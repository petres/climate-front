SERVER=$(cat ../config.json | jq -r '.front.host')
SERVER_PATH=$(cat ../config.json | jq -r '.front.path')