'use client';

import { useState, useMemo } from 'react';
import { Todo } from '@prisma/client';
import {
  Layout,
  Button,
  Avatar,
  Badge,
  Calendar,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Upload,
  message,
  Dropdown,
  Radio,
} from 'antd';
import {
  CheckCircleOutlined,
  InboxOutlined,
  CalendarOutlined,
  PlusOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  BellOutlined,
  FlagFilled,
  PictureOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { signOut } from 'next-auth/react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import api from '@/lib/axios';
import type { UploadFile } from 'antd/es/upload';

const { Sider, Content, Header } = Layout;
const { TextArea } = Input;

interface TodoAppProps {
  initialTodos: Todo[];
  user: { id: string; username: string };
}

type ViewType = 'inbox' | 'today' | 'calendar';

const priorityColors: Record<number, string> = {
  1: '#FF4D4D',
  2: '#FF9F1A',
  3: '#4D96FF',
};

const priorityLabels: Record<number, string> = {
  1: '高',
  2: '中',
  3: '低',
};

export default function TodoApp({ initialTodos, user }: TodoAppProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [currentView, setCurrentView] = useState<ViewType>('inbox');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // 统计数据
  const stats = useMemo(() => {
    const today = dayjs().startOf('day');
    return {
      inbox: todos.filter((t) => !t.completed).length,
      today: todos.filter(
        (t) =>
          !t.completed &&
          t.dueDate &&
          dayjs(t.dueDate).isSame(today, 'day')
      ).length,
    };
  }, [todos]);

  // 过滤任务
  const filteredTodos = useMemo(() => {
    const today = dayjs().startOf('day');
    switch (currentView) {
      case 'today':
        return todos.filter((t) =>
          t.dueDate ? dayjs(t.dueDate).isSame(today, 'day') : false
        );
      case 'calendar':
        return todos;
      default:
        return todos;
    }
  }, [todos, currentView]);

  // 添加任务
  async function handleAddTodo(values: any) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      if (values.description)
        formData.append('description', values.description);
      formData.append('priority', values.priority || '2');

      // 如果没有设置截止日期，使用今天
      const dueDate = values.dueDate || dayjs();
      formData.append('dueDate', dueDate.format('YYYY-MM-DD'));

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      const { data } = await api.post('/todos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.todo) {
        setTodos([data.todo, ...todos]);
        form.resetFields();
        setFileList([]);
        setIsAddModalOpen(false);
        message.success('任务添加成功');
      }
    } catch (error: any) {
      message.error(error.message || '添加失败');
    } finally {
      setLoading(false);
    }
  }

  // 切换完成状态
  async function toggleTodo(id: number, completed: boolean) {
    try {
      const { data } = await api.patch(`/todos/${id}`, {
        completed: !completed,
      });
      if (data.todo) {
        setTodos(todos.map((t) => (t.id === id ? data.todo : t)));
      }
    } catch (error: any) {
      message.error('更新失败');
    }
  }

  // 删除任务
  async function deleteTodo(id: number) {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter((t) => t.id !== id));
      message.success('删除成功');
    } catch (error: any) {
      message.error('删除失败');
    }
  }

  // 查看图片
  function viewImage(url: string) {
    setPreviewImage(url);
    setIsImageModalOpen(true);
  }

  // 侧边栏菜单项
  const menuItems = [
    {
      key: 'inbox',
      icon: <InboxOutlined />,
      label: '收件箱',
      count: stats.inbox,
    },
    {
      key: 'today',
      icon: <CheckCircleOutlined />,
      label: '今天',
      count: stats.today,
    },
    {
      key: 'calendar',
      icon: <CalendarOutlined />,
      label: '日历',
      count: 0,
    },
  ];

  // 日期单元格渲染（日历视图）
  function dateCellRender(date: dayjs.Dayjs) {
    const dateTodos = todos.filter(
      (t) =>
        t.dueDate &&
        dayjs(t.dueDate).isSame(date, 'day') &&
        !t.completed
    );

    if (dateTodos.length === 0) return null;

    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {dateTodos.slice(0, 3).map((todo) => (
          <li
            key={todo.id}
            style={{
              fontSize: 12,
              color: priorityColors[todo.priority] || '#666',
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <FlagFilled style={{ fontSize: 10, marginRight: 4 }} />
            {todo.title}
          </li>
        ))}
        {dateTodos.length > 3 && (
          <li style={{ fontSize: 11, color: '#999' }}>
            +{dateTodos.length - 3} 更多
          </li>
        )}
      </ul>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Sidebar */}
      <Sider
        width={260}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{
          background: '#F7F7F7',
          borderRight: '1px solid #E0E0E0',
        }}
        breakpoint="lg"
        collapsedWidth={60}
      >
        {/* Logo */}
        <div
          style={{
            padding: '20px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1px solid #E0E0E0',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: '#DC4C3E',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircleOutlined style={{ color: 'white', fontSize: 18 }} />
          </div>
          {!collapsed && (
            <span style={{ fontSize: 20, fontWeight: 700, color: '#202020' }}>
              TodoList
            </span>
          )}
        </div>

        {/* Navigation */}
        <div style={{ padding: '12px 8px' }}>
          {menuItems.map((item) => (
            <div
              key={item.key}
              onClick={() => setCurrentView(item.key as ViewType)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                marginBottom: 4,
                background:
                  currentView === item.key ? '#FFFFFF' : 'transparent',
                boxShadow:
                  currentView === item.key
                    ? '0 1px 3px rgba(0,0,0,0.1)'
                    : 'none',
                borderLeft:
                  currentView === item.key ? '3px solid #DC4C3E' : '3px solid transparent',
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  color: currentView === item.key ? '#DC4C3E' : '#666666',
                  marginRight: 12,
                }}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: currentView === item.key ? 600 : 500,
                      color: currentView === item.key ? '#202020' : '#444444',
                    }}
                  >
                    {item.label}
                  </span>
                  {item.count > 0 && (
                    <Badge
                      count={item.count}
                      style={{
                        backgroundColor:
                          item.key === 'today' ? '#DC4C3E' : '#999999',
                      }}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            background: '#FFFFFF',
            borderBottom: '1px solid #E0E0E0',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: '#666666' }}
            />
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#202020' }}>
              {currentView === 'inbox' && '收件箱'}
              {currentView === 'today' && '今天'}
              {currentView === 'calendar' && '日历视图'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalOpen(true)}
              style={{
                background: '#DC4C3E',
                borderColor: '#DC4C3E',
                borderRadius: 6,
              }}
            >
              添加任务
            </Button>

            <Button type="text" icon={<SearchOutlined />} />
            <Button type="text" icon={<BellOutlined />} />

            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                    onClick: () => signOut({ callbackUrl: '/login' }),
                  },
                ],
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} size={36} />
                <span style={{ color: '#202020', fontWeight: 500 }}>{user.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{ padding: 24, background: '#FFFFFF', overflow: 'auto' }}>
          {currentView === 'calendar' ? (
            // 日历视图
            <Calendar
              cellRender={dateCellRender}
              style={{ background: '#FFFFFF' }}
            />
          ) : (
            // 列表视图
            <div style={{ maxWidth: 800 }}>
              {filteredTodos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <CheckCircleOutlined
                    style={{ fontSize: 64, color: '#E0E0E0', marginBottom: 16 }}
                  />
                  <p style={{ color: '#999999', fontSize: 16 }}>
                    {currentView === 'today'
                      ? '今天没有任务，享受生活吧！'
                      : '暂无任务，点击右上角添加'}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredTodos.map((todo) => (
                    <div
                      key={todo.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: '16px 20px',
                        borderBottom: '1px solid #F0F0F0',
                        transition: 'all 0.2s',
                        background: todo.completed ? '#FAFAFA' : '#FFFFFF',
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        onClick={() => toggleTodo(todo.id, todo.completed)}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: `2px solid ${
                            todo.completed
                              ? '#4CAF50'
                              : priorityColors[todo.priority] || '#E0E0E0'
                          }`,
                          background: todo.completed ? '#4CAF50' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 16,
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      >
                        {todo.completed && (
                          <CheckOutlined style={{ fontSize: 12, color: 'white' }} />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                            color: todo.completed ? '#999999' : '#202020',
                            textDecoration: todo.completed ? 'line-through' : 'none',
                            marginBottom: 4,
                          }}
                        >
                          {todo.title}
                        </div>

                        {todo.description && (
                          <div
                            style={{
                              fontSize: 13,
                              color: '#666666',
                              marginBottom: 6,
                            }}
                          >
                            {todo.description}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span
                            style={{
                              fontSize: 12,
                              color: priorityColors[todo.priority],
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <FlagFilled />
                            {priorityLabels[todo.priority]}优先级
                          </span>

                          {todo.dueDate && (
                            <span style={{ fontSize: 12, color: '#666666' }}>
                              {dayjs(todo.dueDate).format('MM月DD日')}
                            </span>
                          )}

                          {todo.imageUrl && (
                            <Button
                              type="link"
                              size="small"
                              icon={<EyeOutlined />}
                              onClick={() => viewImage(todo.imageUrl!)}
                              style={{ padding: 0, fontSize: 12 }}
                            >
                              查看图片
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteTodo(todo.id)}
                        style={{ opacity: 0.6 }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Content>
      </Layout>

      {/* Add Task Modal */}
      <Modal
        title="添加新任务"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
          setFileList([]);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddTodo}
          initialValues={{ priority: 2, dueDate: dayjs() }}
        >
          <Form.Item
            label="任务标题"
            name="title"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="准备做什么？" />
          </Form.Item>

          <Form.Item label="任务描述" name="description">
            <TextArea rows={2} placeholder="添加详细描述（可选）" />
          </Form.Item>

          <Form.Item label="优先级" name="priority">
            <Select>
              <Select.Option value={1}>
                <FlagFilled style={{ color: '#FF4D4D' }} /> 高优先级
              </Select.Option>
              <Select.Option value={2}>
                <FlagFilled style={{ color: '#FF9F1A' }} /> 中优先级
              </Select.Option>
              <Select.Option value={3}>
                <FlagFilled style={{ color: '#4D96FF' }} /> 低优先级
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="截止日期"
            name="dueDate"
            rules={[{ required: true, message: '请选择截止日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="附件图片">
            <Upload
              listType="picture-card"
              maxCount={1}
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: fl }) => setFileList(fl)}
            >
              {fileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button
              onClick={() => setIsAddModalOpen(false)}
              style={{ marginRight: 8 }}
            >
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{ background: '#DC4C3E', borderColor: '#DC4C3E' }}>
              添加任务
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        open={isImageModalOpen}
        title="图片预览"
        footer={null}
        onCancel={() => setIsImageModalOpen(false)}
        centered
      >
        <img
          src={previewImage}
          alt="Preview"
          style={{ maxWidth: '100%', borderRadius: 8 }}
        />
      </Modal>
    </Layout>
  );
}
