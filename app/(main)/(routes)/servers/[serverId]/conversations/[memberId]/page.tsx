import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessages } from '@/components/chat/chat-messages';
import { MeadiaRoom } from '@/components/media-room';
import { getOrCreateConversation } from '@/lib/conversation';
import CurrentProfile from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

interface MemberIdPageProps {
  params: {
    memberId: string;
    serverId: string;
  };
  searchParams: {
    video?: string;
  };
}

export const MemberIdPage = async ({
  params: { memberId, serverId },
  searchParams: { video },
}: MemberIdPageProps) => {
  const profile = await CurrentProfile();
  if (!profile) return redirectToSignIn();
  const currentMember = await db.member.findFirst({
    where: {
      serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });
  if (!currentMember) redirect('/');
  const conversation = await getOrCreateConversation(currentMember?.id, memberId);
  if (!conversation) redirect(`/servers/${serverId}`);
  const { memberOne, memberTwo } = conversation;
  const {
    profile: { imageUrl, name, id },
  } = memberOne.profileId === profile.id ? memberTwo : memberOne;
  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader imageUrl={imageUrl} name={name} serverId={serverId} type="conversation" />

      {video === 'true' ? (
        <MeadiaRoom audio={true} video={true} chatId={conversation.id} />
      ) : (
        <>
          <ChatMessages
            apiUrl="/api/direct-messages"
            chatId={conversation.id}
            member={currentMember}
            name={name}
            paramKey="conversationId"
            paramValue={conversation.id}
            socketQuery={{
              conversationId: conversation.id,
            }}
            socketUrl="/api/socket/direct-messages"
            type="conversation"
          />
          <ChatInput
            apiUrl="/api/socket/direct-messages"
            name={name}
            query={{
              conversationId: conversation.id,
              serverId: serverId,
            }}
            type="conversation"
          />
        </>
      )}
    </div>
  );
};

export default MemberIdPage;
