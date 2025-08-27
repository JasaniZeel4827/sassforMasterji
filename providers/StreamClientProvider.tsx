'use client';

import { ReactNode, useEffect, useState } from 'react';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';

// import { tokenProvider } from '@/actions/stream.actions';
// Use fetch-based token provider instead
import Loader from '@/components/Loader';

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (!API_KEY) throw new Error('Stream API key is missing');

    // Client-side token provider: fetches token from API route
    const fetchToken = async () => {
      console.log('Fetching Stream token for user:', user.id);
      const res = await fetch('/api/stream-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      console.log('Stream token response status:', res.status);
      if (!res.ok) {
        const error = await res.text();
        console.error('Failed to fetch Stream token:', error);
        throw new Error('Failed to fetch Stream token');
      }
      const data = await res.json();
      console.log('Received Stream token:', data.token);
      return data.token;
    };


    const client = new StreamVideoClient({
      apiKey: API_KEY,
      user: {
        id: user.id,
        name: user.username || user.id,
        image: user.imageUrl,
      },
      tokenProvider: fetchToken,
    });

    setVideoClient(client);
  }, [user, isLoaded]);

  if (!videoClient) return <Loader />;

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamVideoProvider;
