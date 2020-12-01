// Copyright 2020 @po-polochkam authors & contributors

import React, { memo, ReactElement } from 'react';
import { Layout } from 'antd';

import LoginForm from 'components/LoginForm';
import './styles.scss';

const { Content, Footer, Header } = Layout;

function OnBoarding (): ReactElement {
  return (
    <div className='OnBoarding'>
      <Layout>
        <Content>
          <LoginForm />
        </Content>
      </Layout>
    </div>
  );
}

export default memo(OnBoarding);
