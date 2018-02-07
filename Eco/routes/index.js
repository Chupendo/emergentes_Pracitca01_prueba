/**
 * 
 * https://www.techiediaries.com/build-messenger-bot-nodejs/
 */

'use strict'

//start by requiring the following packages 

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()        

//set the port to 8000 (the port we used with ngrok )

app.set('port', (process.env.PORT || 8000 ))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// setup a route 
app.get('/', function (req, res) {
    res.send("Hello , I'm a bot ")
});

app.listen(app.get('port'), function() {
    console.log('server running at : ', app.get('port'))
});

//Put any token here like your password for example 
const FACEBOOK_VERIFY_CODE = '0123456789';

app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === FACEBOOK_VERIFY_CODE) {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error : wrong token');
})

/*
 * Puede utilizar la herramienta Curl para enviar solicitudes de 
 * publicación a su perfil de plataforma de mensajería para configurar 
 * estas funciones, ya que solo necesita hacer esto por una vez o puede 
 * hacerlo desde el código, así que simplemente agregue otra ruta a su 
 * aplicación expresa.
 */
app.get('/setup',function(req,res){

    setupGetStartedButton(res);
    setupPersistentMenu(res);
    setupGreetingText(res);
})

//funciones
function setupGreetingText(res){
var messageData = {
    "greeting":[
        {
        "locale":"default",
        "text":"Greeting text for default local !"
        }, {
        "locale":"en_US",
        "text":"Greeting text for en_US local !"
        }
    ]};
request({
    url: 'https://graph.facebook.com/v2.6/me/messenger_profile?access_token='+ PAGE_ACCESS_TOKEN,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    form: messageData
},
function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        res.send(body);

    } else { 
        // TODO: Handle errors
        res.send(body);
    }
});

}

function setupPersistentMenu(res){
var messageData = 
    {"persistent_menu":[
        {
        "locale":"default",
        "composer_input_disabled":true,
        "call_to_actions":[
            {
            "title":"Info",
            "type":"nested",
            "call_to_actions":[
                {
                "title":"Help",
                "type":"postback",
                "payload":"HELP_PAYLOAD"
                },
                {
                "title":"Contact Me",
                "type":"postback",
                "payload":"CONTACT_INFO_PAYLOAD"
                }
            ]
            },
            {
            "type":"web_url",
            "title":"Visit website ",
            "url":"http://www.techiediaries.com",
            "webview_height_ratio":"full"
            }
        ]
        },
        {
        "locale":"zh_CN",
        "composer_input_disabled":false
        }
    ]};  
// Start the request
request({
    url: "https://graph.facebook.com/v2.6/me/messenger_profile?access_token="+ PAGE_ACCESS_TOKEN,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    form: messageData
},
function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        res.send(body);

    } else { 
        // TODO: Handle errors
        res.send(body);
    }
});

}


function setupGetStartedButton(res){
var messageData = {
        "get_started":{
            "payload":"getstarted"
        }
};
// Start the request
request({
    url: "https://graph.facebook.com/v2.6/me/messenger_profile?access_token="+ PAGE_ACCESS_TOKEN,
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    form: messageData
},
function (error, response, body) {
    if (!error && response.statusCode == 200) {
        // Print out the response body
        res.send(body);

    } else { 
        // TODO: Handle errors
        res.send(body);
    }
});
}

//enviar mensajes entre el servidor bot y facebook
app.post('/webhook', function (req, res) {
	var data = req.body;

	// Make sure this is a page subscription
	if (data.object === 'page') {


	    data.entry.forEach(function(entry) {
	    var pageID = entry.id;
	    var timeOfEvent = entry.time;

	    entry.messaging.forEach(function(event) {
	        if (event.message) {

	        //receivedMessage(event);

	        } else {

	        if(event.postback)
	        {
	            //receivedPostback(event);
	        }      

	        }
	    });
	    });

	    // You should return a 200 status code to Facebook 
	    res.sendStatus(200);
	}
	});

//La funcion receivedMessage
function receivedMessage(event) {
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	var messageId = message.mid;

	var messageText = message.text;
	var messageAttachments = message.attachments;
	if (messageText) {

	    // If we receive a text message, check to see if it matches a keyword
	    // and send back the example. Otherwise, just echo the text we received.
	    switch (messageText) { 
	    case 'help' :
	        var msg = "So you need my help ? ";         
	        //sendTextMessage(senderID,msg); 
	        break;

	    default :
	        //sendTextMessage(senderID,"I'm not sure I can understand you !");
	    break;
	    }
	}
	}

//Procesamiento de devoluciones
function receivedPostback(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var payload = event.postback.payload;
    switch(payload)
    {
        case 'getstarted':
            var msg =" Hi,I'm a bot created as a demo for a \n"+
                     " tutorial to build messenger bots by techiediaries.com\n" ;

            //sendTextMessage(senderID,msg);
            break;
        default :
            var msg = "Implement logic for this Postback";
            //sendTextMessage(senderID,msg); 
        break;
    }

}

//funcionsendTextMessaege
function sendTextMessage(recipientId, messageText) {
    var messageData = {
        recipient: {
        id: recipientId
        },
        message: {
        text: messageText
        }
    };
    // call the send API
    callSendAPI(messageData);
}  

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;
        //successfull 

        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });  
}


