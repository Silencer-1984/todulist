'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Typography, message } from 'antd';
import { CheckCircleOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/axios';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  async function onSubmit(values: {
    username: string;
    password: string;
    confirmPassword: string;
  }) {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        username: values.username,
        password: values.password,
      });

      message.success('注册成功，请登录');
      router.push('/login');
    } catch (error: any) {
      message.error(error.response?.data?.error || '注册失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Side - Form */}
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
            <span style={{ fontSize: 26, fontWeight: 700, color: '#202020' }}>
              TodoList
            </span>
          </div>

          <Title level={2} style={{ marginBottom: 8, color: '#202020' }}>
            创建账户
          </Title>
          <Text style={{ display: 'block', marginBottom: 32, color: '#666666' }}>
            开始您的任务管理之旅
          </Text>

          <Form form={form} layout="vertical" onFinish={onSubmit}>
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#999999' }} />}
                placeholder="请输入用户名"
                size="large"
                style={{ height: 48, borderRadius: 8 }}
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
                style={{ height: 48, borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              label="确认密码"
              name="confirmPassword"
              rules={[{ required: true, message: '请再次输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#999999' }} />}
                placeholder="请再次输入密码"
                size="large"
                style={{ height: 48, borderRadius: 8 }}
              />
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
                }}
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Text style={{ color: '#666666' }}>
              已有账户？{' '}
              <Link href="/login" style={{ color: '#DC4C3E', fontWeight: 600 }}>
                立即登录
              </Link>
            </Text>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          background: 'linear-gradient(135deg, #FDF8F3 0%, #F5E6D3 100%)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="hidden md:flex"
      >
        <div style={{ textAlign: 'center', maxWidth: 500 }}>
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
            <CheckCircleOutlined style={{ fontSize: 120, color: '#DC4C3E' }} />
          </div>
          <Title level={3} style={{ color: '#202020' }}>
            开始高效工作
          </Title>
          <Text style={{ color: '#666666', fontSize: 18 }}>
            加入 TodoList，让每一天都井然有序
          </Text>
        </div>
      </div>
    </div>
  );
}
