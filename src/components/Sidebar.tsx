"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import CreatePostModal from "./CreatePostModal";
import SearchModal from "./SearchModal";

const GET_UNREAD_NOTIFICATIONS = gql`
  query GetNotificationsCount {
    getNotifications {
      id
      read
    }
  }
`;

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDarkMode(false);
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      setIsDarkMode(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  const { data: notifData } = useQuery<{ getNotifications: { read: boolean }[] }>(GET_UNREAD_NOTIFICATIONS, {
    skip: !session,
    fetchPolicy: "cache-and-network",
    pollInterval: 30000 // Poll every 30s to keep it updated
  });

  const unreadCount = notifData?.getNotifications?.filter((n: { read: boolean }) => !n.read).length || 0;

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    {
      name: "Messages",
      href: "/messages",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      )
    },
    {
      name: "Search",
      href: "/search",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      )
    },
    {
      name: "Explore",
      href: "/explore",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
        </svg>
      )
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      )
    },
    {
      name: "Create",
      href: "/create",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      )
    },
    {
      name: "Profile",
      href: "/profile",
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" width="26" height="26" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-3.93-.57-5.54-1.58C7.17 16.03 9.46 14.5 12 14.5s4.83 1.53 5.54 3.92C15.93 19.43 14.03 20 12 20z"></path>
        </svg>
      )
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo" style={{ padding: '24px 16px 16px' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'hsl(var(--sidebar-text))', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          DevConnect
        </Link>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.name === "Create" || item.name === "Search") {
            const isSearch = item.name === "Search";
            return (
              <div key={item.name} onClick={() => isSearch ? setIsSearchModalOpen(true) : setIsCreateModalOpen(true)} className="sidebar-item" style={{ cursor: 'pointer' }}>
                <div className="sidebar-item-content">
                  <div className="sidebar-icon" style={{ position: 'relative' }}>
                    {item.icon}
                  </div>
                  <span className={`sidebar-text ${isActive ? 'active' : ''}`}>{item.name}</span>
                </div>
              </div>
            );
          }

          return (
            <Link key={item.name} href={item.href} className="sidebar-item">
              <div className="sidebar-item-content">
                <div className="sidebar-icon" style={{ position: 'relative' }}>
                  {item.icon}
                  {item.name === "Notifications" && unreadCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#f91880',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      borderRadius: '10px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      border: '2px solid hsl(var(--bg-primary))'
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>
                <span className={`sidebar-text ${isActive ? 'active' : ''}`}>{item.name}</span>
              </div>
            </Link>
          );
        })}

        <div onClick={toggleTheme} className="sidebar-item" style={{ cursor: 'pointer' }}>
          <div className="sidebar-item-content">
            <div className="sidebar-icon">
              {isDarkMode ? (
                <svg viewBox="0 0 24 24" aria-hidden="true" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </div>
            <span className="sidebar-text">Theme</span>
          </div>
        </div>
      </nav>

      <div style={{ marginTop: 'auto', paddingBottom: '60px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {session ? (
          <>
            <img 
              src={session.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (session.user?.name || "User")} 
              alt="Avatar" 
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <button 
              onClick={() => signOut()}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'hsl(var(--sidebar-text))',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 20px',
                fontWeight: 'bold',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              Sign Out
            </button>
          </>
        ) : (
          <button 
            onClick={() => signIn()}
            style={{
              background: '#1d9bf0',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              padding: '12px 24px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              width: '100%',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#1a8cd8'}
            onMouseOut={(e) => e.currentTarget.style.background = '#1d9bf0'}
          >
            Log In
          </button>
        )}
      </div>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
      
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
}
