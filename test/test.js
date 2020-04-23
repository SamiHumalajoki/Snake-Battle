
var io = require('socket.io-client')
var assert = require('chai'),assert;
var expect = require('chai').expect;
const supertest = require('supertest');
const server = require('../index');
const chai = require('chai');

const api = supertest.agent(server);
// const PORT = process.env.PORT || 3000;

describe('Suite of unit tests', function() {

  var socket1;
  var socket2;

  before(function(done) {
    // Setup
    socket1 = io.connect('http://localhost:3000'
    , {
        'reconnection delay' : 0
        , 'reopen delay' : 0
        , 'force new connection' : true
    });
    
    socket1.on('connect', function() {
        console.log('worked...');
        
    });
    socket1.on('disconnect', function() {
        console.log('disconnected...');
    });
    socket2 = io.connect('http://localhost:3000', {
        'reconnection delay' : 0
        , 'reopen delay' : 0
        , 'force new connection' : true
    });
    socket2.on('connect', function() {
      console.log('worked...');      
    });
    socket2.on('disconnect', function() {
        console.log('disconnected...');
    });
    done();
  });

  after(function(done) {
    // Cleanup
    if(socket1.connected) {
        console.log('disconnecting socket1...');
        socket1.disconnect();
    } else {
        // There will not be a connection unless you have done() in beforeEach, socket1.on('connect'...)
        console.log('no connection to break...');
    }
    if(socket2.connected) {
      console.log('disconnecting socket2...');
      socket2.disconnect();
    } else {
        // There will not be a connection unless you have done() in beforeEach, socket1.on('connect'...)
        console.log('no connection to break...');
    }
    done();
  });

  describe('Some basic tests', function() {

    it('Client should connect', function (done) {
      api.on('connection', (socket) => {
        assert.notEqual(socket, null, 'socket should not be null');
      });
      done();
    });

    it('Should pass an event to another client', function (done) {
      // this is how you determine your tests are successful
      socket1.on('move', (data) => {
        if (data === 'test') {
          done();
        }
      });
      socket2.emit('move', 'test');
    });
  });

});
