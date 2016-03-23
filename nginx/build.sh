#!/bin/bash

declare -r SOURCE=${BASH_SOURCE[0]}
declare -r DIR=$(dirname ${SOURCE})

cd ${DIR}

wget http://nginx.org/download/nginx-1.8.1.tar.gz
tar -zxf nginx-1.8.1.tar.gz
cd nginx-1.8.1
./configure --with-http_auth_request_module
make
