'use strict';

var url = "http://localhost/login";
var chatPageUrl = "http://localhost/Invio";

var login_form = document.getElementById('login_form');
var login_btn = document.getElementById('login_btn');
var loader = document.getElementsByClassName('loader')[0];
var error = document.getElementsByClassName('error')[0];
login_btn.addEventListener('click', login);

var errorColor = "#edbaba";
var defaultColor = "#fff";

var emailPatt = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+\.[a-z]+$/;
var namePatt = /^[a-zA-Z0-9]+$/;

var passwordMinChars = 8;

var usernameErrorMessage  = "Incorrect input!\nNote: The allowed characters are [a-z , A-Z , 0-9]";
var emptyFieldsMessage = "username and password fields are required";
var passMinMessage = "The password must contain at least 8 characters";

function postRequest(postData, url, cFunction)
{
	console.log("post request");
	loader.style.visibility = "visible";
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function ()
	{
		if (this.readyState === 4)
		{
			cFunction(this);
		}
	}
	xhttp.open("POST", url, true);
	var data = JSON.stringify(postData);
	xhttp.setRequestHeader("Content-type", "application/json");
	xhttp.send(data);
}

function loginResponse(xhttp)
{
	console.log("login response");
	loader.style.visibility = "hidden";
	login_btn.disabled = false;
	
	if (xhttp.status === 200)
	{
		var response = JSON.parse(xhttp.responseText);
		if (response.error)
		{	
			error.innerText = response.message;
			error.style.visibility = "visible";
		} else 
		{
			// hide error message if exists
			error.style.visibility = "hidden";

			// redirect the user to chat page
			document.location = chatPageUrl;
		}
	} else 
	{
		console.log(xhttp.responseText);
	}
}


function login()
{
	console.log("login");
	var ret = FormValidator();
	if (ret['error'])
	{
		error.style.visibility = "visible";
		error.innerText = ret['message'];
		return;
	}
	var postData = {username: ret.username, password: ret.password};
	

	error.style.visibility = "hidden";
	login_btn.disabled = true;
	postRequest(postData, url, loginResponse);
}

function FormValidator()
{

	var ret = {error: false, message: "", username: "", password: ""};

	var inputs = document.getElementsByTagName('input');

	var username ="";
	var password ="";
	var passwordInput, usernameInput;

	for (let i=0; i<inputs.length; i++)
	{
		if (inputs[i].type === "text")
		{
			username = inputs[i].value;
			usernameInput = inputs[i];
		} else (inputs[i].type === "password")
		{
			password = inputs[i].value;
			passwordInput = inputs[i];
		}
	}

	if (username.trim() === "" || password.trim() === "")
	{
		ret.error = true;
		ret.message = emptyFieldsMessage;
		usernameInput.style.background = errorColor;
		passwordInput.style.background = errorColor;
		return ret;
	} else if (!username.match(namePatt))
	{
		ret.error = true;
		ret.message = usernameErrorMessage;
		usernameInput.style.background = errorColor;
		passwordInput.style.background = defaultColor;
		return ret;
	} else if (password.length<passwordMinChars) 
	{
		ret.message = passMinMessage;
		ret.error = true;
		passwordInput.style.background = errorColor;
		usernameInput.style.background = defaultColor;
		return ret;
	} else 
	{
		passwordInput.style.background = defaultColor;
		usernameInput.style.background = defaultColor;
		ret.username = username;
		ret.password = password;
		return ret;
	}

}

