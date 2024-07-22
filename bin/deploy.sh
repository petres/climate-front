#!/usr/bin/env bash

BASE_FOLDER=`dirname -- "$0"`/..;
cd $BASE_FOLDER

. bin/vars.sh

rm -rf dist
echo 'Building ...'
node_modules/.bin/webpack --config build/prod.js
echo 'Syncing ...'
rsync -arv dist/ ${SERVER}:${SERVER_PATH}