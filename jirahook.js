/**
 * Created by Papp on 2015.05.05..
 */
var JIRAHOOK = {};
var http = require("http");
exports.core = function() {
    return JIRAHOOK;
};

JIRAHOOK.options = {
    port : 3000
};
/**
 * @param callback callback
 * @param options object
 */
JIRAHOOK.start = function(callback, options) {
    JIRAHOOK.options.callback = callback;
    if (typeof options == "object") {
        JIRAHOOK.options.merge(options); // if it is an object then merge it to the defaults
    }
    console.log("Listening at http://localhost:" + JIRAHOOK.options.port);
    // start listening for incoming JIRA hooks
    http.createServer(function(req, resp) {
        // register a callback for

        req.on("data", function(chunk) {
            JIRAHOOK.parse(chunk);
        }, this);


        // send back an empty response
        resp.writeHead(200, {'Content-Type': 'text/plain'});
        resp.end('Ok\n');
    }, this).listen(JIRAHOOK.options.port);

}


/**
 * It converts the incoming binary data to JSON
 * @param binary chunk Binary data from the post message
 * @param callback callback The callback given to parse and filter the request
 * @return void
 */

JIRAHOOK.parse = function(chunk) {
    try {
        var content = JSON.parse(chunk.toString());
    }
    catch (error) {

        return; // if not valid JSON sent
    }
    JIRAHOOK.options.callback(content);

};



// define the API endpoints
// define the token
// first of all, check the API token we got
// if it's ok, then get the users in the team
// make a map for the JIRA users to Slack users
