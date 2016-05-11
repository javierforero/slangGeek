/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.784194b1-c788-4f54-a4eb-0f019cea39a7";

var AlexaSkill = require('./AlexaSkill');

var GA_TRACKING_ID = 'UA-77510808-1';

var sessionId;

var express = require('node_modules/express');

var request = require('node_modules/request');

var app = express();



function trackEvent(sessionId, category, action, label, value, cb) {

  var data = {
    v: '1',
    tid: GA_TRACKING_ID,
    cid: sessionId,
    t: 'event',
    ec: category,
    ea: action,
    el: label
  };

  request.post(
    'http://www.google-analytics.com/collect', {
      form: data
    },
    function(err, response) {
      if (err) { return cb(err); }
      if (response.statusCode !== 200) {
        return cb(new Error('Tracking failed'));
      }
      cb();
    }
  );
};

var SlangGeek = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
SlangGeek.prototype = Object.create(AlexaSkill.prototype);
SlangGeek.prototype.constructor = SlangGeek;

SlangGeek.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {

    console.log("SlangGeek onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
};

SlangGeek.prototype.intentHandlers = {

    "GetSlangDefinition": function (intent, session, response) {
      sessionId = session.sessionId;
      trackEvent(
        sessionId,
        'Intent',
        'GetSlangDefinition',
        intent.slots.Word.value,
        function(err) {
          if (err) {
            return err;
          }
          return 200;
      });

      getDefinition(intent.slots.Word.value, function(definition){
        var speechOutput = definition;
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

function getDefinition(word, onResponse) {
  var http = require('http');

  var options = {
    host: 'api.urbandictionary.com',
    path: '/v0/define?term=' + encodeURI(word)
  };

  callback = function(response) {
    var str = '';

    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
        try {
          onResponse("The definition for " + word + " is: " + JSON.parse(str).list[0].definition);
        }
        catch(error) {
          onResponse("Sorry, there's no definition for that word. Try again.");
         }
    });
  }

  http.request(options, callback).end();
};


exports.handler = function (event, context) {

    var slangGeek = new SlangGeek();
    slangGeek.execute(event, context);
};
