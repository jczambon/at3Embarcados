const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ControleVagasSchema = new Schema({
    numero: {
        type: String, 
        required: [true, 'Número Obrigatório']},
    cpf: {
        type: String, 
        required: [true, 'CPF Obrigatório']},
    hora_entrada: {
        type: String, 
        required: [true, 'Hora Obrigatória']},
});
// Exportar o modelo
module.exports = mongoose.model('controle_vagas', ControleVagasSchema);