"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      // Redirect to "/" after Google sign-in completes.
      // NextAuth handles the OAuth flow and redirects back automatically.
      // If it fails, NextAuth redirects to /auth/error (our custom error page).
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Failed to connect to Google. Please try again.");
      setGoogleLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await signIn("credentials", {
        email: "test@example.com",
        password: "password123",
        redirect: false,
      });
      if (res?.error) {
        setError("Could not sign in with demo account.");
      } else {
        onClose();
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to sign in as demo user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, padding: '20px' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '420px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              background: 'hsl(var(--accent-primary))', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'hsl(var(--text-primary))' }}>DevConnect</h2>
              <p style={{ fontSize: '12px', margin: 0, color: 'hsl(var(--text-muted))' }}>Sign in to connect with engineers</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{ 
              padding: '10px 14px', 
              borderRadius: '8px', 
              background: 'rgba(239, 68, 68, 0.12)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: '#ef4444', 
              fontSize: '13px', 
              marginBottom: '16px',
              lineHeight: '1.4'
            }}>
              {error}
            </div>
          )}

          {/* Primary Action: Google Authentication Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid hsl(var(--border-subtle))',
              background: 'white',
              color: '#1f2937',
              fontSize: '15px',
              fontWeight: '600',
              cursor: googleLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              opacity: googleLoading ? 0.7 : 1,
            }}
          >
            {/* Google official logo SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            {googleLoading ? "Connecting to Google..." : "Sign in with Google"}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'hsl(var(--border-subtle))' }} />
            <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or with credentials</span>
            <div style={{ flex: 1, height: '1px', background: 'hsl(var(--border-subtle))' }} />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleCredentialsSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'hsl(var(--text-secondary))' }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border-subtle))',
                  background: 'hsl(var(--bg-secondary))',
                  color: 'hsl(var(--text-primary))',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'hsl(var(--text-secondary))' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border-subtle))',
                  background: 'hsl(var(--bg-secondary))',
                  color: 'hsl(var(--text-primary))',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                marginTop: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? "Authenticating..." : "Sign In / Auto-Register"}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid hsl(var(--border-subtle))', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'hsl(var(--accent-primary))',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '6px 10px',
                textDecoration: 'underline'
              }}
            >
              ⚡ Quick Sign-In as Demo Developer (test@example.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
