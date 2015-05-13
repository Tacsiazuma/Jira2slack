/**
 * Created by Papp on 2015.05.12..
 */
var ERISE = {};

ERISE.config = {

};



var jirahook = require("./jirahook.js").core();
var slack = require("./slack.js").core();

/**
 * Defining "constants"
 * @type {string}
 */
slack.options = {
    token : "xoxb-4599095429-I0mPiuBd2VuJUzgEoodPCCKJ"

};


jirahook.start(function(content) {
    ERISE.parse(content)
});


ERISE.parse = function(content) {
    switch (content.webhookEvent) {
        case "jira:worklog_updated" : ERISE.worklog(content);
            break;
    }
}



ERISE.worklog = function(content) {
    slackstuff = new slack.core(slack.options);
    // send message to skromesch
    // im.open
    // chat.postMessage
}