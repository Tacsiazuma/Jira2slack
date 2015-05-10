/**
 * Created by Papp on 2015.05.09..
 */
var assert = require('assert');

var bot = require("./index.js").bot();
var expect = require("chai").expect;

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
})