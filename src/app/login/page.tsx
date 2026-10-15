'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
    __googleClient?: { requestAccessToken: () => void };
  }
}

// Read from environment — set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [isPreviousUser, setIsPreviousUser] = useState(false)

  const handleGoogleResponse = useCallback(
    async (response: { access_token: string }) => {
      setIsLoggingIn(true);
      setAuthError(null);
      try {
        await login(response.access_token);
        if (!isPreviousUser) localStorage.setItem('previous-user', JSON.stringify(true));
        router.push('/');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setAuthError(message);
      } finally {
        setIsLoggingIn(false);
      }
    },
    [login, router],
  );

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  // Initialize Google OAuth token client
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    function initGoogle() {
      if (!window.google?.accounts?.oauth2) return;

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'email profile',
        callback: handleGoogleResponse,
      });

      window.__googleClient = client;
      setGoogleReady(true);
    }

    if (window.google?.accounts?.oauth2) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [handleGoogleResponse]);

  useEffect(() => {
    try {
      setIsPreviousUser(Boolean(localStorage.getItem('previous-user')));
    } catch (e) {
      console.error(e);
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#002D57]">
        <div className="animate-pulse text-[#E8C468] text-xl font-semibold">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Side — LSCS Brand */}
      <div className="flex relative w-full md:w-1/2 bg-primary-600">
        {/* Background */}
        <div className="absolute inset-0 z-0 flex gap-4 px-4 flex-row items-start select-none pointer-events-none blur-xs">
          <div className="flex-1 flex flex-col gap-4 animate-vertical-scroll-one will-change-transform [animation-delay:-10s]">
            <div className="w-full flex flex-col gap-4">
              <div className="h-48 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-72 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-24 w-full bg-secondary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-48 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-72 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
            </div>
            <div className="w-full flex flex-col gap-4" aria-hidden="true">
              <div className="h-48 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-72 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-24 w-full bg-secondary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-48 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-72 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4 animate-vertical-scroll-two will-change-transform [animation-delay:-24s]">
            <div className="w-full flex flex-col gap-4">
              <div className="h-24 w-full bg-secondary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-72 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-48 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-48 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-36 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="h-24 w-full bg-secondary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-72 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-48 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-48 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-36 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4 animate-vertical-scroll-three will-change-transform [animation-delay:-28s]">
            <div className="w-full flex flex-col gap-4">
              <div className="h-72 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-36 w-full bg-secondary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-48 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-72 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-24 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-24 w-full bg-secondary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
            </div>
            <div className="w-full flex flex-col gap-4">
              <div className="h-72 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-36 w-full bg-secondary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-48 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-72 w-full bg-primary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-24 w-full bg-primary-900 rounded-lg shadow-lg/80 shadow-surface-800"></div>
              <div className="h-24 w-full bg-secondary-500 rounded-lg shadow-lg/80 shadow-surface-800"></div>
            </div>
          </div>
        </div>
        {/* Foreground */}
        <div className="flex h-full w-full z-1 flex-col items-end justify-center gap-4 px-4 py-14 text-center">
          <div className="flex flex-col items-end gap-6">
            <h1 className="text-8xl font-extrabold text-surface-50 tracking-widest drop-shadow-lg drop-shadow-surface-950 [-webkit-text-stroke:2px_var(--color-surface-950)] uppercase">
              MLS-API
            </h1>
          </div>
        </div>
      </div>

      {/* Right Side — Google Auth */}
      <div className="w-full md:w-1/2 min-h-[25vh] flex relative items-center justify-center bg-surface-50 px-8 py-10 md:py-12">
        <div className="w-full max-w-md text-left flex flex-col gap-4">
          <div className="flex flex-col items-left">
            <div className="font-bold text-secondary-500 [-webkit-text-stroke:1.5px_var(--color-surface-400)] drop-shadow-md drop-shadow-surface-300"> 
              {isPreviousUser ? (
                <div className="text-5xl">
                  Welcome back!
                </div>
              ) : (
                <div className="text-[2.5rem]">
                  Welcome to MLS-API.
                </div>
              )}
            </div>  
            <p className="text-sm font-semibold text-surface-400">
              Sign in with your DLSU account to get started.
            </p>
          </div>

          { /* Any Errors */}
          <div className={`w-full flex items-center justify-center gap-4 rounded-[10px] px-4 py-4 font-semibold text-primary-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${authError ? "outline-[0.4px] outline-error-200 shadow-md/50 shadow-error-200 bg-error-50" : "bg-surface-50"}`}>
            { authError && (
              <>
                <p className="font-bold text-sm text-error-500">!</p>
                <p className="text-sm font-semibold">{authError}</p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {GOOGLE_CLIENT_ID ? (
              <button
                type="button"
                onClick={() => window.__googleClient?.requestAccessToken()}
                disabled={!googleReady || isLoggingIn}
                className="w-full flex items-center justify-center gap-3 rounded-[10px] outline-[0.4px] outline-surface-400 px-4 py-3 font-semibold text-primary-900 bg-surface-50 shadow-md/50 shadow-surface-800 hover:bg-surface-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full">
                  {/* Google G icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-5 w-5"
                  >
                    <path
                      fill="#4285F4"
                      d="M24 9.5c3.15 0 5.97 1.08 8.2 2.86l6.12-6.12C34.6 2.4 29.6 0 24 0 14.7 0 6.56 5.38 2.53 13.16l7.14 5.54C11.75 13.38 17.36 9.5 24 9.5z"
                    />
                    <path
                      fill="#34A853"
                      d="M46.5 24.5c0-1.63-.15-3.2-.43-4.71H24v9.01h12.68c-.55 2.96-2.2 5.48-4.66 7.17l7.32 5.68C43.83 36.4 46.5 30.87 46.5 24.5z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M9.67 28.7a14.54 14.54 0 010-9.4l-7.14-5.54a23.91 23.91 0 000 20.48l7.14-5.54z"
                    />
                    <path
                      fill="#EA4335"
                      d="M24 47.5c5.6 0 10.62-1.85 14.17-5.04l-7.32-5.68C29.57 38.23 26.96 39 24 39a14.5 14.5 0 01-13.33-9.23l-7.14 5.54C6.56 42.62 14.7 47.5 24 47.5z"
                    />
                  </svg>
                </span>
                {isLoggingIn ? 'Signing you in…' : 'Continue with Google'}
              </button>
            ) : (
              <p className="text-sm text-amber-600 font-medium bg-amber-50 rounded-lg px-4 py-3">
                ⚠️ Add{' '}
                <code className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>{' '}
                to your <code className="font-mono">.env.local</code> to enable
                sign-in.
              </p>
            )}

            <p className="text-sm font-semibold text-surface-800 text-center">
              By continuing you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </div>
        <div className="opacity-30 absolute -bottom-16 -right-24">
          <Image
            src="/lscs-logo.png"
            alt="LSCS Logo"
            width={483}
            height={495}
            className="object-contain drop-shadow-2xl w-xs"
          />
        </div>
      </div>
    </div>
  );
}
