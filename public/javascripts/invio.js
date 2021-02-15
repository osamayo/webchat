'use strict';

const sock = new WebSocket('ws://localhost/ws');

const contacts_list = document.getElementById('contacts_list');
const search_list = document.getElementById('search_list');
const searchCloseBtn = document.getElementsByClassName('close-search-icon')[0];
const searchBox = document.getElementById('search');
const searchLoader = document.getElementById('search_loader');
const chatSection = document.getElementsByClassName('chat-section')[0];
const chatBox = chatSection.getElementsByClassName('chat')[0];
const chatBackward = document.getElementById('chat_backward_btn');
const contactName = document.getElementById('contactName');
const contactUsername = document.getElementById('contactUsername');
const sendBox = document.getElementsByClassName('send-box')[0].getElementsByClassName('textbox-message')[0];
const sendButton = document.getElementsByClassName('send-button')[0];
const logoutButton = document.getElementsByClassName('logout')[0];
const searchBtn = document.getElementById('search_btn');

const selectedListItemColor = "#f0f0f0";
const defaultListItemColor = "#0000";

// variables to save user info
var profileFName = "";
var profileLName = "";
var profileUsername = "";

var contacts = [];

var list_items; // is for contacts list items view
var selectedItem = 0;

var searchResults;


var chats = {}; // contains all the chats
// chats = { contact:  [
// 		{direction: "from || to", message: "content"},
// 		{direction: "from || to", message: "content"},
// 	],
// }


// create send box enter listener
sendBox.addEventListener('keypress', function(event)
{
	// this preventing break lines in send box
	if (event.keyCode===13)
	{
		if (sendBox.innerText.trim() !=="")
		{
			sendMessage(contacts[selectedItem]['contact_username'], sendBox.innerText);
			sendBox.innerText = "";
		}
		event.preventDefault();
	}
});

// send button click listener
sendButton.addEventListener('click', function(event)
{
	if (sendBox.innerText.trim() !=="")
	{
		sendMessage(contacts[selectedItem]['contact_username'], sendBox.innerText);
		sendBox.innerText = "";
	}
	
});

searchCloseBtn.addEventListener('click', function(event)
{
	searchCloseBtn.style.visibility = 'hidden';
	search_list.style.display = "none";
	// clear search text
	searchBox.innerText = "";
	// removing previous results
	var previousResults = search_list.getElementsByClassName('list-item');
	for (let i=0; i<previousResults.length; i++)
	{
		previousResults[i].remove();
	}	
});

logoutButton.addEventListener('click', function(e)
{
	logout();
});

function logout()
{
	document.location = "/logout";
}

searchBtn.addEventListener('click', function(event){
	searchForUser(searchBox.innerText);
	console.log('searchBtn clicked');

});


searchBox.addEventListener('keypress', function(event)
{
	// this preventing break lines in search box
	if (event.keyCode===13)
	{
		event.preventDefault();
	}
});

searchBox.addEventListener('keyup', function(event)
{
	if (event.keyCode === 13)
	{
		event.preventDefault();
		console.log('enter on search box');
		searchForUser(searchBox.innerText);
	}


});


chatBackward.addEventListener('click', function(event)
{
	
	// changing layout for normal screens
	// hide chat section and backward btn
	chatBackward.style.visibility = "hidden";
	chatSection.style.visibility = "hidden";

	// change view in small screens
	onChangeWidth(window.matchMedia("(max-width: 800px)"));


	unSelectContact();
});




sock.addEventListener('open', function(event)
{
	console.log("connection is opened");

	// get profile info
	var request = {query:"info"};
	sock.send(JSON.stringify(request));
	// get contacts
	request.query = "contacts";
	sock.send(JSON.stringify(request));

});

sock.addEventListener('message', function(event)
{
	console.log('server has sent: ' + event.data);

	var data = JSON.parse(event.data);

	if (data.status === 200)
	{
		if (data.response === "info")
		{
			profileFName = data.content.fname;
			profileLName = data.content.lname;
			profileUsername = data.content.username;
		} else if (data.response === "contacts")
		{
			ListContacts(data.content);
			console.log('listing contacts');
		} else if (data.response === "search")
		{
			ListSearchResults(data.content);
			console.log('listing search results');
		} else if (data.response === "message")
		{
			recievedMessage(data.from, data.content, data.fname, data.lname);
			console.log("Recieved Message");
		} else if (data.response === "chat")
		{
			console.log("Recieved chat");
			saveChat(data.contact, data.chat);
		}
	} else
	{
		console.log('status: ' + data.status);
	}
});

sock.addEventListener('close', function(event)
{
	console.log('connection is closed');
});

