"use client";

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";
import EditProfileModal from "@/components/EditProfileModal";
import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import PostCard from "@/components/PostCard";

type PostType = Prisma.PostGetPayload<{
  include: {
    author: true;
    likes: { include: { user: true } };
    comments: { include: { author: true } };
    savedBy: { include: { user: true } };
  }
}>;

type ProfileUserType = Omit<Prisma.UserGetPayload<{
  include: {
    posts: { include: { author: true; likes: { include: { user: true } }; comments: { include: { author: true } }; savedBy: { include: { user: true } } } };
    comments: { include: { post: { include: { author: true; likes: { include: { user: true } }; comments: { include: { author: true } }; savedBy: { include: { user: true } } } } } };
    likes: { include: { post: { include: { author: true; likes: { include: { user: true } }; comments: { include: { author: true } }; savedBy: { include: { user: true } } } } } };
  }
}>, 'followers' | 'following'> & {
  followers: Prisma.UserGetPayload<{}>[];
  following: Prisma.UserGetPayload<{}>[];
};

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      username
      image
      coverImage
      bio
      createdAt
      posts {
        id
        content
        mediaUrl
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
        }
        savedBy {
          user {
            id
          }
        }
      }
      comments {
        id
        content
        createdAt
        post {
          id
          content
          mediaUrl
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
      likes {
        id
        post {
          id
          content
          mediaUrl
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
      followers {
        id
        name
        username
        image
        bio
      }
      following {
        id
        name
        username
        image
        bio
      }
    }
  }
`;

const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId)
  }
`;

const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId)
  }
