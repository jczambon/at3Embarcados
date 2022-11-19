const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatusVagaSchema = new Schema({
    numero: {
        type: Number, 
        required: [true, 'Número Obrigatório']},
    status: {
        type: String, 
        required: [true, 'Creditos Obrigatórios']},
});
// Exportar o modelo
module.exports = mongoose.model('status_vaga', StatusVagaSchema);