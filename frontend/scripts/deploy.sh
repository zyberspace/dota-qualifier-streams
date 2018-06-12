#!/bin/bash
echo "Making sure s3cmd is installed..."
pip install --user --quiet s3cmd

echo "Syncing build folder with s3 bucket..."

~/.local/bin/s3cmd sync --acl-public --delete-removed --no-preserve \
    --no-mime-magic --guess-mime-type --add-header="Cache-Control: public, max-age=31536000, no-cache" \
    build/ s3://dota-qualifier-streams/frontend/

echo "Done!"
