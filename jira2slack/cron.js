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
    new cronjob("* * * * * *", function() {
        self.sendSlackerNotification();
    }, null, true);
}


jira2slack.notificationservice.prototype.sendSlackerNotification = function() {
    ERISE.users.forEach(function(elem, index) {
        if (elem.worklog == undefined) elem.worklog = 0;
        if (elem.worklog < (6*3600)) {
            text = "*" + elem.name + "* csak *" + ERISE.createTime(elem.worklog) + "*-t logoltál!";
            slackstuff.postMessage(elem.slackname, text);
        }
    });
};



module.exports.cron = jira2slack.notificationservice;
