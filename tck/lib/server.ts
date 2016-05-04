'use strict';

import klid = require('./../../src/index');
import os = require('os');

const port = 9000;

klid.addFile(__dirname + '/../../test/p/policy.json');
klid.startServer(9000);

console.log("Server running at http://" + os.hostname() + ":" + port);

