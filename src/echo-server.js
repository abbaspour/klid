'use strict';

const http = require('http');
const os = require('os');

const port = 9090;

function echoHeadersToBody(request, response) {

    let user = request.headers['x-user'];

    let content = 'user header: ' + user;

    let code = 202;

    response.writeHead(code, {"Content-Type": "text/plain", 'Content-Length' : content.length});
    response.end(content);

}
const server = http.createServer(echoHeadersToBody);
server.listen(port);


console.log("Server running at http://" + os.hostname() + ":" + port);

