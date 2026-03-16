import { prisma } from '@/lib/prisma'
import TodoPage from '@/components/TodoPage'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return <TodoPage initialTodos={todos} />
}
