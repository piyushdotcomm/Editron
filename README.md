# Editron

**A next-generation browser-based code editor with AI-powered intelligence and WebContainer integration**

Editron is a modern, full-stack web application that brings the power of a complete development environment to your browser. Built with Next.js 15, it features real-time code execution, multiple framework templates, and seamless authentication—all without leaving your browser.

---

## ✨ Features

### 🚀 Core Capabilities
- **Browser-Based IDE**: Full-featured code editor powered by Monaco Editor
- **Live Code Execution**: Run Node.js, React, Next.js, Vue, Angular, and more directly in the browser using WebContainer API
- **Multiple Templates**: Pre-configured starter templates for popular frameworks:
  - React (TypeScript)
  - Next.js
  - Express.js
  - Vue
  - Angular
  - Hono (Node.js)
- **Real-Time Terminal**: Integrated xterm.js terminal with full command execution
- **File System Management**: Create, edit, and organize files in a virtual file system

### 🔐 Authentication & User Management
- **Multi-Provider Auth**: Sign in with GitHub or Google via NextAuth.js
- **User Roles**: Support for Admin, User, and Premium User tiers
- **Persistent Playgrounds**: Save and manage your coding projects
- **Starred Projects**: Bookmark your favorite playgrounds

### 🎨 Modern UI/UX
- **Responsive Design**: Fully responsive interface built with Tailwind CSS v4
- **Dark/Light Mode**: Theme switching with next-themes
- **Radix UI Components**: Accessible, customizable UI primitives
- **Framer Motion Animations**: Smooth, professional animations
- **Monochrome Theme**: Clean, distraction-free aesthetic

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.5.12 (App Router)
- **React**: 19.1.0
- **TypeScript**: ^5
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: Framer Motion
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Terminal**: xterm.js with addons (fit, search, web-links)

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: MongoDB (via Prisma ORM)
- **Authentication**: NextAuth.js v5 (beta)
- **Adapter**: Prisma Adapter for NextAuth

### Key Dependencies
- **WebContainer API**: Browser-based Node.js runtime
- **Prisma**: Type-safe database ORM
- **Zod**: Schema validation
- **Zustand**: State management
- **React Hook Form**: Form handling
- **Sonner**: Toast notifications

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or yarn/pnpm/bun)
- **MongoDB**: Database instance (local or cloud, e.g., MongoDB Atlas)
- **OAuth Credentials**:
  - GitHub OAuth App (Client ID & Secret)
  - Google OAuth App (Client ID & Secret)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/piyushdotcomm/Editron.git
cd Editron
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority"

# NextAuth.js
AUTH_SECRET="<your-auth-secret>"  # Generate with: openssl rand -base64 32

# GitHub OAuth
AUTH_GITHUB_ID="<your-github-client-id>"
AUTH_GITHUB_SECRET="<your-github-client-secret>"

# Google OAuth
AUTH_GOOGLE_ID="<your-google-client-id>"
AUTH_GOOGLE_SECRET="<your-google-client-secret>"
```

**Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

### 4. Database Setup

Generate Prisma client and push schema to database:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
Editron/
├── app/                      # Next.js App Router
│   ├── (root)/              # Public routes (landing page)
│   ├── api/                 # API routes
│   │   └── template/        # Template generation endpoints
│   ├── auth/                # Authentication pages
│   ├── dashboard/           # User dashboard
│   └── playground/          # Code playground interface
├── modules/                 # Feature modules
│   ├── auth/               # Authentication logic
│   ├── dashboard/          # Dashboard components
│   ├── home/               # Landing page components
│   ├── playground/         # Playground features
│   └── webcontainers/      # WebContainer integration
├── components/             # Reusable UI components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
│   ├── db.ts             # Prisma client
│   ├── template.ts       # Template paths configuration
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma
├── public/               # Static assets
├── editron-starters/     # Framework starter templates
├── auth.ts              # NextAuth.js configuration
├── middleware.ts        # Route protection middleware
└── routes.ts           # Route definitions
```

---

## 🎯 Key Features Explained

### Playground System

Each playground is a fully isolated development environment:

1. **Template Selection**: Choose from 6 pre-configured framework templates
2. **File System**: Virtual file system powered by WebContainer API
3. **Code Editor**: Monaco Editor with syntax highlighting and IntelliSense
4. **Terminal**: Full terminal access for running commands
5. **Live Preview**: Real-time preview of your application
6. **Persistence**: Playgrounds are saved to MongoDB with user association

### Authentication Flow

1. User clicks "Sign In" and selects provider (GitHub/Google)
2. OAuth flow redirects to provider for authorization
3. NextAuth.js handles callback and creates/links user account
4. User session is managed via JWT strategy
5. Protected routes are enforced via middleware

### Template Generation

Templates are dynamically scanned and converted to JSON:

```typescript
// API Route: /api/template/[id]
1. Fetch playground from database
2. Resolve template path from template key
3. Scan template directory structure
4. Generate JSON representation of files
5. Return to client for WebContainer initialization
```

---

## 🔧 Configuration

### Tailwind CSS

Tailwind v4 is configured via `@tailwindcss/postcss`. Custom theme tokens are defined in `app/globals.css`.

### TypeScript

TypeScript configuration is in `tsconfig.json` with strict mode enabled and path aliases:

```json
{
  "@/*": ["./*"]
}
```

### ESLint

ESLint is configured to ignore build errors during development (see `next.config.ts`).

---

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio (database GUI)

# Linting
npm run lint         # Run ESLint
```

---

## 🗄️ Database Schema

### Models

- **User**: User accounts with role-based access
- **Account**: OAuth provider accounts linked to users
- **Playground**: User-created coding environments
- **TemplateFile**: JSON storage of playground file structures
- **StarMark**: User bookmarks for playgrounds

### Enums

- **UserRole**: `ADMIN`, `USER`, `PREMIUM_USER`
- **Templates**: `REACT`, `NEXTJS`, `ANGULAR`, `VUE`, `HONO`, `EXPRESS`

---

## 🔒 Security

- **Environment Variables**: Sensitive credentials stored in `.env` (gitignored)
- **JWT Sessions**: Secure session management with NextAuth.js
- **CORS Headers**: Configured for WebContainer API compatibility
- **Route Protection**: Middleware enforces authentication on protected routes
- **OAuth 2.0**: Industry-standard authentication flow

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Ensure all `.env` variables are set in your deployment platform:
- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID` & `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_ID` & `AUTH_GOOGLE_SECRET`
- `NODE_ENV=production`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is private and proprietary. All rights reserved.

---

## 🐛 Known Issues

- **WebContainer Limitations**: Only one WebContainer instance can be booted per page
- **COEP Headers**: Set to `require-corp` for WebContainer compatibility (may block some third-party resources)
- **Template Path**: Ensure `editron-starters/` directory contains all framework templates

---

## 📞 Support

For issues, questions, or feature requests:

- **GitHub Issues**: [Create an issue](https://github.com/piyushdotcomm/Editron/issues)
- **Email**: Contact the maintainer

---

## 🙏 Acknowledgments

- **Next.js** - The React framework for production
- **Vercel** - Deployment and hosting platform
- **Prisma** - Next-generation ORM
- **WebContainer API** - Browser-based Node.js runtime by StackBlitz
- **shadcn/ui** - Beautifully designed components
- **Radix UI** - Unstyled, accessible components

---

**Built with ❤️ by [Piyush](https://github.com/piyushdotcomm)**

*Last updated: February 2026*
