const express = require("express");
const app = express();
var path = require("path");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const conexao = require("./config/database");
const Usuario = require("./model/Usuario");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
      secret: "e_us_guri",
      resave: false,
      saveUninitialized: true,
    })
  );

app.get("/", function (req, res) {
    res.render("login.ejs", {});
});

app.get("/cadastro", function (req, res) {
    res.render("index.ejs", {});
});

app.get("/usuarios", function (req, res) {
    try {
        const id_usuario = req.session.id_usuario;

        if(!id_usuario){
            return res.redirect("/");
        }

        Usuario.find({}).then(function(docs){
            res.render('usuarios.ejs', {Usuarios: docs});
        });

    }catch (error) {
        res.status(500).send("Ocorreu um erro: " + error);
     }
});

app.get("/sair", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Erro ao finalizar a sessão:", err);
        return res
          .status(500)
          .send(
            `<script>alert("Ocorreu um erro ao sair da conta."); window.history.back();</script>`
          );
      }
      res.redirect("/");
    });
});

app.post('/cadastro', function(req, res){
  bcrypt.hash(req.body.senha, saltRounds, function(err, hash) {
      if (err) {
          return res.send("Erro ao criptografar a senha: " + err);
      }

      var usuario = new Usuario({
          nome: req.body.nome,
          cpf: req.body.cpf,
          email: req.body.email,
          senha: hash,
          endereco: req.body.endereco,
          telefone: req.body.telefone
      });

      usuario.save(function(err, docs){
          if(err){
              res.send("Erro ao salvar o usuário: " + err);
          } else {
              res.redirect("/usuarios");
          }
      });
  });
});

app.post("/", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.send(
        `<script>alert("Cadastro não encontrado."); window.history.back();</script>`
      );
    }

    const match = await bcrypt.compare(senha, usuario.senha);

    if (match) {
      req.session.id_usuario = usuario._id;
      req.session.email = usuario.email;
      return res.redirect("/usuarios");
    } else {
      return res.send(
        `<script>alert("E-mail ou senha incorretos."); window.history.back();</script>`
      );
    }
  } catch (error) {
    console.error("Erro ao consultar o banco de dados: ", error);
    return res.status(500).send(
      `<script>alert("Ocorreu um erro ao consultar o banco de dados."); window.history.back();</script>`
    );
  }
});

app.listen("3000", function () {
    console.log("Conexão iniciada com sucesso!");
});