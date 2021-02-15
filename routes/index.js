const express = require('express');
const router = express.Router();
const R = require('../util/Resources.js');

router.get('/', function(req, res, next) {
  res.render('index', { title:  R.string.SiteName});
});

module.exports = router;
