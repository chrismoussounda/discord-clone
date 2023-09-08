import { CurrentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get('serverId');
    const { name, type } = await req.json();
    const profile = await CurrentProfile();
    if (!profile) return new NextResponse('Unauthorized', { status: 401 });
    if (!serverId) return new NextResponse('ServerId Missing', { status: 400 });
    if (name === 'general') return new NextResponse('Name cannot be general', { status: 400 });
    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              not: 'GUEST',
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name,
            type,
          },
        },
      },
    });
    return NextResponse.json(server, { status: 201 });
  } catch (error: any) {
    console.error({ error });
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
