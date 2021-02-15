'use strict';

var url = "http://localhost/signup";

var main_section = document.getElementById('main');
var signup_form = document.getElementById('signup_form');
var signup_btn = document.getElementById('signup_btn');
var loader = document.getElementsByClassName('loader')[0];
var error = document.getElementsByClassName('error')[0];
signup_btn.addEventListener('click', signup)

var errorColor = "#edbaba";
var defaultColor = "#fff";

var emailPatt = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+\.[a-z]+$/;
var namePatt = /^[a-zA-Z0-9]+$/;

var emailErrorMessage = "Incorrect email!\nNote: The allowed characters are [a-z , A-Z , 0-9 , @ , _ , -]\n\tThe email must be in a form like: example@example.com";
var nameErrorMessage  = "Incorrect input!\nNote: The allowed characters are [a-z , A-Z , 0-9]";
var passwordErrorMessage = "You've entered a two different passwords";
var emptyFieldsMessage = "*Fields are required!";
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

function signupResponse(xhttp)
{
	console.log("signup response");
	if (xhttp.status === 200)
	{
		var response = JSON.parse(xhttp.responseText);
		main_section.innerHTML = response.message;
	} else 
	{
		console.log(xhttp.responseText);
	}
}


function signup()
{
	console.log("signup");
	var ret = FormValidator();
	if (ret['error'])
	{
		error.style.visibility = "visible";
		error.innerText = ret['message'];
		return;
	}
	var postData = {fname: "", lname: "", username: "", email: "", password: "", vpassword: ""};
	var inputs = document.getElementsByTagName('input');
	for (let i=0; i<inputs.length; i++)
	{
		if (inputs[i].type!=="submit")
		{
			postData[inputs[i].name] = inputs[i].value;
		}
	}


	error.style.visibility = "hidden";
	signup_btn.disabled = true;
	postRequest(postData, url, signupResponse);
}

function FormValidator()
{

	var ret = {error: false, message: ""};

	var error = false;
	var message = "";
	var inputs = document.getElementsByTagName('input');

	var passFirst = false;
	var password, vpassword;
	var passFieldsIndexes = [0,0];

	for (let i=0; i<inputs.length; i++)
	{
		if (inputs[i].value.trim() === "")
		{
			inputs[i].style.background = errorColor;
			error = true;
			message = emptyFieldsMessage;
		} else {
			inputs[i].style.background = defaultColor;
		}

		if (inputs[i].type === "password")
		{
			if (!passFirst)
			{
				passFirst = true;
				password = inputs[i].value;
				passFieldsIndexes[0] = i;
			} else 
			{
				vpassword = inputs[i].value;
				passFieldsIndexes[1] = i;
			}
		}

	}

	if (error)
	{
		ret['error'] = true;
		ret['message'] = message;
		return ret;
	}	

	if (password !== vpassword)
	{
		error = true;
		message = passwordErrorMessage;
		for (let i=0; i<passFieldsIndexes.length; i++)
		{
			inputs[passFieldsIndexes[i]].style.background = errorColor;
		}
	} else
	{
		for (let i=0; i<passFieldsIndexes.length; i++)
		{
			inputs[passFieldsIndexes[i]].style.background = defaultColor;
		}
	}

	if (error)
	{
		ret['error'] = true;
		ret['message'] = message;
		return ret;
	}


	if (password.length < 8)
	{
		error = true;
		message = passMinMessage;
	}

	if (error)
	{
		ret['error'] = true;
		ret['message'] = message;
		return ret;
	}

	for (let i=0; i<inputs.length; i++)
	{
		if (inputs[i].type === "text")
		{
			if (!inputs[i].value.match(namePatt))
			{
				error = true;
				inputs[i].style.background = errorColor;
				message = nameErrorMessage;
			} else
			{
				inputs[i].style.background = defaultColor;
			}

		}
	}

	if (error)
	{
		ret['error'] = true;
		ret['message'] = message;
		return ret;
	}

	for (let i=0; i<inputs.length; i++)
	{
		if (inputs[i].type === "email")
		{
			if (!inputs[i].value.match(emailPatt))
			{
				error = true;
				inputs[i].style.background = errorColor;
				message = emailErrorMessage;
			} else
			{
				inputs[i].style.background = defaultColor;
			}

		}
	}

	if (error)
	{
		ret['error'] = true;
		ret['message'] = message;
	}

	return ret;
}

