const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CadastroSchema = new Schema({
 nome: {
  type: String, 
  required: [true, 'Nome Obrigatório'], 
  max: 100
 },
 telefone: {
    type: String, 
    required: [true, 'Telefone Obrigatório'], 
    max: 100
   },
 placa: {
    type: String, 
    required: [true, 'Placa de Veículo Obrigatório'], 
    max: 100
   },
 cpf: {
  type: String, 
  required: [true, 'CPF Obrigatório']}
 });
// Exportar o modelo
module.exports = mongoose.model('cadastro', CadastroSchema);