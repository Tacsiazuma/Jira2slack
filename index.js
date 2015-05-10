/**
 * Created by Papp on 2015.05.05..
 */
var slackbot = {};

exports.bot = function() {
    return slackbot;
};

slackbot.token = "xoxb-4599095429-I0mPiuBd2VuJUzgEoodPCCKJ";
slackbot.url = "http://https://slack.com/api/";

slackbot.endpoints = {

};


// define the API endpoints
// define the token
// first of all, check the API token we got
// if it's ok, then get the users in the team
// make a map for the JIRA users to Slack users
