/*
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000
*/

/**
 * For the login session 
 * https://medium.com/@timtamimi/getting-started-with-authentication-in-node-js-with-passport-and-postgresql-2219664b568c
 */
var express = require('express');
require('dotenv').config();
const PORT = process.env.DATABASE_URL || 'postgres://postgres:cmpt276@localhost/study_scapes'

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

app.listen(PORT);
console.log('Node listening on port %s', PORT);