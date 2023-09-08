import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MeadiaRoom } from '@/components/media-room';
import CurrentProfile from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { ChannelType } from '@prisma/client';
import { redirect } from 'next/navigation';

interface ChannelIdPageProps {
  params: {
    channelId: string;
    serverId: string;
  };
}

export const ChannelIdPage = async ({
  params: { channelId, serverId },
}: ChannelIdPageProps) => {
  const profile = await CurrentProfile();
  if (!profile) return redirectToSignIn();
  const channel = await db.channel.findUnique({
    where: {
      id: channelId,
    },
  });
  const member = await db.member.findFirst({
    where: {
      serverId,
      profileId: profile.id,
    },
  });
  if (!channel || !member) redirect('/');
  return (
    <>
      <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
        <ChatHeader
          name={channel.name}
          imageUrl={profile.imageUrl}
          serverId={serverId}
          type="channel"
        />
        {channel.type === ChannelType.TEXT && (
          <>
            <ChatMessages
              member={member}
              name={channel.name}
              type="channel"
              apiUrl="/api/messages"
              socketUrl="/api/socket/messages"
              socketQuery={{
                channelId: channel.id,
                serverId: serverId,
              }}
              paramKey="channelId"
              chatId={channel.id}
              paramValue={channel.id}
            />
            <ChatInput
              apiUrl="/api/socket/messages"
              name={channel.name}
              query={{
                channelId: channel.id,
                serverId: channel.serverId,
              }}
              type="channel"
            />
          </>
        )}
        {channel.type === ChannelType.AUDIO && (
          <MeadiaRoom audio={true} video={false} chatId={channel.id} />
        )}
        {channel.type === ChannelType.VIDEO && (
          <MeadiaRoom audio={false} video={true} chatId={channel.id} />
        )}
      </div>
    </>
  );
};

export default ChannelIdPage;
