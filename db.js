const mongoose = require('mongoose')
const dburl = "mongodb+srv://admin:admin@cometcluster.nivj2.mongodb.net/Comet?retryWrites=true&w=majority"
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