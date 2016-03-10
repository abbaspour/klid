'use strict';

const _ = require('lodash');
const fs = require('fs');

function filesInInput(input) {
    if (_.isUndefined(input)) {
        console.error('input file/folder is mandatory');
        return [];
    }
    let f;
    try {
        f = fs.lstatSync(input)
    } catch (e) {
        console.warn(`skipping path ${input} : ${e}`);
        return [];
    }

    return f.isDirectory() ? filesInFolder(input) : [input];
}

function filesInFolder(dir) {
    var results = [];
    fs.readdirSync(dir).forEach(function(file) {
        file = dir+'/'+file;
        var stat = fs.statSync(file);
        if (stat && !stat.isDirectory())
            results.push(file);
    });
    return results;
}

function loadFile(file) {
    const payload = fs.readFileSync(file, 'utf8');
    try {
        return JSON.parse(payload);
    } catch (e) {
        console.error('unable to load file: ' + file + ", error: " + e.message);
        process.exit(1);
    }
}

function processFile(file) {
    console.log('loading json user file: ' + file);
    const data = loadFile(file);
    if(_.isArray(data))
        _.forEach(data, addUser);
    else
        addUser(data);
}

function addUser(user) {
    let username = user['username'];
    if(_.isUndefined(username)) {
        console.warn(`skipping. undefined username for user:  ` + JSON.stringify(user));
        return;
    }
    if(users[username])
        console.warn(`duplicate username:${username}`);
    console.log(`adding ${username} : ${JSON.stringify(user)}`);
    users[username] = user;
}

const users = {};


const  m = {

    /**
     * initiates a module with given config
     * @param {object} config to init module from
     */
    init : function(config) {
        console.log('init json ds with config: ' + JSON.stringify(config));
        let path = __dirname + '/' + config['path'];
        let files = filesInInput(path);
        _.forEach(files, processFile);

    },

    /**
     * tries to bind a principal/secret
     * @param {string} principal user name
     * @param {string} secret password
     * @returns {boolean} authenticated or not with given u/p
     */
    bind : function(principal, secret) {
        console.log('json bind principal : ' + principal);
        let user = users[principal];
        return ! _.isUndefined(user) && user["password"] == secret;
    },

    /**
     * loads a principal's attributes from store
     * @param {string} principal user name to load
     * @returns {object} attributes of given principal. null if not found
     */
    load : function(principal) {
        console.log('json load principal : ' + principal);
        return _.get(users, principal, null);
    }
};

module.exports = m;