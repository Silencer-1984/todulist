import { prisma } from '@/lib/prisma'
import { Todo, Prisma } from '@prisma/client'

export interface CreateTodoInput {
  userId: string
  title: string
  description?: string | null
  priority?: number
  dueDate?: Date | null
  imageUrl?: string | null
}

export interface UpdateTodoInput {
  title?: string
  description?: string | null
  completed?: boolean
  priority?: number
  dueDate?: Date | null
  imageUrl?: string | null
}

export interface TodoFilters {
  userId: string
  completed?: boolean
  priority?: number
}

export class TodoModel {
  /**
   * 获取所有 Todo（带过滤）
   */
  static async findMany(filters: TodoFilters): Promise<Todo[]> {
    const where: Prisma.TodoWhereInput = {
      userId: filters.userId,
    }

    if (filters.completed !== undefined) {
      where.completed = filters.completed
    }
    if (filters.priority !== undefined) {
      where.priority = filters.priority
    }

    return prisma.todo.findMany({
      where,
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    })
  }

  /**
   * 根据 ID 查找 Todo
   */
  static async findById(id: number): Promise<Todo | null> {
    return prisma.todo.findUnique({
      where: { id },
    })
  }

  /**
   * 创建 Todo
   */
  static async create(data: CreateTodoInput): Promise<Todo> {
    return prisma.todo.create({
      data: {
        userId: data.userId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        priority: data.priority || 2,
        dueDate: data.dueDate || null,
        imageUrl: data.imageUrl || null,
      },
    })
  }

  /**
   * 更新 Todo
   */
  static async update(id: number, data: UpdateTodoInput): Promise<Todo> {
    const updateData: Prisma.TodoUpdateInput = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.completed !== undefined) updateData.completed = data.completed
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl

    return prisma.todo.update({
      where: { id },
      data: updateData,
    })
  }

  /**
   * 删除 Todo
   */
  static async delete(id: number): Promise<void> {
    await prisma.todo.delete({
      where: { id },
    })
  }

  /**
   * 统计用户 Todo 数量
   */
  static async countByUser(userId: string): Promise<number> {
    return prisma.todo.count({
      where: { userId },
    })
  }

  /**
   * 统计今日 Todo 数量
   */
  static async countToday(userId: string, today: Date): Promise<number> {
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    return prisma.todo.count({
      where: {
        userId,
        completed: false,
        dueDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })
  }
}
