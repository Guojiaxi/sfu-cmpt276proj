/**
 * For the login session
 * https://medium.com/@timtamimi/getting-started-with-authentication-in-node-js-with-passport-and-postgresql-2219664b568c
 */
var express = require('express');
var app = express();
var passport = require("passport"); //authentication middleware - modular

var request = require('request'); //for HTTP calls
const { Pool, Client } = require('pg') //add Client for session
const bcrypt = require('bcrypt') //hashed passwords
const user = require("os").userInfo().username;

//Temporary Admin Login Info
const ADMIN_UNAME = "ADMIN";
const ADMIN_PASS = "ADMIN";

//Public
app.use(express.static('public'));
//app.use('/public', express.static(__dirname + '/public'));

const LocalStrategy = require('passport-local').Strategy; //strategy for passport
const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
        //change this according to your local postgres password
        'postgres://postgres:cmpt276@localhost/study_scapes',
    //'postgres://postgres:root@localhost/study_scapes'
});



module.exports = function(app) {
    //Home - about_app
    app.get('/', function(req, res, next) {
        res.render('login');

        console.log("user" + user);
    });
    app.get('/about_app', function(req, res, next) {
        res.render('about_app');

        console.log("user" + user);
    });

    //Sign up for account
    app.get('/sign_up', function(req, res, next) {
        res.render('sign_up');
    });
    app.post('/sign_up', async function(req, res) {

        try {
            const client = await pool.connect()
            await client.query('BEGIN')
            var pwd = await bcrypt.hash(req.body.password, 5); //encrypted password
            //var pwd = req.body.password;
            await JSON.stringify(client.query('SELECT username FROM login WHERE username=$1', [req.body.username], function(err, result) {
                if (result.rows[0]) {
                    //req.flash('warning', "This username has already registered. <a href='/login'>Log in!</a>"); //doesn't work!!! (yet)
                    console.log('Username already registered');
                    res.redirect('/sign_up');
                } else {
                    client.query('INSERT INTO login (username, password, role) VALUES ($1, $2, $3)', [req.body.username, pwd, req.body.role], function(err, result) {
                        if (err) { console.log(err); } else {

                            client.query('COMMIT')
                            console.log('User successfully created');
                            //req.flash('success', 'User created.') //doesn't work!!! (yet)

                            res.redirect('/login');
                            return;
                        }
                    });
                }
            }));
            client.release();
        } catch (e) { throw (e) }
    });

    //Home page after login
    app.get('/home', function(req, res, next) {
        try {
            var unameQuery = ('SELECT * FROM login WHERE uid=' + req.user);

            //Set return values for success and failure
            pool.query(unameQuery, (error, result) => {
                //this is pretty excessive, because string compare is being weird
                var results = { 'results': result.rows }
                var role = String(result.rows[0].role);
                var faculty = "faculty";
                var isFaculty = true;
                var admin = "admin";
                var isAdmin = true;

                //Faculty
                for (var i = 0; isFaculty == true && i < faculty.length; i++) {
                    if (role[i] != faculty[i]) {
                        isFaculty = false;
                    }
                }

                //Admin
                for (var j = 0; isAdmin == true && j < admin.length; j++) {
                    if (role[j] != admin[j]) {
                        isAdmin = false;
                    }
                }

                //Determine view to render
                if (isFaculty) {
                    console.log('User is Faculty');
                    res.render('home_faculty', results);
                } else if (isAdmin) {
                    console.log('User is ADMIN');
                    res.redirect('home_admin');
                } else {
                    console.log('User is a Student');
                    res.render('home_student', results);
                }
            });
        } catch (e) { throw (e) }
    });

    //Admin view displays the whole login database
    app.get('/home_admin', function(req, res, next) {
        try {
            var unameQuery = ('SELECT * FROM login');

            //Set return values for success and failure
            pool.query(unameQuery, (error, result) => {
                var results = { 'results': result.rows }
                console.log('User is ADMIN');
                res.render('home_admin', results);

            });
        } catch (e) { throw (e) }
    });

    app.get('/login', function(req, res, next) {
        if (req.isAuthenticated()) {
            console.log('Logging in');
            res.redirect('/home');
        } else {
            res.render('login');
        }

    });

    app.get('/logout', function(req, res) {

        console.log(req.isAuthenticated());
        req.logout();
        console.log(req.isAuthenticated());
        //req.flash('success', "Logged out. See you soon!");
        console.log('Logged out');
        res.redirect('/');
    });

    app.post('/login', passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }), function(req, res) {
        if (req.body.remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
        } else {
            req.session.cookie.expires = false; // Cookie expires at end of session
        }
        res.redirect('/');
    });

    //Home page after login
    app.get('/meetup', function(req, res, next) {
        try {
            var meetupQuery = ('SELECT * FROM meetup WHERE ' + req.user + '= ANY(users)');

            //Set return values for success and failure
            pool.query(meetupQuery, (error, result) => {
                //this is pretty excessive, because string compare is being weird
                var results = { 'results': result.rows }
                var role = String(req.user.role);
                var faculty = "faculty";
                var isFaculty = true;
                var admin = "admin";
                var isAdmin = true;

                //Faculty
                for (var i = 0; isFaculty == true && i < faculty.length; i++) {
                    if (role[i] != faculty[i]) {
                        isFaculty = false;
                    }
                }

                //Admin
                for (var j = 0; isAdmin == true && j < admin.length; j++) {
                    if (role[j] != admin[j]) {
                        isAdmin = false;
                    }
                }

                //Determine view to render
                if (isFaculty) {
                    console.log('User is Faculty');
                    res.render('meetups_faculty', results);
                } else if (isAdmin) {
                    console.log('User is ADMIN');
                    res.redirect('meetups_admin');
                } else {
                    console.log('User is a Student');
                    res.render('meetups_student', results);
                }
            });
        } catch (e) { throw (e) }
    });

    //View meetups
    app.get('/meetup_admin', function(req, res, next) {
        try {
            var meetupQuery = ('SELECT * FROM meetup');

            //Set return values for success and failure
            pool.query(meetupQuery, (error, result) => {
                var results = { 'results': result.rows }
                console.log('Meetups page');
                res.render('meetups', results);

            });
        } catch (e) { throw (e) }
    });

    app.get('/about_app', (req, res) => res.render('about_app'))
    app.get('/about_team', (req, res) => res.render('about_team'))
    app.get('/burnaby_map', (req, res) => res.render('burnaby_map'))
    app.get('/room_finder', (req, res) => res.render('room_finder'))
        //app.get('/burnaby_events')
        //app.get('/dashboard/:user_id/profile')
        //app.get('/dashboard/:user_id/schedule')
        //app.get('/dashboard/:user_id/schedule/create')

    // for admin only
    //app.get('/admin/database')

}

passport.use('local', new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => {

    loginAttempt();
    async function loginAttempt() {


        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            var currentAccountsData = await JSON.stringify(client.query('SELECT * FROM login WHERE username=$1', [username], function(err, result) {

                if (err) {
                    return done(err);
                }
                if (result.rows[0] == null) {
                    //req.flash('danger', "Oops. Incorrect login details.");
                    console.log('Incorrect login details - no username');
                    return done(null, false);
                } else {
                    bcrypt.compare(password, result.rows[0].password, function(err, check) {
                        if (err) {
                            console.log('Error while checking password');
                            return done();
                        } else if (check) {
                            console.log('Correct password');
                            return done(null, result.rows[0].uid);
                        } else {
                            //req.flash('danger', "Oops. Incorrect login details.");
                            console.log('Incorrect login details: ' + username + ", " + password);
                            return done(null, false);
                        }
                    });
                }
            }))
        } catch (e) { throw (e); }
    };

}))

passport.serializeUser(function(user, done) {
    console.log('Serialize for user: ' + user);
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log('Deserialize for user: ' + user);
    done(null, user);
});