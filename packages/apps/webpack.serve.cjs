// Copyright 2017-2021 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const baseConfig = require('./webpack.base.cjs');

require('dotenv-defaults').config();

module.exports = merge(
  baseConfig(__dirname, 'development'),
  {
    devServer: {
      open: false,
      port: 3003,
      proxy: {
        '/Offers': {
          changeOrigin: true,
          target: process.env.UNIQUE_API
        },
        '/Trades': {
          changeOrigin: true,
          target: process.env.UNIQUE_API
        },
        '/api/settings': {
          changeOrigin: true,
          target: process.env.UNIQUE_API
        },
      },
      static: path.resolve(__dirname, 'build')
    },
    plugins: [
      new HtmlWebpackPlugin({
        PAGE_TITLE: 'Unique Network NFT Marketplace',
        inject: true,
        template: path.join(__dirname, 'public/index.html')
      }),
      new webpack.HotModuleReplacementPlugin()
    ],
    watchOptions: {
      ignored: ['.yarn', 'build', 'node_modules']
    }
  }
);
