function R()
{
	this.string = {
		SiteName: "Invio",
		SecretSessionKey: "secretkey",
		Email: 'example@example.com', // email
		EmailPass: '', // email pass
		EmailService: 'gmail', // mail service
		Hostname: 'localhost',
		SqlHost: 'localhost',
		SqlUser: 'user', // username in mysql
		db: 'webchat', // database name
		SqlPass: '', // sql password
		salt: 'salt' // salt for password hashing
		
	}

	this.color = {

	}
}


module.exports = new R();