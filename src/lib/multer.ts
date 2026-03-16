import multer from 'multer'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

const uploadDir = path.join(process.cwd(), 'public', 'uploads')

// 确保上传目录存在
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, 'todo-' + uniqueSuffix + ext)
  }
})

const fileFilter = (req: any, file: any, cb: any) => {
  // 只允许图片类型
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('只允许上传图片文件'), false)
  }
}

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 限制
  },
  fileFilter: fileFilter,
})
