const Nota = require('../models/NotaModel');

exports.index = (req, res) => {
  res.render('nota', {
    nota: {}
  });
};

exports.register = async(req, res) => {
  try {
    const nota = new Nota(req.body);
    await nota.register();

    if(nota.errors.length > 0) {
      req.flash('errors', nota.errors);
      req.session.save(() => res.redirect('back'));
      return;
    }

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
