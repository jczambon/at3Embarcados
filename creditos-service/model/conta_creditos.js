const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContaCreditosSchema = new Schema({
    cpf: {
        type: String, 
        required: [true, 'CPF Obrigatório']},
    creditos: {
        type: Number, 
        required: [true, 'Creditos Obrigatórios']},
});
// Exportar o modelo
module.exports = mongoose.model('conta_creditos', ContaCreditosSchema);