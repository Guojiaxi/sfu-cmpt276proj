/**
 * For the login session
 * https://medium.com/@timtamimi/getting-started-with-authentication-in-node-js-with-passport-and-postgresql-2219664b568c
 * 
 * Socket.io on Heroku
 * https://devcenter.heroku.com/articles/node-websockets#option-2-socket-io
 * https://robdodson.me/deploying-your-first-node-dot-js-and-socket-dot-io-app-to-heroku/
 * https://ayushgp.github.io/Tic-Tac-Toe-Socket-IO/
 */
var express = require('express');
var app = express();

// Testing: cross-origin resource sharing
//var cors = require('cors');
//app.use("/", cors());

// FOR SOCKET
var server = require('http').Server(app);
var io = require('socket.io')(server);
var rooms = 0;
io.on('connection', (socket) => {

    // Create a new game room and notify the creator of game.
    socket.on('createGame', (data) => {
        socket.join(`room-${++rooms}`);
        socket.emit('newGame', { name: data.name, room: `room-${rooms}` });
    });

    // Connect the Player 2 to the room he requested. Show error if room full.
    socket.on('joinGame', function(data) {
        var room = io.nsps['/'].adapter.rooms[data.room];
        if (room && room.length === 1) {
            socket.join(data.room);
            socket.broadcast.to(data.room).emit('player1', {});
            socket.emit('player2', { name: data.name, room: data.room })
        } else {
            socket.emit('err', { message: 'Sorry, The room is full!' });
        }
    });

    /**
     * Handle the turn played by either player and notify the other.
     */
    socket.on('playTurn', (data) => {
        socket.broadcast.to(data.room).emit('turnPlayed', {
            tile: data.tile,
            room: data.room
        });
    });

    /**
     * Notify the players about the victor.
     */
    socket.on('gameEnded', (data) => {
        socket.broadcast.to(data.room).emit('gameEnd', data);
    });
});


var passport = require("passport"); //authentication middleware - modular

var request = require('request'); //for HTTP calls
const { Pool, Client } = require('pg') //add Client for session
const bcrypt = require('bcrypt'); //hashed passwords
const { DEFAULT_MIN_VERSION } = require('tls');
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
        'postgres://postgres:cmpt276@localhost/study_scapes', // Celina's local db
    //'postgres://postgres:root@localhost/study_scapes' // Josh's local db
});

const strcmp = (str1, str2) => {
    if (str1.length != str2.length) {
        return false;
    }

    for (let i = 0; i < str1.length; i++) {
        if (str1[i] != str2[i]) {
            return false;
        }
    }

    return true;
};

