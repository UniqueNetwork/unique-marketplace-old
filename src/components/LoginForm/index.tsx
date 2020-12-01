// Copyright 2020 @po-polochkam authors & contributors

import React, { memo, ReactElement, useCallback } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 }
};

const LoginForm = (): ReactElement => {
  const { t } = useTranslation();
  const onFinish = useCallback((values) => {
    console.log('Success:', values);
  }, []);

  const onFinishFailed = useCallback((errorInfo) => {
    console.log('Failed:', errorInfo);
  }, []);

  return (
    <Form
      {...layout}
      initialValues={{ remember: true }}
      name='LoginForm'
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item
        label='Username'
        name='username'
        rules={
          [
            {
              message: t('enter login'),
              required: true
            }
          ]
        }
      >
        <Input />
      </Form.Item>

      <Form.Item
        label='Password'
        name='password'
        rules={
          [
            {
              message: t('enter password'),
              required: true
            }
          ]
        }
      >
        <Input.Password />
      </Form.Item>

      <Form.Item {...tailLayout}
        name='remember'
        valuePropName='checked'>
        <Checkbox>{t('remember me')}</Checkbox>
      </Form.Item>

      <Form.Item {...tailLayout}>
        <Button htmlType='submit'
          type='primary'>
          {t('enter')}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default memo(LoginForm);
