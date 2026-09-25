"use client";

import Sidebar from "@/components/Sidebar";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import ExploreFeedModal from "@/components/ExploreFeedModal";
import type { Prisma } from "@prisma/client";

type PostType = Prisma.PostGetPayload<{
  include: {
    author: true;
    likes: { include: { user: true } };
    comments: { include: { author: true } };
    savedBy: { include: { user: true } };
  }
}>;

const EXPLORE_QUERY = gql`
  query Explore {
    explore {
      id
      content
      mediaUrl
      createdAt
      author {
        id
        name
        image
        username
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

export default function ExplorePage() {
  const { data: session } = useSession();
  const { data, loading, error } = useQuery<{ explore: PostType[] }>(EXPLORE_QUERY, {
    skip: !session,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const posts: PostType[] = data?.explore || [];

  const handlePostClick = (index: number) => {
    setSelectedIndex(index);
    setModalOpen(true);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="feed-header" style={{ padding: '0 20px' }}>
          <h1>Explore</h1>
        </div>
        
        {!session && (
          <div style={{ textAlign: "center", color: "hsl(var(--text-muted))", padding: "40px 0" }}>
            Please log in to see personalized recommendations.
          </div>
        )}

        {loading && <p style={{ color: "hsl(var(--text-muted))", padding: '0 20px' }}>Loading explore feed...</p>}
        {error && <p style={{ color: "red", padding: '0 20px' }}>Error loading explore feed: {error.message}</p>}
        
        {session && !loading && posts.length === 0 && (
          <div style={{ textAlign: "center", color: "hsl(var(--text-muted))", padding: "40px 0" }}>
            No posts found to explore right now. Check back later!
          </div>
        )}

        {posts.length > 0 && (
          <div className="explore-grid">
            {posts.map((post: PostType, index: number) => (
              <div 
                key={post.id} 
                className="explore-item" 
                onClick={() => handlePostClick(index)}
              >
                {post.mediaUrl ? (
                  <img src={post.mediaUrl} alt="Post content" />
                ) : (
                  <div className="explore-item-text">
                    {post.content.length > 100 
                      ? post.content.substring(0, 100) + '...' 
                      : post.content}
                  </div>
                )}
                <div className="explore-overlay">
                  <div className="explore-overlay-stats">
                    <span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      {post.likes?.length || 0}
                    </span>
                    <span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                      {post.comments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <ExploreFeedModal 
          posts={posts} 
          initialIndex={selectedIndex} 
          onClose={() => setModalOpen(false)} 
        />
      )}
    </div>
  );
}
