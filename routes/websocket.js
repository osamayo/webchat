const WebSocket = require('ws');
const Users = require('../classes/user.js');
const R = require('../util/Resources.js');
const validate = require('../classes/sec.js');

var UsersMap = new Map();

var ws = new WebSocket.Server({ clientTracking: true, noServer: true });


ws.on('connection', function (client, request) {
  console.log("Connection Received");
  var username = request.session.username;

  UsersMap.set(username, client);

  client.on('message', function (message) {
    //
    // Here we can now use session parameters.
    //
    console.log(`Received message ${message} from user ${username}`);

    try
    {
      data = JSON.parse(message);
      var query = validate.encode(data.query);
      if (query === "info")
      {
        var info = {fname: request.session.fname, lname:request.session.lname, username: username};
        sendInfo(client, info);
      } else if (query === "contacts")
      {
        getContacts(client, username);
      } else if (query === "search" && data.username)
      {
        let user = validate.encode(data.username);
        search(client, user);
      } else if (query === "chat" && data.username)
      {
        let user = validate.encode(data.username);
        getChat(client, username, user);
      } else if (query === "send" && data.username && data.message)
      {
        let user = validate.encode(data.username);
        let msg = validate.encode(data.message);
        if (msg.trim()!=="")
        {
          send(client, username, user, msg, request.session.fname, request.session.lname);
        }
        
      }

    } catch(e)
    {
      console.log(e);
      console.log("invalid json");
      client.send('401');
    }

  });

  client.on('close', function () {
    console.log(`client ${username} closed the connection`);
    UsersMap.delete(username);

    console.log('listing clients');

    UsersMap.forEach(function (item, index)
    {
      console.log(item.username);
    });
  });

});

function getChat(client, username, contact)
{
  Users.GetChat(username, contact, function(results)
  {
    var response = {response: 'chat', status: 200, contact: contact, chat: results};
    client.send(JSON.stringify(response));
  });
}

function send(client, username, toUsername, message, fname, lname)
{
  console.log("to username:" + toUsername);
  console.log('listing clients');

  UsersMap.forEach(function (item, index)
  {
    console.log(item.username + "index: "+ index);
  });

  if (UsersMap.get(toUsername))
  {
    console.log("found user");
    var response = {response: 'message', status: 200, from: username, content: message, fname: fname, lname: lname};

    UsersMap.get(toUsername).send(JSON.stringify(response));
  }

  // insert message in db
  Users.SendMessage(username, toUsername, message);
}


function search(client, searchText)
{
  // searching for users info with the same searchText pattern
  Users.Search(searchText, function(results)
  {
    var response = {response: 'search', status: 200, content: results};
    client.send(JSON.stringify(response));
  });
}

function sendInfo(client, info)
{
  var response = {response: 'info', status: 200, content: info};
  client.send(JSON.stringify(response));
}

function getContacts(client, username)
{
  Users.getContacts(username, function(results){
    var response = {response: 'contacts', status: 200, content: results};
    client.send(JSON.stringify(response));
  });
}


module.exports = ws;