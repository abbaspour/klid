'use strict';

const klid = require('./src/klid');
const os = require('os');

const port = 9000;

klid.load('test/p/policy.json');
klid.listen(9000);

console.log("Server running at http://" + os.hostname() + ":" + port);

