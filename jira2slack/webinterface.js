/**
 * Created by Papp on 2015.05.15..
 */
var jira2slack = jira2slack || {};

var http = require("http");
var fs = require("fs");


jira2slack.webinterface = function(options, core) {
    this.options = options;
    this.core = core;
}

jira2slack.webinterface.prototype.__ = function(key) {
    return this.core.translate.translate(key);
}

jira2slack.webinterface.prototype.start = function() {
    var self = this;
    console.log("Starting webinterface at http://localhost:" + this.options.port);
    // start listening for incoming JIRA hooks
    http.createServer(function(req, resp) {
        // register a callback for


        if ( req.url != "/") {
            fs.exists("./jira2slack/public"+req.url, function(exists) {
                if (exists == true) {
                    content = fs.readFileSync("./jira2slack/public" + req.url, { encoding: "UTF-8"});
                    resp.writeHead(200, {
                        'Content-Length': content.length,
                        'Content-Type': 'text/css'
                    });

                    resp.end(content);

                } else {
                    resp.writeHead(404);
                    resp.end();
                }
            });

        } else {

            var template = fs.readFileSync("./jira2slack/view/index.html", {encoding: "UTF-8"});
            title = self.__("Title");
            head = "";
            body = "";


            var users = "<tr><th>" + self.__("Name") + "</th><th>" + self.__("Slackname") + "</th><th>" + self.__("Worklog") + "</th></tr>";

            self.core.users.forEach(function (elem) {
                if (elem.worklog == undefined) elem.worklog = 0;
                users += "<tr><td>" + elem.name + "</td><td>" + elem.slackname + "</td><td>" + createTime(elem.worklog) + "</td></tr>";
            });

            var managers = "<tr><th>" + self.__("Name") + "</th><th>" + self.__("Slackname") + "</th></tr>";

            self.core.managers.forEach(function (elem) {
                managers += "<tr><td>" + elem.name + "</td><td>" + elem.slackname + "</td></tr>";
            });

            template = template.replace("%title%", title).
                replace("%head%", head).
                replace(/%users%/g, users).
                replace(/%managers%/g, managers).
                replace(/%users_title%/g, self.__("Users")).
                replace(/%managers_title%/g, self.__("Managers"));

            resp.writeHead(200, {
                'Content-Length': template.length,
                'Content-Type': 'text/html'
            });
            resp.end(template);
        }
    }).listen(this.options.port).timeout = 5000;
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

/**
 * Exports section
 * @type {Function|jira2slack.webinterface}
 */
module.exports.web = jira2slack.webinterface;
module.exports.web.prototype = jira2slack.webinterface.prototype;