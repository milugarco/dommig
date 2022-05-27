const express = require("express");
var http = require("http");
const app = express();
const bodyParser = require("body-parser");
const port = 9090; //porta padrão
const fs = require("fs");


//Routers migration
const migration = require("./app/controllers/migration");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

module.exports = app;

//configurando o body parser para pegar POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//SEND Client
app.use("/api/migration", migration);

//definindo as rotas
app.get("/", (req, res) => {
  res.json({ message: "Bem vindo a API Migração! 1" });
});

//inicia o servidor
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`API Migration on *:${port}`);
});
