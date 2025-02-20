'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  const [birthYear, setBirthYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [playlistUrl, setPlaylistUrl] = useState('');

  // Generate birth years from 1940 to current year - 15
  const currentYear = new Date().getFullYear();
  const birthYears = Array.from(
    { length: currentYear - 1940 - 14 },
    (_, i) => currentYear - 15 - i
  ).reverse();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthYear) return;

    setLoading(true);
    setMessage('');
    setPlaylistUrl('');

    try {
      const response = await fetch('/api/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ birthYear: parseInt(birthYear) }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Success! Check your Spotify account for the new playlist:');
        setPlaylistUrl(data.playlistUrl);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage('An error occurred while creating the playlist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="page-header">
        {session && (
          <div className="user-section">
            <span>{session.user?.email}</span>
            <button
              onClick={() => signOut()}
              className="text-button"
            >
              Sign out
            </button>
          </div>
        )}

        <div className="header">
          <h1>Reverb</h1>
          <p>Your nostalgic music time machine</p>
        </div>
      </div>

      <div className="form-container">
        <p className="text-gray-500 mb-12">
          Enter your birth year to create a personalized playlist from your formative years (15-22).
        </p>

        {!session ? (
          <button
            onClick={() => signIn('spotify')}
            className="w-full"
          >
            Sign in with Spotify
          </button>
        ) : (
          <form onSubmit={handleSubmit}>
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              required
            >
              <option value="">Select birth year</option>
              {birthYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating playlist...' : 'Generate Playlist'}
            </button>
          </form>
        )}

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
            {playlistUrl && (
              <div style={{ marginTop: '0.5rem' }}>
                <a href={playlistUrl} target="_blank" rel="noopener noreferrer">
                  {playlistUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}