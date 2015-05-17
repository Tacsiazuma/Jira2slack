/**
 * Created by Papp on 2015.05.15..
 */
var jira2slack = jira2slack || {};

var cronjob = require("cron").CronJob;

jira2slack.notificationservice = function(options, core) {
    this.options = options;
    this.core = core;
};

jira2slack.notificationservice.prototype.__ = function(key) {
    return this.core.translate.translate(key);
}


jira2slack.notificationservice.prototype.start = function() {
    console.log("Notification service started!");
    var self = this;
    if (self.options.managers.worklogs == true) {
        new cronjob("5 * * * * *", function () { // self.options.managers.pattern
            self.sendManagerNotification();
        }, null, true);
    }
    if (self.options.users.worklogs == true) {
        new cronjob(self.options.users.pattern, function () {
            self.sendSlackerNotification();
        }, null, true);
    }
    new cronjob("00 * * * * *", function () {
        self.generateManagerMessage(); // generates the message to the managers
        self.resetWorkLogs();
    }, null, true);

}
/**
 * Reset the daily worklogs
 */
jira2slack.notificationservice.prototype.resetWorkLogs = function() {
    var core = this.core;
    core.users.forEach(function(elem) {
        elem.worklog = 0;
    });
}


jira2slack.notificationservice.prototype.generateManagerMessage = function() {
    var core = this.core;
    var self = this;
    this.managerMessage = [ {
        fallback : this.__("Daily report"),
        pretext: this.__("Daily report"),
        fields : []
    } ];
    core.users.forEach(function(elem) {
        if (elem.worklog == undefined) {
            elem.worklog = 0; // if no worklog has been assigned
            time = "Nincs riportja!"
        } else if (elem.worklog == 0) {
            time = "Nincs riportja!";
        }
        else time = createTime(elem.worklog);
        self.managerMessage[0].fields.push({
            title : elem.name,
            value : time,
            short: true
        });
    });
}


jira2slack.notificationservice.prototype.sendSlackerNotification = function() {
    var core = this.core;
    var self = this;
    core.users.forEach(function(elem) {
        if (elem.worklog == undefined) elem.worklog = 0; // if no worklog has been assigned
        if (elem.worklog < (6*3600)) {
            text = self.generateMessageFromTemplate(elem, core.options.users.worklogTemplate);
            core.postMessage(elem.slackname, text);
        }
    });
};


jira2slack.notificationservice.prototype.sendManagerNotification = function() {
    var self = this;
    this.core.managers.forEach(function(elem) {
        self.core.postMessage(elem.slackname, "", self.managerMessage);
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

    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

module.exports.cron = jira2slack.notificationservice;
