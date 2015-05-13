/**
 * Created by Papp on 2015.05.12..
 */
var SLACK = {};
SLACK.request = require("https").request;
querystring = require("querystring");
exports.core = function() {
    return SLACK;
};

SLACK.core = function(options) {
    var self = this;
    this.users = [];
    this.data = ""; // initial data string
    this.options = options;
    this.options.url = "slack.com";
    response = this.rtmStart(options.token);


};

SLACK.user = function(name, realname, id) {
    this.name = name;
    this.realname = realname;
    this.id = id;
}


SLACK.core.prototype.imOpen = function(options) {

}

SLACK.core.prototype.rtmStart = function(token) {
    this.sendRequest(this.options.url, {
        token: token
    } )
}

SLACK.core.prototype.postMessage = function(options) {

}

SLACK.core.prototype.assignChannels = function() {
    var self = this;
    this.users.forEach(function(elem, index) {
        var user = elem;
        self.responseJSON.ims.forEach(function(elem, index){
            if (elem.user == user.id) {
                user.channel = elem.id;
            }
        });
    });
}

SLACK.core.prototype.parse = function() {
    var self = this;
    this.responseJSON = JSON.parse(this.data.toString());
    if (this.responseJSON.ok == true) { // if the response went fine then iterate through the ims and map them to users
            this.responseJSON.users.forEach(function(elem, index) {
                self.users.push(new SLACK.user(elem.name, elem.real_name, elem.id));
            })
        this.assignChannels();
        console.log(this.users);
        process.exit();
    }

}

SLACK.core.prototype.appendData = function (chunk) {
    this.data = this.data + chunk;

};

SLACK.core.prototype.handleResponse = function (res) {
    var self = this;
    res.setEncoding('utf8');

    res.on('data', function(chunk) {
        self.appendData(chunk)
    });
    res.on("end", function() {
        self.parse()
    });



};

SLACK.core.prototype.sendRequest = function(url, postData) {
    var self = this;
    post = querystring.stringify(postData);
    var req = SLACK.request({
        host: url,
        path: "/api/rtm.start",
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post.length
        }

    },function(res) {
            self.handleResponse(res);
        }
    );
    // add error handling
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(post);
    req.end();
}
