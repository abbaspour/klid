'use strict';

const _ = require('lodash');

const AUTHORIZATION_TYPE = "Basic ";

function httpBasicAuthenticate(ds, request) {
    let headers = request.headers;
    let method = request.method;
    let url = request.url;

    let authorizationHeader = headers['authorization'];

    if (_.isUndefined(authorizationHeader)) {
        console.log('no authorization header found');
        return null;
    }

    if (!_.startsWith(authorizationHeader, AUTHORIZATION_TYPE)) {
        console.log('authorization header is not valid: ' + authorizationHeader);
        return false;
    }

    let base64UserPass = authorizationHeader.substring(AUTHORIZATION_TYPE.length);
    console.log("base64UserPass: " + base64UserPass);

    let userPass = new Buffer(base64UserPass, 'base64').toString("ascii");
    let splitUserPass = userPass.split(':');
    let principal = splitUserPass[0];
    let secret = splitUserPass[1];

    console.log(`received request ${method} ${url} with ${principal}/${secret}`);


    if (!ds.bind(principal, secret))
        return null;

    let attributes = ds.load(principal);
    attributes['principal'] = principal;

    return attributes;
}

function  m() {

    let ds;

    /**
     * initiates a module with given config
     * @param {object} config to init module from
     */
    this.init = function(config) {
        console.log('init http-basic auth with config: ' + config);
    };

    this.setDataStore = function (ds) {
        this.ds = ds;
    };

    /**
     * validate http call by looking at http attributes and fetching user from ds
     * @param {object} request http request with headers
     */
    this.authenticate = function(request) {
        return httpBasicAuthenticate(this.ds, request);
    }
}

module.exports = m;