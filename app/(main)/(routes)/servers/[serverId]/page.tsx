import CurrentProfile from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

interface ServerIdPageProps {
  params: {
    serverId: string;
  };
}

export const Server = async ({ params: { serverId } }: ServerIdPageProps) => {
  const profile = await CurrentProfile();
  if (!profile) return redirectToSignIn();
  const server = await db.server.findUnique({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
    include: {
      channels: {
        where: { name: 'general' },
        orderBy: {
          name: 'asc',
        },
      },
    },
  });
  const initialChannal = server?.channels[0];
  return initialChannal?.name !== 'general'
    ? null
    : redirect(`/servers/${serverId}/channels/${initialChannal.id}`);
};

export default Server;
