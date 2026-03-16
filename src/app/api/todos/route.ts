import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

// 确保上传目录存在
const uploadDir = join(process.cwd(), 'public', 'uploads')

async function ensureUploadDir() {
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
}

// GET /api/todos - 获取所有 Todo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const completed = searchParams.get('completed')
    const priority = searchParams.get('priority')

    const where: any = {}
    if (completed !== null) where.completed = completed === 'true'
    if (priority !== null) where.priority = parseInt(priority)

    const todos = await prisma.todo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ todos })
  } catch (error) {
    console.error('GET /api/todos error:', error)
    return NextResponse.json(
      { error: '获取 Todo 列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/todos - 创建新 Todo（支持图片上传）
export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir()
    
    const contentType = request.headers.get('content-type') || ''
    
    let title: string = ''
    let description: string | null = null
    let priority: number = 2
    let dueDate: Date | null = null
    let imageUrl: string | null = null

    // 判断是 JSON 还是 FormData
    if (contentType.includes('multipart/form-data')) {
      // 处理 FormData
      const formData = await request.formData()
      
      title = (formData.get('title') as string) || ''
      description = (formData.get('description') as string) || null
      priority = parseInt((formData.get('priority') as string) || '2')
      const dueDateStr = formData.get('dueDate') as string
      dueDate = dueDateStr ? new Date(dueDateStr) : null
      
      const image = formData.get('image') as File

      // 处理图片上传
      if (image && image.size > 0) {
        // 验证文件类型
        if (!image.type.startsWith('image/')) {
          return NextResponse.json(
            { error: '只允许上传图片文件' },
            { status: 400 }
          )
        }

        // 验证文件大小 (5MB)
        if (image.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: '图片大小不能超过 5MB' },
            { status: 400 }
          )
        }

        // 生成唯一文件名
        const ext = image.name.split('.').pop() || 'jpg'
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const filename = `todo-${uniqueSuffix}.${ext}`
        const filepath = join(uploadDir, filename)

        // 保存文件
        const bytes = await image.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)

        imageUrl = `/uploads/${filename}`
      }
    } else {
      // 处理 JSON
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

    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority,
        dueDate,
        imageUrl,
      },
    })

    return NextResponse.json({ todo }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/todos error:', error)
    return NextResponse.json(
      { error: '创建 Todo 失败: ' + (error.message || '未知错误') },
      { status: 500 }
    )
  }
}
