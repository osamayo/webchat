const mysql = require('mysql');
const R = require('./Resources.js');

var credentials = {
	host:  R.string.SqlHost,
	user: R.string.SqlUser,
	password: R.string.SqlPass,
	database: R.string.db,
	insecureAuth : true,
	charset : 'utf8mb4'
};

function SQL(credentials)
{
	this.conn = mysql.createConnection(credentials);

	function connect()
	{
		this.conn.connect(function(err)
		{
			if (err) throw err;
			console.log("mysql connected!");
		});
	}
}

module.exports = new SQL(credentials);
