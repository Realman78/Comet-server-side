const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 3000
const Crater = require('./Schemas/CraterSchema')
var cloudinary = require('cloudinary').v2
require('./db')
cloudinary.config({ 
    cloud_name: 'dzmz24nr0', 
    api_key: '411549117332673', 
    api_secret: 'crgNRrcVJ7v6PA76-8HlbEzx5vE' 
});

app.use(express.json({limit: '50mb'}));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req,res)=>{
    res.send({'term':'ok my king'})
})
app.get('/:code', async (req,res)=>{
    const crater = await Crater.findOne({code: req.params.code})
    .catch(e=>console.log(e))
    res.render('crater', crater)
})
app.post('/', async (req,res)=>{
    const code = getRandomInt(100000, 999999)
    const body = {
        url: req.body.url,
        public_id: req.body.public_id,
        code: code.toString()
    }
    const crater = await Crater.create(body).catch(e=>{
        console.log(e)
    })
    setTimeout(async ()=>{
        const craterToDelete = await Crater.findOneAndDelete({code: crater.code})
        if (!craterToDelete) return
        await cloudinary.uploader.destroy(craterToDelete.public_id, function(result,error) { console.log(error) })
    } , 360000)

    res.send({"code":crater.code})
})

app.listen(PORT, ()=>{
    console.log(`Server is up and running on port ${PORT}`)
})

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
