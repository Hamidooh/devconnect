# DevConnect 🚀

> A modern, full-stack social networking platform designed specifically for software developers, creators, and engineers to share projects, stories, and ideas.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![GraphQL](https://img.shields.io/badge/GraphQL-Apollo-E10098?style=for-the-badge&logo=graphql)](https://graphql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

## 📖 Overview

**DevConnect** is a developer-first social hub combining the visual engagement of modern social media with features built around engineering workflows. Share your daily builds with **Developer Stories**, publish project updates and code snippets in the **Feed**, engage through **Direct Messaging**, and build your developer network.

---

## ✨ Features

- **📸 Developer Stories**: Share 24-hour disappearing progress updates, snippets, or reshare posts into stories with full view tracking.
- **📰 Interactive Feed**: Create posts with text and image attachments. Like, comment on, and save posts to your private collection.
- **🔍 Explore & Search**: Discover developers and trending posts with unified instant search.
- **💬 Direct Messaging**: 1-on-1 private messaging to chat and collaborate directly with other engineers.
- **🔔 Real-time Notifications**: Instant alerts whenever users follow you, like your posts, or drop comments.
- **👤 Customizable Profiles**: Personalize your profile with custom bios, profile avatars, cover images, and track your followers and following lists.
- **🌓 Dark & Light Modes**: Seamless theme switching with system preference detection and localStorage persistence.
- **🔐 Secure Authentication**: Integrated credentials authentication powered by NextAuth.js with password hashing.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | [Next.js 16 (App Router)](https://nextjs.org/), [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **API & Data** | [GraphQL](https://graphql.org/), [Apollo Server](https://www.apollographql.com/docs/apollo-server/), [Apollo Client SSR](https://www.apollographql.com/docs/react/) |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/) with LibSQL / SQLite (Turso cloud compatible) |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) |
| **Styling** | Custom Vanilla CSS Design System with CSS Variables |

---

## 📂 Project Architecture

```
├── prisma/
│   └── schema.prisma         # Prisma data models (User, Post, Story, Comment, etc.)
├── public/
│   └── uploads/              # Local storage for media uploads
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/         # NextAuth session & credentials routes
│   │   │   ├── graphql/      # Apollo GraphQL server endpoint
│   │   │   └── upload/       # Multipart file upload handler
│   │   ├── explore/          # Explore feed page
│   │   ├── messages/         # Direct messages & chat interface
│   │   ├── notifications/    # User activity & notifications page
│   │   ├── profile/          # User profile view & edit pages
│   │   ├── layout.tsx        # App root layout & theme initialization
│   │   └── page.tsx          # Main home feed & stories feed
│   ├── components/           # Reusable UI components (Sidebar, Modals, PostCard, etc.)
│   ├── graphql/
│   │   ├── schema.ts         # GraphQL type definitions
│   │   └── resolvers.ts      # Query & Mutation business logic
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration & credentials provider
│   │   └── prisma.ts         # Prisma client singleton with LibSQL adapter
│   └── types/                # TypeScript interface definitions
├── docker-compose.yml        # Optional Docker container config
├── next.config.ts            # Next.js build & transpilation config
└── package.json              # Project dependencies & run scripts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.17.0 or higher recommended)
- `npm`, `yarn`, or `pnpm`

### 1. Clone the repository

```bash
git clone https://github.com/Hamidooh/devconnect.git
cd devconnect
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-random-key"

# Database Configuration (defaults to local SQLite)
DATABASE_URL="file:./dev.db"
```

### 4. Initialize Database

Push the schema migrations to your local SQLite database:

```bash
npx prisma db push
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start using DevConnect!

---

## 📡 GraphQL API Reference

The app exposes a unified GraphQL endpoint at `/api/graphql`. Key operations include:

### Queries
- `feed`: Fetch the authenticated user's home timeline.
- `explore`: Fetch global trending and recent posts.
- `getStories`: Fetch active (non-expired) 24h stories.
- `getMessages(userId)`: Fetch chat history with a specific developer.
- `getNotifications`: Fetch all interaction alerts.
- `searchUsers(query)` / `searchPosts(query)`: Search platform content.

### Mutations
- `createPost(content, mediaUrl)`: Publish a new post.
- `createStory(mediaUrl, sharedPostId)`: Post a new story.
- `likePost(postId)` / `unlikePost(postId)`: Toggle post likes.
- `savePost(postId)` / `unsavePost(postId)`: Bookmark posts.
- `createComment(postId, content)`: Comment on a post.
- `sendMessage(receiverId, content)`: Send a direct message.
- `followUser(userId)` / `unfollowUser(userId)`: Follow or unfollow a user.
- `updateProfile(...)`: Update bio, username, and avatars.

---

## 🌐 Deployment

### Option A: Railway / Render (Recommended for SQLite & Local Uploads)
1. Fork or push this repository to GitHub.
2. Link your repository in [Railway](https://railway.app) or [Render](https://render.com).
3. Set environment variables: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NODE_ENV=production`.
4. Attach a persistent volume to persist SQLite (`dev.db`) and uploaded media (`/public/uploads`).

### Option B: Vercel + Turso (Serverless)
1. Connect a free cloud database on [Turso](https://turso.tech) and set `DATABASE_URL="libsql://your-db.turso.io"`.
2. Connect your repository on [Vercel](https://vercel.com).
3. Add `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `DATABASE_URL` in the Vercel dashboard.
4. Deploy!

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
