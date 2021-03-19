#!/bin/bash
# Copyright 2017-2021 usetech authors & contributors
# SPDX-License-Identifier: Apache-2.0

# This script is used when the docker container starts and does the magic to
# bring the ENV variables to the generated static UI.

TARGET=./env-config.js

# Recreate config file
rm -rf $TARGET
touch $TARGET

echo "window.process_env = {" >> $TARGET
echo "escrowAddress: '$escrowAddress'," >> $TARGET
echo "MatcherContractAddress: '$MatcherContractAddress'," >> $TARGET
echo "mintedCollection: '$mintedCollection'," >> $TARGET
echo "vaultAddress: '$vaultAddress'" >> $TARGET
echo "}" >> $TARGET
