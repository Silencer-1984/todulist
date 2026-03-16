import { NextRequest, NextResponse } from 'next/server'
import { TodoService } from '../services/todo.service'
import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const uploadDir = join(process.cwd(), 'public', 'uploads')

async function ensureUploadDir() {
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
}

export class TodoController {
  /**
   * GET /api/todos - 获取 Todo 列表
   */
  static async getTodos(request: NextRequest, userId: string) {
    try {
      const { searchParams } = new URL(request.url)
      const completed = searchParams.get('completed')
      const priority = searchParams.get('priority')

      const filters: any = { userId }
      if (completed !== null) filters.completed = completed === 'true'
      if (priority !== null) filters.priority = parseInt(priority)

      const result = await TodoService.getUserTodos(filters)
      return NextResponse.json(result)
    } catch (error) {
      console.error('获取 Todo 列表失败:', error)
      return NextResponse.json(
        { error: '获取 Todo 列表失败' },
        { status: 500 }
      )
    }
  }

  /**
   * POST /api/todos - 创建 Todo
   */
  static async createTodo(request: NextRequest, userId: string) {
    try {
      await ensureUploadDir()

      const contentType = request.headers.get('content-type') || ''
      let title: string = ''
      let description: string | null = null
      let priority: number = 2
      let dueDate: Date | null = null
      let imageUrl: string | null = null

      // 解析请求体
      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData()
        
        title = (formData.get('title') as string) || ''
        description = (formData.get('description') as string) || null
        priority = parseInt((formData.get('priority') as string) || '2')
        const dueDateStr = formData.get('dueDate') as string
        dueDate = dueDateStr ? new Date(dueDateStr) : null
        
        const image = formData.get('image') as File

        // 处理图片上传
        if (image && image.size > 0) {
          if (!image.type.startsWith('image/')) {
            return NextResponse.json(
              { error: '只允许上传图片文件' },
              { status: 400 }
            )
          }

          if (image.size > 5 * 1024 * 1024) {
            return NextResponse.json(
              { error: '图片大小不能超过 5MB' },
              { status: 400 }
            )
          }

          const ext = image.name.split('.').pop() || 'jpg'
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          const filename = `todo-${uniqueSuffix}.${ext}`
          const filepath = join(uploadDir, filename)

          const bytes = await image.arrayBuffer()
          const buffer = Buffer.from(bytes)
          await writeFile(filepath, buffer)

          imageUrl = `/uploads/${filename}`
        }
      } else {
        const body = await request.json()
        title = body.title || ''
        description = body.description || null
        priority = body.priority || 2
        dueDate = body.dueDate ? new Date(body.dueDate) : null
      }

      // 验证标题
      if (!title.trim()) {
        return NextResponse.json(
          { error: '标题不能为空' },
          { status: 400 }
        )
      }

      const result = await TodoService.createTodo({
        userId,
        title: title.trim(),
        description: description?.trim() || null,
        priority,
        dueDate,
        imageUrl,
      })

      return NextResponse.json(result, { status: 201 })
    } catch (error: any) {
      console.error('创建 Todo 失败:', error)
      return NextResponse.json(
        { error: '创建 Todo 失败: ' + (error.message || '未知错误') },
        { status: 500 }
      )
    }
  }

  /**
   * GET /api/todos/:id - 获取单个 Todo
   */
  static async getTodoById(id: number, userId: string) {
    try {
      const todo = await TodoService.getTodoById(id, userId)

      if (!todo) {
        return NextResponse.json(
          { error: 'Todo 不存在' },
          { status: 404 }
        )
      }

      return NextResponse.json({ todo })
    } catch (error: any) {
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: '无权访问' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: '获取 Todo 失败' },
        { status: 500 }
      )
    }
  }

  /**
   * PATCH /api/todos/:id - 更新 Todo
   */
  static async updateTodo(
    request: NextRequest,
    id: number,
    userId: string
  ) {
    try {
      const body = await request.json()
      const { title, description, completed, priority, dueDate } = body

      const updateData: any = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (completed !== undefined) updateData.completed = completed
      if (priority !== undefined) updateData.priority = priority
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null

      const result = await TodoService.updateTodo(id, userId, updateData)
      return NextResponse.json(result)
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        return NextResponse.json(
          { error: 'Todo 不存在' },
          { status: 404 }
        )
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: '无权修改' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: '更新 Todo 失败' },
        { status: 500 }
      )
    }
  }

  /**
   * DELETE /api/todos/:id - 删除 Todo
   */
  static async deleteTodo(id: number, userId: string) {
    try {
      await TodoService.deleteTodo(id, userId)
      return NextResponse.json({ success: true })
    } catch (error: any) {
      if (error.message === 'NOT_FOUND') {
        return NextResponse.json(
          { error: 'Todo 不存在' },
          { status: 404 }
        )
      }
      if (error.message === 'FORBIDDEN') {
        return NextResponse.json(
          { error: '无权删除' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: '删除 Todo 失败' },
        { status: 500 }
      )
    }
  }
}
