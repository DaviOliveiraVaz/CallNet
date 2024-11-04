require('dotenv').config();

const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Conectado ao MongoDB com sucesso!");
    })
    .catch(err => {
        console.error("Erro ao conectar ao MongoDB:", err);
    });

module.exports = mongoose;
