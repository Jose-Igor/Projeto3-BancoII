const mongoose = require('mongoose');
const validator = require('validator');
var neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.NEO4J_URI;
const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

const NotaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  conteudo: { type: String, required: false, default: '' },
  criadoEm: { type: Date, default: Date.now },
  autor: { type: String},
});

const NotaModel = mongoose.model('Nota', NotaSchema);

function Nota(body) {
  this.body = body;
  this.errors = [];
  this.nota = null;
}

Nota.prototype.register = async function() {
  this.valida();
  if(this.errors.length > 0) return;
  this.nota = await NotaModel.create(this.body);
};

Nota.prototype.valida = function() {
  this.cleanUp();

  // Validação
  if(!this.body.titulo) this.errors.push('titulo é um campo obrigatório.');
};

Nota.prototype.cleanUp = function() {
  for(const key in this.body) {
    if(typeof this.body[key] !== 'string') {
      this.body[key] = '';
    }
  }

  this.body = {
    titulo: this.body.titulo,
    conteudo: this.body.conteudo,
  };
};

Nota.prototype.edit = async function(id) {
  if(typeof id !== 'string') return;
  this.valida();
  if(this.errors.length > 0) return;
  this.nota = await NotaModel.findByIdAndUpdate(id, this.body, { new: true });
};

// Métodos estáticos
Nota.buscaPorId = async function(id) {
  if(typeof id !== 'string') return;
  const nota = await NotaModel.findById(id);
  return nota;
};

Nota.buscaNotas = async function() {
  const notas = await NotaModel.find()
    .sort({ criadoEm: -1 });
  return notas;
};

Nota.delete = async function(id) {
  if(typeof id !== 'string') return;
  const session = driver.session();
  try {
    await session.run(
      'MATCH (u:Usuario)-[p:PUBLICOU]->(n:Nota) ' +
      'WHERE n.id = $id ' +
      'DELETE p, n',
      { id }
    );
  } finally {
    session.close();
  }

  const nota = await NotaModel.findOneAndDelete({_id: id});
  return nota;
};


module.exports = Nota;
