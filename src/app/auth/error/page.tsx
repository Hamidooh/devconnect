"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already registered with a different sign-in method. Please sign in with your email and password instead.",
  OAuthSignin:
    "Could not connect to Google. Please check that Google Sign-In is configured correctly.",
  OAuthCallback:
    "Google sign-in was cancelled or failed. Please try again.",
  OAuthCreateAccount:
    "Could not create your account via Google. Please try again or use email/password.",
  EmailCreateAccount:
    "Could not create your account. Please try again.",
  Callback:
    "An error occurred during sign-in. Please try again.",
  AccessDenied:
    "Access was denied. You may not have permission to sign in.",
  Configuration:
    "There is a server configuration error. Please contact the site administrator.",
  Verification:
    "The sign-in link is no longer valid. It may have already been used or expired.",
  Default:
    "An unexpected sign-in error occurred. Please try again.",
};

function ErrorContent() {
  const params = useSearchParams();
  const router = useRouter();
  const errorCode = params.get("error") ?? "Default";
  const message = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(var(--bg-primary, 222 47% 6%))",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          background: "hsl(var(--bg-secondary, 222 47% 11%))",
          border: "1px solid hsl(var(--border-subtle, 215 28% 17%))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid hsl(var(--border-subtle, 215 28% 17%))",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "hsl(var(--accent-primary, 217 91% 60%))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                margin: 0,
                color: "hsl(var(--text-primary, 210 40% 98%))",
              }}
            >
              DevConnect
            </h2>
            <p
              style={{
                fontSize: "12px",
                margin: 0,
                color: "hsl(var(--text-muted, 215 16% 47%))",
              }}
            >
              Sign-in error
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {/* Error Banner */}
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "10px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: "1px" }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p
                style={{
                  margin: 0,
                  color: "#f87171",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                {message}
              </p>
            </div>
          </div>

          {/* Go Back Button */}
          <button
            onClick={() => router.push("/")}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: "hsl(var(--accent-primary, 217 91% 60%))",
              color: "white",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            Back to DevConnect
          </button>

          {/* Try again with different method hint */}
          {errorCode === "OAuthAccountNotLinked" && (
            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                color: "hsl(var(--text-muted, 215 16% 47%))",
                margin: 0,
              }}
            >
              Use the Email/Password form on the main page to sign in.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
