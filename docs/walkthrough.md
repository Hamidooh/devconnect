# Social / Community Platform MVP Walkthrough

I have successfully bootstrapped the core MVP of the Social/Community Platform. Here is a summary of what was accomplished and how to verify it.

## Changes Made

### 1. Infrastructure (SQLite)
Since Docker was unavailable on your machine, I switched the database layer to SQLite for local development. This ensures you can run the app immediately without extra dependencies. You can easily swap this out for PostgreSQL later in production by editing the `provider` in `prisma/schema.prisma`.

### 2. Next.js App & Dependencies
Initialized a modern Next.js App Router project and installed:
- `next-auth` (with Google OAuth and Credentials fallback)
- `@prisma/client` and `prisma`
- `@apollo/server`, `@apollo/client`, and `@as-integrations/next` for the GraphQL API layer
- Removed TailwindCSS entirely in favor of a Vanilla CSS styling system.

### 3. Database Schema (Prisma)
Defined a comprehensive relational data model in [schema.prisma](prisma/schema.prisma) including:
- `User`, `Account`, `Session`, `VerificationToken` (NextAuth required models)
- `Post` (with content and author relation)
- `Comment` and `Like` (with relations to Posts and Users)
- `Follows` (for the social graph)

### 4. Backend API (GraphQL)
Set up an Apollo Server at `/api/graphql` featuring:
- **Type Definitions**: Covering all the Prisma models ([schema.ts](src/graphql/schema.ts))
- **Resolvers**: Handling authentication context, fetching the feed, creating posts, liking, and following ([resolvers.ts](src/graphql/resolvers.ts)).

### 5. Frontend UI & Aesthetics
Implemented a sleek, dark-mode focused premium design using Vanilla CSS ([globals.css](src/app/globals.css)).
- **Navigation**: Integrated NextAuth sign in/out buttons.
- **Feed**: A real-time updating feed of posts using Apollo Client.
- **Post Cards**: Interactive components that allow authenticated users to like posts.

## How to Test

1. **Start the Development Server**
   Run the following command in your terminal:
   ```bash
   npm run dev
   ```
2. **Explore the App**
   Navigate to `http://localhost:3000`. You will see the main feed.
3. **Sign In**
   Click "Sign In" in the navbar. You can use the Credentials provider (email/password) or set up Google OAuth credentials in your `.env` file to use the Google login.
4. **Interact**
   Once signed in, you can create new posts and like existing ones.

> [!TIP]
> **Next Steps**
> - Configure Google OAuth credentials in `.env` if you wish to use social login.
> - Expand the frontend to include dedicated user profile pages (`/[username]`).
> - Implement the GraphQL mutations and UI for commenting on posts.
