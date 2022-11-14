//server data, modules needed for serverjs to run
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var User = require('./models/user'); //used to express what infor needed to be in database
var hbs = require('express-handlebars'); 
var path = require('path'); 

