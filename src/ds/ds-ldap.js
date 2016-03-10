'use strict';

const  m = {

    /**
     * initiates a module with given config
     * @param {object} config to init module from
     */
    init : function(config) {
        console.log('init ldap ds with config: ' + JSON.stringify(config));
    },

    /**
     * tries to bind a principal/secret
     * @param {string} principal user name
     * @param {string} secret password
     * @returns {boolean} authenticated or not with given u/p
     */
    bind : function(principal, secret) {
        console.log('ldap bind principal : ' + principal);
        return false;
    },

    /**
     * loads a principal's attributes from store
     * @param {string} principal user name to load
     * @returns {object} attributes of given principal. null if not found
     */
    load : function(principal) {
        console.log('ldap load principal : ' + principal);
        return null;
    }
};

module.exports = m;