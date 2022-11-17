const express = require('express');
const bodyParser = require('body-parser');

const app = express();


//Servidor
let porta = 8080;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});

const Cadastro = require('./model/cadastro')

//Acesso ao BD
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://jcz:17022003Aa@cluster0.gkmwloj.mongodb.net/?retryWrites=true&w=majority';
const database_name = 'ZonaAzulDB';
const collection_name= 'CadastroCliente'
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

app.post('/Cadastro', (req, res, next) => {
    var cliente = new Cadastro({
        "nome": req.body.nome,
        "Telefone": req.body.Telefone,
        "placa": req.body.placa,
        "cpf": req.body.cpf
     });
    db.insertOne(cliente, (err, result) => {
        if (err) return console.log("Error:" + err);
        console.log('Cliente cadastrado com sucesso!');
        res.send('Cliente cadastrado com sucesso!');
    });
});

// Obtém todos os cadastros
app.get('/Cadastro', (req, res, next) => {
    db.find({}).toArray((err, result) => {
        if (err) return console.log("Error: " + err);
        res.send(result);
    });
});

// Obtém cadastro do usuário com base no CPF
app.get('/Cadastro/:cpf', (req, res, next) => {
    const result = db.findOne({ "cpf": req.params.cpf }, (err, result) => {
    if (err) return console.log("Cliente não encontrado")
    res.send(result);
    });
});

// Altera um cadastro
app.put('/Cadastro/:cpf', (req, res, next) => {
    db.updateOne({"cpf": req.params.cpf }, {
        $set: {
          "nome": req.body.nome,
          "telefone": req.body.telefone,
          "placa": req.body.placa}
    }, (err, result) => {
        if (err) return console.log("Error: " + err);
        console.log('Cadastro do cliente alterado com sucesso!');
        res.send('Cadastro do cliente alterado com sucesso!');
    });
});

//Remover cadastro de usuário
app.delete('/Cadastro/:cpf', (req, res, next) => {
    db.deleteOne({cpf: req.params.cpf },(err, result) => {
        if (err) return console.log("Error: " + err);
        console.log('Cadastro do cliente removido!');
        res.send('Cadastro do cliente removido!');
    });
});
