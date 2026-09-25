"use client";

import Sidebar from "@/components/Sidebar";
import PostCard from "@/components/PostCard";
import CreateStoryModal from "@/components/CreateStoryModal";
import StoryViewerModal from "@/components/StoryViewerModal";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import type { Prisma, User } from "@prisma/client";

type PostType = Prisma.PostGetPayload<{
  include: {
    author: true;
    likes: { include: { user: true } };
    comments: { include: { author: true } };
    savedBy: { include: { user: true } };
  }
}>;

type StoryType = Prisma.StoryGetPayload<{
  include: {
    author: true;
    sharedPost: { include: { author: true } };
  }
}> & { viewers?: User[] };

const GET_FEED = gql`
  query GetFeed {
    feed {
      id
      content
      mediaUrl
      createdAt
      author {
        id
        name
        image
      }
      likes {
        user {
          id
          name
          username
          image
          bio
        }
      }
      comments {
        id
      }
      savedBy {
        user {
          id
        }
      }
    }
  }
`;

const GET_STORIES = gql`
  query GetStories {
    getStories {
      id
      mediaUrl
      createdAt
      expiresAt
      author {
        id
        name
        image
      }
      sharedPost {
        id
        content
        mediaUrl
        author {
          name
          image
        }
      }
      viewers {
        id
        name
        image
      }
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($content: String!, $mediaUrl: String) {
    createPost(content: $content, mediaUrl: $mediaUrl) {
      id
      content
      mediaUrl
      createdAt
      author {
        id
        name
        image
      }
      likes {
        user {
          id
          name
          username
          image
          bio
        }
      }
      comments {
        id
      }
      savedBy {
        user {
          id
        }
      }
    }
  }
`;

export default function Home() {
  const { data: session } = useSession();
  const { data, loading, error } = useQuery<{ feed: PostType[] }>(GET_FEED);
  const { data: storiesData } = useQuery<{ getStories: StoryType[] }>(GET_STORIES);
  
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState<StoryType | null>(null);
  
  const stories: StoryType[] = storiesData?.getStories || [];
  const feed: PostType[] = data?.feed || [];

  // Group stories by author
  const storiesByAuthor = stories.reduce((acc: Record<string, { author: User, stories: StoryType[] }>, story) => {
    if (!acc[story.author.id]) {
      acc[story.author.id] = {
        author: story.author,
        stories: []
      };
    }
    acc[story.author.id].stories.push(story);
    return acc;
  }, {});

  const groupedStories = Object.values(storiesByAuthor);
  const [createPost] = useMutation<{ createPost: PostType }>(CREATE_POST, {
    update(cache, { data }) {
      const createdPost = data?.createPost;
      if (!createdPost) return;
      const existingFeed = cache.readQuery<{ feed: PostType[] }>({ query: GET_FEED });
      if (existingFeed) {
        cache.writeQuery({
          query: GET_FEED,
          data: { feed: [createdPost, ...existingFeed.feed] },
        });
      }
    }
  });
  
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePost = async () => {
    if (!content.trim() && !selectedFile) return;
    try {
      setUploading(true);
      let mediaUrl = undefined;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const result = await res.json();
          mediaUrl = result.url;
        } else {
          console.error("Upload failed");
        }
      }

      await createPost({ variables: { content, mediaUrl } });
      setContent("");
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="feed-header" style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px' }}>Developer Stories</h1>
        </div>

        <div className="stories-container">
          {session && (
            <div className="story-item" onClick={() => setIsCreateStoryOpen(true)}>
              <div className="story-avatar-wrapper" style={{ background: 'hsl(var(--border-subtle))' }}>
                <div className="story-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'hsl(var(--text-muted))' }}>
                  +
                </div>
              </div>
              <span className="story-name">Add Story</span>
            </div>
          )}
          {groupedStories.map((group) => {
            const hasUnviewedStories = session?.user?.id
              ? group.stories.some((story) => !story.viewers?.some((v) => v.id === session?.user?.id))
              : true;

            return (
              <div key={group.author.id} className="story-item" onClick={() => setViewingStory(group.stories[0])}>
                <div 
                  className="story-avatar-wrapper"
                  style={!hasUnviewedStories ? { background: 'hsl(var(--border-subtle))' } : {}}
                >
                  <div className="story-avatar">
                    <img src={group.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${group.author.name}`} alt={group.author.name || ""} />
                  </div>
                </div>
                <span className="story-name">{group.author.name?.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
        
        {session && (
          <div className="compose-box">
            <textarea
              placeholder="What's on your mind? Share a code snippet or thought..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="compose-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label className="action-btn" style={{ cursor: 'pointer', margin: 0 }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    hidden 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }} 
                  />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </label>
                {selectedFile && <span style={{ fontSize: '14px', color: 'hsl(var(--text-muted))' }}>{selectedFile.name}</span>}
              </div>
              <button 
                className="btn-primary" 
                onClick={handlePost}
                disabled={(!content.trim() && !selectedFile) || uploading}
              >
                {uploading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        )}

        {loading && <p style={{ color: "hsl(var(--text-muted))" }}>Loading feed...</p>}
        {error && <p style={{ color: "red" }}>Error loading feed: {error.message}</p>}
        
        <div className="instagram-feed">
          {feed.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        
        {!loading && feed.length === 0 && (
          <div style={{ textAlign: "center", color: "hsl(var(--text-muted))", padding: "40px 0" }}>
            No posts yet. Be the first to share something!
          </div>
        )}
      </main>

      <CreateStoryModal isOpen={isCreateStoryOpen} onClose={() => setIsCreateStoryOpen(false)} />
      <StoryViewerModal story={viewingStory} isOpen={!!viewingStory} onClose={() => setViewingStory(null)} />
    </div>
  );
}
