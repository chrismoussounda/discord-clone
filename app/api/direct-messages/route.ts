import CurrentProfile from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
const MESSAGE_BATCH = 10;

export const GET = async (req: Request) => {
  try {
    const profile = await CurrentProfile();
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get('cursor');
    const conversationId = searchParams.get('conversationId');

    if (!profile) return new NextResponse('Unauthorized', { status: 401 });
    if (!conversationId) return new NextResponse('conversationId Missing', { status: 400 });
    const commonQuery = {
      take: MESSAGE_BATCH,
      where: { conversationId },
      include: { member: { include: { profile: true } } },
      orderBy: { createAt: 'desc' },
    } as any;

    const messages = cursor
      ? await db.directMessage.findMany({
          cursor: { id: cursor },
          ...commonQuery,
        })
      : await db.directMessage.findMany({
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
