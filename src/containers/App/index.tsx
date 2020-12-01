// Copyright 2020 @po-polochkam authors & contributors

import React, { memo, ReactElement, useCallback, useState } from 'react';
import { Layout, Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, VideoCameraOutlined, UploadOutlined } from '@ant-design/icons';

import './styles.scss';

const { Content, Header, Sider } = Layout;

function App (): ReactElement {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { t } = useTranslation();

  const toggle = useCallback(() => {
    setCollapsed((prevCollapsed) => !prevCollapsed);
  }, []);

  return (
    <div className='App'>
      <Layout>
        <Sider collapsed={collapsed}
          collapsible
          trigger={null}>
          <div className='logo' />
          <Menu defaultSelectedKeys={['1']}
            mode='inline'
            theme='dark'>
            <Menu.Item icon={<UserOutlined />}
              key='1'>
              {t('nav1')}
            </Menu.Item>
            <Menu.Item icon={<VideoCameraOutlined />}
              key='2'>
              {t('nav2')}
            </Menu.Item>
            <Menu.Item icon={<UploadOutlined />}
              key='3'>
              {t('nav3')}
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout className='site-layout'>
          <Header className='site-layout-background'
            style={{ padding: 0 }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: toggle
            })}
          </Header>
          <Content
            className='site-layout-background'
            style={{
              margin: '24px 16px',
              minHeight: 280,
              padding: 24
            }}
          >
            {t('content')}
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default memo(App);
