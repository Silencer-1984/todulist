'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  Result,
  Spin,
} from 'antd';
import {
  CheckCircleOutlined,
  LockOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/axios';

const { Title, Text } = Typography;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [form] = Form.useForm();

  // 验证令牌
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setValidating(false);
        return;
      }

      try {
        const { data } = await api.get(`/auth/reset-password?token=${token}`);
        setIsValid(data.valid);
      } catch (error) {
        setIsValid(false);
      } finally {
        setValidating(false);
      }
    }

    validateToken();
  }, [token]);

  async function onSubmit(values: {
    password: string;
    confirmPassword: string;
  }) {
    if (!token) return;

    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        password: values.password,
      });

      setResetSuccess(true);
      message.success('密码重置成功');
    } catch (error: any) {
      message.error(error.response?.data?.error || '重置失败');
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16, color: '#666666' }}>验证中...</p>
      </div>
    );
  }

  if (!token || !isValid) {
    return (
      <Result
        status="error"
        title="链接无效或已过期"
        subTitle="该密码重置链接已过期或不存在，请重新申请"
        extra={[
          <Link key="forgot" href="/forgot-password">
            <Button type="primary" style={{ background: '#DC4C3E', borderColor: '#DC4C3E' }}>
              重新申请
            </Button>
          </Link>,
          <Link key="login" href="/login">
            <Button>返回登录</Button>
          </Link>,
        ]}
      />
    );
  }

  if (resetSuccess) {
    return (
      <Result
        status="success"
        title="密码重置成功"
        subTitle="您的密码已更新，请使用新密码登录"
        extra={[
          <Link key="login" href="/login">
            <Button type="primary" style={{ background: '#DC4C3E', borderColor: '#DC4C3E' }}>
              前往登录
            </Button>
          </Link>,
        ]}
      />
    );
  }

  return (
    <>
      <Title level={2} style={{ marginBottom: 8, color: '#202020' }}>
        重置密码
      </Title>
      <Text
        style={{
          display: 'block',
          marginBottom: 32,
          color: '#666666',
          fontSize: 16,
        }}
      >
        请输入您的新密码
      </Text>

      <Form form={form} layout="vertical" onFinish={onSubmit} autoComplete="off">
        <Form.Item
          label="新密码"
          name="password"
          rules={[{ required: true, message: '请输入新密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#999999' }} />}
            placeholder="请输入新密码"
            size="large"
            style={{ height: 48, borderRadius: 8 }}
          />
        </Form.Item>

        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          rules={[{ required: true, message: '请再次输入新密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#999999' }} />}
            placeholder="请再次输入新密码"
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
            icon={<CheckOutlined />}
            style={{
              height: 48,
              borderRadius: 8,
              background: '#DC4C3E',
              borderColor: '#DC4C3E',
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            确认重置
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Side */}
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
            <span style={{ fontSize: 26, fontWeight: 700, color: '#202020' }}>
              TodoList
            </span>
          </div>

          <Suspense
            fallback={
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Spin size="large" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
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
            设置新密码
          </Title>
          <Text style={{ color: '#666666', fontSize: 18 }}>
            请设置一个安全的密码，包含字母和数字
          </Text>
        </div>
      </div>
    </div>
  );
}
