const express = require('express');
const bodyParser = require('body-parser');

const app = express();


//Servidor
let porta = 8090;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});

const Cadastro = require('./model/vagas')

//Acesso ao BD
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://jcz:17022003Aa@cluster0.gkmwloj.mongodb.net/?retryWrites=true&w=majority';
const database_name = 'ZonaAzulDB';
const collection_name= 'CadastroVagas'
var db;
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            console.log('ERRO: não foi possível conectar à base de dados ` ' + database_name + ' `.');
            throw error;
        }
        db = client.db(database_name).collection(collection_name);
        console.log('Conectado à base de dados ` ' + database_name + ' `!');
    });
//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/vagas', (req, res, next) => {
    var vaga = new Cadastro({
        "numero": req.body.numero,
        "coordenadas": req.body.coordenadas,
        "local": req.body.local,
     });
    db.insertOne(vaga, (err, result) => {
        if (err) return console.log("Error: " + err);
        console.log('Vaga cadastrada com sucesso!');
        res.send('Vaga cadastrada com sucesso!');
    });
});

// Obtém todos os cadastros
app.get('/vagas', (req, res, next) => {
    db.find({}).toArray((err, result) => {
        if (err) return console.log("Error: " + err);
        res.send(result);
    });
});

// Obtém cadastro do usuário com base no número
app.get('/vagas/:numero', (req, res, next) => {
    const result = db.findOne({ "numero": (req.params.numero) }, (err, result) => {
    if (err) return console.log("Vaga não encontrada");
    res.send(result);
    });
});

// Altera um cadastro
app.put('/vagas/:numero', (req, res, next) => {
    db.updateOne({"numero": req.params.numero }, {
        $set: {
          "numero": req.body.numero,
          "coordenadas": req.body.coordenadas,
          "local": req.body.local}
    }, (err, result) => {
        if (err) return console.log("Error: " + err);
        console.log('Cadastro da vaga alterado com sucesso!');
        res.send('Cadastro da vaga alterado com sucesso!');
    });
});

//Remover cadastro de vaga
app.delete('/vagas/:numero', (req, res, next) => {
    db.deleteOne({numero: req.params.numero },(err, result) => {
        if (err) return console.log("Error: " + err);
        console.log('Cadastro da vaga removido!');
        res.send('Cadastro da vaga removido!');
    });
});