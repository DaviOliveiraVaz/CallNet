const conexao = require("../config/database");
const { Schema, model } = require("mongoose");

const ChamadoSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  titulo: {
    type: String,
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
  prioridade: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    required: true,
  },
  local: {
    type: String,
    required: true,
  },
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  observacao: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: false,
    default: "ABERTO",
  },
  data: {
    type: Date,
    required: true,
    default: Date.now,
  }
});

ChamadoSchema.pre("validate", async function (next) {
  const chamado = this;

  if (!chamado.id) {
    const ultimoChamado = await model("Chamado").findOne().sort({ id: -1 });
    chamado.id = ultimoChamado ? ultimoChamado.id + 1 : 1;
  }

  next();
});

module.exports = model("Chamado", ChamadoSchema, "Chamados");