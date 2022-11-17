const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CadastroSchema = new Schema({
 numero: {
  type: Number, 
  required: [true, 'Numero Obrigatório'], 
  max: 100
 },
 coordenadas: {
    type: String, 
    required: [true, 'Coordenadas Obrigatórias'], 
    max: 100
   },
 local: {
    type: String, 
    required: [true, 'Local Obrigatório'], 
    max: 100
   },
 });
// Exportar o modelo
module.exports = mongoose.model('vagas', CadastroSchema);