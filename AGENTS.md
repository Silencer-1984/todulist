# Todo List Application

A full-stack Todo List application built with Next.js, Prisma, and Ant Design. Supports task management with image attachments, priority levels, due dates, and dark/light theme switching.

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14.2.35 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 18 + Ant Design 5.29 |
| Styling | Tailwind CSS 3.4 |
| Database | SQLite (via Prisma ORM 5.22) |
| Date Handling | dayjs |
| HTTP Client | axios |
| File Upload | multer |

## Project Structure

```
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma           # Prisma schema definition
│   ├── dev.db                  # SQLite database file (gitignored)
│   └── migrations/             # Database migration files
├── public/
│   └── uploads/                # Uploaded images storage directory
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/todos/          # REST API routes
│   │   │   ├── route.ts        # GET/POST /api/todos
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET/PATCH/DELETE /api/todos/:id
│   │   ├── layout.tsx          # Root layout with Ant Design registry
│   │   ├── page.tsx            # Home page (Server Component)
│   │   └── globals.css         # Global styles and CSS variables
│   ├── components/             # React components
│   │   ├── TodoPage.tsx        # Main page wrapper with theme toggle
│   │   └── TodoList.tsx        # Todo list UI with forms and interactions
│   └── lib/                    # Utility libraries
│       ├── prisma.ts           # Prisma client singleton
│       ├── axios.ts            # Axios instance with error handling
│       └── multer.ts           # Multer upload configuration (unused)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env                        # Environment variables (DATABASE_URL)
```

## Database Schema

```prisma
model Todo {
  id          Int       @id @default(autoincrement())
  title       String
  description String?   // Optional
  imageUrl    String?   // Optional image path
  completed   Boolean   @default(false)
  priority    Int       @default(2)  // 1=高, 2=中, 3=低
  dueDate     DateTime? // Optional
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

## Build and Development Commands

```bash
# Install dependencies
npm install

# Setup database (run migrations)
npx prisma migrate dev

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key-change-this-in-production"
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos?completed=&priority=` | List all todos (optional filters) |
| POST | `/api/todos` | Create new todo (JSON or multipart/form-data for image upload) |
| GET | `/api/todos/:id` | Get single todo |
| PATCH | `/api/todos/:id` | Update todo |
| DELETE | `/api/todos/:id` | Delete todo |

## Code Style Guidelines

### Component Types
- **Server Components** (default): Data fetching, database operations
- **Client Components**: Mark with `'use client'` directive for interactive UI

### Path Aliases
Use `@/*` alias for imports from `src/*`:
```typescript
import { prisma } from '@/lib/prisma'
import TodoList from '@/components/TodoList'
```

### Naming Conventions
- Components: PascalCase (e.g., `TodoList.tsx`)
- Utilities: camelCase (e.g., `prisma.ts`)
- API routes: kebab-case directories, `route.ts` files

### TypeScript
- Strict mode enabled
- Explicit return types on API route handlers
- Uses `@prisma/client` types for data models

## Key Features Implementation

### Image Upload
- Stored in `public/uploads/`
- 5MB size limit
- Only image files allowed (MIME type check)
- Unique filenames with timestamp + random suffix
- Access via `/uploads/:filename` URL

### Theme Switching
- Dark/light mode toggle in header
- Persisted to localStorage (`todo-theme-dark` key)
- Ant Design's ConfigProvider with algorithm switching
- Custom CSS gradients for background

### Localization
- Chinese (zh-CN) locale for Ant Design
- Chinese locale for dayjs date formatting
- UI labels in Chinese

## Testing Instructions

Currently, this project does not have automated tests configured. To test manually:

1. Run `npm run dev` to start the development server
2. Access `http://localhost:3000`
3. Test CRUD operations:
   - Add todos with/without images
   - Toggle completion status
   - Delete todos
   - Filter by completion status
4. Test theme switching

## Security Considerations

1. **File Upload Security**:
   - MIME type validation (only `image/*`)
   - File size limit (5MB)
   - Unique filename generation prevents overwrites
   
2. **Database**:
   - Prisma ORM provides SQL injection protection
   - SQLite file should not be committed (in `.gitignore`)

3. **Environment**:
   - `.env` file contains sensitive database path
   - Never commit `.env` files

## Deployment Notes

- Built for static deployment or Node.js server
- Database file (`prisma/dev.db`) is excluded from git - ensure migrations run on deploy
- Uploaded images in `public/uploads/` are stored on filesystem
- For production, consider:
  - Using a persistent volume for uploads
  - Migrating to PostgreSQL/MySQL for concurrent access
  - Configuring proper environment variables

## Prisma Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name <migration-name>

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

---

## Agent Rules

### Rule 1: Package Installation
当有安装 npm 包的需求时，**不要自动执行**，而是提示用户：
```
需要安装 [包名]，请执行：
npm install [包名]
安装完成后告诉我。
```

### Rule 2: Configuration Queries
关于第三方库（如 Prisma、antd、Next.js 等）的配置问题，**优先使用 Context7 MCP 工具**查询官方文档，而不是猜测。

### Rule 3: Git Commit Workflow
当用户说**"提交代码"**时，自动执行：
1. 执行 `git add -A`
2. 总结这段时间的更新内容，写入 commit message（使用中文，遵循 conventional commits 格式）
3. 执行 `git commit -m "..."`
4. 执行 `git push -u origin master`（或当前分支）

注意：需要先确保用户已配置好 Git 远程仓库和认证。

### Rule 4: Next.js Server/Client Components
编写代码时**严格遵守 Next.js App Router 规范**：
- **Server Components**（默认）：数据库操作、API 调用、敏感数据处理
- **Client Components**（`'use client'`）：浏览器 API、React hooks（useState/useEffect）、事件处理
- **禁止在 Server Component 中使用**：useSession、useState、浏览器事件等
- **SessionProvider 必须通过 Client Component 包裹**

### Rule 5: Dependency Version Compatibility
安装新依赖时**必须检查版本兼容性**：
- 检查是否与现有依赖冲突（如 `next-auth@5` 与 `@auth/prisma-adapter` 不兼容）
- 优先使用与已安装版本匹配的依赖
- 遇到兼容性问题及时降级到稳定版本
- 使用 `npm list [package]` 检查已安装版本
