'use strict';

const assert = require('assert');
const klid = require('../src/index');
const it = require('mocha/lib/mocha.js').it;
const describe = require('mocha/lib/mocha.js').describe;

describe('load', function() {
    it('should load without issues', function() {
        klid.load(__dirname + '/p/policy.json');
    });
    it('should authenticate without having multiple auth modules', function() {
        let request = {'url' : '/ds/1', 'headers' : {'authorization' : 'Basic YW1pbjpqdWxpYQ=='}, 'method' : 'GET'};
        let attributes = klid.authenticate(request);
        assert.notEqual(null, attributes);
    })
});

