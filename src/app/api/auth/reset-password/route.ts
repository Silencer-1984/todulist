import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 查找有效的重置令牌
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: '无效的重置链接' },
        { status: 400 }
      )
    }

    if (resetToken.expires < new Date()) {
      // 删除过期令牌
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      return NextResponse.json(
        { error: '重置链接已过期，请重新申请' },
        { status: 400 }
      )
    }

    // 哈希新密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 更新用户密码
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    })

    // 删除已使用的令牌
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })

    return NextResponse.json({
      message: '密码重置成功，请使用新密码登录',
    })
  } catch (error) {
    console.error('重置密码错误:', error)
    return NextResponse.json(
      { error: '重置密码失败' },
      { status: 500 }
    )
  }
}

// 验证令牌是否有效
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: '缺少令牌' },
        { status: 400 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json(
        { valid: false, error: '无效或已过期的令牌' },
        { status: 200 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('验证令牌错误:', error)
    return NextResponse.json(
      { valid: false, error: '验证失败' },
      { status: 500 }
    )
  }
}
