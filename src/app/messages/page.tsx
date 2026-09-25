"use client";

import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { User, Message } from "@prisma/client";

const GET_CONTACTS = gql`
  query GetContacts {
    me {
      id
      following {
        id
        name
        username
        image
      }
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
      }
    }
  }
`;

export default function MessagesPage() {
  const { data: session } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: contactsData, loading: contactsLoading } = useQuery<{ me: { following: User[] } }>(GET_CONTACTS);
  const { data: messagesData, loading: messagesLoading, refetch: refetchMessages } = useQuery<{ getMessages: (Message & { sender: { id: string } })[] }>(GET_MESSAGES, {
    variables: { userId: selectedUserId },
    skip: !selectedUserId,
    pollInterval: 3000 // Poll every 3 seconds for new messages
  });

  const [sendMessage, { loading: sending }] = useMutation<{ sendMessage: Message & { sender: { id: string } } }>(SEND_MESSAGE, {
    onCompleted: () => {
      setMessageContent("");
      refetchMessages();
    }
  });

  const contacts: User[] = contactsData?.me?.following || [];
  const messages: (Message & { sender: { id: string } })[] = messagesData?.getMessages || [];

  const selectedUser = contacts.find((c: User) => c.id === selectedUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedUserId || sending) return;
    
    try {
      await sendMessage({
        variables: {
          receiverId: selectedUserId,
          content: messageContent
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!session) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Please sign in to view messages.</h2>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', padding: 0, height: '100vh', overflow: 'hidden' }}>
        
        {/* Contacts List */}
        <div style={{ width: '300px', borderRight: '1px solid hsl(var(--border-subtle))', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>Messages</h1>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {contactsLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                You aren't following anyone yet. Follow someone to message them!
              </div>
            ) : (
              contacts.map((contact: User) => (
                <div 
                  key={contact.id}
                  onClick={() => setSelectedUserId(contact.id)}
                  style={{ 
                    padding: '16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px',
                    cursor: 'pointer',
                    background: selectedUserId === contact.id ? 'hsl(var(--bg-tertiary))' : 'transparent',
                    borderBottom: '1px solid hsl(var(--border-subtle))',
                    transition: 'background-color 0.2s'
                  }}
                  className="contact-item"
                >
                  <img 
                    src={contact.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (contact.name || contact.id)} 
                    alt="Avatar" 
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{contact.name || "Anonymous"}</div>
                    <div style={{ color: 'hsl(var(--text-muted))', fontSize: '14px' }}>@{contact.username || contact.id.slice(0,8)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {!selectedUserId ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'hsl(var(--text-muted))' }}>
              <h2 style={{ fontSize: '24px', color: 'hsl(var(--text))', marginBottom: '8px' }}>Select a message</h2>
              <p>Choose from your existing conversations, start a new one, or just keep swimming.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid hsl(var(--border-subtle))', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={selectedUser?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (selectedUser?.name || selectedUser?.id)} 
                  alt="Avatar" 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <Link href={`/profile/${selectedUserId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{selectedUser?.name || "Anonymous"}</div>
                </Link>
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messagesLoading && messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'hsl(var(--text-muted))' }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', marginTop: 'auto', marginBottom: 'auto' }}>
                    No messages yet. Say hi!
                  </div>
                ) : (
                  messages.map((msg: Message & { sender: { id: string } }) => {
                    const isMine = msg.sender.id === session?.user?.id;
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        <div style={{ 
                          maxWidth: '70%', 
                          padding: '12px 16px', 
                          borderRadius: '20px',
                          background: isMine ? '#1d9bf0' : 'hsl(var(--bg-tertiary))',
                          color: isMine ? 'white' : 'hsl(var(--text))',
                          borderBottomRightRadius: isMine ? '4px' : '20px',
                          borderBottomLeftRadius: !isMine ? '4px' : '20px',
                          wordBreak: 'break-word'
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '16px', borderTop: '1px solid hsl(var(--border-subtle))' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', background: 'hsl(var(--bg-secondary))', padding: '8px 16px', borderRadius: '24px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Start a new message" 
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'hsl(var(--text))', fontSize: '15px' }}
                  />
                  <button type="submit" disabled={!messageContent.trim() || sending} style={{ background: 'transparent', border: 'none', cursor: messageContent.trim() ? 'pointer' : 'default', color: messageContent.trim() ? '#1d9bf0' : 'hsl(var(--text-muted))' }}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" width="24" height="24" fill="currentColor">
                      <g><path d="M2.504 21.866l.526-2.108C3.04 19.719 4 15.823 4 12s-.96-7.719-.97-7.757l-.527-2.109L22.236 12 2.504 21.866zM5.981 13c-.072 1.962-.34 3.833-.583 5.183L17.764 12 5.398 5.818c.242 1.349.51 3.221.583 5.183H10v2H5.981z"></path></g>
                    </svg>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