sock.addEventListener('error', function(event)
{
	console.log('socket error: ' + event);
});


// chats = { contact:  [
// 		{direction: "sent || recv", message: "content"},
// 		{direction: "sent || recv", message: "content"},
// 	],
// }

// chat from the server
// chat = [
// 	{from: , to: , message: },

// ]
function saveChat(contact, chat)
{
	if (!chats.contact)
	{
		// create chat array
		chats[contact] = [];
	}

	var contactChat = chats[contact];

	for (let i=0; i<chat.length; i++)
	{
		if (chat[i].from === profileUsername)
		{
			// message is sent 
			let messageObj = {direction: "sent", message: chat[i].message};
			contactChat.push(messageObj);
		} else 
		{
			// message is recieved 
			let messageObj = {direction: "recv", message: chat[i].message};
			contactChat.push(messageObj);
		}
	}

	// display messages if the contact is selected
	if (contact === contacts[selectedItem].contact_username)
	{
		displayMessages(contact);
	}
}

function displayMessages(contact)
{
	var contactChat = chats[contact];
	for (let i=0; i<contactChat.length; i++)
	{
		if (contactChat[i].direction === "sent")
		{
			chatBox.innerHTML += `<div class="sent-message">${contactChat[i].message}</div>`;

		} else 
		{
			chatBox.innerHTML += `<div class="recieved-message">${contactChat[i].message}</div>`;

		}
	}

	// scroll to last message
	chatBox.scrollTo(0, chatBox.scrollHeight);
}

function sendMessage(to, message)
{
	if (!chats[to])
	{
		// chat doesn't exists
		// create the chat array
		chats[to] = [];
		let messageObj = {direction: "sent", message: encode(message)};
		chats[to].push(messageObj);
	} else
	{
		let messageObj = {direction: "sent", message: encode(message)};
		chats[to].push(messageObj);

	}

	// display the message
	chatBox.innerHTML += `<div class="sent-message">${encode(message)}</div>`;

	// send the message via web socket
	var request = {query: "send", username: to, message: message};
	sock.send(JSON.stringify(request));

	// scroll to last message
	chatBox.scrollTo(0, chatBox.scrollHeight);
}


function recievedMessage(from, message, fname, lname)
{
	if (!chats[from])
	{
		// chat doesn't exists
		// create the chat array
		chats[from] = [];
		let messageObj = {direction: "recv", message: message};
		chats[from].push(messageObj);
	} else
	{
		let messageObj = {direction: "recv", message: message};
		chats[from].push(messageObj);

	}

	console.log("from: " + from);
	


	// check if the contact not exist in contacts list
	if (!contacts.find(contact => contact.contact_username === from))
	{
		// new contact
		contacts.push({contact_username: from, fname: fname, lname: lname});
		contacts_list.innerHTML += `<div class="list-item"><img class="icon" src="/images/user.svg" /><div class="list-item-content"><h3 class="profile-name">${fname} ${lname}</h3><h5 class="profile-username">@${from}</h5></div></div>`;
		setListenersForContactItems();
	} 

	 if (from === contacts[selectedItem].contact_username)
	{
		// show the message if the current contact username === from

		chatBox.innerHTML += `<div class="recieved-message">${message}</div>`;
		// scroll to last message
		chatBox.scrollTo(0, chatBox.scrollHeight);

	}

}

function searchForUser(text)
{
	// removing previous results
	var previousResults = search_list.getElementsByClassName('list-item');
	for (let i=0; i<previousResults.length; i++)
	{
		previousResults[i].remove();
	}

	searchCloseBtn.style.visibility = "visible";
	search_list.style.display = "block";
	searchLoader.style.display = "inline-block";
	console.log('search: ' + text);
	var request = {query:"search", username: text};
	sock.send(JSON.stringify(request));
}

function setListenersForContactItems()
{
	list_items = contacts_list.getElementsByClassName('list-item');
	for (let i=0; i<list_items.length; i++)
	{
		// add on click listener for list items
		list_items[i].addEventListener('click', function(e)
		{
			selectContact(i);
		});
	}
}

