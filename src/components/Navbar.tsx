"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
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
            <button className="btn-primary" onClick={() => signIn()}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
