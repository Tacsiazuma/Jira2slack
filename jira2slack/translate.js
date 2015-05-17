/**
 * Created by Papp on 2015.05.17..
 */
var jira2slack = jira2slack || {};

jira2slack.translate = function(locale) {
    try {
        this.locale = require("./lang/"+ locale);
    } catch(err) {
        console.log(err.message);
        process.exit(0);
    }
}

jira2slack.translate.prototype.translate = function(key) {
    var value = key;
    this.locale.forEach(function(elem, index) {
            if (elem.key == key) {
                value = elem.value;
            }
    });
    return value;
}



module.exports.translate = jira2slack.translate;
