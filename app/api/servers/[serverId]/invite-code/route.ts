import CurrentProfile from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { v4 as uuidV4 } from 'uuid';

export const PATCH = async (req: Request, res: { params: { serverId: string } }) => {
  try {
    const id = res.params.serverId;
    const profile = await CurrentProfile();
    if (!profile) return new NextResponse('unauthorized', { status: 401 });
    if (!id) new NextResponse('Server Id Missing', { status: 400 });
    const server = await db.server.update({
      where: {
        id,
        profileId: profile.id,
      },
      data: {
        inviteCode: uuidV4(),
      },
    });
    return NextResponse.json(server);
  } catch (error: any) {
    console.log(error);
    return new NextResponse(error.message, { status: 400 });
  }
};