`;

export default function UserProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: session } = useSession();
  const { data, loading, error } = useQuery<any>(GET_USER, {
    variables: { id: id || "" },
    skip: !id,
    fetchPolicy: "cache-and-network"
  });
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'profile' | 'followers' | 'following'>('profile');
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAboutModalOpen, setAboutModalOpen] = useState(false);

  const [followUser] = useMutation(FOLLOW_USER, {
    refetchQueries: [{ query: GET_USER, variables: { id: id || "" } }, "GetMe"]
  });
  
  const [unfollowUser] = useMutation(UNFOLLOW_USER, {
    refetchQueries: [{ query: GET_USER, variables: { id: id || "" } }, "GetMe"]
  });

  const isOwnProfile = session?.user?.id === id;
  const isFollowing = data?.user?.followers?.some((f: { id: string }) => f.id === session?.user?.id);

  if (loading && !data?.user) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ padding: 0 }}>
          <div className="connect-header" style={{ borderBottom: '1px solid hsl(var(--border-subtle))', position: 'sticky', top: 0, zIndex: 10, background: 'hsl(var(--bg-primary))', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div className="skeleton" style={{ width: '140px', height: '22px', borderRadius: '4px', marginBottom: '6px' }}></div>
              <div className="skeleton" style={{ width: '60px', height: '14px', borderRadius: '4px' }}></div>
            </div>
          </div>
          <div className="profile-cover skeleton" style={{ width: '100%', height: '200px', borderRadius: 0 }}></div>
          <div className="profile-header" style={{ padding: '0 20px', position: 'relative' }}>
            <div className="profile-avatar-container" style={{ marginTop: '-60px', marginBottom: '16px' }}>
              <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid hsl(var(--bg-primary))' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div className="skeleton" style={{ width: '180px', height: '24px', borderRadius: '6px' }}></div>
              <div className="skeleton" style={{ width: '100px', height: '16px', borderRadius: '4px' }}></div>
              <div className="skeleton" style={{ width: '280px', height: '16px', borderRadius: '4px', marginTop: '6px' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div className="skeleton" style={{ width: '80px', height: '18px', borderRadius: '4px' }}></div>
              <div className="skeleton" style={{ width: '80px', height: '18px', borderRadius: '4px' }}></div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid hsl(var(--border-subtle))', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: '16px' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '140px', borderRadius: '16px' }}></div>
          </div>
        </main>
      </div>
    );
  }

  if (error) return <div className="container">Error loading profile: {error.message}</div>;

  const user = data?.user as ProfileUserType | undefined;

  if (!user) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content" style={{paddingTop: '100px'}}>
          <h2>User not found</h2>
        </div>
      </div>
    );
  }

  const joinDate = user.createdAt ? new Date(user.createdAt as unknown as string | number).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently";

  return (
    <div className="app-layout">
      <Sidebar />
      {viewMode === 'profile' ? (
        <main className="main-content" style={{ padding: 0 }}>
          <div className="profile-cover">
            {user.coverImage ? (
              <img src={user.coverImage} alt="Cover" />
            ) : (
              <div style={{width: '100%', height: '100%', background: 'var(--bg-tertiary)'}}></div>
            )}
          </div>
          
          <div className="profile-header">
            <div style={{ position: 'relative', width: 'fit-content' }}>
              <div className="profile-avatar-container">
                {user.image ? (
                  <img src={user.image} alt="Avatar" />
                ) : (
                  <div style={{width: '100%', height: '100%', background: 'var(--bg-tertiary)'}}></div>
                )}
              </div>
              
              {!isOwnProfile && (
                <Link href={`/messages/${id}`} style={{ position: 'absolute', right: '-56px', bottom: '10px' }}>
                  <button className="btn-outline" style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--bg-primary))' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </button>
                </Link>
              )}
            </div>
            
            <div className="profile-actions">
              {isOwnProfile ? (
                <button className="btn-outline" onClick={() => setEditModalOpen(true)}>
                  Edit profile
                </button>
              ) : (
                <button 
                  className={isFollowing ? "btn-outline" : "btn-primary"} 
                    onClick={() => {
                      if (isFollowing) {
                        unfollowUser({ variables: { userId: id } });
                      } else {
                        followUser({ variables: { userId: id } });
                      }
                    }}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
              )}
            </div>
            
            <div className="profile-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                <h1 className="profile-name" style={{ margin: 0 }}>{user.name || "Anonymous"}</h1>
                
                {!isOwnProfile && (
                  <>
                    <button 
                      className="dots-btn" 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid hsl(var(--border))', 
                        color: 'hsl(var(--text))', 
                        borderRadius: '50%', 
                        width: '32px', 
                        height: '32px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        fontSize: '18px',
                        paddingBottom: '8px'
                      }}
                    >
                      ...
                    </button>

                    {isDropdownOpen && (
                      <div style={{
                        position: 'absolute',
                        top: '40px',
                        left: '0',
                        background: 'hsl(var(--bg-secondary))',
                        border: '1px solid hsl(var(--border-subtle))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        zIndex: 100,
                        minWidth: '200px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        <button style={{ padding: '16px', background: 'transparent', border: 'none', color: '#ff4d4d', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>
                          Block
                        </button>
                        <button style={{ padding: '16px', background: 'transparent', border: 'none', color: '#ff4d4d', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>
                          Restrict
                        </button>
                        <button style={{ padding: '16px', background: 'transparent', border: 'none', color: '#ff4d4d', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>
                          Report
                        </button>
                        <button style={{ padding: '16px', background: 'transparent', border: 'none', color: 'hsl(var(--text))', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}>
                          Share to...
                        </button>
                        <button 
                          onClick={() => { setIsDropdownOpen(false); setAboutModalOpen(true); }}
                          style={{ padding: '16px', background: 'transparent', border: 'none', color: 'hsl(var(--text))', textAlign: 'left', cursor: 'pointer', fontSize: '15px' }}
                        >
                          About this account
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="profile-handle">@{user.username || user.id.slice(0,8)}</div>
              
              {user.bio && (
                <div className="profile-bio">
                  {user.bio}
                </div>
              )}
              
              <div className="profile-stats">
                <div onClick={() => setViewMode('following')} style={{cursor: 'pointer'}}><span className="stat-value">{user.following?.length || 0}</span> <span className="stat-label">Following</span></div>
                <div onClick={() => setViewMode('followers')} style={{cursor: 'pointer'}}><span className="stat-value">{user.followers?.length || 0}</span> <span className="stat-label">Followers</span></div>
              </div>
            </div>
          </div>
          
          <div className="profile-tabs">
            <div className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')} style={{cursor: 'pointer'}}>Posts</div>
            <div className={`profile-tab ${activeTab === 'replies' ? 'active' : ''}`} onClick={() => setActiveTab('replies')} style={{cursor: 'pointer'}}>Replies</div>
            <div className={`profile-tab ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')} style={{cursor: 'pointer'}}>Media</div>
            <div className={`profile-tab ${activeTab === 'likes' ? 'active' : ''}`} onClick={() => setActiveTab('likes')} style={{cursor: 'pointer'}}>Likes</div>
          </div>

          <div className="profile-posts-container" style={{ padding: '0 20px', paddingBottom: '40px' }}>
            {activeTab === 'posts' && (
              user.posts && user.posts.length > 0 ? (
                user.posts.map((post: PostType) => (
                  <PostCard key={post.id} post={post} />
                ))
              ) : (
                <div style={{ textAlign: "center", color: "hsl(var(--text-muted))", padding: "40px 0" }}>
                  No posts yet.
                </div>
              )
            )}
            
            {activeTab === 'replies' && (
              user.comments && user.comments.length > 0 ? (
                user.comments.map((comment) => (
                  <div key={comment.id} style={{ borderBottom: '1px solid hsl(var(--border-subtle))', padding: '16px 0' }}>
                    <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginBottom: '8px' }}>
                      Replying to @{comment.post?.author?.username || comment.post?.author?.id?.slice(0,8)}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div className="avatar" style={{ width: '40px', height: '40px' }}>
                        <img src={user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user.name || user.id)} alt="Avatar" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold' }}>{user.name || "Anonymous"}</span>
                          <span style={{ color: 'hsl(var(--text-muted))' }}>@{user.username || user.id.slice(0,8)}</span>
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
              )
            )}

            {activeTab === 'media' && (
              <div style={{ textAlign: "center", color: "hsl(var(--text-muted))", padding: "40px 0" }}>
                When i post photos or videos, they will show up here.
              </div>
            )}

            {activeTab === 'likes' && (
              user.likes && user.likes.length > 0 ? (
                user.likes.map((like) => (
                  like.post ? <PostCard key={like.id} post={like.post} /> : null
                ))
              ) : (
                <div style={{ textAlign: "center", color: "hsl(var(--text-muted))", padding: "40px 0" }}>
                  show what i've liked
                </div>
              )
            )}
          </div>
        </main>
      ) : (
        <main className="main-content" style={{ padding: 0 }}>
          <div className="connect-header">
            <button className="back-btn" onClick={() => setViewMode('profile')}>←</button>
            <div>
              <h1 className="profile-name" style={{fontSize: '20px', margin: 0}}>{user.name || "Anonymous"}</h1>
              <div className="profile-handle" style={{fontSize: '13px', margin: 0}}>@{user.username || user.id.slice(0,8)}</div>
            </div>
          </div>
          <div className="profile-tabs">
            <div className={`profile-tab ${viewMode === 'followers' ? 'active' : ''}`} onClick={() => setViewMode('followers')}>Followers</div>
            <div className={`profile-tab ${viewMode === 'following' ? 'active' : ''}`} onClick={() => setViewMode('following')}>Following</div>
          </div>

          <div className="connect-list">
            {(viewMode === 'followers' ? user.followers : user.following)?.length === 0 ? (
              <div className="empty-connect-state" style={{padding: '40px 20px'}}>
                <h2 style={{fontSize: '32px', marginBottom: '12px'}}>Looking for {viewMode === 'followers' ? 'followers' : 'people to follow'}?</h2>
                <p style={{color: 'hsl(var(--text-muted))', fontSize: '15px', lineHeight: 1.5}}>
                  {viewMode === 'followers' 
                    ? "When someone follows this account, they'll show up here. Posting and interacting with others helps boost followers."
                    : "When you follow someone, they'll show up here."}
                </p>
              </div>
            ) : (
              (viewMode === 'followers' ? user.followers : user.following)?.map((u) => (
                <Link key={u.id} href={`/profile/${u.id}`} style={{ textDecoration: 'none' }}>
                  <div className="connect-user-item">
                    <div className="avatar">
                      <img src={u.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (u.name || u.id)} alt="Avatar" />
                    </div>
                    <div className="connect-user-info">
                      <div className="connect-user-name" style={{ color: 'hsl(var(--text))' }}>{u.name || "Anonymous"}</div>
                      <div className="connect-user-handle">@{u.username || u.id.slice(0,8)}</div>
                      {u.bio && <div className="connect-user-bio" style={{ color: 'hsl(var(--text))' }}>{u.bio}</div>}
                    </div>
                    <button className="btn-outline" style={{marginLeft: 'auto'}}>View</button>
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      )}

      {isAboutModalOpen && (
        <div className="modal-overlay" onClick={() => setAboutModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 style={{margin: 0}}>About this account</h2>
              <button className="close-btn" onClick={() => setAboutModalOpen(false)}>&times;</button>
            </div>
            <div style={{ marginTop: '20px', padding: '16px', background: '#0a0a0a', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>📅</span>
              <span style={{ fontSize: '16px', fontWeight: '500', color: 'hsl(var(--text-muted))' }}>Joined {joinDate}</span>
            </div>
          </div>
        </div>
      )}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
        user={user}
      />
    </div>
  );
}
