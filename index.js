/**
 * Created by Papp on 2015.05.05..
 */
var slackbot = {};
var http = require("http");
exports.core = function() {
    return slackbot;
};

/**
 * Defining "constants"
 * @type {string}
 */
slackbot.token = "xoxb-4599095429-I0mPiuBd2VuJUzgEoodPCCKJ";
slackbot.url = "http://https://slack.com/api/";
slackbot.port = 9091;


// endpoints to call
slackbot.endpoints = {

};

slackbot.start = function() {
    console.log("Listening at http://localhost:"+slackbot.port);
// start listening for incoming JIRA hooks
    http.createServer(function(req, resp) {

        // register a callback for
        req.on("data", function(chunk) {
            slackbot.parse(chunk);
        });


        // send back an empty response
        resp.writeHead(200, {'Content-Type': 'text/plain'});
        resp.end('Ok\n');
    }).listen(slackbot.port);

}



slackbot.parse = function(chunk) {
    try {
        var hook_content = JSON.parse(chunk.toString());
    }
    catch (error) {
        return; // if not valid JSON sent
    }


        console.log("Received body data:");
        console.log(hook_content);



}

// start the bot
slackbot.start();




// define the API endpoints
// define the token
// first of all, check the API token we got
// if it's ok, then get the users in the team
// make a map for the JIRA users to Slack users
