// Copyright 2017-2021 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const baseConfig = require('./webpack.base.cjs');

module.exports = merge(
  baseConfig(__dirname, 'development'),
  {
    devServer: {
      open: false,
      port: 3003,
      proxy: {
        '/Offers': {
          changeOrigin: true,
          target: 'https://dev-api.unique.network'
        },
        '/Trades': {
          changeOrigin: true,
          target: 'https://dev-api.unique.network'
        },
        '/auction': {
          changeOrigin: true,
          target: 'https://dev-api.unique.network'
        },
        '/api/settings': {
          changeOrigin: true,
          target: 'https://market-api-opal.unique.network'
        },
        [process.env.WHITE_LABEL_URL]: {
          changeOrigin: true,
          target: process.env.WHITE_LABEL_URL
        }
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
