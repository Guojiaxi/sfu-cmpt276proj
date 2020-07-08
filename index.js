const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

//Pool connection string
const { Pool } = require('pg');

/* Not sure what this is, but it breaks things?? */
//const { REFUSED } = require('dns');

var pool;
pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
        /* change this according to your local postgres password */
        'postgres://postgres:cmpt276@localhost/study_scapes'
        //'postgres://postgres:root@localhost/study_scapes'
})

//Express
var app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//Set paths
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//Get for main page - login
app.get('/', (req, res) => res.render('pages/login'))
app.get('/login', (req, res) => res.render('pages/login'))
app.get('/sign_up', (req, res) => res.render('pages/sign_up'))
app.get('/about_app', (req, res) => res.render('pages/about_app'))
app.get('/about_team', (req, res) => res.render('pages/about_team'))
app.get('/burnaby/map', (req, res) => res.render('pages/burnaby/burnabymap'))
app.get('/burnaby/events')
app.get('/dashboard/:user_id/profile')
app.get('/dashboard/:user_id/schedule')
app.get('/dashboard/:user_id/schedule/create')

// for admin only
app.get('/admin/database')

//Post for login & password
//Will send the user to the appropriate home page (faculty or student)
app.post('/login', (req, res) => {
    uname = req.body.username;
    pass = req.body.password;

    //checks for an existing username in the database with corresponding password
    var unameQuery = 'SELECT * FROM login WHERE uname= \'' + uname + '\' AND password= \'' + pass + '\'';

    //Set return values for success and failure
    pool.query(unameQuery, (error, result) => {
        if (error) {
            //username doesn't exist or pass is wrong
            //reload login page
            res.render('pages/login');
        } else {
            //user does exist
            if (result.rows[0] == null) {
                //incorrect password
                res.render('pages/login');
            } else {
                //correct password
                //this is pretty excessive, because string compare is being weird
                var results = { 'results': result.rows }
                var role = String(result.rows[0].role);
                var faculty = "faculty";
                var isFaculty = true;

                for (var i = 0; isFaculty == true && i < faculty.length; i++) {
                    if (role[i] != faculty[i]) {
                        isFaculty = false;
                    }
                }

                if (isFaculty) {
                    res.render('pages/home_faculty', results);
                } else {
                    res.render('pages/home_student', results);
                }
            }
        }
    });
})

//Post for account creation
//Will send user back to login page after sign up
app.post('/sign_up', (req, res) => {
    uname = req.body.username;
    pass = req.body.password;
    role = req.body.role;

    //Add new row to table
    var signupQuery = 'INSERT INTO login (uname, password, role) VALUES (\'' + uname + '\', \'' + pass + '\', \'' + role + '\')';
    pool.query(signupQuery, (error, result) => {
        if (error) {
            res.redirect('/sign_up');
        } else {
            res.redirect('/login');
        }
    });

})

//Get for home pages
//app.get('/home_st', (req, res) => res.render('pages/home_student'))
//app.get('/home_fa', (req, res) => res.render('pages/home_faculty'))

//Listening - port
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
