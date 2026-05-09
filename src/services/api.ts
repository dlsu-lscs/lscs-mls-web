const API_BASE = 'http://localhost:3000';

export async function testBackend(): Promise<boolean> {
  try {
    await fetch(`${API_BASE}/auth/google`, { method: 'OPTIONS' });
    return true;
  } catch {
    return false;
  }
}

export async function loginWithGoogle(accessToken: string): Promise<string> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: accessToken }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Login failed');
  }

  // Backend returns a JWT string
  return res.json();
}
