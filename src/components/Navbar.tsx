"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const { data: session } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <nav className="nav">
        <div className="container nav-content">
          <Link href="/" className="nav-logo">
            DevConnect
          </Link>
          <div className="nav-actions">
            {session ? (
              <>
                <Link href="/profile" className="avatar">
                  <img
                    src={session.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + session.user?.name}
                    alt="Avatar"
                  />
                </Link>
                <button className="btn-secondary" onClick={() => signOut()}>
                  Sign Out
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => setIsAuthModalOpen(true)}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
