import CurrentProfile from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { utapi } from 'uploadthing/server';

export const PATCH = async (req: Request, { params }: { params: { serverId: string } }) => {
  try {
    const id = params.serverId;
    const { name, imageUrl } = await req.json();
    const profile = await CurrentProfile();
    if (!profile) return new NextResponse('Unauthorized', { status: 401 });
    const oldImage = (
      await db.server.findUniqueOrThrow({
        where: { id },
      })
    ).imageUrl;
    const data = oldImage.split('/');
    const key = data.pop() || '';
    if (oldImage !== imageUrl) await utapi.deleteFiles(decodeURIComponent(key));
    const server = await db.server.update({
      where: {
        id,
        members: {
          some: {
            profileId: profile.id,
            role: 'ADMIN',
          },
        },
      },
      data: {
        name,
        imageUrl,
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
};

export const DELETE = async (req: Request, { params }: { params: { serverId: string } }) => {
  try {
    const id = params.serverId;
    const profile = await CurrentProfile();
    if (!profile) return new NextResponse('Unauthorized', { status: 401 });
    const oldImage = (
      await db.server.findUniqueOrThrow({
        where: { id },
      })
    ).imageUrl;
    const data = oldImage.split('/');
    const key = data.pop() || '';
    await utapi.deleteFiles(decodeURIComponent(key));
    const server = await db.server.delete({
      where: {
        id,
        profileId: profile.id,
      },
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
};
