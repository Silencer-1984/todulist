'use client';

import { useState } from 'react';
import { Form, Input, Button, Typography, message, Card, Alert } from 'antd';
import { CheckCircleOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import api from '@/lib/axios';

const { Title, Text, Paragraph } = Typography;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [form] = Form.useForm();

  async function onSubmit(values: { username: string }) {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', {
        username: values.username,
      });

      setSubmitted(true);
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
      message.success('重置链接已生成');
    } catch (error: any) {
      message.error(error.response?.data?.error || '请求失败');
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
          {/* Back Link */}
          <Link
            href="/login"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#666666',
              marginBottom: 32,
              textDecoration: 'none',
            }}
          >
            <ArrowLeftOutlined /> 返回登录
          </Link>

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

          {!submitted ? (
            <>
              <Title level={2} style={{ marginBottom: 8, color: '#202020' }}>
                忘记密码？
              </Title>
              <Text
                style={{
                  display: 'block',
                  marginBottom: 32,
                  color: '#666666',
                  fontSize: 16,
                }}
              >
                输入您的用户名，我们将为您生成密码重置链接
              </Text>

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
                    placeholder="请输入您的用户名"
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
                      fontSize: 16,
                    }}
                  >
                    发送重置链接
                  </Button>
                </Form.Item>
              </Form>
            </>
          ) : (
            <>
              <Title level={2} style={{ marginBottom: 16, color: '#202020' }}>
                重置链接已生成
              </Title>
              <Alert
                message="演示模式提示"
                description="由于这是一个演示项目，我们没有配置邮件服务。请使用下方链接重置密码。"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
              {resetUrl && (
                <Card style={{ background: '#F7F7F7', marginBottom: 24 }}>
                  <Paragraph style={{ marginBottom: 8 }}>
                    <strong>您的重置链接：</strong>
                  </Paragraph>
                  <Paragraph
                    copyable
                    style={{
                      wordBreak: 'break-all',
                      color: '#DC4C3E',
                      marginBottom: 0,
                    }}
                  >
                    {resetUrl}
                  </Paragraph>
                </Card>
              )}
              <Button
                type="primary"
                block
                size="large"
                style={{
                  height: 48,
                  borderRadius: 8,
                  background: '#DC4C3E',
                  borderColor: '#DC4C3E',
                }}
                onClick={() => window.open(resetUrl, '_blank')}
              >
                点击重置密码
              </Button>
            </>
          )}
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
            安全重置密码
          </Title>
          <Text style={{ color: '#666666', fontSize: 18 }}>
            链接有效期为1小时，请尽快操作
          </Text>
        </div>
      </div>
    </div>
  );
}
