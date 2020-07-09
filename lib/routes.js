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

                for (var i = 0; isFaculty == true && i < faculty.length; i++) {
                    if (role[i] != faculty[i]) {
                        isFaculty = false;
                    }
                }

                if (isFaculty) {
                    console.log('User is Faculty');
                    res.render('home_faculty', results);
                } else {
                    console.log('User is a Student');
                    res.render('home_student', results);
                }
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

    app.get('/about_app', (req, res) => res.render('about_app'))
    app.get('/about_team', (req, res) => res.render('about_team'))
    app.get('/burnaby_map', (req, res) => res.render('burnaby_map'))
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
                            console.log('Incorrect login details');
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

//identifies current chat
var chatID;
//link to chat page
app.get('/chat/:username/:chatID', (req, res) => {
    var username = req.params.username;
    chatID = req.params.chatID;
    var getmessagesQuery = "SELECT * FROM messages where chatID = " + chatID + "ORDER BY time ASC;" +
        "SELECT * FROM chats WHERE '" + username + "'= any(participants);" +
        "SELECT * FROM login WHERE username = '" + username + "';" +
        "SELECT * FROM chats WHERE chatID = " + chatID;

    pool.query(getmessagesQuery, (error, result) => {
        if (error)
            res.end(error);
        var mesData = { 'mesInfo': result[0].rows, 'chatInfo': result[1].rows, 'data': result[2].rows[0], 'currentchat': result[3].rows[0] }
        res.render('chat', mesData);
    })
})

app.post('/chat/:username/create', (req, res) => {
    username = req.params.username;
    var makechatQuery = "INSERT INTO chats VALUES (default, '" + req.body.chatnameinput + "', ARRAY ['" + username + "'])"
    var getunameQuery = "SELECT * FROM login WHERE username = '" + username + "'"

    pool.query(makechatQuery, (error, unused) => {
        if (error)
            res.end(error);
        pool.query(getunameQuery, (error, result) => {
            if (error)
                res.end(error);
            var username = result.rows[0]
            res.render('group', username);
        })
    })
})

io.on('connection', (socket) => {
    console.log('user connected');
    socket.join(chatID);
    console.log("in chat: " + chatID)

    //temporary ask for username
    socket.on('username', (username) => {
        socket.username = username;
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on("chat_message", (info) => {
        //broadcast message to everyone in port:5000 except yourself.
        socket.to(info.chatID).emit("received", { name: socket.username, message: info.msg });
        var storemessageQuery = "INSERT INTO messages VALUES (" + info.chatID + ", default, '" + socket.username + "', " + "'" + info.msg + "')";
        pool.query(storemessageQuery, (error, result) => {})

        socket.emit("chat_message", { name: socket.username, message: info.msg });
    });

    socket.on("add_participant", (info) => {
        var addparticipantQuery = "update chats set participants = array_append(participants, '" + info.msg + "') where chatid = " + info.chatID
        pool.query(addparticipantQuery, (error, result) => {})

        var userAddedMessage = socket.username + " added " + info.msg + " to the chat."
        socket.to(info.chatID).emit("received", { name: socket.username, message: userAddedMessage });
        socket.emit("chat_message", { name: socket.username, message: userAddedMessage });

        var storemessageQuery = "INSERT INTO messages VALUES (" + info.chatID + ", default, '" + socket.username + "', " + "'" + userAddedMessage + "')";
        pool.query(storemessageQuery, (error, result) => {})
    })
});