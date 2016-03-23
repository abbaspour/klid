#!/bin/bash

declare -r SOURCE=${BASH_SOURCE[0]}
declare -r DIR=$(dirname ${SOURCE})

${DIR}/../../node_modules/tape/bin/tape ${DIR}/../t/*.js

