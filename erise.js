/**
 * Created by Papp on 2015.05.12..
 */
var ERISE = {};

ERISE.config = {

};



var jirahook = require("./jirahook.js").core();
var slack = require("./slack.js").core();
var cronjob = require("cron").CronJob;



warnusersPattern = "00 00 18 * * 1-5";
always = "30 * * * * *";
warnmanagementPattern = "00 00 08 * * 1-5";
var job = new cronjob(always, function() {
   ERISE.sendSlackerNotification();
}, null, true);



slack.options = {
    token : "xoxb-4599095429-I0mPiuBd2VuJUzgEoodPCCKJ"

};

var slackstuff = new slack.core(slack.options);

slackstuff.rtmStart(slack.options.token); // start a real time messaging session


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



ERISE.sendSlackerNotification = function() {
    ERISE.users.forEach(function(elem, index) {
        if (elem.worklog == undefined) elem.worklog = 0;
        if (elem.worklog < (6*3600)) {
            text = "*" + elem.name + "* csak *" + ERISE.createTime(elem.worklog) + "* logoltál!";
            slackstuff.postMessage(elem.name, text);
        }
    });
};

jirahook.start(function(content) {
    ERISE.parse(content)
});


ERISE.parse = function(content) {
    switch (content.webhookEvent) {
        case "jira:worklog_updated" : ERISE.worklog(content);
            break;
        case "jira:issue_created" : ERISE.issueCreated(content);
            break;
        case "jira:issue_updated" : ERISE.issueUpdated(content);
            break;
    }
}
ERISE.commitWorklog = function(content) {
    ERISE.users.forEach(function(elem, index) {
        if (elem.name == content.user.name) {
            elem.worklog += content.issue.fields.timespent;
        }
    });
}

/**
 *
 * @param content
 */
ERISE.worklog = function(hookContent) {

    ERISE.commitWorklog(hookContent);

//    slackstuff.postMessage("tacsiazuma", text);
    // send message to skromesch

}

ERISE.issueCreated = function(content) {
    if (content.user.name !== content.issue.fields.assignee.name) {
        text = ERISE.generateIssueCreateMessage(content.issue);
        slackstuff.postMessage(content.issue.fields.assignee.name , text ); //
    }
}

ERISE.issueUpdated = function(content) {

}
ERISE.generateWorkLogMessage = function(content) {
    text = content.user.name + " " + ERISE.createTime(content.issue.fields.timespent) + " másodpercet baszott el marhaságokra.";
    return text;
}

ERISE.createTime = function(time) {
    var sec_num = parseInt(time, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

ERISE.generateIssueCreateMessage = function(issue) {
    if (issue.fields.issuetype.subtask == true) {
        type = "subtask-ot";
    } else
    type = "ticket-et";

    text = "*" + issue.fields.creator.name + "* kiirta neked a(z) <http://jira.erise.hu/browse/"+issue.key+ "|"+issue.key+ "> "+type+":\n" +
    issue.fields.description + "\nEstimate: " + issue.fields.timetracking.originalEstimate;
    return text;
}

