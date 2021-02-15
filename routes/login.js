const express = require('express');
const router = express.Router();
const User = require('../classes/user.js');
const R = require('../util/Resources.js');
const validate = require('../classes/sec.js');

var BadRequestError = "Bad request!\nPlease try again";
var InvalidCredentialError = "Invalid credentials!";


router.get('/', function(req, res, next) {
  	res.render('login', { title: R.string.SiteName });
});

router.post('/', function(req, res, next) {
	console.log(req.body);

	if (req.get('Content-Type') === 'application/json')
	{
		// getting credetials and try login
		try
		{
			var data = req.body;
			// data should be json object otherwise it's a bad request
			console.log(validate);
			var username = validate.encode(data.username);
			var password = validate.encode(data.password);
			if (username.trim() === "" || password.trim() === "")
			{
				BadRequest(res)
			} else 
			{
				// try login
				User.Login(username, password, function(err, result)
				{
					if (err) 
					{
						//	username patt doesn't match or not found these credentials in db
						InValidUser(res);
					} else
					{
						// found match credentials and result contains the username
						var user = result; // username
						req.session.username = user.username; // saving the session of the user
						req.session.fname = user.fname;
						req.session.lname = user.lname;
						// redirect the user to chat page
						ValidUser(res);
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

function BadRequest(res)
{
	var ret = {error: true, message: BadRequestError};
	res.end(JSON.stringify(ret));
}

function InValidUser(res)
{
	var ret = {error: true, message: InvalidCredentialError};
	res.end(JSON.stringify(ret));
}


function ValidUser(res)
{
	var ret = {error: false, message: "success"};
	res.end(JSON.stringify(ret));
}

module.exports = router;
