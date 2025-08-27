import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { StreamClient } from '@stream-io/node-sdk';

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY!;

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  const { userId: authUserId } = auth();

  if (!authUserId || !userId || userId !== authUserId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);
  const expirationTime = Math.floor(Date.now() / 1000) + 3600;
  const issuedAt = Math.floor(Date.now() / 1000) - 60;
  const token = streamClient.createToken(userId, expirationTime, issuedAt);

  return NextResponse.json({ token });
}
