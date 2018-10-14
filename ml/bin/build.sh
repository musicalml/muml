#! /bin/bash

echo "Start build"

apt-get update

pip3 install --upgrade pip
pip3 install --no-cache-dir -r requirements.txt

mkdir ml repos databases thirdparty