const replaceChar = (str, charToReplace, char) => {
    var newStr = ""
    for (let i = 0; i < str.length; i++) {
        newStr += (str[i] != charToReplace) ? str[i] : char;
    }
    return newStr;
};

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

    app.post('/sign_up_submit', async function(req, res) {

        try {
            const client = await pool.connect()
            await client.query('BEGIN')
                //encrypted - hashed - password
            var pwd = await bcrypt.hash(req.body.password, 5);

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
    app.get('/home_none', (req, res) => res.render('err_pages/home_none'));

    //Admin view displays the whole login database
    app.get('/home_admin', function(req, res, next) {
        try {
            var unameQuery = ('SELECT * FROM login ORDER BY uid');

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
    app.get('/login_none', (req, res) => res.render('err_pages/login_none'));

    //Meetups page
    //Needs different views for different users
    app.get('/meetup', async function(req, res) {
        try {
            const client = await pool.connect()
            await client.query('BEGIN')

            await JSON.stringify(client.query('SELECT * FROM login WHERE uid = ' + req.user, function(err, result) {

                if (err) {
                    //Redirect to meetup error page
                    res.redirect('/meetup_none');
                } else {

                    var results = { 'results': result.rows }
                    var role = String(result.rows[0].role);
                    var admin = "admin";
                    var isAdmin = true;

                    console.log("User is: " + role);

                    //Admin
                    for (var j = 0; isAdmin == true && j < admin.length; j++) {
                        if (role[j] != admin[j]) {
                            isAdmin = false;
                        }
                    }

                    if (isAdmin) {

                        client.query('COMMIT')

                        //Admin meetups page needs to display all db entries
                        //Need to redirect to another route
                        console.log('User is ADMIN');
                        res.redirect('/meetup_admin');

                        return;
                    }

                    client.query('SELECT * FROM meetup WHERE ' + req.user + ' = ANY(users) ORDER BY mid', function(err, result) {

                        if (err) {
                            res.redirect('/meetup_none');
                        } else {
                            var results = { 'results': result.rows }

                            var faculty = "faculty";
                            var isFaculty = true;

                            //Faculty
                            for (var i = 0; isFaculty == true && i < faculty.length; i++) {
                                if (role[i] != faculty[i]) {
                                    isFaculty = false;
                                }
                            }

                            //Determine view to render
                            if (isFaculty) {
                                client.query('COMMIT')

                                console.log('User is Faculty');
                                res.render('meetups_faculty', results);

                            } else {
                                client.query('COMMIT')

                                console.log('User is a Student');
                                res.render('meetups_student', results);
                            }

                            return;
                        }
                    });
                }
            }));

            client.release();

        } catch (e) {
            //Redirect to meetup error page
            res.redirect('/meetup_none');
        }
    });

    //Meetups error page
    //Page for when the user has no meetups
    app.get('/meetup_none', (req, res) => res.render('err_pages/meetups_none'));

    //View all meetups
    app.get('/meetup_admin', function(req, res, next) {

        try {
            console.log("meetup admin");
            var meetupQuery = ('SELECT * FROM meetup ORDER BY mid');

            //Set return values for success and failure
            pool.query(meetupQuery, (error, result) => {
                if (error) {
                    res.redirect('/meetup_none');
                } else {
                    try {
                        //Render the admin page for meetups
                        var results = { 'results': result.rows }
                        console.log('Meetups page');
                        res.render('meetups_admin', results);
                    } catch (e) {
                        res.redirect('/meetup_none');
                    }
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

        //Delete row from person table
        var cancelQuery = 'UPDATE meetup SET is_cancelled = true where mid = ' + mid;

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


    });

    //Page to edit meetup data
    app.post('/meetup_edit', (req, res) => {
        var mid = req.body.mid;

        //View a row's from person table
        var viewQuery = 'SELECT * FROM meetup WHERE mid = ' + mid + " ORDER BY mid";

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

    });

    //Edit a meetup - from submitted data
    app.post('/meetup_edit_submit', (req, res) => {
        var mid = req.body.mid;
        var date = req.body.date;
        var time = req.body.time;
        var location = req.body.location;
        var is_pending = true;

        console.log(mid + ", " + date + ", " + time + ", " + location + ", " + is_pending);

        //View a row from meetup table
        var editQuery = 'UPDATE meetup SET date=\'' + date + '\', time=\'' + time + '\', location=\'' + location + '\', is_pending=' + is_pending + ' WHERE mid=' + mid;
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
    });

    //Page to confirm a requested/pending meetup
    app.post('/meetup_confirm', (req, res) => {
        var mid = req.body.mid;

        //View a row's from person table
        var confirmQuery = 'UPDATE meetup SET is_pending = FALSE WHERE mid = ' + mid;

        try {
            pool.query(confirmQuery, (error, result) => {
                if (error) {
                    res.redirect('/meetup_none');
                } else {
                    res.redirect('/meetup');
                }

            });
        } catch (e) {
            res.redirect('/meetup_none');
        }

    });

    //Page to remove a cancelled meetup
    app.post('/meetup_remove', async function(req, res) {
        var mid = req.body.mid;
        try {
            const client = await pool.connect()
            await client.query('BEGIN')

            await JSON.stringify(client.query('SELECT * FROM meetup WHERE mid = ' + mid, function(err, result) {
                if (err) {
                    //Redirect to meetup error page
                    res.redirect('/meetup_none');
                } else {
                    client.query('COMMIT')
                    var results = { 'results': result.rows }
                    var is_cancelled = result.rows[0].is_cancelled;

                    console.log("is_cancelled:" + is_cancelled);

                    //Check if the meetup has been cancelled, then it can be removed 
                    if (!is_cancelled) {
                        console.log("Not cancelled: don't remove it");
                        res.redirect('/meetup_none');
                        return;

                    } else {
                        console.log("Cancelled: remove it");
                        client.query('DELETE FROM meetup WHERE mid = ' + mid, function(err, result) {

                            try {

                                if (err) {
                                    res.redirect('/meetup_none');
                                } else {
                                    client.query('COMMIT')
                                    res.redirect('/meetup');
                                    return;
                                }
                            } catch (e) {
                                res.redirect('/meetup_none');
                            }
                        });
                    }
                }
            }));

            client.release();

        } catch (e) {
            //Redirect to meetup error page
            res.redirect('/meetup_none');
        }

    });

    //Request a meetup
    app.get('/meetup_request', (req, res) => {
        try {
            var userQuery = ('SELECT role, username, uid FROM login ORDER BY role, username');

            //Set return values for success and failure
            pool.query(userQuery, (error, result) => {
                if (error) {
                    res.redirect('/meetup_none');
                } else {
                    try {
                        var results = { 'results': result.rows }
                            //render meetups request page
                        res.render('meetups_request', results);

                    } catch (e) {
                        res.redirect('/meetup_none');
                    }
                }
            });
        } catch (e) {
            //throw (e)
            res.redirect('/meetup_none');
        }
    });

    //Request a meeting from form submit button
    app.post('/meetup_request_submit', (req, res) => {
        var users = req.body.users;
        var date = req.body.date;
        var time = req.body.time;
        var location = req.body.location;
        var is_pending = true;
        var is_cancelled = false;

        //Add a row to the meetup table
        var requestQuery = 'INSERT INTO meetup(users, date, time, location, is_pending, is_cancelled) VALUES(\'{' + users + '}\', \'' + date + '\', \'' + time + '\', \'' + location + '\', ' + is_pending + ', ' + is_cancelled + ')';
        try {
            pool.query(requestQuery, (error, result) => {

                // MOCHA TEST
                //ob = { 'users': users, 'date': date, 'time': time, 'location': location };
                //res.send(ob)

                if (error) {
                    console.log("query err");
                    console.log(users + ", " + date + ", " + time + ", " + location + ", " + is_pending + ", " + is_cancelled);
                    res.redirect('/meetup_none');
                } else {
                    res.redirect('/meetup');
                }
            });
        } catch (e) {
            console.log("catch err");
            res.redirect('/meetup_none');
        }
    });

    app.get('/burnaby_map', (req, res) => { res.render('burnaby_map'); });
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
            res.redirect('home_none');
        }
    });
    app.get('/event_request', (req, res) => {
        res.render('event_request');
    });

    app.post('/event_request_submit', (req, res) => {
        var eventName = req.body.name,
            hostName = req.body.host_name,
            startDatetime = replaceChar(req.body.start_datetime, 'T', ' '),
            endDatetime = replaceChar(req.body.end_datetime, 'T', ' '),
            location = req.body.location,
            otherLocation = req.body.other_location,
            website = req.body.website;

        console.log(typeof(startDatetime));
        var insertQuery = "INSERT INTO event(name, host_name, url, location, start_datetime, end_datetime) " +
            `VALUES ('${eventName}', '${hostName}', '${website}', '${(strcmp(location, "OTHER")) ? otherLocation : location}', ` +
            `TO_TIMESTAMP('${startDatetime}', 'YYYY-MM-DD HH24:MI'), TO_TIMESTAMP('${endDatetime}', 'YYYY-MM-DD HH24:MI'));`

        try {
            pool.query(insertQuery, (error, result) => {
                if (error) {
                    console.log("event postgres insert error.");
                    console.log(`eventName: ${eventName}, hostName: ${hostName}, website: ${website}, location: ${location}, ` +
                        `otherLocation: ${otherLocation}, startDatetime: ${startDatetime}, endDatetime: ${endDatetime}`);
                    console.log(error.stack);
                }
                res.redirect('burnaby_events');
            });
        } catch (e) {
            res.redirect('home_none');
        }
    });

    // Greate new game
    app.get('/new_game', (req, res) => {
        res.redirect('gameboard');
    });

    app.post('/new_game_submit', (req, res) => {
        res.redirect('gameboard');
    });


    // Join existing game
    app.get('/join_game', (req, res) => {
        res.redirect('gameboard');
    });

    app.post('/join_game_submit', (req, res) => {
        res.redirect('gameboard');
    });

    // Gameboard
    app.get('/gameboard', (req, res) => {
        res.render('gameboard');
    });

    app.get('/minigame', (req, res) => res.render('minigame'));

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

// For testing with cors
//module.exports = app;