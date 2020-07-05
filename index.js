const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

//Pool connection string
const { Pool } = require('pg');
var pool;
pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:cmpt276@localhost/study_scapes'
})

//Express 
var app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//Set paths
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//Get(s)
app.get('/', (req, res) => res.render('pages/login'))

//Listening - port
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))