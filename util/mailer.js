var mailer = require('nodemailer');
var hjs = require('hjs');
const R = require('./Resources.js');

var credentials = {
	user: R.string.Email,
	pass: R.string.EmailPass
};

var transporter = mailer.createTransport({
		service: R.string.EmailService,
		auth: credentials
	});

	




module.exports = transporter;