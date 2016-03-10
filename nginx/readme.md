Documentation
=============
# Nginx 

Compiling Nginx
===============

```bash
wget http://nginx.org/download/nginx-1.8.1.tar.gz
tar -zxf nginx-1.8.1.tar.gz
cd nginx-1.8.1
./configure --with-http_auth_request_module
make
```

Running Nginx
=============

```bash
./objs/nginx -p ..  -c nginx.conf
```