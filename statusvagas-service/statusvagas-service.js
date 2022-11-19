const express = require('express');
const bodyParser = require('body-parser');
const StatusVaga = require('./model/status_vaga');
const axios = require('axios');

const instAxios = axios.create({
    baseURL: 'http://localhost:8000/'
});

const app = express();

//Servidor
let porta = 8120;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});


const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://pedrocaninas:1234@cluster0.kawxe5x.mongodb.net/?retryWrites=true&w=majority';  // mudar
const database_name = 'BaseAtividadeBackEnd';                                                             // mudar
const collection_name= 'StatusVagas'                                                                   // mudar
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


// Retorna os status de todas as vagas
app.get('/statusvagas', (req, res, next) => {
    db.find({}).toArray((err, result) => {
        if (err) return console.log("Error: " + err);
        res.send(result);
    });
});

// Retorna status de uma vaga, se existir
app.get('/statusvagas/num/:numero', (req, res, next) => {
    console.log(typeof(req.params.numero))
    db.findOne({ "numero": Number(req.params.numero) }, async (err, result) => {
        if (!result) {
            let resposta = await instAxios.get(`/vagas/${Number(req.params.numero)}`).then((resp) => {    // checa se existe usuario com aquele cpf
                console.log(resp.data)
                return resp.data
            })

            return res.send(resposta);
        }
        console.log(err, result, "aqui")
        res.send(result);
    });
});

// Retorna status de vagas de um local, se existirem
app.get('/statusvagas/:local', async (req, res, next) => {
    let vagas_local = await instAxios.get(`/vagas`).then((resp) => {
        console.log(resp.data)
        return resp.data
    })
    
    if (vagas_local) {
        vagas = []
        for (i of vagas_local) {
            
            if (!(await db.findOne({ "numero": i.numero }))) {
                var statusvaga = new StatusVaga({
                    "numero": i.numero,
                    "status": "Livre"
                });
                db.insertOne(statusvaga, (err, result) => {
                    if (err) return console.log("Error: " + err);
                });
            }

            if (i.local == req.params.local) {
                let r = await (db.findOne({ "numero": Number(i.numero)}))
                console.log(r)
                if (r){
                    vagas.push(r)
                }
            }
        }
        return res.send(vagas);
    }
    res.send("Nenhuma vaga encontrada no local");
});

// Vagas devem ser criadas no cadastro de vagas
app.post('/statusvagas', async (req, res, next) => {
    return res.send("Vagas devem ser criadas no cadastro de vagas")
});


// Atualiza o status da vaga
app.put('/statusvagas/:numero', async (req, res, next) => {
    let vaga = await instAxios.get(`/vagas/${req.params.numero}`).then((resp) => {
        console.log(resp.data)
        return resp.data
    })
    
    if (vaga) {
        if (!(await db.findOne({ "numero": vaga.numero }))) {
            var statusvaga = new StatusVaga({
                "numero": i.numero,
                "status": req.body.status
            });
            db.insertOne(statusvaga, (err, result) => {
                if (err) return console.log("Error: " + err);
            });
        } else {
            await db.updateOne({ "numero": Number(vaga.numero) }, {
                $set: {
                    "status": req.body.status
            }})
        }
        return res.send("Status Alterado!")
    }
        
    res.send("Nenhuma vaga encontrada com esse número!")
});


// Remove vaga status
app.delete('/statusvagas/:numero', (req, res, next) => {
    db.deleteOne({"numero": Number(req.params.numero)}, (err, result) => {
        console.log(result)
        if (err) return console.log("Error: " + err);
        console.log('Vaga excluída com sucesso no BD!');
        res.send('Vaga excluída com sucesso no BD!');
    });
});