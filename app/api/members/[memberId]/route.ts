import CurrentProfile from '@/lib/current-profile';
import { db } from '@/lib/db';
import { MemberRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export const PATCH = async (req: Request, { params }: { params: { memberId: string } }) => {
  try {
    const id = params.memberId;
    const profile = await CurrentProfile();
    const { searchParams } = new URL(req.url);
    const { role }: { role: MemberRole } = await req.json();
    const serverId = searchParams.get('serverId');
    if (!profile) throw new NextResponse('Unauthorized', { status: 401 });
    if (!serverId) throw new NextResponse('Missing ServerId', { status: 400 });
    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          update: {
            where: {
              id,
              profileId: {
                not: profile.id,
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: { role: 'asc' },
        },
      },
    });
    console.log(server);
    return NextResponse.json(server);
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse('Internal Error', { status: 500 });
  }
};

export const DELETE = async (req: Request, { params }: { params: { memberId: string } }) => {
  try {
    const id = params.memberId;
    const profile = await CurrentProfile();
    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get('serverId');
    if (!profile) return new NextResponse('Unauthorized', { status: 401 });
    if (!serverId) throw new NextResponse('Missing ServerId', { status: 400 });
    const server = await db.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          delete: {
            id,
            profileId: {
              not: profile.id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: 'asc',
          },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse('Internal Error', { status: 500 });
  }
};
