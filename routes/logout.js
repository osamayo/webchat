const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next)
{
	// destroy the session
	req.session.destroy();

	// rediret to index
	res.redirect("/");
});


module.exports = router;