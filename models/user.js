//focus on three attributes ID used in mysql database, Username and Password

//create the required modules
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt'); //hash password bcrypt
	
// create a sequelize instance with our local postgres database information.
const sequelize = new Sequelize('ourDatabase', 'root', 'password', {
	host:'localhost',
	port: 3306,
	dialect:'mysql',
	pool:{
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	}, 
	operatorsAliases: false
});

// setup User table called users and its fields.
var User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
	username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}); 

//we want the user password they have given us to be encrypted so we create a before create function that accepts username and options as input
User.beforeCreate((user, options) => {
	const salt = bcrypt.genSaltSync();
	user.password = bcrypt.hashSync(user.password, salt);
});
  
 //everytime we come back to database we check if the user exists by creating a function
User.prototype.validPassword = function(password) {
        return bcrypt.compareSync(password, this.password);
      }; 

// create all the defined tables in the specified database.
sequelize.sync()
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(error => console.log('This error occured', error));

// export User model for use in other files.
module.exports = User;