
declare -r NGINX_VER=1.8.1
declare -r NGINX_PATH=${DIR}/../../nginx
declare -r NGINX_BIN=${NGINX_PATH}/nginx-${NGINX_VER}/objs/nginx

declare -r ECHO=${DIR}/../lib/echo-server.js
declare -r KLID=${DIR}/../lib/server.js

function startNginx() {
    echo "starting nginx..."
    ${NGINX_BIN} -p ${NGINX_PATH} -c nginx.conf
}

function stopNginx() {
    echo "stopping nginx..."
    ${NGINX_BIN} -p ${NGINX_PATH} -c nginx.conf -s stop 2>/dev/null
}

function startEcho() {
    echo "starting echo..."
    node ${ECHO} &
    echo "$!" > ${DIR}/echo.pid
}

function stopEcho() {
    if [ -f ${DIR}/echo.pid  ]; then
        echo "no echo.pid"
        pid=$(cat ${DIR}/echo.pid)
    else
        pid=$(ps -ef | grep node | grep echo-server | awk '{print $2}')
    fi

    if [ -z ${pid} ]; then return; fi

    echo "stopping echo at PID: $pid"
    kill ${pid}
    rm -f ${DIR}/echo.pid
}


function startKlid() {
    echo "starting echo..."
    node ${KLID} &
    echo "$!" > ${DIR}/klid.pid
}

function stopKlid() {
    if [ -f ${DIR}/klid.pid  ]; then
        echo "no klid.pid"
        pid=$(cat ${DIR}/klid.pid)
    else
        pid=$(ps -ef | grep node | grep server | awk '{print $2}')
    fi

    if [ -z ${pid} ]; then return; fi

    echo "stopping klid at PID: $pid"
    kill ${pid}
    rm -f ${DIR}/klid.pid
}