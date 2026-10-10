# Social / Community Platform MVP

This plan outlines the architecture, technology stack, and implementation steps for building the Social / Community Platform as requested from the screenshot.

## Goal Description

To build a full-stack web application that serves as a mini Twitter/Reddit clone. The platform will support user profiles, posts, likes, comments, follows, and a personalized feed. The goal is to demonstrate complex relationship modeling, scalability concerns, and a holistic UX.

### Tech Stack
*   **Frontend**: React / Next.js (App Router)
*   **API**: GraphQL (Apollo Server/Client)
*   **Database**: PostgreSQL (with Prisma ORM for type-safe database access)
*   **Storage**: S3 / Cloudflare R2 (We can use MinIO locally via Docker to simulate S3)
*   **Infrastructure**: Docker & Nginx

## Open Questions

> [!IMPORTANT]
> **What is the specific niche for this platform?**
> The screenshot suggests a twist, like "for developers" or a "niche hobby". Knowing this will help shape the UI theme, seed data, and specific features (e.g., syntax highlighting for code snippets if it's for developers).

> [!IMPORTANT]
> **How would you like to handle Authentication?**
> Do you want to use NextAuth.js with OAuth providers (GitHub, Google), or implement custom JWT email/password authentication?

> [!IMPORTANT]
> **Infrastructure Setup**
> For local development, I propose using Docker Compose to spin up PostgreSQL, MinIO (for S3-compatible storage), and Nginx. Are you comfortable running Docker on your machine?

> [!WARNING]
> Building this entire platform will be a multi-step process. This plan focuses on bootstrapping the MVP core functionality first.

## Proposed Changes

We will bootstrap the application from scratch in the empty workspace.

### 1. Infrastructure & Database Setup

*   **Docker Compose**: Create a `docker-compose.yml` to run PostgreSQL and optionally MinIO and Nginx locally.
*   **Prisma Schema**: Define the relational data model for users, posts, comments, likes, and follows.

#### [NEW] docker-compose.yml
#### [NEW] prisma/schema.prisma

### 2. Backend (Next.js API & GraphQL)

We will set up a Next.js application and configure it as a full-stack app, serving both the frontend and the GraphQL API.

*   **GraphQL Setup**: Integrate Apollo Server with Next.js Route Handlers.
*   **Type Definitions**: Define GraphQL schema for Users, Posts, etc.
*   **Resolvers**: Implement business logic for querying the feed, creating posts, liking, and following.

#### [NEW] package.json (Next.js initialization)
#### [NEW] app/api/graphql/route.ts
#### [NEW] graphql/schema.ts
#### [NEW] graphql/resolvers.ts

### 3. Frontend Development (React & UI)

We will build out the user interface prioritizing modern, premium design aesthetics as per the web application guidelines.

*   **UI Foundation**: Setup global CSS, CSS modules or styled-components (depending on preference, though vanilla CSS/modules are recommended).
*   **Components**: Create reusable UI components (PostCard, UserProfile, CommentList, Navbar).
*   **Pages**:
    *   `/` (Home/Feed)
    *   `/[username]` (Profile Page)
    *   `/post/[id]` (Detailed Post View)

#### [NEW] app/globals.css
#### [NEW] app/page.tsx
#### [NEW] components/PostCard.tsx
#### [NEW] components/Navbar.tsx

## Verification Plan

### Automated Tests
*   Once the core API is built, we can add simple Jest tests for critical GraphQL resolvers (e.g., feed generation logic).

### Manual Verification
1.  Run `docker-compose up -d` to verify database connectivity.
2.  Start the Next.js dev server and navigate to `http://localhost:3000/api/graphql` to test queries and mutations using the Apollo Sandbox.
3.  Manually create users, posts, and follows via the UI to ensure end-to-end functionality and real-time feel.
4.  Review the UI aesthetics to ensure it meets the "premium design" requirement.
