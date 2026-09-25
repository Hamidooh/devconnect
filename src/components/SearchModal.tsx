"use client";

import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
import PostCard from "./PostCard";
import type { Prisma, User } from "@prisma/client";

type PostType = Prisma.PostGetPayload<{
  include: {
    author: true;
    likes: { include: { user: true } };
    comments: { include: { author: true } };
    savedBy: { include: { user: true } };
  }
}>;

const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      name
      username
      image
      bio
    }
  }
`;

const SEARCH_POSTS = gql`
  query SearchPosts($query: String!) {
    searchPosts(query: $query) {
      id
      content
      createdAt
      author {
        id
        name
        username
        image
      }
      likes {
        user {
          id
        }
      }
      comments {
        id
      }
    }
  }
`;

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");

  const { data: usersData, loading: usersLoading } = useQuery<{ searchUsers: User[] }>(SEARCH_USERS, {
    variables: { query },
    skip: query.trim().length < 2,
  });

  const { data: postsData, loading: postsLoading } = useQuery<{ searchPosts: PostType[] }>(SEARCH_POSTS, {
    variables: { query },
    skip: query.trim().length < 2,
  });

  if (!isOpen) return null;

  const users: User[] = usersData?.searchUsers || [];
  const posts: PostType[] = postsData?.searchPosts || [];
  const isLoading = usersLoading || postsLoading;
  const hasResults = users.length > 0 || posts.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, display: 'flex', justifyContent: 'center' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '600px', width: '100%', top: '5%', minHeight: '400px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header & Input */}
        <div className="modal-header" style={{ marginBottom: '20px', borderBottom: '1px solid hsl(var(--border-subtle))', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20" fill="currentColor" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}>
                <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="2"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"></line>
              </svg>
              <input 
                type="text" 
                placeholder="Search accounts and content..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'hsl(var(--bg-secondary))',
                  border: 'none',
                  color: 'hsl(var(--text))',
                  fontSize: '16px',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '24px',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>
            <button className="close-btn" onClick={onClose} style={{ top: 'auto', position: 'static' }}>&times;</button>
          </div>
        </div>
        
        {/* Results Area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {query.trim().length < 2 ? (
            <div style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', padding: '40px' }}>
              Enter at least 2 characters to search
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', padding: '40px' }}>
              Searching...
            </div>
          ) : !hasResults ? (
            <div style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', padding: '40px' }}>
              No results found for "{query}"
            </div>
          ) : (
            <div>
              {/* Accounts Section */}
              {users.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '12px', padding: '0 8px' }}>Accounts</h3>
                  {users.map((user: User) => (
                    <Link key={user.id} href={`/profile/${user.id}`} onClick={onClose} style={{ textDecoration: 'none' }}>
                      <div className="contact-item" style={{ 
                        padding: '12px 16px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '16px',
                        cursor: 'pointer',
                        borderRadius: '12px',
                        transition: 'background-color 0.2s',
                        marginBottom: '4px'
                      }}>
                        <img 
                          src={user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user.name || user.id)} 
                          alt="Avatar" 
                          style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color: 'hsl(var(--text))', fontSize: '16px' }}>{user.name || "Anonymous"}</div>
                          <div style={{ color: 'hsl(var(--text-muted))', fontSize: '14px' }}>@{user.username || user.id.slice(0,8)}</div>
                          {user.bio && <div style={{ color: 'hsl(var(--text))', fontSize: '14px', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{user.bio}</div>}
                        </div>
                        <button className="btn-outline" style={{ pointerEvents: 'none' }}>View</button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Posts Section */}
              {posts.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '18px', marginBottom: '12px', padding: '0 8px', borderTop: users.length > 0 ? '1px solid hsl(var(--border-subtle))' : 'none', paddingTop: users.length > 0 ? '24px' : '0' }}>Content</h3>
                  {posts.map((post: PostType) => (
                    <div key={post.id} onClick={onClose}>
                      <PostCard post={post} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
