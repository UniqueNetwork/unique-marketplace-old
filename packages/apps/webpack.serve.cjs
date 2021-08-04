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
      port: 3000,
      proxy: {
        '/health': {
          changeOrigin: true,
          target: process.env.UNIQUE_API
        },
        '/mint': {
          changeOrigin: true,
          target: process.env.UNIQUE_API
        },
        '/offers': {
          changeOrigin: true,
          target: process.env.UNIQUE_API
        },
        '/trades': {
          changeOrigin: true,
          target: process.env.UNIQUE_API
        },
        [process.env.UNIQUE_API]: {
          changeOrigin: true,
          target: process.env.UNIQUE_API
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
