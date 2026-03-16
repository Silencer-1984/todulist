import type { Metadata } from "next";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "TodoList - 组织一切，成就更多",
  description: "简洁高效的任务管理工具",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <SessionProvider session={session}>
          <AntdRegistry>
            {children}
          </AntdRegistry>
        </SessionProvider>
      </body>
    </html>
  );
}
