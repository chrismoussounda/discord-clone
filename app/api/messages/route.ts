import CurrentProfile from '@/lib/current-profile';
import { db } from '@/lib/db';
import { Message, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';
const MESSAGE_BATCH = 10;

export const GET = async (req: Request) => {
  try {
    const profile = await CurrentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get('cursor');
    const channelId = searchParams.get('channelId');

    if (!profile) return new NextResponse('Unauthorized', { status: 401 });
    if (!channelId) return new NextResponse('ChannelId Missing', { status: 400 });
    const commonQuery = {
      take: MESSAGE_BATCH,
      where: { channelId },
      include: { member: { include: { profile: true } } },
      orderBy: { createAt: 'desc' },
    } as any;

    const messages = cursor
      ? await db.message.findMany({
          cursor: { id: cursor },
          ...commonQuery,
        })
      : await db.message.findMany({
          ...commonQuery,
        });

    let nextCursor = null;
    if (messages.length === MESSAGE_BATCH) nextCursor = messages[MESSAGE_BATCH - 1].id;
    return NextResponse.json({
      items: messages,
      nextCursor,
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 400 });
  }
};
