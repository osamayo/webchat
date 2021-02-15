const express = require('express');
const router = express.Router();
const R = require('../util/Resources.js');
const validate = require('../classes/sec.js');

const mail = require('../util/mailer.js');
const User = require('../classes/user.js');

const emailTemplatePath = "./views/confirmation_mail.hjs";

const urlVerifyCode = `http://${R.string.Hostname}/VerifyCode?code=`;
const url = `http://${R.string.Hostname}/`;
const signupUrl = `http://${R.string.Hostname}/signup`;
const loginUrl = `http://${R.string.Hostname}/login`;

// verification code lifetime
const lifetime = 86400; // 24 hours
const verficationMailSubject = "Complete Registration Process";

const siteEmail = R.string.Email;

const EmailRegisteredError = {message:"Email Already Registered", link: loginUrl, link_text: 'login'};
const BadRequestError = {message:"Bad Request\nTry Again", link: signupUrl, link_text: 'signup'};


const signupErrorTemplate = "./views/Signup_Error.hjs";
const verficationTemplate = "./views/verification.hjs";

const siteTitle = R.string.SiteName;

const hjs = require('hjs');
const fs = require('fs');

router.get('/', function(req, res, next) {
  res.render('signup', { title: R.string.SiteName });
});

router.post('/', function(req, res, next)
{
	console.log(req.body);

	if (req.get('Content-Type') === 'application/json')
	{
		// creating user instance
		try
		{
			var data = req.body
			var fname = validate.encode(data.fname);
			var lname = validate.encode(data.lname);
			var username = validate.encode(data.username);
			var email = validate.encode(data.email);
			var password = validate.encode(data.password);
			var vpassword = validate.encode(data.vpassword);

			var user = new User(fname, lname, username, email, password, vpassword);
			user.CheckInputs();
			// validate inputs of the user
			if (!user.ValidUser())
			{
				BadRequest(res);
			} else
			{
				// check if email already registered 
				user.checkIfEmailRegistered(function(result){
					console.log("Registered: " + result);
					if (result)
					{
						// email already registered
						EmailRegistered(res);
					} else 
					{
						// not registered
						// get code verfication
						user.getVerificationCode(lifetime, function(code)
						{
							SendVerificationEmail(user, code, res);	
						});
					}
				});
				
			}


			

		} catch (e)
		{
			console.log(e);
			BadRequest(res);
		}
		



	} else
	{
		BadRequest(res);
	}

});


function SendVerificationEmail(user, code, res)
{
	console.log("sending email");

	var codeLink = urlVerifyCode + code;
	sendMail(user.email, verficationMailSubject, codeLink, emailTemplatePath, function(err, result){
		if (err) throw err;
		console.log('Email sent to ' + user.email + " | " + result);
		var response = {error: false, message:""};
		hjs.renderFile(verficationTemplate, {title: siteTitle}, function(err, result){
			if (err) throw err;
			response.message = result;
			res.end(JSON.stringify(response));
		});	
	});


}

function sendMail(userEmail, subject, codeLink, template, fn)
{
	hjs.renderFile(template, { title: siteTitle, link: codeLink}, function(err, result){
		if (err) throw err;
		var mailOptions = {
			from: siteEmail,
			to: userEmail,
			subject: subject,
			html: result
		};

		mail.sendMail(mailOptions, fn);
	});
}

function BadRequest(res)
{
	console.log("bad request");
	var response = {error: true, message:""};
	hjs.renderFile(signupErrorTemplate, {title: siteTitle, message: BadRequestError.message, link: BadRequestError.link, link_text: BadRequestError.link_text}, function(err, result){
		if (err) throw err;
		console.log(result);
		response.message = result;
		res.end(JSON.stringify(response));
	});
}
	

function EmailRegistered(res)
{
	console.log("email registered");
	var response = {error: true, message: ""};
	hjs.renderFile(signupErrorTemplate, {title: siteTitle, message: EmailRegisteredError.message, link: EmailRegisteredError.link, link_text: EmailRegisteredError.link_text}, function(err, result){
		if (err) throw err;
		response.message = result;
		res.end(JSON.stringify(response));
	});
}




module.exports = router;
