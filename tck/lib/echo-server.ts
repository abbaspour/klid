'use strict';

import http = require('http');
import os = require('os');

const port = 9090;

function echoHeadersToBody(request, response) {

    let content = '';
    let headers = request['headers'];
    for(let key in headers)
        content += (key + ' : ' +  headers[key] + '\n');

    console.log(`sending content: ${content}`);

    response.writeHead(202, {"Content-Type": "text/plain", 'Content-Length' : content.length, 'Connection': 'keep-alive'});
    response.write(content);

}

const server = http.createServer(echoHeadersToBody);
server.listen(port);


console.log("Server running at http://" + os.hostname() + ":" + port);

