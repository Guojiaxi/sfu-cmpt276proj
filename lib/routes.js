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

//Temporary Admin Login Info -insecure!
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
    //Login page - main
    app.get('/', function(req, res, next) {
        res.render('login');

        console.log("user" + user);
    });

    //About page
    app.get('/about_app', function(req, res) {
        res.render('about_app');

        console.log("user" + user);
    });

    //About page - team
    app.get('/about_team', (req, res) => res.render('about_team'))

    //Sign up for account
    app.get('/sign_up', function(req, res, next) {
        //render sign up page
        res.render('sign_up');
    });

    app.post('/sign_up_btn', async function(req, res) {

        try {
            const client = await pool.connect()
            await client.query('BEGIN')
            var pwd = await bcrypt.hash(req.body.password, 5); //encrypted password

            await JSON.stringify(client.query('SELECT username FROM login WHERE username=$1', [req.body.username], function(err, result) {
                if (result.rows[0]) {
                    //Check for existing username
                    console.log('Username already registered');
                    res.redirect('/signup_none');

                } else {
                    client.query('INSERT INTO login (username, password, role) VALUES ($1, $2, $3)', [req.body.username, pwd, req.body.role], function(err, result) {
                        if (err) {
                            console.log(err);
                            console.log("insert err");
                            res.redirect('/signup_none');

                        } else {
                            client.query('COMMIT')
                            console.log('User successfully created');

                            //Redirect to login page - main
                            res.redirect('/');
                            return;
                        }
                    });
                }
            }));

            client.release();

        } catch (e) {
            console.log("pool err");
            res.redirect('/signup_none');
        }
    });

    //Sign up error page
    app.get('/signup_none', function(req, res, next) {
        res.render('err_pages/signup_none');
    });

    //Home page after login
    app.get('/home', function(req, res, next) {
        try {
            var unameQuery = ('SELECT * FROM login WHERE uid=' + req.user);

            //Set return values for success and failure
            pool.query(unameQuery, (error, result) => {

                if (error) {
                    res.redirect('/home_none');
                } else {
                    try {
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
                            res.redirect('/home_admin');
                        } else {
                            console.log('User is a Student');
                            res.render('home_student', results);
                        }
                    } catch (e) {
                        res.redirect('/home_none');
                    }
                }

            });
        } catch (e) {
            //throw (e) 
            res.redirect('/home_none');
        }
    });

    //Page for when the user has no home/wrong login/sign up error
    app.get('/home_none', (req, res) => res.render('err_pages/home_none'))

    //Admin view displays the whole login database
    app.get('/home_admin', function(req, res, next) {
        try {
            var unameQuery = ('SELECT * FROM login');

            //Set return values for success and failure
            pool.query(unameQuery, (error, result) => {
                if (error) {
                    res.redirect('/home_none');
                } else {
                    try {
                        var results = { 'results': result.rows }
                        console.log('User is ADMIN');
                        res.render('home_admin', results);

                    } catch (e) {
                        res.redirect('/home_none');
                    }
                }
            });
        } catch (e) {
            //throw (e) 
            res.redirect('/home_none');
        }
    });

    //For user login - action, not page
    app.get('/login', function(req, res, next) {
        if (req.isAuthenticated()) {
            console.log('Logging in');
            res.redirect('/home');
        } else {
            res.redirect('home_none');
        }

    });

    //To log out the user
    app.get('/logout', function(req, res) {

        console.log(req.isAuthenticated());
        req.logout();
        console.log(req.isAuthenticated());

        console.log('Logged out');
        res.redirect('/');
    });

    //User login - on button press
    app.post('/login', passport.authenticate('local', {
        //Success redirects to home page
        successRedirect: '/home',

        //Failure redirects to login error page
        failureRedirect: '/login_none'

    }), function(req, res) {
        if (req.body.remember) {
            // Cookie expires after 30 days
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        } else {
            // Cookie expires at end of session
            req.session.cookie.expires = false;
        }
        res.redirect('/');
    });


    //Login error page
    //Page for when the user login fails
    app.get('/login_none', (req, res) => res.render('err_pages/login_none'))

    //Meetups page 
    //Needs different views for different users
    app.get('/meetup', function(req, res, next) {

        var meetupQuery = ('SELECT * FROM meetup JOIN login ON (uid = ' + req.user + ') WHERE ' + req.user + '= ANY(users)');
        try {
            //Set return values for success and failure
            pool.query(meetupQuery, (error, result) => {
                if (error) {
                    //Redirect to meetups error page
                    res.redirect('/meetup_none');

                } else {
                    try {

                        var results = { 'results': result.rows }

                        //this is pretty excessive, because string compare is being weird
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
                            res.render('meetups_faculty', results);

                        } else if (isAdmin) {
                            //Admin meetups page needs to display all db entries
                            //Need to redirect to another route
                            console.log('User is ADMIN');
                            res.redirect('/meetup_admin');

                        } else {
                            console.log('User is a Student');
                            res.render('meetups_student', results);
                        }
                    } catch (e) {
                        res.redirect('/meetup_none');
                    }
                }
            });

        } catch (e) {
            //Redirect to home page on error
            res.redirect('/home');
        }

    });

    //Meetups error page
    //Page for when the user has no meetups
    app.get('/meetup_none', (req, res) => res.render('err_pages/meetups_none'))

    //View all meetups
    app.get('/meetup_admin', function(req, res) {
        var meetupQuery = ('SELECT * FROM meetup');

        try {
            //Set return values for success and failure
            pool.query(meetupQuery, (error, result) => {
                if (error) {
                    res.redirect('/meetup_none');
                } else {
                    try {

                    } catch (e) {
                        //Render the admin page for meetups
                        var results = { 'results': result.rows }
                        console.log('Meetups page');
                        res.render('meetups_admin', results);
                    }
                    res.redirect('/meetup_none');
                }
            });
        } catch (e) {
            //Redirect to meetups error page
            res.redirect('/meetup_none');
        }
    });

    //Cancel a meetup
    //Student view
    app.post('/meetup_cancel', (req, res) => {
        var mid = req.body.mid;
        var iscancelled = true;

        //Delete row from person table
        var cancelQuery = 'UPDATE meetup SET iscancelled = ' + iscancelled + ' where mid = ' + mid;

        try {
            pool.query(cancelQuery, (error, result) => {
                if (error) {
                    res.redirect('/meetup_none');
                } else {
                    res.redirect('/meetup');
                }

            });
        } catch (e) {
            res.redirect('/meetup_none');
        }


    })

    //Page to edit meetup data
    app.post('/meetup_edit', (req, res) => {
        var mid = req.body.mid;

        //View a row's from person table
        var viewQuery = 'SELECT * FROM meetup WHERE mid = ' + mid;

        try {
            pool.query(viewQuery, (error, result) => {
                if (error) {
                    res.redirect('/meetup_none');
                } else {
                    var results = { 'results': result.rows }
                    res.render('meetups_edit', results);
                }

            });
        } catch (e) {
            res.redirect('/meetup_none');
        }

    })

    //Edit a meetup - from submitted data
    app.post('/meetup_edit_submit', (req, res) => {
        var mid = req.body.mid;
        var date = req.body.date;
        var time = req.body.time;
        var location = req.body.location;
        var ispending = true;

        //View a row from meetup table
        var editQuery = 'UPDATE meetup SET date=\'' + date + '\', time=\'' + time + '\', location=\'' + location + '\', ispending=' + ispending + ' WHERE mid=' + mid;
        try {
            pool.query(editQuery, (error, result) => {
                if (error) {
                    console.log("err" + result);
                    res.redirect('/meetup_none');
                } else {
                    console.log("else" + result);
                    res.redirect('/meetup');
                }

            });
        } catch (e) {
            console.log("catch" + result);
            res.redirect('/meetup_none');
        }
    })

    app.get('/burnaby_map', (req, res) => res.render('burnaby_map'))
    app.get('/room_finder', (req, res) => res.render('room_finder'))
    app.get('/burnaby_events', (req, res) => {
        try {
            var eventsQuery = "SELECT name, host_name, url, location, " +
                "TO_CHAR(start_datetime, 'Mon DD') start_date, " +
                "TO_CHAR(start_datetime, 'HH24:MI') start_time, " +
                "TO_CHAR(end_datetime, 'Mon DD') end_date, " +
                "TO_CHAR(end_datetime, 'HH24:MI') end_time " +
                "FROM event ORDER BY start_datetime ASC, name ASC";

            pool.query(eventsQuery, (error, result) => {
                if (error) {
                    res.end('error');
                }
                var results = { 'results': result.rows };
                console.log('Events List Page');
                res.render('events_list', results);
            });
        } catch (e) {
            res.redirect('home');
        }
    });
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
                            console.log('Incorrect login details: ' + username + ", " + password);
                            return done(null, false);
                        }
                    });
                }
            }))
        } catch (e) {
            //throw (e);
            res.redirect('/home_none');
        }
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