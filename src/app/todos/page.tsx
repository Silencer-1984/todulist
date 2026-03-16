import { prisma } from '@/lib/prisma';
import TodoApp from '@/components/TodoApp';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TodosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const todos = await prisma.todo.findMany({
    where: { userId: session.user.id },
    orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <TodoApp
      initialTodos={todos}
      user={{ id: session.user.id, username: session.user.username }}
    />
  );
}
