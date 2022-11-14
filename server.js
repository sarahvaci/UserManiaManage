//server data, modules needed for serverjs to run
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var User = require('./models/user'); //used to express what information needed to be in database. we will make it
var hbs = require('express-handlebars'); 
var path = require('path'); 


// The express application will be run.
var app = express();

// set our application port
app.set('port', 9000);

//We will set up Morgan to log information about our requests for development purposes.
app.use(morgan('dev'));//use this logger and log all the information as if we are development mode

// We will use body-parser to parse (broken up to understandable pieces) incoming parameters requests and make them available in req.body.
app.use(bodyParser.urlencoded({ extended: true }));//when you want to send a post request across from page to another page make url encoded to be true

// We will use cookie-parser to enable us to access cookies stored in the browser. 
app.use(cookieParser()); //allows us to store cookies in browser

// We will use express-session to keep track of the logged-in user across sessions.
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs', //important for encryption sake
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000 //total secs
    }
}));

