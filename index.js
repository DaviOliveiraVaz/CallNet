const express = require("express");
const app = express();
var path = require("path");
const ejs = require("ejs");
const fs = require("fs");
const mysql = require("mysql2/promise");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const conexao = require("./config/database");
const Usuario = require("./model/Usuario");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.render("index.ejs", {});
});

app.post('/', function(req, res){
    var usuario = new Usuario({
        nome: req.body.nome,
        cpf: req.body.cpf,
        email: req.body.email,
        senha: req.body.senha,
        endereco: req.body.endereco,
        telefone: req.body.telefone
    });

    usuario.save(function(err, docs){
        if(err){
            res.send("Deu o seguinte erro ao salvar a empresa: " + err);
        } else{
            res.redirect("/usuarios");
        }
    });
});

app.get("/usuarios", function (req, res) {
    Usuario.find({}).then(function(docs){
        res.render('usuarios.ejs', {Usuarios: docs});
    });
});

app.listen("3000", function () {
    console.log("Conexão iniciada com sucesso!");
});