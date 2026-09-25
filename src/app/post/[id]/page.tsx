"use client";

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

type PostType = Prisma.PostGetPayload<{
  include: {
    author: true;
    likes: { include: { user: true } };
    comments: { include: { author: true } };
    savedBy: { include: { user: true } };
  }
}>;

const GET_POST = gql`
  query GetPostForDetail($id: ID!) {
    post(id: $id) {
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
          name
          username
          image
          bio
        }
      }
      comments {
        id
        content
        createdAt
        author {
          id
          name
          username
          image
        }
      }
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($postId: ID!, $content: String!) {
    createComment(postId: $postId, content: $content) {
      id
      content
      createdAt
      author {
        id
        name
        username
        image
      }
    }
  }
`;

export default function PostDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [content, setContent] = useState("");

  const { data, loading, error } = useQuery<{ post: PostType }>(GET_POST, {
    variables: { id: id || "" },
    skip: !id
  });

  const [createComment] = useMutation<{ createComment: any }>(CREATE_COMMENT, {
    update(cache, { data }) {
      const newComment = data?.createComment;
      if (!newComment) return;
      
      const existingData = cache.readQuery<{ post: PostType }>({ 
        query: GET_POST, 
        variables: { id } 
      });
      
      if (existingData && existingData.post) {
        cache.writeQuery({
          query: GET_POST,
          variables: { id },
          data: {
            post: {
              ...existingData.post,
              comments: [...existingData.post.comments, newComment]
            }
          }
        });
      }
    }
  });

  const handleReply = async () => {
    if (!content.trim()) return;
    try {
      await createComment({ variables: { postId: id, content } });
      setContent("");
    } catch (err) {
      console.error(err);
    }
  };

  const post = data?.post as PostType | undefined;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: 0 }}>
        <div className="connect-header" style={{ borderBottom: '1px solid hsl(var(--border-subtle))', position: 'sticky', top: 0, zIndex: 10, background: 'hsl(var(--bg-primary))' }}>
          <button className="back-btn" onClick={() => router.back()}>←</button>
          <h1 className="profile-name" style={{fontSize: '20px', margin: 0}}>Post</h1>
        </div>

        {loading && <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>Loading post...</div>}
        {error && <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>Error: {error.message}</div>}
        
        {post && (
          <div>
            <div style={{ padding: '20px 20px 0 20px' }}>
              <PostCard post={post} />
            </div>

            <div className="compose-box" style={{ margin: '0 20px', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '16px 0', background: 'transparent' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="avatar" style={{ width: '40px', height: '40px', flexShrink: 0 }}>
                  <img src={session?.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (session?.user?.name || session?.user?.id)} alt="Your Avatar" />
                </div>
                <div style={{ flex: 1 }}>
                  <textarea 
                    placeholder="Post your reply" 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ minHeight: '60px' }}
                  />
                  <div className="compose-actions" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <button 
                      className="btn-primary" 
                      onClick={handleReply}
                      disabled={!content.trim()}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '0 20px', paddingBottom: '40px' }}>
              {post.comments?.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.id} style={{ borderBottom: '1px solid hsl(var(--border-subtle))', padding: '16px 0' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <Link href={`/profile/${comment.author.id}`} style={{ textDecoration: 'none' }}>
                        <div className="avatar" style={{ width: '40px', height: '40px' }}>
                          <img src={comment.author.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (comment.author.name || comment.author.id)} alt="Avatar" />
                        </div>
                      </Link>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Link href={`/profile/${comment.author.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <span style={{ fontWeight: 'bold' }}>{comment.author.name || "Anonymous"}</span>
                          </Link>
                          <span style={{ color: 'hsl(var(--text-muted))' }}>@{comment.author.username || comment.author.id.slice(0,8)}</span>
                        </div>
                        <div>{comment.content}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", color: "hsl(var(--text-muted))", padding: "40px 0" }}>
                  No replies yet.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
