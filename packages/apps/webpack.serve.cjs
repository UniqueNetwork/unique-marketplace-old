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
      port: 3000,
      proxy: {
        '/health': {
          changeOrigin: true,
          target: 'https://unqnft.io/'
        },
        '/mint': {
          changeOrigin: true,
          target: 'https://unqnft.io/'
        },
        '/offers': {
          changeOrigin: true,
          target: 'https://unqnft.io/'
        },
        '/trades': {
          changeOrigin: true,
          target: 'https://unqnft.io/'
        },
        'https://unqnft.io': {
          changeOrigin: true,
          target: 'https://unqnft.io/'
        },
        'https://whitelabel.market': {
          changeOrigin: true,
          target: 'https://whitelabel.market/'
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
