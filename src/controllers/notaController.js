const Nota = require('../models/NotaModel');
var neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.NEO4J_URI;
const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

exports.index = (req, res) => {
  res.render('nota', {
    nota: {}
  });
};

exports.register = async(req, res) => {
  try {
    console.log(req.session.user)
    const emailAutor = req.session.user.email;
    const tituloDaNota = req.body.titulo;
    const nota = new Nota({
      ...req.body,
      autor: req.session.user.email, 
    });
    console.log(nota);
    await nota.register();

    if(nota.errors.length > 0) {
      req.flash('errors', nota.errors);
      req.session.save(() => res.redirect('back'));
      return;
    }
    
    
    
    const session = driver.session();

    const result = await session.run(
     'MATCH (user:Usuario {email: $email}) ' +
     'CREATE (nota:Nota {titulo: $titulo})<-[:PUBLICOU]-(user) ' +
     'RETURN nota',
     { email: emailAutor, titulo: tituloDaNota }
    );

    session.close();


    req.flash('success', 'Nota registrado com sucesso.');
    req.session.save(() => res.redirect(`/nota/index/${nota.nota._id}`));
    return;
  } catch(e) {
    console.log(e);
    return res.render('404');
  }
};

exports.editIndex = async function(req, res) {
  if(!req.params.id) return res.render('404');

  const nota = await Nota.buscaPorId(req.params.id);
  if(!nota) return res.render('404');

  res.render('nota', { nota });
};

exports.edit = async function(req, res) {
  try {
    if(!req.params.id) return res.render('404');
    const nota = new Nota(req.body);
    await nota.edit(req.params.id);

    if(nota.errors.length > 0) {
      req.flash('errors', nota.errors);
      req.session.save(() => res.redirect('back'));
      return;
    }

    req.flash('success', 'Nota editado com sucesso.');
    req.session.save(() => res.redirect(`/nota/index/${nota.nota._id}`));
    return;
  } catch(e) {
    console.log(e);
    res.render('404');
  }
};

exports.delete = async function(req, res) {
  if(!req.params.id) return res.render('404');

  const nota = await Nota.delete(req.params.id);
  if(!nota) return res.render('404');

  req.flash('success', 'Nota apagado com sucesso.');
  req.session.save(() => res.redirect('back'));
  return;
};
