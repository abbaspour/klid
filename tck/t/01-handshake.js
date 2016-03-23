'use strict';

var request = require('request');
var net = require('net');

var test = require('tape');

/*
test('nginx is up', function (t) {
    t.plan(1);

});
*/

test('GET with Authorization Basic Header', function (t) {
    t.plan(1);

    var options = {
        url: 'http://localhost:8080/somemodule/somegroup',
        headers: {
            'Authorization': 'Basic YW1pbjpqdWxpYQ=='
        }
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 202) {
            //console.log(body);
            t.pass('response code is 200');
        } else {
            //console.log(body);
            t.fail('response code is: ' + response.statusCode);
        }
    });


});