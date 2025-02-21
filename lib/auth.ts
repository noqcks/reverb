import { DefaultSession, Account, Session } from "next-auth"
import { JWT } from "next-auth/jwt";
import Spotify from "next-auth/providers/spotify";
import { User } from "next-auth";

interface ExtendedToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  user?: User;
  error?: string;
}

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    user?: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    user?: User;
    error?: string;
  }
}

export const authOptions = {
  providers: [
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "user-read-email playlist-modify-public playlist-modify-private user-read-private"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, user }: { token: JWT; account: Account | null; user: User | null }) {
      if (account && user) {
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at! * 1000,
          user
        }
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }: { session: Session & DefaultSession; token: JWT }) {
      session.accessToken = token.accessToken;
      session.user = token.user;
      return session;
    }
  }
};

async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
  try {
    const url = "https://accounts.spotify.com/api/token";
    const basicAuth = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');

    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    if (token.refreshToken) {
      params.append('refresh_token', token.refreshToken);
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params,
      method: 'POST',
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
