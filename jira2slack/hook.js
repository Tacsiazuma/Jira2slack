/**
 * Created by Papp on 2015.05.15..
 */
var jira2slack = {};

var http = require("http");

jira2slack.hook = function(options, core) {
    this.options = options;
    this.core = core;
}

/**
 * Starts the http server listening to jira webhooks
 */

jira2slack.hook.prototype.start = function() {
    var self = this;
    console.log("Starting webhook at http://localhost:" + this.options.port);
    // start listening for incoming JIRA hooks
    http.createServer(function(req, resp) {
        // register a callback for

        req.on("data", function(chunk) {
            self.parse(chunk);
        });


        // send back an empty response
        resp.writeHead(200, {'Content-Type': 'text/plain'});
        resp.end('Ok\n');
    }).listen(this.options.port);

}

jira2slack.hook.prototype.parse = function(data) {
    var self = this;
    try {
        var content = JSON.parse(data.toString());
    }
    catch (error) {
        // @todo add a log method
        console.log(error.message);
    }

    switch (content.webhookEvent) {
        case "jira:worklog_updated" : self.commitWorkLog(content);
            break;
        case "jira:issue_created" : self.issueCreated(content);
            break;
        case "jira:issue_updated" : self.issueUpdated(content);
            break;
    }
}
jira2slack.hook.prototype.commitWorkLog = function(content) {
    this.core.users.forEach(function(elem, index) {

        if (elem.name == content.user.name) {
            elem.worklog += content.issue.fields.timespent;
        }
    });
}

/**
 * An issue has been created
 * @param content
 */

jira2slack.hook.prototype.issueCreated = function(content) {
    // if issue related notifications are turned on
    if (this.options.issues == true) {
        if (content.user.name !== content.issue.fields.assignee.name) { // if the creator and the assignee are not the same person
            text = this.generateIssueCreateMessage(content.issue);
            this.core.postMessage(content.issue.fields.assignee.name, text); //
        }
    }
}

jira2slack.hook.prototype.issueUpdated = function(content) {

}

jira2slack.hook.prototype.createTime = function(time) {
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

jira2slack.hook.prototype.generateIssueCreateMessage = function(issue) {
    if (issue.fields.issuetype.subtask == true) {
        type = "subtask-ot";
    } else
        type = "ticket-et";

    text = "*" + issue.fields.creator.name + "* kiirta neked a(z) <http://jira.erise.hu/browse/"+issue.key+ "|"+issue.key+ "> "+type+":\n" +
    issue.fields.description + "\nEstimate: " + issue.fields.timetracking.originalEstimate;
    return text;
}

/**
 * Export block
 * @type {Function|jira2slack.hook}
 */
module.exports.hook = jira2slack.hook;
module.exports.hook.prototype = jira2slack.hook.prototype;
