const express = require('express');
const route = express.Router();

const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');
const notaController = require('./src/controllers/notaController');

const { loginRequired } = require('./src/middlewares/middleware');

// Rotas da home
route.get('/', homeController.index);

// Rotas de login
route.get('/login/index', loginController.index);
route.post('/login/register', loginController.register);
route.post('/login/login', loginController.login);
route.get('/login/logout', loginController.logout);

// Rotas de nota
route.get('/nota/index', loginRequired, notaController.index);
route.post('/nota/register', loginRequired, notaController.register);
route.get('/nota/index/:id', loginRequired, notaController.editIndex);
route.post('/nota/edit/:id', loginRequired, notaController.edit);
route.get('/nota/delete/:id', loginRequired, notaController.delete);

module.exports = route;
