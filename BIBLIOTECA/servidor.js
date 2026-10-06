const express = require('express')
const app = express()
app.use(express.json())

let livros = []
let leitores = []
let emprestimos = []
let proximo_livro = 1
let proximo_leitor = 1
let proximo_emprestimo = 1

app.get('/', (req, res) => {
  res.json({ mensagem: 'api da biblioteca' })
})

app.get('/emprestimos', (req, res) => {
  res.json(emprestimos)
})

app.get('/emprestimos/:id', (req, res) => {
  const emprestimo = emprestimos.find(item => item.id === +(req.params.id))
  if (!emprestimo) return res.status(404).json({ erro: 'emprestimo nao encontrado' })
  res.json(emprestimo)
})

app.post('/emprestimos', (req, res) => {
  const livro_id = +(req.body?.livro_id)
  const leitor_id = +(req.body?.leitor_id)
  const livro = livros.find(item => item.id === livro_id)
  const leitor = leitores.find(item => item.id === leitor_id)
  if (!livro || !leitor) return res.status(400).json({ erro: 'livro ou leitor nao encontrado' })
  const ocupado = emprestimos.some(item => item.livro_id === livro_id && !item.devolvido)
  if (ocupado) return res.status(400).json({ erro: 'o livro ja esta emprestado' })
  const emprestimo = { id: proximo_emprestimo++, livro_id, leitor_id, devolvido: false }
  emprestimos.push(emprestimo)
  res.status(201).json(emprestimo)
})

app.put('/emprestimos/:id/devolucao', (req, res) => {
  const emprestimo = emprestimos.find(item => item.id === +(req.params.id))
  if (!emprestimo) return res.status(404).json({ erro: 'emprestimo nao encontrado' })
  if (emprestimo.devolvido) return res.status(400).json({ erro: 'o livro ja foi devolvido' })
  emprestimo.devolvido = true
  res.json(emprestimo)
})


app.get('/livros', (req, res) => {
  res.json(livros)
})

app.get('/livros/:id', (req, res) => {
  const livro = livros.find(item => item.id === +(req.params.id))
  if (!livro) return res.status(404).json({ erro: 'livro nao encontrado' })
  res.json(livro)
})

app.post('/livros', (req, res) => {
  if (typeof req.body?.titulo !== 'string' || !req.body.titulo.trim() || typeof req.body?.autor !== 'string' || !req.body.autor.trim()) return res.status(400).json({ erro: 'informe titulo e autor' })
  const livro = { id: proximo_livro++, titulo: req.body.titulo.trim(), autor: req.body.autor.trim() }
  livros.push(livro)
  res.status(201).json(livro)
})

app.put('/livros/:id', (req, res) => {
  const livro = livros.find(item => item.id === +(req.params.id))
  if (!livro) return res.status(404).json({ erro: 'livro nao encontrado' })
  if (typeof req.body?.titulo !== 'string' || !req.body.titulo.trim() || typeof req.body?.autor !== 'string' || !req.body.autor.trim()) return res.status(400).json({ erro: 'informe titulo e autor' })
  livro.titulo = req.body.titulo.trim()
  livro.autor = req.body.autor.trim()
  res.json(livro)
})

app.delete('/livros/:id', (req, res) => {
  const id = +(req.params.id)
  const livro = livros.find(item => item.id === id)
  if (!livro) return res.status(404).json({ erro: 'livro nao encontrado' })
  const pendente = emprestimos.some(item => item.livro_id === id && !item.devolvido)
  if (pendente) return res.status(400).json({ erro: 'existe um emprestimo pendente' })
  livros = livros.filter(item => item.id !== id)
  res.json({ mensagem: 'livro excluido' })
})

app.get('/leitores', (req, res) => {
  res.json(leitores)
})

app.get('/leitores/:id', (req, res) => {
  const leitor = leitores.find(item => item.id === +(req.params.id))
  if (!leitor) return res.status(404).json({ erro: 'leitor nao encontrado' })
  res.json(leitor)
})

app.post('/leitores', (req, res) => {
  if (typeof req.body?.nome !== 'string' || !req.body.nome.trim() || typeof req.body?.email !== 'string' || !req.body.email.trim()) return res.status(400).json({ erro: 'informe nome e email' })
  const leitor = { id: proximo_leitor++, nome: req.body.nome.trim(), email: req.body.email.trim() }
  leitores.push(leitor)
  res.status(201).json(leitor)
})

app.put('/leitores/:id', (req, res) => {
  const leitor = leitores.find(item => item.id === +(req.params.id))
  if (!leitor) return res.status(404).json({ erro: 'leitor nao encontrado' })
  if (typeof req.body?.nome !== 'string' || !req.body.nome.trim() || typeof req.body?.email !== 'string' || !req.body.email.trim()) return res.status(400).json({ erro: 'informe nome e email' })
  leitor.nome = req.body.nome.trim()
  leitor.email = req.body.email.trim()
  res.json(leitor)
})

app.delete('/leitores/:id', (req, res) => {
  const id = +(req.params.id)
  const leitor = leitores.find(item => item.id === id)
  if (!leitor) return res.status(404).json({ erro: 'leitor nao encontrado' })
  const pendente = emprestimos.some(item => item.leitor_id === id && !item.devolvido)
  if (pendente) return res.status(400).json({ erro: 'existe um emprestimo pendente' })
  leitores = leitores.filter(item => item.id !== id)
  res.json({ mensagem: 'leitor excluido' })
})

app.use((erro, req, res, next) => {
  res.status(erro.status || 500).json({ erro: 'nao foi possivel processar a requisicao' })
})

app.listen(3000, () => {
  console.log('servidor rodando em http://localhost:3000')
})
