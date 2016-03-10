Building 
========

```bash
npm install 
```

Running
=======

Run Nginx
---------

run nginx following instructions in its [readme](nginx/readme.md) file
 
Running Klid
------------
 
```
npm start
```

Testing
=======

Start Local Echo Server
-----------------------

```
npm run echo
```

Send HTTP Request to Gateway
----------------------------

```
curl -v -X GET --header "Accept: */*" --header "Authorization: Basic YW1pbjpqdWxpYQ==" \
    http://localhost:8080/somemodule/somegroup
```


