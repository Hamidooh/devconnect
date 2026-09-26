"use client";

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const GET_USER = gql`
  query GetUserForChat($id: ID!) {
    user(id: $id) {
      id
      name
      username
      image
    }
  }
`;

const GET_MESSAGES = gql`
  query GetMessages($userId: ID!) {
    getMessages(userId: $userId) {
      id
      content
      createdAt
      sender {
        id
        name
        image
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($receiverId: ID!, $content: String!) {
    sendMessage(receiverId: $receiverId, content: $content) {
      id
      content
      createdAt
      sender {
        id
        name
        image
      }
    }
  }
`;

export default function ChatPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const currentUserId = session?.user?.id;

  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: userData, loading: userLoading } = useQuery<{ user: { id: string, name: string | null, username: string | null, image: string | null } }>(GET_USER, {
    variables: { id: id || "" },
    skip: !id
  });

  const { data: messagesData, loading: messagesLoading } = useQuery<{ getMessages: { id: string, content: string, sender: { id: string } }[] }>(GET_MESSAGES, {
    variables: { userId: id || "" },
    skip: !id,
    pollInterval: 3000 // Poll every 3 seconds for new messages
  });

  const [sendMessage] = useMutation<{ sendMessage: any }>(SEND_MESSAGE, {
    update(cache, { data }) {
      const newMessage = data?.sendMessage;
      if (!newMessage) return;
      
      const existingData = cache.readQuery<{ getMessages: any[] }>({ 
        query: GET_MESSAGES, 
        variables: { userId: id } 
      });
      
      if (existingData) {
        cache.writeQuery({
          query: GET_MESSAGES,
          variables: { userId: id },
          data: { getMessages: [...existingData.getMessages, newMessage] }
        });
      }
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesData]);

  const handleSend = async () => {
    if (!session?.user?.id || !content.trim()) return;
    try {
      await sendMessage({ variables: { receiverId: params.id, content } });
      setContent("");
    } catch (e) {
      console.error(e);
    }
  };

  const user = userData?.user;
  const messages = messagesData?.getMessages || [];

  if (userLoading) return <div className="container" style={{paddingTop: '100px'}}>Loading chat...</div>;
  if (!user) return <div className="container" style={{paddingTop: '100px'}}>User not found.</div>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: 0, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="connect-header" style={{ borderBottom: '1px solid hsl(var(--border-subtle))', position: 'sticky', top: 0, zIndex: 10, background: 'hsl(var(--bg-primary))' }}>
          <button className="back-btn" onClick={() => router.back()}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar" style={{ width: '40px', height: '40px' }}>
              <img src={user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user.name || user.id)} alt="Avatar" />
            </div>
            <div>
              <h1 className="profile-name" style={{fontSize: '18px', margin: 0}}>{user.name || "Anonymous"}</h1>
              <div className="profile-handle" style={{fontSize: '13px', margin: 0}}>@{user.username || user.id.slice(0,8)}</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 && !messagesLoading && (
            <div style={{ textAlign: "center", color: "hsl(var(--text-muted))", marginTop: 'auto', marginBottom: 'auto' }}>
              No messages yet. Say hi!
            </div>
          )}
          
          {messages.map((msg: { id: string, content: string, sender: { id: string } }) => {
            const isMe = msg.sender.id === currentUserId;
            return (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                width: '100%'
              }}>
                <div style={{
                  maxWidth: '70%',
                  background: isMe ? 'hsl(var(--accent-primary))' : 'hsl(var(--bg-tertiary))',
                  color: isMe ? 'white' : 'hsl(var(--text-primary))',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  borderBottomRightRadius: isMe ? '4px' : '16px',
                  borderBottomLeftRadius: !isMe ? '4px' : '16px',
                  lineHeight: '1.4'
                }}>
                  {msg.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid hsl(var(--border-subtle))', background: 'hsl(var(--bg-primary))' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Start a new message" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              style={{
                flex: 1,
                background: 'hsl(var(--bg-secondary))',
                border: 'none',
                borderRadius: '9999px',
                padding: '12px 20px',
                color: 'hsl(var(--text-primary))',
                outline: 'none'
              }}
            />
            <button 
              className="btn-primary" 
              style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleSend}
              disabled={!content.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
