'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const named = require('named-regexp').named;
const http = require('http');

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
    fs.readdirSync(dir).forEach(function (file) {
        file = dir + '/' + file;
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
    console.log('loading file: ' + file);
    const data = loadFile(file);
    if (_.isArray(data))
        _.forEach(data, addPolicy);
    else
        addPolicy(data);
}

/**
 * determine type of policy: realm, ds, auth, statement, include
 * @param policy JSON object of policy
 */
function addPolicy(policy) {

    let realm = policy['realm'];
    let ds = policy['ds'];
    let auth = policy['auth'];
    let statement = policy['statement'];
    let include = policy['include'];

    if (!_.isUndefined(ds)) {
        if (_.isArray(ds))
            _.forEach(ds, addDs);
        else
            addDs(ds);
    }

    if (!_.isUndefined(auth)) {
        if (_.isArray(auth))
            _.forEach(auth, addAuth);
        else
            addAuth(auth);
    }

    if (!_.isUndefined(realm)) {
        if (_.isArray(realm))
            _.forEach(realm, addRealm);
        else
            addRealm(realm);
    }


    if (!_.isUndefined(statement)) {
        if (_.isArray(statement))
            _.forEach(statement, addStatement);
        else
            addStatement(statement);
    }

    if (!_.isUndefined(include)) {
        /*
         console.warn("include is not implemented yet. relative path issue.");
         if(_.isArray(include))
         _.forEach(include, addFile);
         else
         addRealm(addFile);
         */

    }

}


const loadedDs = {};

function addDs(ds) {
    let name = ds['name'];
    if (_.isUndefined(name)) {
        console.warn("skipping DS. lacking name");
        return;
    }

    let module = ds['module'];
    if (_.isUndefined(module)) {
        console.warn(`skipping DS ${name}. lacking module`);
        return;
    }

    let dsMod;
    try {
        dsMod = require(__dirname + '/ds/ds-' + module);
    } catch (e) {
        console.warn(`skipping DS ${name}. unable to load module: ${module}`);
        return;
    }

    let config = ds['config'];
    try {
        dsMod.init(config);
    } catch (e) {
        console.warn(`skipping DS ${name}. unable to init module: ${module}, error: ${e}`);
        return;
    }

    loadedDs[name] = dsMod;

    console.log(`adding ds: ${name}`);

    return dsMod;
}

const loadedAuth = {};

function addAuth(auth) {

    let name = auth['name'];
    if (_.isUndefined(name)) {
        console.warn("skipping Auth. lacking name");
        return;
    }

    let module = auth['module'];
    if (_.isUndefined(module)) {
        console.warn(`skipping Auth ${name}. lacking module`);
        return;
    }

    let authMod;
    try {
        authMod = require(__dirname + '/auth/auth-' + module);
    } catch (e) {
        console.warn(`skipping Auth ${name}. unable to load module: ${module}`);
        return;
    }

    let config = auth['config'];
    try {
        authMod.init(config);
    } catch (e) {
        console.warn(`skipping Auth ${name}. unable to init module: ${module}, error: ${e}`);
        return;
    }

    let dsName = auth['ds'];
    if (!_.isUndefined(dsName)) {
        let ds;
        if(_.isString(dsName)) {
            ds = loadedDs[dsName];
        } else {
            ds = addDs(dsName);
        }
        if (!_.isUndefined(ds)) {
            try {
                authMod.setDataStore(ds);
            } catch (e) {
                console.warn(`skipping DS ${name}. unable to set its DS module: ${module}, error: ${e}`);
                return;
            }
        }
    }

    loadedAuth[name] = authMod;

    console.log(`adding auth: ${name}`);

    return authMod;
}

const loadedRealm = {};
let defaultRealm = null;

function addRealm(realm) {
    let name = realm['name'];
    if (_.isUndefined(name)) {
        console.warn("skipping realm. lacking name");
        return;
    }

    let authName = realm['auth'];
    if (_.isUndefined(authName)) {
        console.warn(`skipping realm ${name}. lacking auth`);
        return;
    }

    let auth;

    if(_.isString(authName)) {
        auth = loadedAuth[authName];
    } else {
        auth = addAuth(authName);
    }

    if(_.isUndefined(auth)) {
        console.warn(`skipping realm ${name}. unable to assign auth.`);
        return;
    }

    realm['auth'] = auth;

    loadedRealm[name] = realm;

    if(realm['default'] === 'true' || defaultRealm === null) {
        console.log(`default realm is now: ${name}`);
        defaultRealm = realm;
    }

    console.log(`adding realm: ${name}`);

    return realm;
}

function getRealm(name) {
    return _.get(loadedRealm, name, defaultRealm);
}

const loadedStatements = [];


function addStatement(statement) {


    let resource = statement['resource'];
    if(_.isUndefined(resource)) {
        console.warn('skipping statement with no resource');
        return;
    }

    let names = getNamesOfNamedRE(resource);

    statement['allow'] = _.get(statement, 'effect', 'true') === "true";

    statement['names'] = names;
    statement['re'] = namedResourceToRe(resource);

    statement['realm'] = getRealm(statement['realm']);

    if(statement['condition'] != null) {
        statement['condition'] = buildConditionFunction(names, statement['condition']);
    }

    loadedStatements.push(statement);

}

function buildConditionFunction(names, text) {
    console.log(`build condition function params: ${names} and text: ${text}`);
    return new Function(names, text);
}

function namedResourceToRe(resource) {
    let slashedResource = resource.replace(/\//g, "\\/");
    let namedResource = slashedResource.replace(/\$([^\\]+)/g, "(:<$1>[^/]+)");
    console.log(`${resource} => ${namedResource}`);
    return named( new RegExp(namedResource, 'ig'));
}

function getNamesOfNamedRE(resource) {
    let namesRe = /\$([^/]+)/g;
    let names = [];
    let match = false;
    while(match = namesRe.exec(resource)) {
        names.push(match[1]);
    }
    return names;
}


function addFile(path) {
    let files = filesInInput(path);
    _.forEach(files, processFile);
}

function evaluate(request) {

    let url = request.headers['x-original-uri'];
    if(_.isUndefined(url)) url = request.url;

    for(let s of loadedStatements) {
        let nameValue = matches(url, s);

        if(nameValue == null)
            continue;

        console.log(`matched ${url} against ${s}`);
        let realm = s['realm'];
        if(_.isUndefined(realm)) continue;
        let authMod = realm['auth'];
        if(_.isUndefined(authMod)) continue;
        let attributes = authMod.authenticate(request);
        if(attributes == null)
            return null;
        console.log(`authentication result from real ${realm.name}: ${attributes}`);
        let condition = s['condition'];
        if(_.isUndefined(condition))
            return attributes; // todo: return effect.allow
        console.log('invoking condition with ' + JSON.stringify(nameValue));
        let c = condition.apply(null, nameValue);
        return c == true ? attributes : null;
    }

    return null;
}

function matches(url, statement) {
    let re = statement['re'];
    let names = statement['names'];
    if(_.isUndefined(re)) return null;
    let matched = re.exec(url);
    if(matched === null) return null;
    console.log(`matched: ${matched}`);
    let nameValue = [];
    for(let n of names) {
        let value = matched.capture(n);
        console.log(n + ' => ' + value);
        nameValue.push( value);
    }
    return nameValue;

}

const HTTP_PREFIX = 'X-';

function addHeaders(response, principal, attributes) {
    response.setHeader(HTTP_PREFIX + 'principal' , principal);
    _.forIn(attributes, function(value, name) {
        response.setHeader(HTTP_PREFIX + _.toUpper(name), value);
    });
}

function handleSubAuthRequest(request, response) {
    let content = 'unauthorized';
    let code = 406;

    console.log('received authenticate request headers: ' + JSON.stringify(request.headers));
    let attributes = evaluate(request);

    if(attributes) {
        let principal = attributes['principal'];
        addHeaders(response, principal, attributes);
        content = 'authenticated';
        code = 200;
    }

    console.log('result : ' + content);

    response.writeHead(code, {"Content-Type": "text/plain", 'Content-Length' : content.length});
    response.end(content);
}

/**
 * start klid is server mode. evalute and inject headers
 * @param {number} port
 */
function startServer(port) {
    let server = http.createServer(handleSubAuthRequest);
    server.listen(port);
}

const m = {

    /**
     * @exports
     * @param {string} path of file or folder to read policies from
     *
     * this function can load policy, realms, auths, data-stores, and statements
     */
    load: function (path) {
        if (_.isUndefined(path)) path = 'policy.json';
        addFile(path);
    },

    /**
     * @exports
     * @param {object} request
     * @return {map} list of attributes, null if not authenticated
     */
    authenticate: function (request) {
        return evaluate(request);
    },

    listen : function(port) {
        startServer(port);
    }
};

module.exports = m;