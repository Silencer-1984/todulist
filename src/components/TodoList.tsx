"use client";

import { useState } from "react";
import { Todo } from "@prisma/client";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  List,
  Tag,
  Space,
  Checkbox,
  Radio,
  Typography,
  Empty,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  theme,
  Upload,
  Modal,
  Image,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  FlagOutlined,
  PictureOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "@/lib/axios";
import type { UploadFile, UploadProps } from "antd/es/upload";

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;
const { useToken } = theme;

interface TodoListProps {
  initialTodos: Todo[];
  isDarkMode?: boolean;
}

type Priority = 1 | 2 | 3;

const priorityOptions = [
  { value: 1, label: "高优先级", color: "red" },
  { value: 2, label: "中优先级", color: "orange" },
  { value: 3, label: "低优先级", color: "green" },
];

const priorityMap: Record<number, { label: string; color: string }> = {
  1: { label: "高", color: "red" },
  2: { label: "中", color: "orange" },
  3: { label: "低", color: "green" },
};

export default function TodoList({
  initialTodos,
  isDarkMode = false,
}: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filterCompleted, setFilterCompleted] = useState<boolean | "all">(
    "all"
  );
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const { token } = useToken();

  const filteredTodos = todos.filter((todo) => {
    if (filterCompleted === "all") return true;
    return todo.completed === filterCompleted;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.filter((t) => !t.completed).length;

  // 图片上传配置
  const uploadProps: UploadProps = {
    listType: "picture-card",
    maxCount: 1,
    fileList,
    beforeUpload: () => {
      // 阻止自动上传，改为手动提交表单时一起上传
      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    onPreview: (file) => {
      const url =
        file.thumbUrl ||
        file.url ||
        (file.originFileObj ? URL.createObjectURL(file.originFileObj) : "");
      setPreviewImage(url);
      setPreviewOpen(true);
    },
  };

  async function addTodo(values: any) {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      if (values.description)
        formData.append("description", values.description);
      if (values.priority) formData.append("priority", values.priority);
      if (values.dueDate)
        formData.append("dueDate", values.dueDate.format("YYYY-MM-DD"));

      // 添加图片
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      const { data } = await api.post("/todos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.todo) {
        setTodos([data.todo, ...todos]);
        form.resetFields();
        setFileList([]);
        message.success("任务添加成功");
      }
    } catch (error: any) {
      message.error(error.message || "添加失败");
    } finally {
      setLoading(false);
    }
  }

  async function toggleTodo(id: number, completed: boolean) {
    try {
      const { data } = await api.patch(`/todos/${id}`, {
        completed: !completed,
      });

      if (data.todo) {
        setTodos(todos.map((t) => (t.id === id ? data.todo : t)));
        message.success(completed ? "已标记为未完成" : "已完成");
      }
    } catch (error: any) {
      message.error(error.message || "更新失败");
    }
  }

  async function deleteTodo(id: number) {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter((t) => t.id !== id));
      message.success("删除成功");
    } catch (error: any) {
      message.error(error.message || "删除失败");
    }
  }

  // 查看图片
  function viewImage(imageUrl: string) {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* 添加表单 */}
      <Card>
        <Title level={5} style={{ marginBottom: 16, marginTop: 0 }}>
          <PlusOutlined /> 添加新任务
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={addTodo}
          autoComplete="off"
        >
          <Form.Item
            label="任务标题"
            name="title"
            rules={[{ required: true, message: "请输入任务标题" }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>

          <Form.Item label="任务描述" name="description">
            <TextArea rows={2} placeholder="请输入任务描述（可选）" />
          </Form.Item>
          {/* 图片上传 */}
          <Form.Item label="附件图片" style={{ marginBottom: 8 }}>
            <Upload {...uploadProps}>
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="优先级" name="priority" initialValue={2}>
                <Select>
                  {priorityOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      <Tag color={opt.color}>{opt.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="截止日期" name="dueDate">
                <DatePicker style={{ width: "100%" }} placeholder="选择日期" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<PlusOutlined />}
            >
              添加任务
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 筛选器和统计 */}
      <Card size="small">
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Space>
              <Text strong>筛选：</Text>
              <Radio.Group
                value={filterCompleted}
                onChange={(e) => setFilterCompleted(e.target.value)}
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value={false}>待办</Radio.Button>
                <Radio.Button value={true}>已完成</Radio.Button>
              </Radio.Group>
            </Space>
          </Col>
          <Col xs={24} sm={12}>
            <Row justify="end" gutter={16}>
              <Col>
                <Statistic
                  title="总计"
                  value={todos.length}
                  valueStyle={{ fontSize: 16, color: token.colorText }}
                />
              </Col>
              <Col>
                <Statistic
                  title="待办"
                  value={pendingCount}
                  valueStyle={{ fontSize: 16, color: token.colorPrimary }}
                />
              </Col>
              <Col>
                <Statistic
                  title="已完成"
                  value={completedCount}
                  valueStyle={{ fontSize: 16, color: token.colorSuccess }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Todo 列表 */}
      <Card>
        {filteredTodos.length === 0 ? (
          <Empty
            description={
              filterCompleted === "all"
                ? "暂无任务，添加一个吧！"
                : filterCompleted === false
                ? "没有待办任务"
                : "没有已完成任务"
            }
          />
        ) : (
          <List
            dataSource={filteredTodos}
            renderItem={(todo) => (
              <List.Item
                actions={[
                  <Popconfirm
                    key="delete"
                    title="确定删除这个任务？"
                    onConfirm={() => deleteTodo(todo.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Checkbox
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id, todo.completed)}
                    />
                  }
                  title={
                    <Space>
                      <Text
                        delete={todo.completed}
                        strong={!todo.completed}
                        style={{ fontSize: 16 }}
                      >
                        {todo.title}
                      </Text>
                      {todo.imageUrl && (
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => viewImage(todo.imageUrl!)}
                        >
                          查看图片
                        </Button>
                      )}
                    </Space>
                  }
                  description={
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: "100%" }}
                    >
                      {todo.description && (
                        <Text
                          type="secondary"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {todo.description}
                        </Text>
                      )}
                      <Space size={8} wrap>
                        <Tag
                          color={priorityMap[todo.priority].color}
                          icon={<FlagOutlined />}
                        >
                          {priorityMap[todo.priority].label}优先级
                        </Tag>
                        {todo.dueDate && (
                          <Tag icon={<CalendarOutlined />}>
                            {dayjs(todo.dueDate).format("YYYY-MM-DD")}
                          </Tag>
                        )}
                        {todo.imageUrl && (
                          <Tag icon={<PictureOutlined />} color="blue">
                            有图片
                          </Tag>
                        )}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          创建于{" "}
                          {dayjs(todo.createdAt).format("YYYY-MM-DD HH:mm")}
                        </Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 图片预览弹窗 */}
      <Modal
        open={previewOpen}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
        width="auto"
        style={{ maxWidth: "90vw" }}
      >
        <Image
          alt="预览"
          style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
          src={previewImage}
          preview={false}
        />
      </Modal>
    </Space>
  );
}
