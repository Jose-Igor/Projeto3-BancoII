const Login = require('../models/LoginModel');
const zxcvbn = require('zxcvbn');

exports.index = (req, res) => {
  if(req.session.user) return res.render('login-logado');
  return res.render('login');
};

exports.register = async function(req, res) {
  try {
  const password = req.body.password;
  const passwordStrength = zxcvbn(password);
  if (passwordStrength.score < 3) {
    req.flash('errors', ['A senha deve conter números, letras e caracteres especiais.']);
    req.session.save(function() {
      return res.redirect('back');
    });
    return;
  }
  
  if (!/\d/.test(password) || !/[a-zA-Z]/.test(password) || !/[!@#\$%\^&\*]/.test(password)) {
    req.flash('errors', ['A senha deve conter números, letras e caracteres especiais.']);
    req.session.save(function() {
      return res.redirect('back');
    });
    return;
  }
  
  const login = new Login(req.body);
  await login.register();
  
  if (login.errors.length > 0) {
    req.flash('errors', login.errors);
    req.session.save(function() {
      return res.redirect('back');
    });
    return;
  }
  
  req.flash('success', 'Seu usuário foi criado com sucesso.');
  req.session.save(function() {
    return res.redirect('back');
  });}

  catch (e) {
    console.log(e);
    return res.render('404');
    }
};
  

exports.login = async function(req, res) {
  try {
    const login = new Login(req.body);
    await login.login();

    if(login.errors.length > 0) {
      req.flash('errors', login.errors);
      req.session.save(function() {
        return res.redirect('back');
      });
      return;
    }

    req.flash('success', 'Você entrou no sistema.');
    req.session.user = login.user;
    req.session.save(function() {
      return res.redirect('back');
    });
  } catch(e) {
    console.log(e);
    return res.render('404');
  }
};

exports.logout = function(req, res) {
  req.session.destroy();
  res.redirect('/');
};

