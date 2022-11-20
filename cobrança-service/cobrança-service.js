const express = require('express');
const bodyParser = require('body-parser');
const { HistoricoCobrança, PreçoVaga } = require('./model/historico_cobrança');
const axios = require('axios')

const instAxios = axios.create({
    baseURL: 'http://localhost:8000/'
});

const app = express();

//Servidor
let porta = 8110;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://jcz:17022003Aa@cluster0.gkmwloj.mongodb.net/?retryWrites=true&w=majority';  // mudar
const database_name = 'ZonaAzulDB';                                                             // mudar
const collection_name= 'Cobranca'                                                                   // mudar
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

// Retorna historico de cobranças
app.get('/cobranca', (req, res, next) => {
    db.find({}).toArray((err, result) => {
        if (err) return console.log("Error: " + err);
        res.send(result);
    });
});

// Retorna historico de cobranças associada a um CPF
app.get('/cobranca/:cpf', (req, res, next) => {
    const result = db.find({ "cpf": req.params.cpf });
    return res.send(result)
});

// Cria uma nova cobrança
app.post('/cobranca', async (req, res, next) => {
    let preço = await db.findOne({ "id": "preço"})    // pega o preço atual
    let hora_atual = Date.now()

    let horas = Math.ceil((hora_atual - req.body.hora_entrada) / 1000 / 60 / 60) // cobra fração de hora como hora completa

    preço = preço.preço * horas

    let cobrança = await instAxios.put(`/creditos/${req.body.cpf}` , {"creditos": -preço }).then((resp) => {  
        return resp.data
    })

    if (cobrança.status) {                          // cobrou
        let hist_cobra = new HistoricoCobrança({
            cpf: req.body.cpf,
            vaga: 1,
            hora_entrada: req.body.hora_entrada,
            hora_saida: hora_atual,
            custo: preço

        })
        
        db.insertOne(hist_cobra, (err, result) => {
            if (err) return console.log("Error: " + err);
            console.log('Cobrança cadastrada com sucesso no BD!');
            res.send({"msg": 'Cobrança cadastrada com sucesso no BD!', "cobrança": cobrança});
        });
    } else {
        res.send(cobrança);
    }
});


// Seta o valor por hora das vagas
app.put('/cobranca/:valor_hora', async (req, res, next) => {
    const result = await db.findOne({ "id": "preço"})    // checa se o preço já tem registro

    if (result){
        db.updateOne({ "id": "preço" }, {            //creditos podem ser positivos ou negativos
            $set: {
            "preço": Number(req.params.valor_hora)
        }})
    } else {
        let preço_vaga = new PreçoVaga({
            "id": "preço",
            "preço": Number(req.params.valor_hora)
        })
        
        db.insertOne(preço_vaga, (err, result) => {
            if (err) return console.log("Error: " + err);
            console.log('Preço cadastrado com sucesso no BD!');
            res.send('Preço cadastrado com sucesso no BD!');
        });
    }
});


//
// app.delete('/cobranca/:cpf', async (req, res, next) => {
//     db.deleteOne({"cpf": req.params.cpf}, (err, result) => {
//         if (err) return console.log("Error: " + err);
//         console.log('Conta de creditos do usuário excluída com sucesso no BD!');
//         res.send('Conta de creditos do usuário excluída com sucesso no BD!');
//     });
// });