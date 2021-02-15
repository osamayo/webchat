const express = require('express');
const router = express.Router();
const R = require('../util/Resources.js');

var loginRedirect = "/login";


router.get('/', function(req, res, next) {
	console.log(req.session);

	if (!req.session.username || !req.session.fname || !req.session.lname)
	{
		// destroy the session
		req.session.destroy(function (err) {
			if (err) throw err;
		});

		// redirect the user to login
		res.redirect(loginRedirect);
	} else 
	{
		// getting userinfo from session
		var username = req.session.username;
		var fname = req.session.fname;
		var lname = req.session.lname;

		
	  	res.render('invio', { title: R.string.SiteName, fname: fname, lname: lname, username: username});
	}
});

module.exports = router;
