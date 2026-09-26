"use client";

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    getNotifications {
      id
      type
      read
      createdAt
      sender {
        id
        name
        username
        image
      }
      post {
        id
        content
      }
    }
  }
`;

const MARK_NOTIFICATIONS_READ = gql`
  mutation MarkNotificationsRead {
    markNotificationsRead
  }
`;

export default function NotificationsPage() {
  const { data: session } = useSession();
  const { data, loading, error, refetch } = useQuery<{ getNotifications: { id: string, type: string, sender: { id: string, name: string, image: string | null }, post: { id: string, content: string } | null, createdAt: Date, read: boolean }[] }>(GET_NOTIFICATIONS, {
    skip: !session,
    fetchPolicy: "network-only"
  });
  const [markRead] = useMutation(MARK_NOTIFICATIONS_READ);

  const hasMarkedRead = useRef(false);

  useEffect(() => {
    if (session && !hasMarkedRead.current) {
      hasMarkedRead.current = true;
      markRead().catch(console.error);
    }
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Please sign in to view notifications.</h2>
        </main>
      </div>
    );
  }

  const notifications = data?.getNotifications || [];

  const getNotificationText = (notification: { type: string, sender: { name: string } }) => {
    switch (notification.type) {
      case "LIKE":
        return "liked your post";
      case "COMMENT":
        return "replied to your post";
      case "FOLLOW":
        return "followed you";
      default:
        return "interacted with you";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#f91880">
            <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"></path>
          </svg>
        );
      case "COMMENT":
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#1d9bf0">
            <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
          </svg>
        );
      case "FOLLOW":
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#1d9bf0">
            <path d="M17.863 13.44c1.477 1.58 2.366 3.8 2.632 6.46l.11 1.1H3.395l.11-1.1c.266-2.66 1.155-4.88 2.632-6.46C7.627 11.85 10.027 11 12 11s4.373.85 5.863 2.44zM12 2C9.79 2 8 3.79 8 6s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: 0 }}>
        <div style={{ position: 'sticky', top: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(12px)', zIndex: 10, padding: '16px 20px', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Notifications</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'hsl(var(--text-muted))' }}>
            <h2 style={{ color: 'hsl(var(--text))', marginBottom: '8px' }}>Nothing to see here — yet</h2>
            <p>From likes to follows, all your notifications will live here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                style={{ 
                  display: 'flex', 
                  padding: '16px 20px', 
                  borderBottom: '1px solid hsl(var(--border-subtle))',
                  background: notif.read ? 'transparent' : 'rgba(29, 155, 240, 0.05)',
                  transition: 'background-color 0.3s'
                }}
              >
                <div style={{ width: '40px', display: 'flex', justifyContent: 'flex-end', paddingRight: '12px' }}>
                  {getNotificationIcon(notif.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <img 
                    src={notif.sender.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (notif.sender.name || notif.sender.id)} 
                    alt="Avatar" 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' }}
                  />
                  <div>
                    <span style={{ fontWeight: 'bold' }}>{notif.sender.name || "Anonymous"}</span>{" "}
                    <span style={{ color: 'hsl(var(--text-muted))' }}>{getNotificationText(notif)}</span>
                  </div>
                  {notif.post && (
                    <div style={{ marginTop: '8px', color: 'hsl(var(--text-muted))', fontSize: '15px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {notif.post.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
