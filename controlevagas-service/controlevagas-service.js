const express = require('express');
const bodyParser = require('body-parser');
const ControleVagas = require('./model/controle_vagas');
const axios = require('axios')

const instAxios = axios.create({
    baseURL: 'http://localhost:8000/'
});

const app = express();

//Servidor
let porta = 8130;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});


const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://jcz:17022003Aa@cluster0.gkmwloj.mongodb.net/?retryWrites=true&w=majority';  // mudar
const database_name = 'ZonaAzulDB';                                                             // mudar
const collection_name= 'ControleVagas'                                                                   // mudar
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

// Retorna todas as vagas
app.get('/controlevagas', (req, res, next) => {
    db.find({}).toArray((err, result) => {
        if (err) return console.log("Error: " + err);
        res.send(result);
    });
});

// Retorna uma vaga associada a um número
app.get('/controlevagas/:numero', (req, res, next) => {
    const result = db.findOne({ "numero": req.params.numero }, (err, result) => {
    if (err) return console.log("vaga não encontrada")
    res.send(result);
    });
});

// Registros de vagas não podem ser alterados
app.put('/controlevagas', async (req, res, next) => {
    return res.send("Registros de vagas não podem ser alterados")
});


// Ocupa Vaga escolhida
app.post('/controlevagas', async (req, res, next) => {
    let vaga = await instAxios.get(`/statusvagas/num/${req.body.numero}`).then((resp) => {
        console.log(resp.data)
        return resp.data
    })

    let pessoa = await instAxios.get(`/creditos/${req.body.cpf}`).then((resp) => {
        console.log(resp.data)
        return resp.data
    })
    
    if (vaga != ''  && pessoa != '' && vaga.status == "Livre") {
        var hora_agora = Date.now();
        var controlevaga = new ControleVagas({
            "numero": req.body.numero,
            "cpf": req.body.cpf,
            "hora_entrada": hora_agora
        });
        db.insertOne(controlevaga, (err, result) => {
            if (err) return console.log("Error: " + err);
        });
        let troca_estado = await instAxios.put(`/statusvagas/${req.body.numero}` , {"status": "Ocupado" }).then((resp) => {  
            return resp.data
            });
            return res.send("Vaga ocupada com sucesso!");
        } else {
            res.send('Vaga não está livre ou Conta não Encontrada')
            
        }
    }
);


// Desocupa vaga
app.delete('/controlevagas/:numero', async (req, res, next) => {
    let vaga = await instAxios.get(`/controlevagas/${req.params.numero}`).then((resp) => {
        console.log(resp.data)
        return resp.data
    });
    
    if (vaga != '') {

    let troca_estado = await instAxios.put(`/statusvagas/${vaga.numero}` , {"status": "Livre" }).then((resp) => {  
        return resp.data
        });

    let cobrar = await instAxios.post(`/cobranca` , {"hora_entrada" : vaga.hora_entrada , "cpf": vaga.cpf}).then((resp) => {  
        return resp.data
        });

    db.deleteOne({"numero": req.params.numero}, (err, result) => {
        console.log(result)
        if (err) return console.log("Error: " + err);
        console.log('Vaga desocupada com sucesso no BD!');
        res.send('Vaga desocupada com sucesso no BD!');
    });
    } else {
        res.send('Vaga não ocupada')
    }
});