import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { TodoController } from '@/server/controllers/todo.controller'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/todos/:id - 获取单个 Todo
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: '未登录' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const id = parseInt(params.id)
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: '无效的 ID' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return TodoController.getTodoById(id, session.user.id)
}

/**
 * PATCH /api/todos/:id - 更新 Todo
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: '未登录' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const id = parseInt(params.id)
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: '无效的 ID' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return TodoController.updateTodo(request, id, session.user.id)
}

/**
 * DELETE /api/todos/:id - 删除 Todo
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: '未登录' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const id = parseInt(params.id)
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: '无效的 ID' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return TodoController.deleteTodo(id, session.user.id)
}
