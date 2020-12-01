// Copyright 2020 @po-polochkam authors & contributors

import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from 'containers/App';
import './i18n';
// import OnBoarding from 'containers/OnBoarding';
import reportWebVitals from './reportWebVitals';
// warning! Less-loader-7 not allows inline js in and design, wait for new version of ant design for less loader 7
import './index.less';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
