import { prisma } from "../lib/prisma";
import { User, Story, Post, Like, SavedPost, Prisma } from "@prisma/client";
import { Session } from "next-auth";

interface GraphQLContext {
  session: Session | null;
}

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.session?.user?.email) return null;
      return prisma.user.findUnique({
        where: { email: context.session.user.email },
        include: {
          posts: {
            include: {
              author: true,
              likes: { include: { user: true } },
              comments: { include: { author: true } },
              savedBy: { include: { user: true } }
            },
            orderBy: { createdAt: 'desc' }
          },
          followers: { include: { follower: true } },
          following: { include: { following: true } }
        }
      });
    },
    feed: async () => {
      return prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
          likes: {
            include: { user: true }
          },
          comments: {
            include: { author: true }
          },
          savedBy: {
            include: { user: true }
          }
        },
      });
    },
    explore: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      const currentUserId = context.session.user.id;
      
      const following = await prisma.follows.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true }
      });
      const followingIds = following.map(f => f.followingId);
      
      return prisma.post.findMany({
        where: {
          authorId: {
            notIn: [...followingIds, currentUserId]
          }
        },
        orderBy: [
          { likes: { _count: 'desc' } }, // Simple trending proxy
          { createdAt: 'desc' }
        ],
        take: 30,
        include: {
          author: true,
          likes: { include: { user: true } },
          comments: { include: { author: true } },
          savedBy: { include: { user: true } }
        }
      });
    },
    user: async (_: unknown, { id }: { id: string }) => {
      return prisma.user.findUnique({
        where: { id },
        include: {
          posts: {
            include: {
              author: true,
              likes: { include: { user: true } },
              comments: { include: { author: true } },
              savedBy: { include: { user: true } }
            },
            orderBy: { createdAt: 'desc' }
          },
          followers: { include: { follower: true } },
          following: { include: { following: true } }
        }
      });
    },
    post: async (_: unknown, { id }: { id: string }) => {
      return prisma.post.findUnique({
        where: { id },
        include: {
          author: true,
          likes: {
            include: { user: true }
          },
          comments: { include: { author: true } },
          savedBy: { include: { user: true } }
        }
      });
    },
    getMessages: async (_: unknown, { userId }: { userId: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      const currentUserId = context.session.user.id;
      
      return prisma.message.findMany({
        where: {
          OR: [
            { senderId: currentUserId, receiverId: userId },
            { senderId: userId, receiverId: currentUserId }
          ]
        },
        orderBy: { createdAt: 'asc' },
        include: {
          sender: true,
          receiver: true
        }
      });
    },
    searchUsers: async (_: unknown, { query }: { query: string }) => {
      if (!query.trim()) return [];
      return prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { username: { contains: query } },
            { bio: { contains: query } }
          ]
        },
        take: 10
      });
    },
    searchPosts: async (_: unknown, { query }: { query: string }) => {
      if (!query.trim()) return [];
      return prisma.post.findMany({
        where: {
          content: { contains: query }
        },
        include: {
          author: true,
          likes: { include: { user: true } },
          comments: { include: { author: true } },
          savedBy: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      });
    },
    getNotifications: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      return prisma.notification.findMany({
        where: { receiverId: context.session.user.id },
        include: { sender: true, receiver: true, post: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    getStories: async () => {
      const now = new Date();
      return prisma.story.findMany({
        where: { expiresAt: { gt: now } },
        orderBy: { createdAt: 'desc' },
        include: {
          author: true,
          sharedPost: { include: { author: true } },
          views: { include: { user: true } }
        }
      });
    }
  },
  Mutation: {
    createStory: async (_: unknown, { mediaUrl, sharedPostId }: { mediaUrl?: string, sharedPostId?: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // Expires in 24 hours
      return prisma.story.create({
        data: {
          mediaUrl,
          sharedPostId,
          expiresAt,
          authorId: context.session.user.id
        },
        include: { author: true, sharedPost: true }
      });
    },
    deleteStory: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      const story = await prisma.story.findUnique({ where: { id } });
      if (!story || story.authorId !== context.session.user.id) return false;
      await prisma.story.delete({ where: { id } });
      return true;
    },
    viewStory: async (_: unknown, { storyId }: { storyId: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      try {
        await prisma.storyView.upsert({
          where: {
            userId_storyId: {
              userId: context.session.user.id,
              storyId
            }
          },
          update: {},
          create: {
            userId: context.session.user.id,
            storyId
          }
        });
        return true;
      } catch (e) {
        console.error("Error logging story view:", e);
        return false;
      }
    },
    createPost: async (_: unknown, { content, mediaUrl }: { content: string, mediaUrl?: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      return prisma.post.create({
        data: {
          content,
          mediaUrl,
          authorId: context.session.user.id
        },
        include: { author: true, likes: true, comments: true }
      });
    },
    deletePost: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) throw new Error("Post not found");

      const isOwner = post.authorId === context.session.user.id || !post.authorId;
      if (!isOwner) {
        throw new Error("You are not authorized to delete this post");
      }

      await prisma.$transaction([
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.comment.deleteMany({ where: { postId: id } }),
        prisma.savedPost.deleteMany({ where: { postId: id } }),
        prisma.notification.deleteMany({ where: { postId: id } }),
        prisma.story.updateMany({ where: { sharedPostId: id }, data: { sharedPostId: null } }),
        prisma.post.delete({ where: { id } })
      ]);
      return true;
    },
    likePost: async (_: unknown, { postId }: { postId: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      
      const existingLike = await prisma.like.findUnique({
        where: { userId_postId: { userId: context.session.user.id, postId } },
        include: { user: true, post: true }
      });
      
      if (existingLike) return existingLike;

      const like = await prisma.like.create({
        data: {
          userId: context.session.user.id,
          postId
        },
        include: { user: true, post: true }
      });

      // Create notification for post author
      if (like.post.authorId !== context.session.user.id) {
        await prisma.notification.create({
          data: {
            type: "LIKE",
            senderId: context.session.user.id,
            receiverId: like.post.authorId,
            postId: postId
          }
        });
      }

      return like;
    },
    unlikePost: async (_: unknown, { postId }: { postId: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      const like = await prisma.like.findUnique({
        where: { userId_postId: { userId: context.session.user.id, postId } }
      });
      if (!like) return false;
      await prisma.like.delete({ where: { id: like.id } });
      return true;
    },
    savePost: async (_: unknown, { postId }: { postId: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      
      const existingSave = await prisma.savedPost.findUnique({
        where: { userId_postId: { userId: context.session.user.id, postId } },
        include: { user: true, post: true }
      });
      
      if (existingSave) return existingSave;

      return await prisma.savedPost.create({
        data: {
          userId: context.session.user.id,
          postId
        },
        include: { user: true, post: true }
      });
    },
    unsavePost: async (_: unknown, { postId }: { postId: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      const savedPost = await prisma.savedPost.findUnique({
        where: { userId_postId: { userId: context.session.user.id, postId } }
      });
      if (!savedPost) return false;
      await prisma.savedPost.delete({ where: { id: savedPost.id } });
      return true;
    },
    createComment: async (_: unknown, { postId, content }: { postId: string, content: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      const comment = await prisma.comment.create({
        data: {
          content,
          authorId: context.session.user.id,
          postId
        },
        include: { author: true, post: true }
      });

      // Create notification for post author
      if (comment.post.authorId !== context.session.user.id) {
        await prisma.notification.create({
          data: {
            type: "COMMENT",
            senderId: context.session.user.id,
            receiverId: comment.post.authorId,
            postId: postId
          }
        });
      }

      return comment;
    },
    followUser: async (_: unknown, { userId }: { userId: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      if (context.session.user.id === userId) throw new Error("Cannot follow yourself");
      await prisma.follows.create({
        data: {
          followerId: context.session.user.id,
          followingId: userId
        }
      });

      // Create notification for user being followed
      await prisma.notification.create({
        data: {
          type: "FOLLOW",
          senderId: context.session.user.id,
          receiverId: userId
        }
      });

      return true;
    },
    unfollowUser: async (_: unknown, { userId }: { userId: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: context.session.user.id,
            followingId: userId
          }
        }
      });
      return true;
    },
    updateProfile: async (_: unknown, args: { name?: string, username?: string, bio?: string, coverImage?: string, image?: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      
      const { name, username, bio, coverImage, image } = args;
      const data: Prisma.UserUpdateInput = {};
      if (name !== undefined) data.name = name;
      if (username !== undefined) data.username = username;
      if (bio !== undefined) data.bio = bio;
      if (coverImage !== undefined) data.coverImage = coverImage;
      if (image !== undefined) data.image = image;

      try {
        return await prisma.user.update({
          where: { id: context.session.user.id },
          data
        });
      } catch (err: unknown) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new Error("That username is already taken");
        }
        throw err;
      }
    },
    sendMessage: async (_: unknown, { receiverId, content }: { receiverId: string, content: string }, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      const senderId = context.session.user.id;
      
      return prisma.message.create({
        data: {
          content,
          senderId,
          receiverId
        },
        include: {
          sender: true,
          receiver: true
        }
      });
    },
    markNotificationsRead: async (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.session?.user?.id) throw new Error("Not authenticated");
      await prisma.notification.updateMany({
        where: { receiverId: context.session.user.id, read: false },
        data: { read: true }
      });
      return true;
    }
  },
  User: {
    followers: async (parent: User) => {
      const follows = await prisma.follows.findMany({
        where: { followingId: parent.id },
        include: { follower: true }
      });
      return follows.map(f => f.follower);
    },
    following: async (parent: User) => {
      const follows = await prisma.follows.findMany({
        where: { followerId: parent.id },
        include: { following: true }
      });
      return follows.map(f => f.following);
    },
    likes: async (parent: User) => {
      return prisma.like.findMany({
        where: { userId: parent.id },
        include: { post: true, user: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    comments: async (parent: User) => {
      return prisma.comment.findMany({
        where: { authorId: parent.id },
        include: { post: true, author: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    savedPosts: async (parent: User) => {
      return prisma.savedPost.findMany({
        where: { userId: parent.id },
        include: { post: true, user: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    stories: async (parent: User) => {
      const now = new Date();
      return prisma.story.findMany({
        where: { authorId: parent.id, expiresAt: { gt: now } },
        orderBy: { createdAt: 'desc' }
      });
    }
  },
  Story: {
    author: async (parent: Prisma.StoryGetPayload<{ include: { author: true, sharedPost: true } }>) => {
      if (parent.author) return parent.author;
      return prisma.user.findUnique({ where: { id: parent.authorId } });
    },
    sharedPost: async (parent: Prisma.StoryGetPayload<{ include: { author: true, sharedPost: true } }>) => {
      if (!parent.sharedPostId) return null;
      if (parent.sharedPost) return parent.sharedPost;
      return prisma.post.findUnique({ where: { id: parent.sharedPostId }, include: { author: true } });
    },
    viewers: async (parent: Story & { views?: { user: User }[] }) => {
      if (parent.views) return parent.views.map((v) => v.user);
      const views = await prisma.storyView.findMany({
        where: { storyId: parent.id },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });
      return views.map(v => v.user);
    }
  },
  Post: {
    author: async (parent: Prisma.PostGetPayload<{ include: { author: true, likes: true, comments: true, savedBy: true } }>) => {
      if (parent.author) return parent.author;
      return prisma.user.findUnique({ where: { id: parent.authorId } });
    },
    likes: async (parent: Prisma.PostGetPayload<{ include: { author: true, likes: true, comments: true, savedBy: true } }>) => {
      if (parent.likes) return parent.likes;
      return prisma.like.findMany({ where: { postId: parent.id }, include: { user: true } });
    },
    comments: async (parent: Prisma.PostGetPayload<{ include: { author: true, likes: true, comments: true, savedBy: true } }>) => {
      if (parent.comments) return parent.comments;
      return prisma.comment.findMany({ where: { postId: parent.id }, include: { author: true } });
    },
    savedBy: async (parent: Prisma.PostGetPayload<{ include: { author: true, likes: true, comments: true, savedBy: true } }>) => {
      if (parent.savedBy) return parent.savedBy;
      return prisma.savedPost.findMany({ where: { postId: parent.id }, include: { user: true } });
    }
  },
  Like: {
    user: async (parent: Prisma.LikeGetPayload<{ include: { user: true, post: true } }>) => {
      if (parent.user) return parent.user;
      return prisma.user.findUnique({ where: { id: parent.userId } });
    }
  },
  SavedPost: {
    user: async (parent: Prisma.SavedPostGetPayload<{ include: { user: true, post: true } }>) => {
      if (parent.user) return parent.user;
      return prisma.user.findUnique({ where: { id: parent.userId } });
    },
    post: async (parent: Prisma.SavedPostGetPayload<{ include: { user: true, post: true } }>) => {
      if (parent.post) return parent.post;
      return prisma.post.findUnique({ where: { id: parent.postId } });
    }
  }
};
