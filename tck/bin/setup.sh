#!/bin/bash

declare -r SOURCE=${BASH_SOURCE[0]}
declare -r DIR=$(dirname ${SOURCE})

source ${DIR}/functions.inc

stopNginx
startNginx

stopEcho
startEcho

sleep 1

stopKlid
startKlid

sleep 1

echo "ready for integration tests..."