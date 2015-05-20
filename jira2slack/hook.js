/**
 * Created by Papp on 2015.05.15..
 */
var jira2slack = {};

var http = require("http");



jira2slack.hook = function(options, core) {
    this.options = options;
    this.core = core;
    this.data = "";
}

jira2slack.hook.prototype.__ = function(key) {
    return this.core.translate.translate(key);
}


/**
 * Starts the http server listening to jira webhooks
 */

jira2slack.hook.prototype.start = function() {
    var self = this;
    console.log(this.__("Starting webhook at") + " http://localhost:" + this.options.port);
    // start listening for incoming JIRA hooks
    http.createServer(function(req, resp) {
        // register a callback for

        req.on('data', function(chunk) {
            self.appendData(chunk)
        });
        req.on("end", function() {
            self.parse()
        });


        // send back an empty response
        resp.writeHead(200, {'Content-Type': 'text/plain'});
        resp.end('Ok\n');
    }).listen(this.options.port);

}
/**
 * Build the data from the chunks
 * @param chunk
 */
jira2slack.hook.prototype.appendData = function(chunk) {
    this.data += chunk
}

/**
 * Parse the previously builded datastring
 */
jira2slack.hook.prototype.parse = function() {
    var self = this;
    try {
        var content = JSON.parse(this.data.toString());
        this.data = ""; // clear the data field
    }
    catch (error) {
        // @todo add a log method
        console.log(error.message);
    }
    try {
        switch (content.webhookEvent) {
            case "jira:worklog_updated" :
                self.commitWorkLog(content);
                break;
            case "jira:issue_created" :
                self.issueCreated(content);
                break;
            case "jira:issue_updated" :
                self.issueUpdated(content);
                break;
        }
    } catch (error) {
        console.log(error.message);
    }
}

/**
 * Commit worklog to the given user
 * @param content
 */
jira2slack.hook.prototype.commitWorkLog = function(content) {
    console.log(content.issue.fields.timespent);
    this.core.users.forEach(function(elem) {

        if (elem.name == content.user.name) {
            var user = elem;
            content.changelog.items.forEach(function(elem) {
                if (elem.field == "timespent") {
                    if (elem.from == undefined) elem.from = 0;
                    user.worklog += elem.from - elem.to;
                }
            });

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
            attachments = this.generateIssueCreateAttachments(content.issue, content.user);
            this.core.postMessage(content.issue.fields.assignee.name, "", attachments); //
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
            attachments = this.generateIssueUpdateAttachments(content.issue, content.changelog, content.user)
            this.core.postMessage(content.issue.fields.assignee.name, "", attachments); //
        }
    }
}
/**
 *
 * @param issue
 * @returns {{fallback: string, pretext: string, fields: *[], color: string}[]|*}
 */
jira2slack.hook.prototype.generateIssueCreateAttachments = function(issue, user) {
    attachments = [
        {
            "fallback": "*" +user.displayName +"* " + this.__("issue_create") + " : <https://" +this.options.jiraurl+ "/browse/" + issue.key + "|"+ issue.key +">" ,
            "pretext": user.displayName + " " + this.__("issue_create") + " : <https://" +this.options.jiraurl+ "/browse/" + issue.key + "|"+ issue.key +">" ,
            "fields": [
                {
                    "title": this.__("Summary"),
                    "value": issue.fields.summary,
                    "short": true
                },
                {
                    "title": this.__("Estimate"),
                    "value": issue.fields.timetracking.originalEstimate,
                    "short": true
                },
                {
                    "title": this.__("Description"),
                    "value": issue.fields.description,
                    "short": false
                }
            ],
            "color": "warning"
        }
    ];

    return attachments;
}
/**
 * Get the update type from the changelog
 * @param from
 * @param to
 * @returns {*}
 */
jira2slack.hook.prototype.getUpdateType = function(from, to) {
    switch (from) {
        case "In Progress" : return this.updateFromProgress(to);
            break;
        case "To Do" : return this.updateFromToDo(to);
            break;
        case "Done": return this.updateFromDone(to);
            break;
        case "Closed" : return this.updateFromDone(to);
            break;
        default : return to; // if we haven't set up a custom message to it
    }

}

jira2slack.hook.prototype.updateFromProgress = function(to) {
    switch (to) {
        case "To Do" : return "Stopped";
            break;
        case "Done" : return "Resolved";
            break;
        case "Resolved" : return "Resolved";
            break;
        case "Closed" : return "Closed";
            break;
        default : return to;
    }
}


jira2slack.hook.prototype.updateFromToDo = function(to) {
    switch (to) {
        case "In Progress" : return "Started";
            break;
        case "Done" :
        case "Resolved" : return "Resolved";
            break;
        case "Closed" : return "Closed";
            break;
        default : return to;
    }
}

jira2slack.hook.prototype.updateFromDone = function(to) {
    switch (to) {
        case "In Progress" : return "Restarted";
            break;
        case "Done" : return "Resolved";
            break;
        case "To Do" : return "Reopened";
            break;
        case "Closed" : return "Closed";
            break;
        default : return to;
    }
}

/**
 *
 * @param issue
 * @returns {{fallback: string, pretext: string, fields: *[], color: string}[]|*}
 */
jira2slack.hook.prototype.generateIssueUpdateAttachments = function(issue, changelog, user) {
    var statusfield = {};
    changelog.items.forEach(function(elem) {
        if (elem.field == "status") {
            statusfield = elem; // assign the status field
        }
    });
    updateType = this.getUpdateType(statusfield.fromString, statusfield.toString);

    var color;
    switch (updateType) {
        case "Reopened" : color = "danger";
            break;
        case "Resolved" :
        case "Closed" : color = "good";
            break
        default : color = "warning";
    }


    attachments = [
        {
            "fallback": "*" +user.displayName +"* " + this.__(updateType) + " : <https://" +this.options.jiraurl+ "/browse/" + issue.key + "|"+ issue.key +">" ,
            "pretext": user.displayName + " " + this.__(updateType) + " : <https://" +this.options.jiraurl+ "/browse/" + issue.key + "|"+ issue.key +">" ,
            "fields": [
                {
                    "title": this.__("Summary"),
                    "value": issue.fields.summary,
                    "short": false
                },
                {
                    "title": this.__("Description"),
                    "value": issue.fields.description,
                    "short": false
                }
            ],
            "color": color
        }
    ];

    return attachments;
}


/**
 * Export block
 * @type {Function|jira2slack.hook}
 */
module.exports.hook = jira2slack.hook;
module.exports.hook.prototype = jira2slack.hook.prototype;
