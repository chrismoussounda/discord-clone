import CurrentProfile from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { utapi } from 'uploadthing/server';

export const PATCH = async (req: Request, { params }: { params: { channelId: string } }) => {
  try {
    const id = params.channelId;
    const { name, type } = await req.json();
    const profile = await CurrentProfile();
    if (!profile) return new NextResponse('Unauthorized', { status: 401 });
    if (name === 'general') return new NextResponse('Name cannot be general', { status: 400 });
    const channel = await db.channel.update({
      where: {
        id,
        profileId: profile.id,
      },
      data: {
        name,
        type,
      },
    });
    return NextResponse.json(channel);
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
};

export const DELETE = async (req: Request, { params }: { params: { channelId: string } }) => {
  try {
    const id = params.channelId;
    const profile = await CurrentProfile();
    if (!profile) return new NextResponse('Unauthorized', { status: 401 });
    const channel = await db.channel.delete({
      where: {
        id,
        profileId: profile.id,
      },
    });
    return NextResponse.json(channel);
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
};
