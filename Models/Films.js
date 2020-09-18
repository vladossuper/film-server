const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const films = new Schema({
    user_id: String,
    title: String,
    release_year: Number,
    format: String,
    stars: String
});

const Films = mongoose.model('Films', films);
module.exports = Films;