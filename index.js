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
const Chamado = require("./model/Chamado");
const Cliente = require("./model/Cliente");

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

app.get("/chamados", async function (req, res) {
  try {
    const id_usuario = req.session.id_usuario;

    if (!id_usuario) {
      return res.redirect("/");
    }

    const cliente = await Cliente.find({});
    const usuario = await Usuario.findById(id_usuario);

    res.render('chamados.ejs', { cliente, usuario });

  } catch (error) {
    console.error("Erro: ", error);
    res.status(500).send("Ocorreu um erro ao carregar os chamados.");
  }
});

app.get("/clientes", function (req, res) {
  res.render("clientes.ejs", {});
});

app.get("/clientes/:cpf", async function (req, res) {
  try {
    const cliente = await Cliente.findOne({ cpf: req.params.cpf });

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json({
      nome: cliente.nome,
      email: cliente.email,
      endereco: cliente.endereco,
    });
  } catch (error) {
    console.error("Erro ao buscar cliente: ", error);
    res.status(500).json({ error: "Ocorreu um erro ao buscar o cliente" });
  }
});

app.get("/listar-chamados", async function (req, res) {
  try {
    const id_usuario = req.session.id_usuario;

    if (!id_usuario) {
      return res.redirect("/");
    }

    Chamado.find({}).then(function(docs){
      res.render('listar-chamados.ejs', {Chamados: docs});
    });

  } catch (error) {
    console.error("Erro: ", error);
    res.status(500).send("Ocorreu um erro ao carregar os chamados.");
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

app.post("/chamados", async function (req, res) {
  try {
    const id_usuario = req.session.id_usuario;

    if (!id_usuario) {
      return res.redirect("/");
    }

    const usuario = await Usuario.findById(id_usuario);
    const cliente = await Cliente.find();

    if (!usuario) {
      return res.redirect("/");
    }

    let nomeChamado;
    let emailChamado;
    let localChamado;

    if (req.body.tipo === "Interno") {
      nomeChamado = usuario.nome;
      emailChamado = usuario.email;
      localChamado = req.body.local;

      if (Array.isArray(localChamado) && localChamado.length > 0) {
        localChamado = localChamado[0];
      }
    } else if (req.body.tipo === "Externo") {
      const clienteSelecionado = await Cliente.findOne({ cpf: req.body.cliente });
      if (clienteSelecionado) {
        nomeChamado = clienteSelecionado.nome;
        emailChamado = clienteSelecionado.email;
        localChamado = clienteSelecionado.endereco;
      } else {
        return res.status(400).send("Cliente não encontrado.");
      }
    }

    const novoChamado = new Chamado({
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      prioridade: req.body.prioridade,
      tipo: req.body.tipo,
      nome: nomeChamado,
      email: emailChamado,
      local: localChamado,
    });

    await novoChamado.save();
    res.redirect("/listar-chamados");
  } catch (error) {
    console.error("Erro ao criar chamado: ", error);
    res.status(500).send("Ocorreu um erro ao criar o chamado.");
  }
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
        res.redirect("/chamados");
      }
    });
  });
});

app.post('/clientes', function(req, res){
  try {
    var cliente = new Cliente({
      nome: req.body.nome,
      cpf: req.body.cpf,
      email: req.body.email,
      endereco: req.body.endereco,
      telefone: req.body.telefone
    });

    cliente.save(function(err, docs){
      if(err){
        res.send("Erro ao salvar o cliente: " + err);
      } else {
        res.redirect("/chamados");
      }
    });
  } catch (error) {
    console.error("Erro: ", error);
    return res.status(500).send(
      `<script>alert("Ocorreu um erro."); window.history.back();</script>`
    );
  }
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
      return res.redirect("/chamados");
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