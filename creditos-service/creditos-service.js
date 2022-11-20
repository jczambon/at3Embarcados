const express = require('express');
const bodyParser = require('body-parser');
const ContaCreditos = require('./model/conta_creditos');
const axios = require('axios')

const instAxios = axios.create({
    baseURL: 'http://localhost:8000/'
});

const app = express();

//Servidor
let porta = 8100;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});


const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://jcz:17022003Aa@cluster0.gkmwloj.mongodb.net/?retryWrites=true&w=majority';  // mudar
const database_name = 'ZonaAzulDB';                                                             // mudar
const collection_name= 'ControleCreditos'                                                                   // mudar
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

// Retorna todas as contas
app.get('/creditos', (req, res, next) => {
    db.find({}).toArray((err, result) => {
        if (err) return console.log("Error: " + err);
        res.send(result);
    });
});

// Retorna uma conta de creditos associada a um CPF
app.get('/creditos/:cpf', async (req, res, next) => {
    const result = db.findOne({ "cpf": req.params.cpf }, (err, result) => {
    if (err) return console.log("Conta não encontrada")
    return result;
    });

    if (!result) {
        let resp = await instAxios.post("/creditos", {"cpf": req.params.cpf})
        return res.send(resp.data)
    }
    return res.send(result)
});

// Cria uma nova conta de creditos
app.post('/creditos', async (req, res, next) => {
    const result = await new Promise((resolve, reject) => {     // checa se a conta já existe
        db.findOne({ "cpf": req.body.cpf }, (err, result) => {
            if (result) {resolve(1); res.send('Conta já existe, use a função de adicionar credito!'); return console.log("Conta já existe, use a função de adicionar credito!")}
            resolve(0)
        })
    })

    if (!result) {
        const cadastrado = await instAxios.get(`/Cadastro/${req.body.cpf}`).then((resp) => {    // checa se existe usuario com aquele cpf
            console.log(resp.data)
            return resp.data
        })

        if (cadastrado != ""){

            var conta_creditos = new ContaCreditos({
                "cpf": req.body.cpf,
                "creditos": req.body.creditos == undefined ? 0 : Number(req.body.creditos)
            });
            db.insertOne(conta_creditos, (err, result) => {
                if (err) return console.log("Error: " + err);
                console.log('Conta cadastrada com sucesso no BD!');
                res.send('Conta cadastrada com sucesso no BD!');
            });
        } else {
            console.log('É preciso cadastrar o usuário antes de colocar créditos!');
            res.send('É preciso cadastrar o usuário antes de colocar créditos!');
        }
    }
});


// Atualiza a pontuação de uma conta
app.put('/creditos/:cpf', async (req, res, next) => {
    if (Number(req.body.creditos)) {
        const result = await new Promise((resolve, reject) => {     // checa se a conta já existe
            db.findOne({ "cpf": req.params.cpf }, (err, result) => {
                if (result) {resolve(result); return }
                resolve(0)

            })
        })

        if (result){
            var credito_atual = result.creditos
            var novos_creditos = Number(req.body.creditos)
            if ((credito_atual + novos_creditos) < 0){
                return res.send({"msg": `Usuário não tem créditos o suficiente (${result.creditos})!`, "status": 0});
            }
            db.updateOne({"cpf": req.params.cpf }, {            //creditos podem ser positivos ou negativos
                $set: {
                "creditos": credito_atual + novos_creditos
            }
            }, (err, result) => {
                if (err) return console.log("Error: " + err);
                console.log(`Creditos de usuário atualizados com sucesso no BD! ${credito_atual} => ${credito_atual + novos_creditos}`);
                return res.send({"msg": `Creditos de usuário atualizados com sucesso no BD! ${credito_atual} => ${credito_atual + novos_creditos}`, "status": 1});
            });
        } else {
            return res.send({"msg": `CPF não encontrado`, "status": 0});
        }
    } else {
        return res.send({"msg": `Credito precisa ser numérico`, "status": 0});
    }

});


// Remove conta de pontos de um cliente
app.delete('/creditos/:cpf', (req, res, next) => {
    db.deleteOne({"cpf": req.params.cpf}, (err, result) => {
        console.log(result)
        if (err) return console.log("Error: " + err);
        console.log('Conta de creditos do usuário excluída com sucesso no BD!');
        res.send('Conta de creditos do usuário excluída com sucesso no BD!');
    });
});