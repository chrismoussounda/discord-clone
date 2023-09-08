import { v4 as uuidv4 } from 'uuid';
import { CurrentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { MemberRole } from '@prisma/client';

export const POST = async (req: Request) => {
  try {
    const { name, imageUrl } = await req.json();
    const profile = await CurrentProfile();
    if (!profile) return new NextResponse('Unauthorized', { status: 401 });
    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        inviteCode: uuidv4(),
        channels: { create: { name: 'general', profileId: profile.id } },
        members: { create: { role: MemberRole.ADMIN, profileId: profile.id } },
      },
    });
    return NextResponse.json(server, { status: 201 });
  } catch (error: any) {
    console.error({ error });
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
