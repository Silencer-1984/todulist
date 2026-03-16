import { TodoModel, CreateTodoInput, UpdateTodoInput, TodoFilters } from '../models/todo.model'
import { Todo } from '@prisma/client'

export interface TodoListResult {
  todos: Todo[]
}

export interface TodoResult {
  todo: Todo
}

export class TodoService {
  /**
   * 获取用户的 Todo 列表
   */
  static async getUserTodos(filters: TodoFilters): Promise<TodoListResult> {
    const todos = await TodoModel.findMany(filters)
    return { todos }
  }

  /**
   * 获取单个 Todo（带权限检查）
   */
  static async getTodoById(id: number, userId: string): Promise<Todo | null> {
    const todo = await TodoModel.findById(id)
    
    if (!todo) {
      return null
    }

    // 权限检查
    if (todo.userId !== userId) {
      throw new Error('FORBIDDEN')
    }

    return todo
  }

  /**
   * 创建 Todo
   */
  static async createTodo(data: CreateTodoInput): Promise<TodoResult> {
    // 如果没有设置截止日期，默认为今天
    if (!data.dueDate) {
      data.dueDate = new Date()
    }

    const todo = await TodoModel.create(data)
    return { todo }
  }

  /**
   * 更新 Todo（带权限检查）
   */
  static async updateTodo(
    id: number,
    userId: string,
    data: UpdateTodoInput
  ): Promise<TodoResult> {
    // 先检查是否存在且有权限
    const existingTodo = await this.getTodoById(id, userId)
    
    if (!existingTodo) {
      throw new Error('NOT_FOUND')
    }

    const todo = await TodoModel.update(id, data)
    return { todo }
  }

  /**
   * 删除 Todo（带权限检查）
   */
  static async deleteTodo(id: number, userId: string): Promise<void> {
    // 先检查是否存在且有权限
    const existingTodo = await this.getTodoById(id, userId)
    
    if (!existingTodo) {
      throw new Error('NOT_FOUND')
    }

    await TodoModel.delete(id)
  }

  /**
   * 切换 Todo 完成状态
   */
  static async toggleTodoStatus(id: number, userId: string): Promise<TodoResult> {
    const todo = await this.getTodoById(id, userId)
    
    if (!todo) {
      throw new Error('NOT_FOUND')
    }

    const updatedTodo = await TodoModel.update(id, {
      completed: !todo.completed,
    })

    return { todo: updatedTodo }
  }

  /**
   * 获取用户统计信息
   */
  static async getUserStats(userId: string): Promise<{
    total: number
    today: number
  }> {
    const [total, today] = await Promise.all([
      TodoModel.countByUser(userId),
      TodoModel.countToday(userId, new Date()),
    ])

    return { total, today }
  }
}
