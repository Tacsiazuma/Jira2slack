
var slack = require("./jira2slack/core").core;

// fill in the options object below
slack.options = {
    users : [
        // add users here:
        //{ Format:
        //    name: "jira_username",
        //    slackname : "slack_username"
        //}

    ],
    managers: [
       // add managers here, same format as users
    ],
    token : "", // your slack API token here
    notifications : { // notification settings
        managers: { // manager related notifications
            worklogs: true,
            issues: false,
            pattern : "30 * * * * *",
            worklogTemplate : ""
        },
        users: { // user related notifications
            pattern: "00 00 18 * * 1-5",
            worklogs: false,
            issues: false,
            worklogTemplate : ""
        }
    }
};

var jira2slack = new slack.core(slack.options); // instantiate
jira2slack.start(); // start the services