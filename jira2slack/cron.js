/**
 * Created by Papp on 2015.05.15..
 */
var jira2slack = jira2slack || {};

var cronjob = require("cron").CronJob;

jira2slack.notificationservice = function(options, core) {
    this.options = options;
    this.core = core;
};

jira2slack.notificationservice.prototype.start = function() {
    console.log("Notification service started!");
    var self = this;
    if (self.options.managers.worklogs == true) {
        new cronjob(self.options.managers.pattern, function () {
            self.sendManagerNotification();
        }, null, true);
    }
    if (self.options.users.worklogs == true) {
        new cronjob(self.options.users.pattern, function () {
            self.sendSlackerNotification();
        }, null, true);
    }
    new cronjob("0 0 0 * * *", function () {
        self.resetWorkLogs();
    }, null, true);

}
/**
 * Reset the daily worklogs
 */
jira2slack.notificationservice.prototype.resetWorkLogs = function() {
    var core = this.core;
    core.users.forEach(function(elem, index) {
        elem.worklog = 0;
    });
}


jira2slack.notificationservice.prototype.sendSlackerNotification = function() {
    var core = this.core;
    var self = this;
    core.users.forEach(function(elem, index) {
        if (elem.worklog == undefined) elem.worklog = 0; // if no worklog has been assigned
        if (elem.worklog < (6*3600)) {
            text = self.generateMessageFromTemplate(elem, core.options.users.worklogTemplate);
            core.postMessage(elem.slackname, text);
        }
    });
};


jira2slack.notificationservice.prototype.sendManagerNotification = function() {
    var core = this.core;
    var self = this;
    core.users.forEach(function(elem, index) {
        if (elem.worklog == undefined) elem.worklog = 0;
        if (elem.worklog < (6*3600)) {
            text = self.generateMessageFromTemplate(elem, core.options.managers.worklogTemplate);
            core.postMessage(elem.slackname, text);
        }
    });
}

/**
 * Generates a worklog related message by the given template
 * @param user
 */
jira2slack.notificationservice.prototype.generateMessageFromTemplate = function(user, template) {

}


function createTime(time) {
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

module.exports.cron = jira2slack.notificationservice;
