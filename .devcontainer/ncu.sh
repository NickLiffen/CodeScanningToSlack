#!/usr/bin/env bash

function setup {
    for d in */ ; do
        [ -L "${d%/}" ] && continue
        echo "Upgrading Dependencies in: $d"
        cd "$d"
        ncu -u
        npm install
        cd ..
    done
}

cd /workspaces/CodeScanningToSlack/functions

setup
