/**
 * For the login session 
 * https://medium.com/@timtamimi/getting-started-with-authentication-in-node-js-with-passport-and-postgresql-2219664b568c
 */
var express = require('express');
require('dotenv').config();
//const PORT = process.env.DATABASE_URL || 'postgres://postgres:cmpt276@localhost/study_scapes'
const PORT = process.env.PORT || 5000

//Pool connection string
const { Pool } = require('pg');
var pool;
pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
        /* change this according to your local postgres password */
        'postgres://postgres:cmpt276@localhost/study_scapes'
        //'postgres://postgres:root@localhost/study_scapes'
})

var flash = require('connect-flash'); //middleware to notify user

var passport = require("passport"); //authentication middleware - modular
var request = require('request'); //for HTTP calls

/**
 * More for login session
 */

var session = require('express-session'); //session management - cookies
//app.use(expressSession({ secret: 'mySecretKey' }));

var app = express();

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));

//This order is ESSENTIAL: require, use, init(), sess()
//https://stackoverflow.com/questions/29111571/passports-req-isauthenticated-always-returning-false-even-when-i-hardcode-done
app.use(session({ secret: 'keyboard cat' }))
app.use(passport.initialize());
app.use(passport.session());

var bodyParser = require('body-parser') //for parsing json

var path = require('path');

app.use('/public', express.static(__dirname + '/public'));

app.use(flash());

app.use(bodyParser());
//app.set('view engine', 'pug');
app.set('view engine', 'ejs');
app.set('view options', { layout: false });

require('./lib/routes.js')(app); //might need this to contain routes and logic

/*
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
*/

//app.listen(PORT);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
    //console.log('Node listening on port %s', PORT);