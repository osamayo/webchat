"use strict";

const md5 = require('md5');
const R = require('../util/Resources.js');

var characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
var emailPatt = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+\.[a-z]+$/;
var namePatt = /^[a-zA-Z0-9]+$/;
var codeLength = 30;

var EmailExistsError = "Email Already Regiterd";
var codeNotExistsError = "Something went wrong\nThe link you followed is not valid";
var codeIsExpiredError = "The link you followed is expired!";

var Random = require('./random.js');
var Time = require('./time.js');
var conn = require('../util/sql.js').conn;

class User {

	constructor(fname, lname, username, email, password, vpassword)
	{
		this.fname = fname;
		this.lname = lname;
		this.username = username;
		this.email = email;
		this.password = password;
		this.vpassword = vpassword;
	}

	static GetChat(username, contact, callback)
	{
		var getIdQuery = `SELECT id FROM chats_ids WHERE (username='${username}' AND contact_username='${contact}') OR (username='${contact}' AND contact_username='${username}') LIMIT 1 ;`;
		conn.query(getIdQuery, function (err, result)
		{
			if (err) throw err;
			if (result.length === 0)
			{
				// no previous chat
				callback([]);
			} else 
			{
				// chat id found
				let id = result[0].id;
				var getChatQuery = `select chats.from, chats.to, chats.message from chats where id=${id} order by chats.time;`;
				conn.query(getChatQuery, function (err, results)
				{
					callback(results);
				});
			}
		});
	}

	static SendMessage(username, toUser, message)
	{
		// check if the there is a previous chat record
		var getChatQuery = `SELECT id FROM chats_ids WHERE (username='${username}' AND contact_username='${toUser}') OR (username='${toUser}' AND contact_username='${username}') LIMIT 1 ;`;
		conn.query(getChatQuery, function(err, results)
		{
			if (err) throw err;
			if (results.length === 0)
			{
				// there is no previous chat
				// add contacts
				User.AddContact(username, toUser);
				User.AddContact(toUser, username);

				// create chat record
				var insertChatQuery = `INSERT INTO chats_ids (username, contact_username) VALUES ?`;
				var values = [
					[username, toUser]
				];
				console.log(values);
				conn.query(insertChatQuery, [values], function (err, results)
				{
					if (err) throw err;
					console.log("inserted chat record");
					// get the id of the inserted record
					var getIdQuery = `SELECT id FROM chats_ids WHERE (username='${username}' AND contact_username='${toUser}') OR (username='${toUser}' AND contact_username='${username}') LIMIT 1 ;`;
					conn.query(getIdQuery, function(err, result)
					{
						if (err) throw err;
						console.log(result);
						let id= result[0].id;

						// insert message in chat id
						let insertMessageQuery = `INSERT INTO chats (id, chats.from, chats.to, time, message) VALUES ?`;
						var values = [
							[id, username, toUser, Time.timestamp(), message]
						];

						conn.query(insertMessageQuery, [values], function(err, result)
						{
							if (err) throw err;
							console.log("inserted message");
						});
					});
				});
			} else 
			{
				let id = results[0].id;
				// insert message in chat id
				let insertMessageQuery = `INSERT INTO chats (id, chats.from, chats.to, time, message) VALUES ?`;
				var values = [
					[id, username, toUser, Time.timestamp(), message]
				];
				
				conn.query(insertMessageQuery, [values], function(err, result)
				{
					if (err) throw err;
					console.log("inserted message");
				});
			}
		});
	}

	static AddContact(username, contact_username)
	{
		// check if the contact is already there
		var getContactQuery = `SELECT contact_username FROM contacts WHERE username='${username}' AND contact_username='${contact_username}';`;
		conn.query(getContactQuery, function(err, results)
		{
			if (err) throw err;
			if (results.length === 0)
			{
				// contacts doesn't exists in contacts of the user
				// insert new contact
				var insertContactQuery = "INSERT INTO contacts (username, contact_username) VALUES ?";
				var values = [
					[username, contact_username]
				];	

				conn.query(insertContactQuery, [values], function(err, result)
				{
					if (err) throw err;
					console.log("inserted a new contact, affected rows: " + result.affectedRows );
				})
			}
		});
	}


	static Search(username, callback)
	{
		var searchQuery = `SELECT username, fname, lname FROM user WHERE username LIKE '${username}%';`;
		conn.query(searchQuery, function (err, result)
		{
			if (err) throw err;
			callback(result);
		});
	}

	static Login(username, password, callback)
	{
		// callback(error, result);
		if (!username.match(namePatt))
		{
			callback(true, null);
		} else 
		{
			password = md5(password + R.string.salt);

			var getUserQuery = `SELECT username, fname, lname FROM user WHERE username='${username}' AND password='${password}';`;
			console.log(getUserQuery);
			conn.query(getUserQuery, function(err, result){
				if (err) throw err;
				console.log(result);
				if (result.length===0)
				{
					callback(true, null);
				} else 
				{
					console.log('login user: "' + result[0]['username']);
					// user info
					var info = {username: result[0]['username'], fname: result[0]['fname'], lname: result[0]['lname']}
					callback(false, info);
				}
			});
		}

	}

	static getContacts(username, callback)
	{
		var getRecordsQuery = `SELECT contact_username, user.fname, user.lname FROM contacts INNER JOIN user ON user.username=contacts.contact_username WHERE contacts.username='${username}';`;
		conn.query(getRecordsQuery, function(err, result){
			if (err) throw err;
			callback(result);
		});
	}

