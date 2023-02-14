const Nota = require('../models/NotaModel');

exports.index = async(req, res) => {
  const notas = await Nota.buscaNotas();
  res.render('index', { notas });
};

