const conexao = require("mongoose");

const uri =
    "mongodb+srv://Davi_Vaz:19122541@callnet.sixln.mongodb.net/?retryWrites=true&w=majority&appName=CallNet";

conexao.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Conectado ao MongoDB com sucesso!");
    })
    .catch(err => {
        console.error("Erro ao conectar ao MongoDB:", err);
    });

module.exports = conexao;