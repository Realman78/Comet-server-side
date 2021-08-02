const mongoose = require('mongoose')
require('dotenv').config()
const dburl = process.env.DB_CONNECTION_STRING
class Database{
    constructor(){
        this.connect()
    }
    connect() {
        mongoose.connect(dburl, {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            useFindAndModify: false
        }).then(()=>{
            console.log('Connection to database successful')
        })
        .catch((e)=>{
            console.log(e)
        })
    }
}

module.exports = new Database()