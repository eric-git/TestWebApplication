#!/bin/bash

# Description: Create a self-signed SSL certificate for local development.
# Usage: ./create-ssl-certificate.sh
if command -v openssl &>/dev/null; then
    openssl req \
        -nodes \
        -new \
        -x509 \
        -keyout ../src/api/assets/server.key \
        -out ../src/api/assets/server.cert \
        -days 825 \
        -subj "/C=AU/ST=ACT/L=Canberra/O=Department of Employment/CN=localhost"
else
    echo "OpenSSL is not installed."
fi
