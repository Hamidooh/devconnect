"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import type { Prisma, User } from "@prisma/client";

type StoryType = Prisma.StoryGetPayload<{
  include: {
    author: true;
    sharedPost: { include: { author: true } };
  }
}> & { viewers?: User[] };

const VIEW_STORY = gql`
  mutation ViewStory($storyId: ID!) {
    viewStory(storyId: $storyId)
  }
`;

export default function StoryViewerModal({ story, isOpen, onClose }: { story: StoryType | null, isOpen: boolean, onClose: () => void }) {
  const { data: session } = useSession();
  const [viewStory] = useMutation(VIEW_STORY, {
    refetchQueries: ["GetStories"]
  });
  const [showViewers, setShowViewers] = useState(false);

  useEffect(() => {
    if (isOpen && story && session?.user && session.user.id !== story.author.id) {
      viewStory({ variables: { storyId: story.id } }).catch(console.error);
    }
    setShowViewers(false);
  }, [isOpen, story, session, viewStory]);

  if (!isOpen || !story) return null;

  const isAuthor = session?.user && session.user.id === story.author.id;
  const actualViewers = story.viewers?.filter((v: User) => v.id !== story.author.id) || [];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.9)' }}>
      <button className="close-btn" onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', color: 'white', backgroundColor: 'transparent', fontSize: '32px' }}>×</button>
      
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Story Header */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10 }}>
          <img 
            src={story.author.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + story.author.name} 
            alt={story.author.name || ""}
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{story.author.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{new Date(Number(story.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Story Progress Bar Simulation */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', zIndex: 10 }}>
          <div style={{ height: '100%', background: 'white', width: '100%', borderRadius: '2px' }}></div>
        </div>

        {/* Story Content */}
        {story.mediaUrl ? (
          <img 
            src={story.mediaUrl} 
            alt="Story" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px', background: '#000' }} 
          />
        ) : story.sharedPost ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', borderRadius: '16px' }}>
            <div style={{ background: 'hsl(var(--bg-primary))', width: '85%', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <img src={story.sharedPost.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.sharedPost.author.name}`} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'hsl(var(--text-primary))' }}>{story.sharedPost.author.name}</span>
              </div>
              {story.sharedPost.mediaUrl && (
                <img src={story.sharedPost.mediaUrl} style={{ width: '100%', borderRadius: '8px', marginBottom: '12px', maxHeight: '200px', objectFit: 'cover' }} />
              )}
              <div style={{ color: 'hsl(var(--text-primary))', fontSize: '14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {story.sharedPost.content}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333', borderRadius: '16px', color: 'white' }}>
            No content
          </div>
        )}

        {/* Story Viewers Overlay */}
        {isAuthor && story.viewers && (
          <div 
            style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              background: showViewers ? 'rgba(0,0,0,0.85)' : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
              padding: '20px',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.3s ease',
              maxHeight: showViewers ? '50%' : '80px',
              overflowY: showViewers ? 'auto' : 'hidden',
              cursor: showViewers ? 'default' : 'pointer'
            }}
            onClick={() => {
              if (!showViewers) {
                setShowViewers(true);
                viewStory({ variables: { storyId: story.id } }).catch(console.error);
              }
            }}
          >
            {showViewers && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowViewers(false); }}
                style={{ alignSelf: 'flex-end', background: 'transparent', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px' }}
              >
                ×
              </button>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: 'bold' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              {actualViewers.length} {actualViewers.length === 1 ? 'viewer' : 'viewers'}
            </div>

            {showViewers && (
              <div style={{ width: '100%', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {actualViewers.map((viewer: User) => (
                  <div key={viewer.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={viewer.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewer.name}`} 
                      alt={viewer.name || ""}
                      style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    />
                    <span style={{ color: 'white', fontSize: '14px' }}>{viewer.name}</span>
                  </div>
                ))}
                {actualViewers.length === 0 && (
                  <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: '14px' }}>No views yet</div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
