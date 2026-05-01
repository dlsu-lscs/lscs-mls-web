"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
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

const GOOGLE_CLIENT_ID = 'PASTE_YOUR_CLIENT_ID_HERE';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // If already logged in, redirect to schedule
  useEffect(() => {
    if (!loading && user) {
      router.replace('/mls-schedule');
    }
  }, [user, loading, router]);

  // Initialize Google OAuth (access token flow — matches your backend)
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'PASTE_YOUR_CLIENT_ID_HERE') return;

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
  }, []);

  async function handleGoogleResponse(response: { access_token: string }) {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await login(response.access_token);
      router.push('/mls-schedule');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setAuthError(message);
    } finally {
      setIsLoggingIn(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#002D57]">
        <div className="animate-pulse text-[#E8C468] text-xl font-semibold">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row">
      {/* Left Side - LSCS Brand */}
      <div className="flex w-full md:w-2/5 bg-[#002D57]">
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 py-14 text-center">
          <div className="flex flex-col items-center gap-6">
            <div className="mt-4 md:mt-0">
              <Image
                src="/lscs-logo.png"
                alt="LSCS Logo"
                width={280}
                height={280}
                className="object-contain drop-shadow-2xl transition-transform duration-300 hover:scale-105"
              />
            </div>

            <h1 className="text-[clamp(2.75rem,5vw,4.5rem)] font-extrabold text-[#E8C468] tracking-[0.22em] drop-shadow-[0_0_14px_rgba(232,196,104,0.45)] uppercase">
              MackyDo
            </h1>
          </div>

          <p className="text-white text-sm tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]">
            Welcome back!
          </p>
        </div>
      </div>

      {/* Right Side - Google Auth */}
      <div className="w-full md:w-3/5 min-h-[25vh] flex items-center justify-center bg-white px-8 py-10 md:py-12">
        <div className="w-full max-w-md text-center">
          <div className="flex flex-col items-center">
            <Image
              src="/macky.svg"
              alt="Macky Icon"
              width={220}
              height={220}
              className="object-contain drop-shadow-lg animate-float transition-transform duration-300 hover:scale-110"
              priority
            />
            <p className="mt-6 text-3xl font-semibold text-[#002D57] drop-shadow-[0_6px_18px_rgba(0,45,87,0.18)]">
              Plan smart, Do easy.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'PASTE_YOUR_CLIENT_ID_HERE' ? (
              <button
                type="button"
                onClick={() => window.__googleClient?.requestAccessToken()}
                disabled={!googleReady || isLoggingIn}
                className="w-full flex items-center justify-center gap-3 rounded-full px-4 py-3 font-semibold text-[#3D2A08] bg-[#E8C468] shadow-[0_12px_24px_rgba(232,196,104,0.35)] hover:bg-[#f0d17c] hover:shadow-[0_16px_40px_rgba(232,196,104,0.45)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                    <path fill="#4285F4" d="M24 9.5c3.15 0 5.97 1.08 8.2 2.86l6.12-6.12C34.6 2.4 29.6 0 24 0 14.7 0 6.56 5.38 2.53 13.16l7.14 5.54C11.75 13.38 17.36 9.5 24 9.5z" />
                    <path fill="#34A853" d="M46.5 24.5c0-1.63-.15-3.2-.43-4.71H24v9.01h12.68c-.55 2.96-2.2 5.48-4.66 7.17l7.32 5.68C43.83 36.4 46.5 30.87 46.5 24.5z" />
                    <path fill="#FBBC05" d="M9.67 28.7a14.54 14.54 0 010-9.4l-7.14-5.54a23.91 23.91 0 000 20.48l7.14-5.54z" />
                    <path fill="#EA4335" d="M24 47.5c5.6 0 10.62-1.85 14.17-5.04l-7.32-5.68C29.57 38.23 26.96 39 24 39a14.5 14.5 0 01-13.33-9.23l-7.14 5.54C6.56 42.62 14.7 47.5 24 47.5z" />
                  </svg>
                </span>
                {isLoggingIn ? 'Signing you in…' : 'Continue with Google'}
              </button>
            ) : (
              <p className="text-sm text-amber-600 font-medium bg-amber-50 rounded-lg px-4 py-3">
                ⚠️ Set your GOOGLE_CLIENT_ID in login/page.tsx to enable sign-in
              </p>
            )}

            {authError && (
              <p className="text-sm text-red-600 font-medium">{authError}</p>
            )}

            <p className="text-sm text-gray-600">
              Login or sign up with your Google account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}