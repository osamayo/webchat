var express = require('express');
var router = express.Router();
var url = require('url');
const User = require('../classes/user.js');
const R = require('../util/Resources.js');
const validate = require('../classes/sec.js');

const codePatt = /^[a-zA-Z0-9]+$/;
const codeLength = 30;
const lifetime = 86400; // 24 hours

const siteTitle = R.string.SiteName;

const siteUrl = `http://${R.string.Hostname}/`;
const signupUrl = `http://${R.string.Hostname}/signup`;
const loginUrl = `http://${R.string.Hostname}/login`;

const BadRequestError = {message:"Bad Request\nTry Again", link: signupUrl, link_text: 'signup'};
const InvalidLinkError = {message: "You 've followed an invalid link\nPlease to signup again!", link: signupUrl, link_text: 'signup'};
const success  = {message: "Thanks for registration.\nYou 've completed the registration process successfully.\nYou can login from the following link.", link: loginUrl, link_text: 'login'};


router.get('/', function(req, res, next) {
	var reqData = url.parse(req.url, true);
	var code = validate.encode(reqData.query.code);
	console.log(code);
	try 
	{
		if (code.match(codePatt) && (code.length === codeLength || code.length === codeLength -1))
		{
			console.log("code match");
			// RegisterUser(code, lifetime, callback)
			// result = {error: , message: }
			User.RegisterUser(code, lifetime, function(result){
				if (result.error)
				{
					// invalid link case
					console.log(result.message);
					InvalidLink(res);
				} else 
				{
					//valid link + registration completed successfully
					console.log(result.message);
					RegistrationCompleted(res);
				}
			});

		} else
		{
			console.log("code doesn't match");
			BadRequest(res);
		}
	} catch(e)
	{
		console.log(e);
		BadRequest(res);
	}
	

  	
});


function BadRequest(res)
{
	console.log("bad request");
	res.render('VerifyCode', {title: siteTitle, message: BadRequestError.message, link: BadRequestError.link, link_text: BadRequestError.link_text});

}

function InvalidLink(res)
{
	console.log("Invalid Link");
	res.render('VerifyCode', {title: siteTitle, message: InvalidLinkError.message, link: InvalidLinkError.link, link_text: InvalidLinkError.link_text});

}

function RegistrationCompleted(res)
{
	console.log("Registration Completed");
	res.render('VerifyCode', {title: siteTitle, message: success.message, link: success.link, link_text: success.link_text});

}

module.exports = router;
