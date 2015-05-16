/**
 * Created by Papp on 2015.05.12..
 */
var ERISE = {};


var slack = require("./jira2slack/core").core;

warnusersPattern = "00 00 18 * * 1-5";
always = "30 * * * * *";
warnmanagementPattern = "00 00 08 * * 1-5";



ERISE.users = [
    {
        name: "tacsiazuma",
        slackname : "tacsiazuma"
    },
    {
        name: "adam",
        slackname : "aturcsan"
    }
];



slack.options = {
    users : [
        {
            name: "tacsiazuma",
            slackname : "tacsiazuma"
        },
        {
            name: "adam",
            slackname : "aturcsan"
        }
    ],
    token : "xoxb-4599095429-I0mPiuBd2VuJUzgEoodPCCKJ"

};

var slackstuff = new slack.core(slack.options); // instantiate
slackstuff.start();
// slackstuff.rtmStart(); // start a real time messaging session



