const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HistoricoCobrançaSchema = new Schema({
    cpf: {
        type: String, 
        required: [true, 'CPF Obrigatório']},
    vaga: {
        type: Number, 
        required: [true, 'Vaga Obrigatória']},
    hora_entrada: {
        type: Date, 
        required: [true, 'Data de Entrada Obrigatórios']},
    hora_saida: {
        type: Date, 
        required: [true, 'Data de Saída Obrigatórios']},
    custo: {
        type: Number,
        required: [true, 'Custo Obrigatório']}
});

const PreçoVagaScheme = new Schema({
    id: {
        type: String, 
        required: [true, 'CPF Obrigatório']},
    preço: {
        type: Number, 
        required: [true, 'CPF Obrigatório']},
});
// Exportar o modelo
module.exports = {"HistoricoCobrança": mongoose.model('historico_cobrança', HistoricoCobrançaSchema), "PreçoVaga": mongoose.model('preço_vaga', PreçoVagaScheme)};