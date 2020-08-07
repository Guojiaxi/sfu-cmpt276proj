/**
 * Using Bobby Chan's demo7 (8) tutorial on testing
 * https://www.youtube.com/watch?v=LEmyIRD_siw&list=PLg7lel5LdVjwy8mxysOHNdU0t7LvQyKzm&index=17&t=2705s
 * 
 **/

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../lib/routes');
var should = chai.should();
var io = require('socket.io-client')

// Object to make http calls or requests
chai.use(chaiHttp);
/**
// Describes tests
describe('Meetups', function() {
    // All user related tests
    it('should add a single user on successful POST request for /meetup_request_submit', function(done) {
        chai.request(server).post("/meetup_request_submit")
            .send({ 'users': '1, 2, 3, 4', 'date': '2020-12-25', 'time': '11:11', 'location': 'ASB' })
            .end(function(error, res) {
                res.should.have.status(200);
                res.body[0].users.should.equal('1, 2, 3, 4');
                res.body[1].users.should.equal('2020-12-25');
                res.body[2].users.should.equal('11:11');
                res.body[3].users.should.equal('ASB');
                done();
            });
    });
});


describe("Socket", function() {
    it('should socket', function(done) {
        var client = io('http://localhost:5000');
        client.on('connect', function(data) {
            client.disconnect();
            done();
        });
    });

});*/