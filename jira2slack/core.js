/**
 * Created by Papp on 2015.05.15..
 */

var jira2slack = jira2slack || {};
var fs = require("fs");
var colors = require("colors");

jira2slack.request = require("https").request;

jira2slack.hook = require("./hook").hook;

jira2slack.cron = require("./cron").cron;

jira2slack.translate = require("./translate").translate;

jira2slack.web = require("./webinterface").web;

querystring = require("querystring");

process.on("exit", function(code) {
// make sure we delete template files on exit
        fs.unlinkSync("./jira2slack/tmp/users.json");

})


jira2slack.core = function(options) {
    var self = this;

    this.data = ""; // initial data string
    // default options
    this.options = {

        managers : [], // the list of managers to inform about the worklogs
        users : [], // the list of user objects they must have a jiraname and slackname property
        notifications : {
            enabled: true,
         // notification settings
            managers: { // manager related notifications
                worklogs: true,
                issues: false,
                pattern : "00 00 08 * * 1-5", // the cronjob pattern
                worklogTemplate : "",
                notificationLimit : 6*3600
            },
            users: { // user related notifications
                pattern: "00 00 18 * * 1-5",  // the cronjob pattern
                worklogs: false,
                issues: false,
                worklogTemplate : "",
                notificationLimit : 6*3600 // if the daily worklogs pass these number then no warning gonna be send
            }
        },
        // webhook related options
        hook: {
            enabled : true,
            port: 3000,
            worklogs: true,
            issues: true,
        },
        webinterface : {
            enabled : true,
            port: 8081,
            username: "Tacsiazuma",
            password: "test"
        }

    };
    this.options = MergeRecursive(this.options,options); // merge the options
    this.users = this.options.users; // assign the users from options
    fs.exists("./jira2slack/tmp/users.json", function(ex) {
            if (ex !== true) {
                filedesc = fs.openSync("./jira2slack/tmp/users.json", 'w');
                fs.writeSync(filedesc, JSON.stringify(self.users)); // save the users initially
            } else {
                content = fs.readFileSync("./jira2slack/tmp/users.json", {encoding : "UTF-8"});
                self.users = JSON.parse(content);
            }
        });

    this.managers = this.options.managers;
    this.options.url = "slack.com";
    this.translate = new jira2slack.translate(this.options.locale);
    if (this.options.hook.enabled == true) {
        this.hook = new jira2slack.hook(this.options.hook, this); // start the hook service by passing the related configurations and the core object reference to it
    }
    if (this.options.webinterface.enabled == true) {
        this.webinterface = new jira2slack.web(this.options.webinterface, this); // start the webinterface service
    }
    if (this.options.notifications.enabled == true) {
        this.cron = new jira2slack.cron(this.options.notifications, this);
    }
};
/**
 * Start the services
 */
jira2slack.core.prototype.start = function() {
    if (this.options.hook.enabled == true) {
        this.hook.start();
    }
    if (this.options.webinterface.enabled == true) {
        this.webinterface.start();
    }
    if (this.options.notifications.enabled == true) {
        this.cron.start();
    }
    this.rtmStart(this.options.token);
}

/**
 * A user entity
 * @param name
 * @param realname
 * @param id
 */
jira2slack.user = function(name, realname, id) {
    this.name = name;
    this.realname = realname;
    this.id = id;
    this.channel;
}

/**
 * Starts a real time message session.
 * @param token
 */
jira2slack.core.prototype.rtmStart = function() {
    process.stdout.write("Connecting to "+ this.options.url + "...");
    this.sendRequest(this.options.url, "/api/rtm.start", {
        token: this.options.token
    })
}

/**
 * Posts a message to a given channel
 * @param options
 */
jira2slack.core.prototype.postMessage = function(user, text, attachments) {
    channel =  this.getMappedChannel(user);
    console.log("Sent message to user " + user + " at channel:" + channel)
    this.sendRequest(this.options.url, "/api/chat.postMessage", {
        channel : channel,
        username : "JIRA",
        as_user : true,
        token : this.options.token,
        attachments : JSON.stringify(attachments) // we must json_encode it
    })

}

/**
 * Get the channel associated with the given user
 * @param user
 * @returns {string}
 */
jira2slack.core.prototype.getMappedChannel = function(user) {
    var channel = "";
    this.users.forEach(function(elem, index) {
        if (elem.name == user) {
            channel = elem.channel;
        }
    });
    return channel;
}
/**
 * Assign channels to users
 */
jira2slack.core.prototype.assignChannels = function() {
    var self = this;
    this.users.forEach(function(elem) {
        var user = elem;
        self.responseJSON.users.forEach(function(elem) {
            if (elem.name == user.slackname) {
                user.realname = elem.realname;
                user.id = elem.id; // assign the ID
            }
        })

        self.responseJSON.ims.forEach(function(elem, index){
            if (elem.user == user.id) {
                user.channel = elem.id;
            }
        });
    });
    this.managers.forEach(function(elem) {
        var user = elem;
        self.responseJSON.users.forEach(function(elem) {
            if (elem.name == user.slackname) {
                user.realname = elem.realname;
                user.id = elem.id; // assign the ID
            }
        })

        self.responseJSON.ims.forEach(function(elem, index){
            if (elem.user == user.id) {
                user.channel = elem.id;
            }
        });
    });
}
/**
 * Parse a real time messaging session response
 */
jira2slack.core.prototype.parse = function() {
    var self = this;
    this.responseJSON = JSON.parse(this.data.toString());
    if (this.responseJSON.ok == true) { // if the response went fine then iterate through the ims and map them to users
        this.assignChannels(); // assign channels to users
        this.url = this.responseJSON.url; // assign the real time messaging websocket url
        process.stdout.write("success!\n".green);
    } else {
        process.stdout.write("failed!\n".red);
        process.exit();
    }

}

/**
 * Recursively merge properties of two objects (options)
 */
function MergeRecursive(obj1, obj2) {

    for (var p in obj2) {
        try {
            // Property in destination object set; update its value.
            if ( obj2[p].constructor==Object ) {
                obj1[p] = MergeRecursive(obj1[p], obj2[p]);

            } else {
                obj1[p] = obj2[p];

            }

        } catch(e) {
            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];

        }
    }

    return obj1;
}


jira2slack.core.prototype.appendData = function (chunk) {
    this.data = this.data + chunk;

};

jira2slack.core.prototype.handleResponse = function (res) {
    var self = this;
    res.setEncoding('utf8');
    self.data = ""; // empty the buffer
    res.on('data', function(chunk) {
        self.appendData(chunk)
    });
    res.on("end", function() {
        self.parse()
    });



};

jira2slack.core.prototype.sendRequest = function(url,path, postData) {
    var self = this;
    post = querystring.stringify(postData);
    var req = jira2slack.request({
            host: url,
            path: path,
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post.length
            }

        },function(res) {
            if (path == "/api/rtm.start") {
                self.handleResponse(res);
            }
        }
    );
    // add error handling
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    req.write(post);
    req.end();
}

exports.core = jira2slack;