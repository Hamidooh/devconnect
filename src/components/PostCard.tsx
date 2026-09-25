"use client";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      id
    }
  }
`;

const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId)
  }
`;

const SAVE_POST = gql`
  mutation SavePost($postId: ID!) {
    savePost(postId: $postId) {
      id
    }
  }
`;

const UNSAVE_POST = gql`
  mutation UnsavePost($postId: ID!) {
    unsavePost(postId: $postId)
  }
`;

const CREATE_STORY = gql`
  mutation CreateStory($sharedPostId: ID) {
    createStory(sharedPostId: $sharedPostId) {
      id
    }
  }
`;

type PostType = Prisma.PostGetPayload<{
  include: {
    author: true;
    likes: { include: { user: true } };
    comments: { include: { author: true } };
    savedBy: { include: { user: true } };
  }
}>;

export default function PostCard({ post }: { post: PostType }) {
  const { data: session } = useSession();
  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);
  const [savePostMutation] = useMutation(SAVE_POST);
  const [unsavePostMutation] = useMutation(UNSAVE_POST);
  
  const hasLiked = post.likes?.some((like) => like.user?.id === session?.user?.id);
  const hasSaved = post.savedBy?.some((save) => save.user?.id === session?.user?.id);
  const [liked, setLiked] = useState(hasLiked);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [saved, setSaved] = useState(hasSaved || false);

  const [createStory, { loading: sharing }] = useMutation(CREATE_STORY, {
    refetchQueries: ["GetStories"],
    onCompleted: () => {
      alert("Shared to your story!");
    }
  });

  const handleShareToStory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return;
    createStory({ variables: { sharedPostId: post.id } });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleLike = async () => {
    if (!session) return;
    try {
      if (liked) {
        await unlikePost({ variables: { postId: post.id } });
        setLiked(false);
        setLikesCount(likesCount - 1);
      } else {
        await likePost({ variables: { postId: post.id } });
        setLiked(true);
        setLikesCount(likesCount + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) return;
    try {
      if (saved) {
        await unsavePostMutation({ variables: { postId: post.id } });
        setSaved(false);
      } else {
        await savePostMutation({ variables: { postId: post.id } });
        setSaved(true);
      }
    } catch (err) {
      console.error("Error saving post:", err);
    }
  };

  return (
    <div className="card">
      <div className="post-header" style={{ padding: '16px 16px 0', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
        <Link href={`/profile/${post.author.id}`} style={{ textDecoration: 'none', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="avatar">
            <img src={post.author.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + post.author.name} alt="Avatar" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="post-author" style={{ color: 'hsl(var(--text-primary))' }}>{post.author.name || "Anonymous"}</div>
              <span style={{ color: 'hsl(var(--text-muted))', fontSize: '14px' }}>| Senior Dev</span>
            </div>
            <div className="post-time">{new Date(Number(post.createdAt)).toLocaleString()}</div>
          </div>
        </Link>
        <button className="action-btn" style={{ marginLeft: 'auto' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="19" cy="12" r="1"></circle>
            <circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
      </div>

      {post.mediaUrl && (
        <div style={{ width: '100%', backgroundColor: 'hsl(var(--bg-tertiary))' }}>
          <img src={post.mediaUrl} alt="Post Attachment" style={{ width: '100%', display: 'block', maxHeight: '500px', objectFit: 'cover' }} />
        </div>
      )}

      <div style={{ padding: '16px' }}>
        <div className="post-content" style={{ marginBottom: '16px', color: 'hsl(var(--text-primary))', fontSize: '15px' }}>
          {post.content}
        </div>
        
        <div className="post-actions" style={{ borderTop: 'none', paddingTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              className="action-btn"
              style={{ color: liked ? "hsl(var(--accent-primary))" : undefined }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" onClick={handleLike}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <Link href={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
              <button className="action-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </button>
            </Link>
            <button className="action-btn" onClick={handleShareToStory} disabled={sharing} title="Add to Story" style={{ color: sharing ? "hsl(var(--accent-primary))" : undefined }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
            <button className="action-btn" onClick={handleShare} title="Copy Link">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', fontWeight: '500', display: 'flex', gap: '8px' }}>
              <span 
                onClick={(e) => { 
                  e.preventDefault();
                  e.stopPropagation();
                  if (likesCount > 0) setShowLikesModal(true); 
                }}
                style={{ cursor: likesCount > 0 ? 'pointer' : 'default' }}
              >
                {likesCount} Likes
              </span>
              <span>{post.comments?.length || 0} Comments</span>
            </div>
            
            <button 
              className="action-btn"
              style={{ color: saved ? "hsl(var(--accent-primary))" : undefined }}
              onClick={handleSave}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showLikesModal && (
        <div className="modal-overlay" onClick={() => setShowLikesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 style={{margin: 0}}>Liked by</h2>
              <button className="close-btn" onClick={() => setShowLikesModal(false)}>&times;</button>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {post.likes?.map((like, index) => (
                <Link key={like.user?.id || index} href={`/profile/${like.user?.id}`} style={{ textDecoration: 'none' }} onClick={() => setShowLikesModal(false)}>
                  <div className="connect-user-item" style={{ border: 'none', padding: 0 }}>
                    <div className="avatar" style={{ width: '40px', height: '40px' }}>
                      <img src={like.user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (like.user.name || like.user.id)} alt="Avatar" />
                    </div>
                    <div className="connect-user-info">
                      <div className="connect-user-name" style={{ color: 'hsl(var(--text))', fontSize: '15px' }}>{like.user.name || "Anonymous"}</div>
                      <div className="connect-user-handle" style={{ fontSize: '13px' }}>@{like.user.username || like.user.id.slice(0,8)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
