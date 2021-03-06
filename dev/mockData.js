var db = require('mongoose');
var models = require(__dirname+'/../lib/databasemodels.js');
var clienttracking = require(__dirname+'/../lib/clienttracking.js');
var q = require('promised-io/promise');
var Deferred = q.Deferred;
var moment = require('moment');

db.connect('mongodb://127.0.0.1/adnoce', {});

var executeViewQuery = function (sessionID, requestHeaders, additionalData) {  
  var deferred = new Deferred();
  clienttracking.pushTrackingData(sessionID, requestHeaders, additionalData, function(err, data) {
    if (err === null) deferred.resolve(data);
    else deferred.reject(err);
  });
  return deferred.promise;          
} 
var executeEventQuery = function(type, name, sessionId, additionalData, eventDate) {  
  var deferred = new Deferred();
  clienttracking.addEvent(type, name, sessionId, additionalData, eventDate, function(err, data) {    
    if (err === null) deferred.resolve(data);
    else deferred.reject(err);
  });
  return deferred.promise;
}


var requestHeaders = { 'referer': null, 'user-agent': 'user-agent for testing' }
var additionalData = { adnocetype: 100, timestamp: null }
var arrayOfPromises = [];
var acutalDate = new Date();

// generate 200 views 
var pathstringID = 1;
for (var v = 0, vx = 200; v < vx; ++v) {
  if (v % 10 === 0) {
    pathstringID = 10;
  } else {
    pathstringID = Math.floor(Math.random() * (50 - 10 + 1)) + 10;    
  }
  requestHeaders.referer = 'http://www.example.com/path'+pathstringID;
  var hour = Math.floor(Math.random() * (23 - 1 + 1)) + 1; // Math.floor(Math.random() * (max - min + 1)) + min;
  var minute = Math.floor(Math.random() * (59 - 1 + 1)) + 1;
  var second = Math.floor(Math.random() * (59 - 1 + 1)) + 1;
  additionalData.timestamp = new Date(acutalDate.getFullYear(), acutalDate.getMonth(), acutalDate.getDate(), hour, minute, second);
  arrayOfPromises.push(executeViewQuery('testing', requestHeaders, additionalData));  
}
// generate 400 events
for (var v = 0, vx = 400; v < vx; ++v) {  
  var hour = Math.floor(Math.random() * (23 - 1 + 1)) + 1;
  var minute = Math.floor(Math.random() * (59 - 1 + 1)) + 1;
  var second = Math.floor(Math.random() * (59 - 1 + 1)) + 1;
  var value = Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
  var eventname = null;
  if (v % 10 === 0) {
    var eventnameA = [];
    for (var e = 0, ex = 8; e < ex; ++e) eventnameA.push(String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1)) + 65));
    eventname = eventnameA.join('');
  } else {
    switch (Math.floor(Math.random() * (5 - 1 + 1)) + 1) {
      case 5:
        eventname = 'login';
        break;
      case 4:
        eventname = 'login';
        break;
      case 3:
        eventname = 'search';
        break;
      case 2:
        eventname = 'register';
        break;
      case 1:
        eventname = 'order';
        break;
      default:
        eventname = 'generic';
    }
  }
  
  
  var data = { key: 'test', value: value };
  arrayOfPromises.push(executeEventQuery(200, eventname, 'testing', data, new Date(acutalDate.getFullYear(), acutalDate.getMonth(), acutalDate.getDate(), hour, minute, second)));  
}
// generate 200 error events
for (var v = 0, vx = 200; v < vx; ++v) {
  if (v % 10 === 0) {
    ++pathstringID;    
  }  
  var hour = Math.floor(Math.random() * (23 - 1 + 1)) + 1;
  var minute = Math.floor(Math.random() * (59 - 1 + 1)) + 1;
  var second = Math.floor(Math.random() * (59 - 1 + 1)) + 1;
  var message = [];
  for (var e = 0, ex = (Math.floor(Math.random() * (40 - 1 + 1)) + 1); e < ex; ++e) message.push(String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1)) + 65));
  var data = { key: 'message', value: message.join('') };
  arrayOfPromises.push(executeEventQuery(100, 'error', 'testing', data, new Date(acutalDate.getFullYear(), acutalDate.getMonth(), acutalDate.getDate(), hour, minute, second)));  
}

var group = q.all(arrayOfPromises); 
var results = [];

group.then(function(resultArray){    
  process.exit();
});
