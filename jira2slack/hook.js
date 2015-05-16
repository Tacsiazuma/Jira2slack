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

/**
 * Commit worklog to the given user
 * @param content
 */
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
/**
 * An issu has been updated
 * @param content
 */
jira2slack.hook.prototype.issueUpdated = function(content) {
// if issue related notifications are turned on
    if (this.options.issues == true) {
        if (content.user.name !== content.issue.fields.assignee.name) { // if the creator and the assignee are not the same person
            text = this.generateIssueUpdateMessage(content.issue);
            this.core.postMessage(content.issue.fields.assignee.name, text); //
        }
    }
}
/**
 * Generates a message by the template in options and the issue given in params
 * @param issue
 * @return string
 */
jira2slack.hook.prototype.generateIssueUpdateMessage = function(issue) {
    if (issue.fields.issuetype.subtask == true) {
        type = "subtask";
    } else
        type = "ticket";

    text = this.options.issueUpdateTemplate.
        replace(/%creator%/g, issue.fields.creator.name ). // replace variables to the template
        replace(/%key%/g, issue.key).
        replace(/%url%/g, this.options.url).
        replace(/%type%/g, type).
        replace(/%description%/g,issue.fields.description).
        replace(/%estimate%/g, issue.fields.timetracking.originalEstimate );
    return text;
}

/**
 *
 * @param issue
 * @returns string
 */
jira2slack.hook.prototype.generateIssueCreateMessage = function(issue) {
    if (issue.fields.issuetype.subtask == true) {
        type = "subtask";
    } else
        type = "ticket";

    text = this.options.issueCreateTemplate.
        replace(/%creator%/g, issue.fields.creator.name ). // replace variables to the template
        replace(/%key%/g, issue.key).
        replace(/%url%/g, this.options.jiraurl).
        replace(/%type%/g, type).
        replace(/%description%/g,issue.fields.description).
        replace(/%estimate%/g, issue.fields.timetracking.originalEstimate );
    return text;
}

/**
 * Export block
 * @type {Function|jira2slack.hook}
 */
module.exports.hook = jira2slack.hook;
module.exports.hook.prototype = jira2slack.hook.prototype;
