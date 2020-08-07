let chai = require(‘chai’);
let chaiHttp = require(‘chai - http’);
var should = chai.should();
chai.use(chaiHttp);
let server = require(‘.. / lib / routes’);
//Our parent block
describe(‘Homepage’, () => {
            describe(‘/GET /’, () => {
                        it(‘it should GET all of the homepage’, (done) => {
                                chai.request(server)
                                    .get(‘/’)
                                        .end((err, res) => {
                                            (res).should.have.status(200);
                                            (res.body).should.be.a(‘object’);
                                            (res.body.podcasts.length).should.be.eql(1);
                                            done();
                                        });
                                    });
                        });