	CheckInputs()
	{
		var inputs = [this.fname, this.lname, this.username, this.password, this.vpassword];
		for (let i=0; i<inputs.length; i++)
		{
			if (inputs[i].trim()=="")
			{
				throw "Inputs Error: " + this.getString();
				break;
			}
		}
	}

	ValidUser()
	{
	
		if ((!this.fname.match(namePatt)) || (!this.lname.match(namePatt)) || (!this.username.match(namePatt)))
		{
			console.log("name patt error");
			return false;
		} else if (!this.email.match(emailPatt))
		{
			console.log("email patt error");
			return false;
		} else if (this.password !== this.vpassword || this.password.length < 8)
		{
			console.log("email patt error");
			return false;
		} else {
			// valid user set md5 password
			this.password = md5(this.password + R.string.salt);
			return true;
		}
	}

	getString()
	{
		return JSON.stringify(this);
	}

	checkIfEmailRegistered(callback)
	{
		async function ayncFunc(self)
		{
			var query = `SELECT email FROM user WHERE email='${self.email}';`;
			let findEmailPromise = new Promise(function (myResolve, myReject){
				conn.query(query, function(err, result)
				{
					if (err) {throw err; myReject(err)}
					console.log(result);
					if (result.length !==0)
					{
						console.log("return true");
						myResolve(true);
					} else 
					{
						console.log("return false");
						myResolve(false);
					}
				});
			});

			callback( await findEmailPromise);
		}

		ayncFunc(this);
		
	}


	getVerificationCode(lifetime, callback)
	{

		async function ayncFunc(self)
		{
			let promise = new Promise(function(myResolve, myReject)
			{
				var getEmailConfirmationQuery = `SELECT * FROM email_confirmation WHERE email='${self.email}'`;
				conn.query(getEmailConfirmationQuery, function (err, result)
				{
					if (err) {throw err; myReject(err);}
					console.log(result);
					myResolve(result);
				});
			});

			var result = await promise;
			console.log("this shouldn't come before getting the result of the promise");
			if (result.length!==0)
			{
				
				var time = result[0]['time'];
				console.log("previous code time : " + time);
				if (Time.timestamp() > time + lifetime)
				{
					// previous code is expired
					console.log("previous code is expired");
					var deleteQuery = `DELETE FROM email_confirmation WHERE email='${self.email}'`;

					// the delete instruction could come after inserting the new code
					var deletePromise = new Promise(function(myResolve, myReject)
					{
						conn.query(deleteQuery, function(err, result)
						{
							if (err) {throw err; myReject(err);}
							console.log("Number of records deleted: " + result.affectedRows);
							myResolve(result.affectedRows);
						});
					})
					
					await deletePromise;
					console.log("this shouldn't come before deletePromise");

					// get new code confirmation

					callback(self.getNewCode());
				} else 
				{
					// previous code is not expired
					console.log("previous code is not expired");
					callback(result[0]['code']); 
				}
			} else
			{
				// new code 
				callback(self.getNewCode());
			}

		}

		ayncFunc(this);

	}


	getNewCode()
	{
		// new email confirmation
		var insertQuery = `INSERT INTO email_confirmation(code, username, email, fname, lname, password, time) VALUES ?`;
		var code = User.getRandomCode();
		var time = Time.timestamp();
		var values = [
			[code, this.username, this.email, this.fname, this.lname, this.password, time]
		];

		conn.query(insertQuery, [values], function(err, result)
		{
			if (err) throw err;
    		console.log("Number of records inserted: " + result.affectedRows);
		});

		return code;
	}

	static RegisterUser(code, lifetime, callback)
	{
		async function asyncFunc(self)
		{
			var getRecordQuery = `SELECT * FROM email_confirmation WHERE code='${code}'`;
			console.log(getRecordQuery);
			var getRecordPromise = new Promise(function (myResolve, myReject)
			{
				conn.query(getRecordQuery, function(err, result)
				{
					if (err) {throw err; myReject(err)}
					console.log(result);
					myResolve(result);
				});
			});
			var result = await getRecordPromise;
			if (result.length === 0)
			{
				// code not found
				console.log('code not found');
				callback({error: true, message: codeNotExistsError});
			} else
			{
				// record found "code", 
				var time = result[0]['time'];
				if (Time.timestamp() > time + lifetime)
				{
					// link is expired
					callback({error: true, message: codeIsExpiredError});
				} else 
				{
					// link is valid
					var username = result[0]['username'];
					var email = result[0]['email'];
					var fname = result[0]['fname'];
					var lname = result[0]['lname'];
					var password = result[0]['password'];
					var registerTime = result[0]['time'];
					var registerUserQuery = `INSERT INTO user(username, email, fname, lname, password, register_time) VALUES ? `;

					var values = [
						[username, email, fname, lname, password, registerTime]
					];

					conn.query(registerUserQuery, [values], function(err, result)
					{
						if (err) {throw err;}
						console.log("Insert result: " + result.affectedRows);

						// delete the email confirmation code from db
						let deleteQuery = `DELETE FROM email_confirmation WHERE code='${code}'`;
						conn.query(deleteQuery, function(err, result){
							if (err) throw err;
							console.log("Delete result: " + result.affectedRows);
							callback({error: false, message: result});
						});
					});

				}
			}
		}

		asyncFunc(this);
	}

	static getRandomCode()
	{
		var code = "";
		for (let i=0; i<codeLength; i++)
		{
			code+=Random.getRndChar(characters);
		} 
		console.log(code);
		return code;
	}
}


module.exports = User;
