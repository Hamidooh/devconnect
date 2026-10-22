import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcrypt";

const url = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (in case of re-seed)
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.storyView.deleteMany();
  await prisma.story.deleteMany();
  await prisma.savedPost.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follows.deleteMany();
  await prisma.post.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Users
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo Developer",
      username: "demodev",
      email: "test@example.com",
      password: hashedPassword,
      bio: "Full-Stack Engineer building distributed systems & AI apps. Open source contributor.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=demodev",
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      username: "sarahcodes",
      email: "sarah@devconnect.io",
      password: hashedPassword,
      bio: "Staff Frontend Architect @ TechCorp | React 19, TypeScript, Web Performance & Accessibility enthusiast.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarahchen",
    },
  });

  const marcus = await prisma.user.create({
    data: {
      name: "Marcus Vance",
      username: "marcus_sys",
      email: "marcus@devconnect.io",
      password: hashedPassword,
      bio: "Rustacean & Infrastructure Geek. Writing low-latency backends and database internals.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcusvance",
    },
  });

  const elena = await prisma.user.create({
    data: {
      name: "Elena Rostova",
      username: "elena_ui",
      email: "elena@devconnect.io",
      password: hashedPassword,
      bio: "Product Designer turned Design Technologist. Exploring fluid web design and CSS subgrid.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=elenarostova",
    },
  });

  console.log("✓ Created 4 users (demo account: test@example.com / password123)");

  // 2. Create Follows
  await prisma.follows.createMany({
    data: [
      { followerId: demoUser.id, followingId: sarah.id },
      { followerId: demoUser.id, followingId: marcus.id },
      { followerId: sarah.id, followingId: demoUser.id },
      { followerId: marcus.id, followingId: demoUser.id },
      { followerId: elena.id, followingId: demoUser.id },
      { followerId: sarah.id, followingId: elena.id },
    ],
  });

  // 3. Create Posts
  const post1 = await prisma.post.create({
    data: {
      authorId: sarah.id,
      content: "🚀 Just shipped our Next.js 16 App Router upgrade with React 19 Server Actions! Bundle sizes decreased by 34% and TTFB dropped from 420ms to 110ms across our global edge routes. Anyone else migrating this week?",
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: marcus.id,
      content: "💡 Hot take: LibSQL + SQLite embedded databases for serverless architectures are severely underrated. Local latency is practically zero, and syncing to the edge with Turso solves 90% of microservice latency bottlenecks.",
    },
  });

  const post3 = await prisma.post.create({
    data: {
      authorId: elena.id,
      content: "✨ Designed and implemented a modern dark-mode palette using OKLCH color spaces. The contrast ratios are mathematically balanced across all OLED and LCD displays. Check out the clean elevation tokens!",
    },
  });

  const post4 = await prisma.post.create({
    data: {
      authorId: demoUser.id,
      content: "Welcome to DevConnect! 🎉 Excited to connect with fellow software engineers, exchange architecture patterns, and share project milestones.",
    },
  });

  console.log("✓ Created 4 posts");

  // 4. Create Likes & Comments
  await prisma.like.createMany({
    data: [
      { userId: demoUser.id, postId: post1.id },
      { userId: marcus.id, postId: post1.id },
      { userId: elena.id, postId: post1.id },
      { userId: demoUser.id, postId: post2.id },
      { userId: sarah.id, postId: post2.id },
      { userId: sarah.id, postId: post4.id },
      { userId: marcus.id, postId: post4.id },
    ],
  });

  await prisma.comment.createMany({
    data: [
      {
        authorId: demoUser.id,
        postId: post1.id,
        content: "Awesome results Sarah! Did you run into any hydration mismatches with third-party libraries during the React 19 upgrade?",
      },
      {
        authorId: sarah.id,
        postId: post1.id,
        content: "Only with legacy modal portals, but migrating to native HTML dialogs resolved it immediately!",
      },
      {
        authorId: demoUser.id,
        postId: post2.id,
        content: "Agreed 100%. Having SQLite during local development with an identical edge client in production is pure bliss.",
      },
    ],
  });

  // 5. Create 24h Stories
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await prisma.story.create({
    data: {
      authorId: sarah.id,
      expiresAt: expires,
      mediaUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    },
  });

  await prisma.story.create({
    data: {
      authorId: marcus.id,
      expiresAt: expires,
      mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    },
  });

  // 6. Create Direct Messages
  await prisma.message.createMany({
    data: [
      {
        senderId: sarah.id,
        receiverId: demoUser.id,
        content: "Hey! Loved your post on DevConnect. Are you speaking at React Summit this year?",
      },
      {
        senderId: demoUser.id,
        receiverId: sarah.id,
        content: "Hey Sarah! Yes, submitting a proposal on GraphQL SSR caching patterns. Let's catch up if you're there!",
      },
    ],
  });

  // 7. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        senderId: sarah.id,
        receiverId: demoUser.id,
        type: "FOLLOW",
        read: false,
      },
      {
        senderId: sarah.id,
        receiverId: demoUser.id,
        postId: post4.id,
        type: "LIKE",
        read: false,
      },
      {
        senderId: marcus.id,
        receiverId: demoUser.id,
        postId: post4.id,
        type: "LIKE",
        read: false,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
