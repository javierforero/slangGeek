/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.784194b1-c788-4f54-a4eb-0f019cea39a7";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');


var SlangGeek = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
SlangGeek.prototype = Object.create(AlexaSkill.prototype);
SlangGeek.prototype.constructor = SlangGeek;

SlangGeek.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("SlangGeek onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

SlangGeek.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("SlangGeek onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
};

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
SlangGeek.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("SlangGeek onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

SlangGeek.prototype.intentHandlers = {
    "GetSlangDefinition": function (intent, session, response) {

      getDefinition(intent.slots.Word.value, function(definition){
        var speechOutput = definition;
        console.log(definition);
        response.tell(speechOutput);
      });

    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can ask Slang Geek to tell you the definition of a word");
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};

function getDefinition(word, onSuccess) {
  var http = require('http');

  var options = {
    host: 'api.urbandictionary.com',
    path: '/v0/define?term=' + encodeURI(word)
  };

  callback = function(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });
    //the whole response has been received, so we just print it out here
    response.on('end', function () {
        try {
          onSuccess(JSON.parse(str).list[0].definition);
        }
        catch(error) {
          onSuccess("Sorry, there's no definition for that word. Try again.");
         }
    });
  }

  http.request(options, callback).end();
};


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the SlangGeek skill.
    var slangGeek = new SlangGeek();
    slangGeek.execute(event, context);
};
