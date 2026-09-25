"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";

const GET_FEED = gql`
  query GetFeed {
    feed {
      id
      content
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
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($content: String!) {
    createPost(content: $content) {
      id
      content
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
    }
  }
`;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  
  const [createPost, { loading }] = useMutation<{ createPost: any }>(CREATE_POST, {
    update(cache, { data }) {
      const createPost = data?.createPost;
      if (!createPost) return;
      try {
        const existingFeed = cache.readQuery<{ feed: any[] }>({ query: GET_FEED });
        if (existingFeed) {
          cache.writeQuery({
            query: GET_FEED,
            data: { feed: [createPost, ...existingFeed.feed] },
          });
        }
      } catch (e) {
        // Query might not be in cache yet
      }
    },
    onCompleted: () => {
      setContent("");
      onClose();
    }
  });

  if (!isOpen) return null;

  const handlePost = async () => {
    if (!content.trim() || loading) return;
    try {
      await createPost({ variables: { content } });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '600px', top: '5%' }}>
        <div className="modal-header" style={{ marginBottom: '16px' }}>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="avatar" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
            <img 
              src={session?.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (session?.user?.name || "User")} 
              alt="Your Avatar" 
            />
          </div>
          <div style={{ flex: 1 }}>
            <textarea 
              placeholder="What's on your mind? Share a code snippet or thought..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: '100%',
                minHeight: '120px',
                background: 'transparent',
                border: 'none',
                color: 'var(--foreground)',
                fontSize: '18px',
                resize: 'none',
                outline: 'none',
                padding: '8px 0'
              }}
            />
            
            <div style={{ borderTop: '1px solid hsl(var(--border-subtle))', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div></div> {/* Placeholder for media buttons in the future */}
              <button 
                className="btn-primary" 
                onClick={handlePost} 
                disabled={!content.trim() || loading}
                style={{
                  opacity: (!content.trim() || loading) ? 0.5 : 1,
                  padding: '10px 24px',
                  fontSize: '16px'
                }}
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
