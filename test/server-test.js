/**
 * Using Bobby Chan's demo7 (8) tutorial on testing
 * https://www.youtube.com/watch?v=LEmyIRD_siw&list=PLg7lel5LdVjwy8mxysOHNdU0t7LvQyKzm&index=17&t=2705s
 * 
 **/

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../index');
var should = chai.should();

// Object to make http calls or requests
chai.use(chaiHttp);

// Describes tests
describe('Meetups', function() {
    // All user related tests
    it('should add a single user on POST request for /meetup_request', function(done) {
        chai.request(server).post("/meetup_request")
    })
})