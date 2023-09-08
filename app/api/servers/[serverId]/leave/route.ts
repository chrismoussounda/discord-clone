import CurrentProfile from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const DELETE = async (
  req: Request,
  { params: { serverId: id } }: { params: { serverId: string } }
) => {
  try {
    const profile = await CurrentProfile();
    if (!profile) return new NextResponse('unauthorized', { status: 401 });
    const server = await db.server.update({
      where: {
        id,
        profileId: {
          not: profile.id,
        },
        AND: {
          members: {
            some: {
              profileId: profile.id,
            },
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });
    return NextResponse.json(server);
  } catch (error: any) {
    console.log(error);
    return new NextResponse(error.message, { status: 400 });
  }
};
