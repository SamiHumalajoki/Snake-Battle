'use strict';

const io = require('socket.io-client')
var assert = require('chai'),assert;
const expect = require('chai').expect;
const Game = require('../public/Game');

const server = require('../index');

const api = require('http').createServer(server);


describe('Server tests', function() {

  var socket1;
  var socket2;

  before(function(done) {
    // Setup
    socket1 = io.connect('http://localhost:3000', {
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

describe('Client tests', function() {
  // Will hold the reference to the ColorIncreaser class
  let client1;
  let client2;
  let socket1;
  let socket2;
  // beforeEach is a special function that is similar to the setup function in
  // p5.js.  The major difference it that this function runs before each it()
  // test you create instead of running just once before the draw loop
  // beforeEach lets you setup the objects you want to test in an easy fashion.
  before(function() {
    socket1 = io.connect('http://localhost:3000', {
        'reconnection delay' : 0
        , 'reopen delay' : 0
        , 'force new connection' : true
    });
    socket2 = io.connect('http://localhost:3000', {
        'reconnection delay' : 0
        , 'reopen delay' : 0
        , 'force new connection' : true
    });
    client1 = new Game(socket1);
    client2 = new Game(socket2);
  });

  it('should update movement', function(done) {
    expect(client1).to.be.a('object');
    expect(client2).to.be.a('object');
    client1.x = 1;
    client1.y = 2;
    client1.vx = 1;
    client1.vy = 0;
    console.log(client2.opponentSnake);
    
    socket2.on('move', (data) => {
      if (client2.opponentSnake.length > 0) {
        console.log(client2.opponentSnake);
        done();
      }
    });
    client1.gameUpdate();
    expect(client1.mySnake).to.deep.equal([{x:2, y:2}]);
  });

  it('some object testing', function(done) {
    
   // expect(client.currentView).to.be.equal(1);
    done();
  })
});
