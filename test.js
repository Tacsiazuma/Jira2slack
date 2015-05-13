/**
 * Created by Papp on 2015.05.09..
 */
var assert = require('assert');

var bot = require("./jirahook.js").core();
var expect = require("chai").expect;
var http = require("http");

describe('Bot', function(){
    describe('#bot()', function(){
        it('should return object', function(){
            expect(bot).to.be.object;
        })
    })
    describe('#token', function(){
        it('should be a string', function(){
            expect(bot.token).to.be.string;
        })
    })
    describe('#url', function(){
        it('should be a string', function(){
            expect(bot.url).to.be.string;
        })
    })
    describe('#endpoints', function(){
        it('should be an object', function(){
            expect(bot.endpoints).to.be.object;
        })
    })
    describe('#server', function(){
        it('should listen on 9091', function(){
            // bot.server(); // start the server
            options = {
                host: "http://localhost",
                port: 9091,
                method: "POST"
            };
            bot.start(); // start listening
            var req = http.request(options);

            req.on("response",function(response) {
                this.expect(response.statusCode).to.equal(200);
            }, this);

            req.end(); // send a request


            // bot.stop();
        })
    })
})