# Nostalgia Playlist Generator

This app creates Spotify playlists based on the music that was popular during your formative years (ages 15-22). Simply enter your birth year, and the app will generate a personalized playlist of songs from those years.

## Features

- Spotify authentication
- Automatic playlist generation based on birth year
- Curates songs from when you were aged 15-22
- Creates a private playlist in your Spotify account

## Setup

1. Create a Spotify Developer account and register your application at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

2. Set up your environment variables in `.env.local`:
```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_SECRET=your_random_string_here
NEXTAUTH_URL=http://localhost:3000
```

3. Install dependencies:
```bash
pnpm install
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How it Works

1. Sign in with your Spotify account
2. Enter your birth year
3. The app will:
   - Calculate the years when you were 15-22
   - Search for popular songs from each year
   - Create a new private playlist in your Spotify account
   - Add the discovered songs to the playlist

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- NextAuth.js
- Spotify Web API

## Development

To contribute or modify the code:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT
