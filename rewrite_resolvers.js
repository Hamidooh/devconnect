const fs = require('fs');
let code = fs.readFileSync('src/graphql/resolvers.ts', 'utf8');

// 1. Add imports
code = code.replace(
  'import { prisma } from "../lib/prisma";',
  `import { prisma } from "../lib/prisma";
import { User, Story, Post, Like, SavedPost, Prisma } from "@prisma/client";
import { Session } from "next-auth";

interface GraphQLContext {
  session: Session | null;
}`
);

// 2. Query replacements
code = code.replace(/_\: any, __\: any, context\: any/g, '_: unknown, __: unknown, context: GraphQLContext');
code = code.replace(/_\: any,/g, '_: unknown,');
code = code.replace(/context\: any/g, 'context: GraphQLContext');

// 3. User update data and catch
code = code.replace(/const data\: any \= \{\};/g, 'const data: Prisma.UserUpdateInput = {};');
code = code.replace(/\} catch \(err\: any\) \{/g, '} catch (err: unknown) {');
code = code.replace(/if \(err\.code \=\=\= 'P2002'\)/g, "if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002')");

// 4. Parent types
code = code.replace(/User\: \{\s+followers\: async \(parent\: any\)/g, 'User: {\n    followers: async (parent: User)');
code = code.replace(/following\: async \(parent\: any\)/g, 'following: async (parent: User)');
code = code.replace(/likes\: async \(parent\: any\)/g, 'likes: async (parent: User)');
code = code.replace(/comments\: async \(parent\: any\)/g, 'comments: async (parent: User)');
code = code.replace(/savedPosts\: async \(parent\: any\)/g, 'savedPosts: async (parent: User)');
code = code.replace(/stories\: async \(parent\: any\)/g, 'stories: async (parent: User)');

code = code.replace(/Story\: \{\s+author\: async \(parent\: any\)/g, 'Story: {\n    author: async (parent: Prisma.StoryGetPayload<{ include: { author: true, sharedPost: true } }>)');
code = code.replace(/sharedPost\: async \(parent\: any\)/g, 'sharedPost: async (parent: Prisma.StoryGetPayload<{ include: { author: true, sharedPost: true } }>)');
code = code.replace(/viewers\: async \(parent\: any\)/g, 'viewers: async (parent: Story)');

code = code.replace(/Post\: \{\s+author\: async \(parent\: any\)/g, 'Post: {\n    author: async (parent: Prisma.PostGetPayload<{ include: { author: true, likes: true, comments: true, savedBy: true } }>)');
code = code.replace(/likes\: async \(parent\: any\)/g, 'likes: async (parent: Prisma.PostGetPayload<{ include: { author: true, likes: true, comments: true, savedBy: true } }>)');
code = code.replace(/comments\: async \(parent\: any\)/g, 'comments: async (parent: Prisma.PostGetPayload<{ include: { author: true, likes: true, comments: true, savedBy: true } }>)');
code = code.replace(/savedBy\: async \(parent\: any\)/g, 'savedBy: async (parent: Prisma.PostGetPayload<{ include: { author: true, likes: true, comments: true, savedBy: true } }>)');

code = code.replace(/Like\: \{\s+user\: async \(parent\: any\)/g, 'Like: {\n    user: async (parent: Prisma.LikeGetPayload<{ include: { user: true, post: true } }>)');

code = code.replace(/SavedPost\: \{\s+user\: async \(parent\: any\)/g, 'SavedPost: {\n    user: async (parent: Prisma.SavedPostGetPayload<{ include: { user: true, post: true } }>)');
code = code.replace(/post\: async \(parent\: any\)/g, 'post: async (parent: Prisma.SavedPostGetPayload<{ include: { user: true, post: true } }>)');

fs.writeFileSync('src/graphql/resolvers.ts', code);
