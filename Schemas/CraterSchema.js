const mongoose = require('mongoose')

const Schema = mongoose.Schema

const CraterSchema = new Schema({
    code: String,
    url: { type: String},
    public_id: String,
	extension: String
}, { timestamps: true })

var Crater = mongoose.model('Crater', CraterSchema)
module.exports = Crater