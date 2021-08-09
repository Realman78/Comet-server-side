require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const hbs = require('hbs')
const PORT = process.env.PORT || 3000
const Crater = require('./Schemas/CraterSchema')
var cloudinary = require('cloudinary').v2
require('./db')
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

var cors = require('cors');
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.json());
app.set('views', path.join(__dirname, '/templates/views'))
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))
const partialsPath = path.join(__dirname, '/templates/partials')
hbs.registerPartials(partialsPath)
app.set("")

app.get('/', (req,res)=>{
    res.render('home')
})
app.get('/:code/', async (req,res)=>{
    const crater = await Crater.findOne({code: req.params.code})
    .catch(e=>console.log(e))
    if (!crater) return res.render('error',{code: req.params.code, error: `No files with the code ${req.params.code}`})
    res.render('crater', crater)
})
app.get('/:code/get/', async (req,res)=>{
    const craters = await Crater.find({code: req.params.code})
    if (craters.length == 0) return res.send({code: req.params.code, error: `No files with the code ${req.params.code}`})
    res.send(craters)
})
app.post('/', async (req,res)=>{
    const body = {
        url: req.body.url,
        public_id: req.body.public_id,
        code: req.body.code,
        fileName: req.body.fileName
    }
    const crater = await Crater.create(body).catch(e=>{
        console.log(e)
    })
    setTimeout(async ()=>{
        const craterToDelete = await Crater.findByIdAndDelete(crater._id)
        if (!craterToDelete) return
        await cloudinary.uploader.destroy(craterToDelete.public_id, async function(error,result) {
            console.log(result, error)
            if (result.result === 'not found'){
                await cloudinary.uploader.destroy(craterToDelete.public_id, {resource_type: 'video'}, async function(err, res2){
					console.log(res2,err)
					if (res2.result=== 'not found'){
						await cloudinary.uploader.destroy(craterToDelete.public_id, {resource_type: 'raw'}, function(err3, res3){console.log(err3, res3)})
					}
				})
            }
        }).catch((err)=>{
            console.log(err)
        })
    } , 300000)

    res.send({"code":crater.code})
})

app.listen(PORT, ()=>{
    console.log(`Server is up and running on port ${PORT}`)
})