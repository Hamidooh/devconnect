"use client";

import { useEffect, useRef } from "react";
import PostCard from "./PostCard";
import type { Prisma } from "@prisma/client";

type PostType = Prisma.PostGetPayload<{
  include: {
    author: true;
    likes: { include: { user: true } };
    comments: { include: { author: true } };
    savedBy: { include: { user: true } };
  }
}>;

export default function ExploreFeedModal({ 
  posts, 
  initialIndex, 
  onClose 
}: { 
  posts: PostType[], 
  initialIndex: number, 
  onClose: () => void 
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the selected post initially
    if (scrollRef.current && initialIndex >= 0) {
      const targetElement = scrollRef.current.children[initialIndex] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'instant' });
      }
    }
  }, [initialIndex]);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, padding: '20px' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ height: '85vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
      >
        <button 
          className="close-btn" 
          onClick={onClose}
          style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.5)', color: 'white' }}
        >
          &times;
        </button>
        <div className="explore-modal-feed" ref={scrollRef}>
          {posts.map((post) => (
            <div key={post.id} className="explore-modal-post">
              <div style={{ margin: '0 auto', maxWidth: '100%', width: '100%' }}>
                <PostCard post={post} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