function ListSearchResults(results)
{
	
	searchLoader.style.display = "none";


	
	results.forEach(function(item, index)
	{
		// prevent showing the username of the same username of the client
		let valid = true;

		if (item.username === profileUsername)
		{
			valid = false;;
		}

		// prevent showing results that is already in the contacts list
		for (let i=0; i<contacts.length; i++)
		{
			if (contacts[i].contact_username === item.username)
			{
				valid = false;
			}
		}

		if (valid)
		{
			search_list.innerHTML += `<div class="list-item"><div class="list-item-content"><h3 class="profile-name">${item.fname} ${item.lname}</h3><h5 class="profile-username">${item.username}</h5></div></div>`;
		}


	}
	);


	// setting searchResults array in a global variable
	searchResults = results;

	// create on click listeners for search results;
	var searchResultsItems = search_list.getElementsByClassName('list-item');
	for (let i=0; i<searchResultsItems.length; i++)
	{
		searchResultsItems[i].addEventListener('click', function(e)
		{
			// add to contacts view
			contacts_list.innerHTML += `<div class="list-item"><img class="icon" src="/images/user.svg" /><div class="list-item-content"><h3 class="profile-name">${searchResults[i].fname} ${searchResults[i].lname}</h3><h5 class="profile-username">@${searchResults[i].username}</h5></div></div>`;

			// rename username key to contact_username
			var resultItem = searchResults[i];
			resultItem['contact_username'] = resultItem['username'];
			delete resultItem['username'];

			// add to contacts list
			contacts.push(resultItem);

			// add on click listener for the new contact = last item in contacts_list
			setListenersForContactItems();

			// emit an click on close search results
			var clickEvent = new Event('click');
			searchCloseBtn.dispatchEvent(clickEvent);

		});
	}
}

function ListContacts(contactsResults)
{
	contactsResults.forEach(function(item, index)
	{
		contacts_list.innerHTML +=`<div class="list-item"><img class="icon" src="/images/user.svg" /><div class="list-item-content"><h3 class="profile-name">${item.fname} ${item.lname}</h3><h5 class="profile-username">@${item.contact_username}</h5></div></div>`;

	});

	list_items = contacts_list.getElementsByClassName('list-item');
	for (let i=0; i<list_items.length; i++)
	{
		contacts.push(contactsResults[i]); // push the contact in the contacts array
		// add on click listener for list items
		list_items[i].addEventListener('click', function(e)
		{
			selectContact(i);
		});
	}
}

function selectContact(index)
{
	// clear chat box
	chatBox.innerText = "";
	// index is for the contact in list-contacts view and in contacts array
	list_items[selectedItem].style = ""; // set the previous selected item to default color
	list_items[index].style.backgroundColor = selectedListItemColor; // change the selected item color

	selectedItem = index; // set the new item index
	console.log(`item ${index} selected`);

	// show chat backward button
	chatBackward.style.visibility = "visible";
	// show contact profile info
	contactName.innerText = contacts[index].fname + " " + contacts[index].lname;
	contactUsername.innerText = "@" + contacts[index].contact_username;

	// show chat section
	chatSection.style.visibility = "visible";

	// for small screens
	onChangeWidth(window.matchMedia("(max-width: 800px)"));

	// check if the chat is already stored
	if (!chats[contacts[selectedItem].contact_username])
	{
		// get chat from the server
		getChat(contacts[selectedItem].contact_username);

	} else 
	{
		displayMessages(contacts[selectedItem].contact_username);
	}

}

function getChat(contactUsername)
{
	var req = {query: "chat", username: contactUsername};
	sock.send(JSON.stringify(req));
}

function unSelectContact()
{
	// hide contact profile info
	contactName.innerText = "";
	contactUsername.innerText = "";

	// un select contact item
	list_items[selectedItem].style = "";

	chatBox.innerText = "";
}



// control the view on small screens "aside, content"
function onChangeWidth(x)
{
	console.log("called on change width: " + x);
	if (x.matches)
	{
		// if width <= 800px
		if (chatBackward.style.visibility === "visible")
		{
			// show the content section and hide aside
			document.getElementsByTagName('aside')[0].style.display = "none";
			document.getElementsByTagName('content')[0].style.display = "inline-block";

		} else 
		{

			document.getElementsByTagName('aside')[0].style.display = "inline-block";
			document.getElementsByTagName('content')[0].style.display = "none";

		}


	} else 
	{
		// for normal screens > 800px

		document.getElementsByTagName('aside')[0].style.display = "inline-block";
		document.getElementsByTagName('content')[0].style.display = "inline-block";

	}
}

var windowWidth = window.matchMedia("(max-width: 800px)");
onChangeWidth(windowWidth); // call the function at runtime
windowWidth.addListener(onChangeWidth); // attach listener on state changes


if (windowWidth.matches)
{
	// request full screen
	document.body.requestFullscreen();
}

function encode(str)
{
	return String(str).replace(/['"<>&\r\n\\]/gi, function (c) {
        var lookup = {'\\': '&#x5c;', '\r': '&#x0d;', '\n': '&#x0a;', '"': '&quot;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '&': '&amp;'};
        return lookup[c];
    });
}