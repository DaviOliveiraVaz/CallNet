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

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
// app.use(
//   session({
//     secret: "lanche_do_mrbroa_eh_bom_demais",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

app.get("/", function (req, res) {
    res.render("index.ejs", {});
});

app.listen("3000", function () {
    console.log("Conexão iniciada com sucesso!");
});