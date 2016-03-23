#!/bin/bash

declare -r SOURCE=${BASH_SOURCE[0]}
declare -r DIR=$(dirname ${SOURCE})

source ${DIR}/functions.inc

stopNginx
stopEcho
stopKlid