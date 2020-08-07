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
        'postgres://postgres:cmpt276@localhost/study_scapes' // celina's local db
        //'postgres://postgres:root@localhost/study_scapes' // josh's local db
})

var passport = require("passport"); //authentication middleware - modular
var request = require('request'); //for HTTP calls

/**
 * More for login session
 */

var session = require('express-session'); //session management - cookies
//app.use(expressSession({ secret: 'mySecretKey' }));

var app = express();

// Testing: cross-origin resource sharing
var cors = require('cors');
app.use("/", cors());

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

app.use(bodyParser());
//app.set('view engine', 'pug');
app.set('view engine', 'ejs');
app.set('view options', { layout: false });

// Need this to contain routes and logic
require('./lib/routes.js')(app);


/*socket
const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

let rooms = 0;

app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
});

io.on('connection', (socket) => {

    // Create a new game room and notify the creator of game.
    socket.on('createGame', (data) => {
        socket.join(`room-${++rooms}`);
        socket.emit('newGame', { name: data.name, room: `room-${rooms}` });
    });

    // Connect the Player 2 to the room he requested. Show error if room full.
    socket.on('joinGame', function (data) {
        var room = io.nsps['/'].adapter.rooms[data.room];
        if (room && room.length === 1) {
            socket.join(data.room);
            socket.broadcast.to(data.room).emit('player1', {});
            socket.emit('player2', { name: data.name, room: data.room })
        } else {
            socket.emit('err', { message: 'Sorry, The room is full!' });
        }
    });


       //Handle the turn played by either player and notify the other.

    socket.on('playTurn', (data) => {
        socket.broadcast.to(data.room).emit('turnPlayed', {
            tile: data.tile,
            room: data.room
        });
    });


       // Notify the players about the victor.
       
    socket.on('gameEnded', (data) => {
        socket.broadcast.to(data.room).emit('gameEnd', data);
    });
});

server.listen(process.env.PORT || 5000);
*/

//app.listen(PORT);
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
//console.log('Node listening on port %s', PORT);

// For testing with cors
module.exports = app;