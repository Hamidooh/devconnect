import gql from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    name: String
    username: String
    bio: String
    coverImage: String
    createdAt: String
    email: String
    image: String
    posts: [Post!]!
    stories: [Story!]!
    followers: [User!]!
    following: [User!]!
    likes: [Like!]!
    comments: [Comment!]!
    savedPosts: [SavedPost!]!
  }

  type Story {
    id: ID!
    mediaUrl: String
    createdAt: String!
    expiresAt: String!
    author: User!
    sharedPost: Post
    viewers: [User!]!
  }

  type Post {
    id: ID!
    content: String!
    mediaUrl: String
    createdAt: String!
    author: User!
    likes: [Like!]!
    comments: [Comment!]!
    savedBy: [SavedPost!]!
  }

  type Comment {
    id: ID!
    content: String!
    createdAt: String!
    author: User!
    post: Post!
  }

  type Like {
    id: ID!
    user: User!
    post: Post!
  }

  type SavedPost {
    id: ID!
    user: User!
    post: Post!
  }

  type Message {
    id: ID!
    content: String!
    createdAt: String!
    sender: User!
    receiver: User!
  }

  type Notification {
    id: ID!
    type: String!
    read: Boolean!
    createdAt: String!
    sender: User!
    receiver: User!
    post: Post
  }

  type Query {
    me: User
    feed: [Post!]!
    explore: [Post!]!
    user(id: ID!): User
    post(id: ID!): Post
    getMessages(userId: ID!): [Message!]!
    searchUsers(query: String!): [User!]!
    searchPosts(query: String!): [Post!]!
    getNotifications: [Notification!]!
    getStories: [Story!]!
  }

  type Mutation {
    createPost(content: String!, mediaUrl: String): Post!
    createStory(mediaUrl: String, sharedPostId: ID): Story!
    deleteStory(id: ID!): Boolean!
    likePost(postId: ID!): Like!
    unlikePost(postId: ID!): Boolean!
    viewStory(storyId: ID!): Boolean!
    savePost(postId: ID!): SavedPost!
    unsavePost(postId: ID!): Boolean!
    createComment(postId: ID!, content: String!): Comment!
    followUser(userId: ID!): Boolean!
    unfollowUser(userId: ID!): Boolean!
    updateProfile(name: String, username: String, bio: String, coverImage: String, image: String): User!
    sendMessage(receiverId: ID!, content: String!): Message!
    markNotificationsRead: Boolean!
  }
`;
