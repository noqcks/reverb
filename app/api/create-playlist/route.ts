import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import SpotifyWebApi from 'spotify-web-api-node';
import { authOptions } from '../../../lib/auth';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { birthYear } = await request.json();

    // Calculate the years when the person was 15-22
    const nostalgicYears = Array.from({ length: 8 }, (_, i) => birthYear + 15 + i);
    const currentYear = new Date().getFullYear();

    if (nostalgicYears[0] > currentYear) {
      return NextResponse.json(
        { error: 'You are not old enough yet for a nostalgia playlist!' },
        { status: 400 }
      );
    }

    spotifyApi.setAccessToken(session.accessToken as string);

    // Create a new playlist
    const playlist = await spotifyApi.createPlaylist(
      `Reverb: born in ${birthYear}`,
      {
        description: `Songs that were popular when you were between 15-22 years old (${nostalgicYears[0]}-${nostalgicYears[7]})`,
        public: false
      }
    );

    // For each year, search for top tracks
    const allTracks: string[] = [];

    for (const year of nostalgicYears) {
      if (year > currentYear) continue;

      const searchResults = await spotifyApi.searchTracks(`year:${year}`, {
        limit: 10,
        market: 'US'
      });

      const trackUris = searchResults.body.tracks?.items.map((track: SpotifyApi.TrackObjectFull) => track.uri) || [];
      allTracks.push(...trackUris);
    }

    // Add tracks to playlist in batches of 100 (Spotify's limit)
    for (let i = 0; i < allTracks.length; i += 100) {
      const batch = allTracks.slice(i, i + 100);
      await spotifyApi.addTracksToPlaylist(playlist.body.id, batch);
    }

    return NextResponse.json({
      success: true,
      playlistUrl: playlist.body.external_urls.spotify
    });

  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json(
      { error: 'Failed to create playlist' },
      { status: 500 }
    );
  }
}