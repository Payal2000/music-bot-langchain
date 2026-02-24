/** Spotify PKCE OAuth helpers */

export async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, 128)
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export function getSpotifyAuthUrl(
  clientId: string,
  redirectUri: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'streaming',
      'user-modify-playback-state',
      'user-read-playback-state',
    ].join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  })
  return `https://accounts.spotify.com/authorize?${params}`
}

export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  clientId: string,
  redirectUri: string
): Promise<{ access_token: string; expires_in: number; refresh_token: string }> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
    }),
  })
  if (!res.ok) throw new Error('Token exchange failed')
  return res.json()
}

export async function refreshAccessToken(
  refreshToken: string,
  clientId: string
): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }),
  })
  if (!res.ok) throw new Error('Token refresh failed')
  return res.json()
}
