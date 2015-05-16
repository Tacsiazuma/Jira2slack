/**
 * Created by Papp on 2015.05.15..
 */
var jira2slack = jira2slack || {};

var http = require("http");

jira2slack.webinterface = function(options, core) {
    this.options = options;
    this.core = core;
}

jira2slack.webinterface.prototype.start = function() {
    var self = this;
    console.log("Starting webinterface at http://localhost:" + this.options.port);
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

/**
 * Exports section
 * @type {Function|jira2slack.webinterface}
 */
module.exports.web = jira2slack.webinterface;
module.exports.web.prototype = jira2slack.webinterface.prototype;