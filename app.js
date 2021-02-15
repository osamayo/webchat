const createError = require('http-errors');
const express = require('express');
// const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');


const indexRouter = require('./routes/index');
const signupRouter = require('./routes/signup');
const loginRouter = require('./routes/login');
const invioRouter = require('./routes/invio');
const verifyCodeRouter = require('./routes/VerifyCode');
const wsRouter = require('./routes/websocket');
const logoutRouter = require('./routes/logout');

const conn = require('./util/sql.js');

const app = express();

const R = require('./util/Resources.js');

// setting session env
const sessionCookieLifeTime = 1 * 60 * 60 * 1000 ;// 1 min

var cookieOptions = {
	path: '/',
	httpOnly: true,
	secure: false,
	maxAge: sessionCookieLifeTime
};

var sessionParser = session({
	key: 'sid',
	secret: R.string.SecretSessionKey,
	resave: false,
	saveUninitialized: true,
	cookie: cookieOptions
});

app.use(sessionParser);



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/signup', signupRouter);
app.use('/index', indexRouter);
app.use('/login', loginRouter);
app.use('/invio', invioRouter);
app.use('/VerifyCode', verifyCodeRouter);
app.use('/logout', logoutRouter);


process.env.NODE_ENV= "development";
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// var server = https.createServer(
// 	{
// 		key: fs.readFileSync(''),
// 		cert: fs.readFileSync(''),
// 		ca: fs.readFileSync('')
		
// 	}, app);

var server = http.createServer(app);


// web socket upgrading request
server.on('upgrade', function (request, socket, head) {
	console.log('Parsing session from request...');

	sessionParser(request, {}, () => {

	    if (!request.session.username) {
	      console.log("not valid session");
	      console.log(request.session);
	      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
	      socket.destroy();
	      return;
	    }

	    console.log('Session is parsed!');

	    if (url.parse(request.url).pathname!=="/ws")
	    {
	    	console.log('invalid url: ' + request.url);
	    	socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
	    	socket.destroy();
	    	return;
	    }

	    wsRouter.handleUpgrade(request, socket, head, function (ws) {
	      wsRouter.emit('connection', ws, request);
	    });
  	});

});

server.listen(80, function()
{
	console.log("Listening on http://localhost:80")
});

module.exports = app;
