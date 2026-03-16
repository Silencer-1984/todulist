'use client';

import Link from 'next/link';
import { CheckCircleOutlined, CalendarOutlined, TeamOutlined, SafetyOutlined } from '@ant-design/icons';

export default function LandingPage() {
  const features = [
    {
      icon: <CheckCircleOutlined style={{ fontSize: 32, color: '#DC4C3E' }} />,
      title: '任务管理',
      desc: '轻松创建、组织和追踪您的任务',
    },
    {
      icon: <CalendarOutlined style={{ fontSize: 32, color: '#DC4C3E' }} />,
      title: '日历视图',
      desc: '按日期查看任务，合理规划时间',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 32, color: '#DC4C3E' }} />,
      title: '多用户支持',
      desc: '每个用户独立管理自己的任务',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 32, color: '#DC4C3E' }} />,
      title: '安全可靠',
      desc: '数据安全存储，隐私有保障',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
          borderBottom: '1px solid #E0E0E0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: '#DC4C3E',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircleOutlined style={{ color: 'white', fontSize: 20 }} />
          </div>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#202020' }}>
            TodoList
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link
            href="/login"
            style={{
              padding: '10px 24px',
              color: '#202020',
              textDecoration: 'none',
              fontWeight: 500,
              borderRadius: 8,
              transition: 'all 0.2s',
            }}
          >
            登录
          </Link>
          <Link
            href="/register"
            style={{
              padding: '10px 24px',
              background: '#DC4C3E',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 600,
              borderRadius: 8,
              transition: 'all 0.2s',
            }}
          >
            免费注册
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          background: 'linear-gradient(135deg, #FAFAFA 0%, #FDF8F3 100%)',
          minHeight: '60vh',
        }}
      >
        <div
          style={{
            maxWidth: 800,
            textAlign: 'center',
            animation: 'fadeIn 0.6s ease-out',
          }}
        >
          <h1
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: '#202020',
              marginBottom: 24,
              lineHeight: 1.2,
            }}
          >
            组织一切<br />
            <span style={{ color: '#DC4C3E' }}>成就更多</span>
          </h1>
          <p
            style={{
              fontSize: 20,
              color: '#666666',
              marginBottom: 40,
              lineHeight: 1.6,
            }}
          >
            一款简洁高效的任务管理工具，帮助您掌控生活和工作
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link
              href="/register"
              style={{
                padding: '16px 40px',
                background: '#DC4C3E',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 18,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(220, 76, 62, 0.3)',
                transition: 'all 0.2s',
              }}
            >
              开始使用
            </Link>
            <Link
              href="/login"
              style={{
                padding: '16px 40px',
                background: 'white',
                color: '#202020',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 18,
                borderRadius: 8,
                border: '2px solid #E0E0E0',
                transition: 'all 0.2s',
              }}
            >
              已有账号？登录
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 40px', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2
            style={{
              textAlign: 'center',
              fontSize: 36,
              fontWeight: 700,
              color: '#202020',
              marginBottom: 60,
            }}
          >
            功能特点
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 40,
            }}
          >
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  padding: 32,
                  background: '#FAFAFA',
                  borderRadius: 16,
                  textAlign: 'center',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ marginBottom: 20 }}>{feature.icon}</div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: '#202020',
                    marginBottom: 12,
                  }}
                >
                  {feature.title}
                </h3>
                <p style={{ fontSize: 16, color: '#666666', lineHeight: 1.5 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '40px',
          background: '#202020',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#999999', fontSize: 14 }}>
          © 2024 TodoList. 简单高效的任务管理工具。
        </p>
      </footer>
    </div>
  );
}
