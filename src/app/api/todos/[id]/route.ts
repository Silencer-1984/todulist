import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/todos/[id] - 获取单个 Todo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的 ID' },
        { status: 400 }
      )
    }

    const todo = await prisma.todo.findUnique({
      where: { id },
    })

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo 不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ todo })
  } catch (error) {
    return NextResponse.json(
      { error: '获取 Todo 失败' },
      { status: 500 }
    )
  }
}

// PATCH /api/todos/[id] - 更新 Todo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的 ID' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, description, completed, priority, dueDate } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (completed !== undefined) updateData.completed = completed
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null

    const todo = await prisma.todo.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ todo })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Todo 不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: '更新 Todo 失败' },
      { status: 500 }
    )
  }
}

// DELETE /api/todos/[id] - 删除 Todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '无效的 ID' },
        { status: 400 }
      )
    }

    await prisma.todo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Todo 不存在' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: '删除 Todo 失败' },
      { status: 500 }
    )
  }
}
