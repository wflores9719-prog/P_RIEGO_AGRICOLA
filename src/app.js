//requerimos framework de express
const express = require('express');
//requerimos el archivo propio "config.js"
const config = require('./config.js');

//inicializamos app con express
const app = express();

//seteamos el puerto donde iniciara express
app.set('port', config.app.port);

//exportamos app
module.exports = app;