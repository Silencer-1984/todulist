import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { TodoController } from '@/server/controllers/todo.controller'

/**
 * GET /api/todos - 获取当前用户的所有 Todo
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: '未登录' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return TodoController.getTodos(request, session.user.id)
}

/**
 * POST /api/todos - 创建新 Todo
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: '未登录' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return TodoController.createTodo(request, session.user.id)
}
