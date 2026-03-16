'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Typography, message, Checkbox } from 'antd';
import {
  CheckCircleOutlined,
  UserOutlined,
  LockOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  async function onSubmit(values: {
    username: string;
    password: string;
    remember?: boolean;
  }) {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        username: values.username,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        message.error('用户名或密码错误');
      } else {
        message.success('登录成功');
        router.push('/todos');
        router.refresh();
      }
    } catch (error) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Side - Login Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          background: '#FFFFFF',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: '#DC4C3E',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircleOutlined style={{ color: 'white', fontSize: 22 }} />
            </div>
            <span
              style={{ fontSize: 26, fontWeight: 700, color: '#202020' }}
            >
              TodoList
            </span>
          </div>

          {/* Title */}
          <Title
            level={2}
            style={{
              marginBottom: 8,
              color: '#202020',
              fontWeight: 700,
            }}
          >
            欢迎回来！
          </Title>
          <Text
            style={{
              display: 'block',
              marginBottom: 32,
              color: '#666666',
              fontSize: 16,
            }}
          >
            登录您的账户以继续
          </Text>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999999' }} />}
                placeholder="请输入用户名"
                size="large"
                style={{
                  height: 48,
                  borderRadius: 8,
                  borderColor: '#E0E0E0',
                }}
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999999' }} />}
                placeholder="请输入密码"
                size="large"
                style={{
                  height: 48,
                  borderRadius: 8,
                  borderColor: '#E0E0E0',
                }}
              />
            </Form.Item>

            <Form.Item>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Checkbox style={{ color: '#666666' }}>记住我</Checkbox>
                <Link
                  href="#"
                  style={{ color: '#DC4C3E', fontWeight: 500 }}
                >
                  忘记密码？
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  height: 48,
                  borderRadius: 8,
                  background: '#DC4C3E',
                  borderColor: '#DC4C3E',
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text style={{ color: '#666666' }}>
              还没有账户？{' '}
              <Link
                href="/register"
                style={{ color: '#DC4C3E', fontWeight: 600 }}
              >
                立即注册
              </Link>
            </Text>
          </div>

          {/* Demo Account Hint */}
          <div
            style={{
              marginTop: 32,
              padding: 16,
              background: '#F7F7F7',
              borderRadius: 8,
              textAlign: 'center',
            }}
          >
            <Text style={{ color: '#999999', fontSize: 14 }}>
              测试账号：admin / 1234
            </Text>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div
        style={{
          flex: 1,
          display: { xs: 'none', md: 'flex' } as any,
          background: 'linear-gradient(135deg, #FDF8F3 0%, #F5E6D3 100%)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
          {/* Decorative Illustration */}
          <div
            style={{
              width: 300,
              height: 300,
              margin: '0 auto 40px',
              background: 'rgba(220, 76, 62, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircleOutlined
              style={{ fontSize: 120, color: '#DC4C3E' }}
            />
          </div>
          <Title level={3} style={{ color: '#202020', marginBottom: 16 }}>
            掌控每一天
          </Title>
          <Text
            style={{
              color: '#666666',
              fontSize: 18,
              lineHeight: 1.6,
              display: 'block',
            }}
          >
            使用 TodoList 管理您的任务，
            <br />
            让生活更有条理，工作更高效。
          </Text>
        </div>
      </div>
    </div>
  );
}
