import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// 生成随机令牌
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username } = body

    if (!username) {
      return NextResponse.json(
        { error: '请输入用户名' },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      // 为了安全，即使用户不存在也返回成功
      return NextResponse.json(
        { message: '如果该用户存在，重置链接已发送' },
        { status: 200 }
      )
    }

    // 生成重置令牌
    const token = generateToken()
    const expires = new Date(Date.now() + 3600000) // 1小时后过期

    // 删除该用户之前的重置令牌
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    })

    // 保存新令牌
    await prisma.passwordResetToken.create({
      data: {
        email: username,
        token,
        expires,
        userId: user.id,
      },
    })

    // 实际项目中这里应该发送邮件
    // 由于是演示项目，直接返回令牌链接
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`

    console.log('密码重置链接:', resetUrl)

    return NextResponse.json({
      message: '密码重置链接已生成',
      resetUrl, // 实际项目中不要返回这个，应该发送邮件
    })
  } catch (error) {
    console.error('忘记密码错误:', error)
    return NextResponse.json(
      { error: '处理请求失败' },
      { status: 500 }
    )
  }
}
