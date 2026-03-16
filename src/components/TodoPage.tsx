'use client'

import { useState, useEffect } from 'react'
import { Todo } from '@prisma/client'
import { Typography, ConfigProvider, Switch, Space, theme } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import TodoList from './TodoList'
import zhCN from 'antd/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

const { Title } = Typography
const { defaultAlgorithm, darkAlgorithm } = theme

dayjs.locale('zh-cn')

interface TodoPageProps {
  initialTodos: Todo[]
}

export default function TodoPage({ initialTodos }: TodoPageProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  // 从 localStorage 读取主题设置
  useEffect(() => {
    const savedMode = localStorage.getItem('todo-theme-dark')
    if (savedMode) {
      setIsDarkMode(savedMode === 'true')
    }
  }, [])

  // 保存主题设置
  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked)
    localStorage.setItem('todo-theme-dark', String(checked))
  }

  const lightBackground = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  const darkBackground = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'

  return (
    <ConfigProvider 
      locale={zhCN}
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <div 
        style={{ 
          minHeight: '100vh',
          background: isDarkMode ? darkBackground : lightBackground,
          padding: '24px 16px',
          transition: 'background 0.3s ease'
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* 头部：标题 + 主题切换 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16
          }}>
            <Title 
              level={2} 
              style={{ 
                margin: 0,
                color: isDarkMode ? '#fff' : '#1a1a1a'
              }}
            >
              📝 Todo List
            </Title>
            
            <Space>
              <SunOutlined style={{ color: isDarkMode ? '#8c8c8c' : '#faad14' }} />
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
              />
              <MoonOutlined style={{ color: isDarkMode ? '#722ed1' : '#8c8c8c' }} />
            </Space>
          </div>

          <TodoList initialTodos={initialTodos} isDarkMode={isDarkMode} />
        </div>
      </div>
    </ConfigProvider>
  )
}
