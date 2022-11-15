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

// This is the handle bars configuration.
app.engine('hbs', hbs({extname: 'hbs',defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'})); //this is a file called layout handlebars and where is it? In the directory.
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'hbs'); //we dont want to run the html always if its not changing so we use layout file. every file we create will inherit info from the layout file.
// This middleware will check if a user's cookie is still saved in a browser and the user is not set. If so, it will automatically log the user out.
// This usually happens when you stop your express server after logging in. Your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});

//content for handlebars and it will change 

var hbsContent = {userName: '', loggedin: false, title: "You are not logged in today", body: "Hello World"}; 

// change : middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
		
        res.redirect('/dashboard');
    } else {
        next();
    }    
};


// route for Home-Page. when someone localhost 9000 we need to catch that route and reroute to correct place
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});


// route for user signup
app.route('/signup')
    //.get(sessionChecker, (req, res) => {
    .get((req, res) => {
        //res.sendFile(__dirname + '/public/signup.html');
        res.render('signup', hbsContent); //hbs is like html page
    })
    .post((req, res) => {
        User.create({
            username: req.body.username,
            //email: req.body.email,
            password: req.body.password
        })
        .then(user => {
            req.session.user = user.dataValues;
            res.redirect('/dashboard');
        })
        .catch(error => {
            res.redirect('/signup');
        });
    });


// route for user Login
app.route('/login')
    .get(sessionChecker, (req, res) => {
        //res.sendFile(__dirname + '/public/login.html');
        res.render('login', hbsContent);
    })
    //check to see when you type in user name and pass you make a post req but how do we check is a valid login?
    .post((req, res) => {
        var username = req.body.username,
            password = req.body.password;

        User.findOne({ where: { username: username } }).then(function (user) {
            if (!user) {
                res.redirect('/login');
            } else if (!user.validPassword(password)) {
                res.redirect('/login');
            } else {
                req.session.user = user.dataValues;
                res.redirect('/dashboard');
            }
        });
    });


// route for user's dashboard. first check to see if logged in
app.get('/dashboard', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
		hbsContent.loggedin = true; 
		hbsContent.userName = req.session.user.username; 
		//console.log(JSON.stringify(req.session.user)); 
		console.log(req.session.user.username); 
		hbsContent.title = "You are logged in"; 
        //res.sendFile(__dirname + '/public/dashboard.html');
        res.render('index', hbsContent);
    } else {
        res.redirect('/login');
    }
});


// route for user logout
app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
		hbsContent.loggedin = false; 
		hbsContent.title = "You are logged out!"; 
        res.clearCookie('user_sid');
		console.log(JSON.stringify(hbsContent)); 
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});


// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
});


// start the express server
app.listen(app.get('port'), () => console.log(`App started on port ${app.get('port')}`));