#!/bin/bash
MY_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
MY_DIR="$(dirname $MY_PATH)"
cd $MY_DIR

yarn upgrade --latest \
    the-lodash \
    the-promise \
    the-logger \
    @kubevious/http-client
