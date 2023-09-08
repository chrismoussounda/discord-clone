'use client';
import { Member, Message, Profile } from '@prisma/client';
import { ChatWelcome } from './chat-welcome';
import { useChatQuery } from '@/hooks/use-chat-query';
import { Loader2, ServerCrash } from 'lucide-react';
import { ElementRef, Fragment, useRef } from 'react';
import { ChatItem } from './chat-item';
import { format } from 'date-fns';
import { useChatSocket } from '@/hooks/use-chat-socket';
import { useChatScroll } from '@/hooks/use-chat-scroll';

const DATE_FORMAT = 'd MMM yyyy, HH:mm';

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

interface ChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, any>;
  paramKey: 'channelId' | 'conversationId';
  paramValue: string;
  type: 'channel' | 'conversation';
}

export const ChatMessages = ({
  apiUrl,
  chatId,
  member,
  name,
  paramValue,
  socketQuery,
  socketUrl,
  type,
  paramKey,
}: ChatMessagesProps) => {
  console.log({ socketQuery });
  const queryKey = `chat:${chatId}`;
  const addKey = `chat:${chatId}:messages`;
  const updateKey = `chat:${chatId}:messages:update`;
  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<ElementRef<'div'>>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({
    apiUrl,
    paramKey,
    paramValue,
    queryKey,
  });
  useChatSocket({ addKey, updateKey, queryKey });
  useChatScroll({
    bottomRef,
    chatRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items.length ?? 0,
  });
  if (status === 'loading')
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-8 text-zinc-500 data:text-zinc-300 animate-spin" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading messages...</p>
      </div>
    );
  if (status === 'error')
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-8 text-zinc-500 data:text-zinc-300" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Something went wrong</p>
      </div>
    );
  return (
    <div ref={chatRef} className="flex-1 flex flex-col py-4 overflow-y-auto">
      {!hasNextPage && (
        <>
          <div className="flex-1"></div>
          <ChatWelcome type={type} name={name} />
        </>
      )}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 text-xs my-4 transition"
            >
              Load previous chats
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data &&
          data.pages &&
          data.pages.map((group, i) => (
            <Fragment key={i}>
              {group &&
                group.items.map((message: MessageWithMemberWithProfile) => (
                  <ChatItem
                    key={message.id}
                    currentMember={member}
                    content={message.content}
                    fileUrl={message.fileUrl || ''}
                    deleted={message.deleted}
                    isUpdated={message.createAt !== message.updateAt}
                    timestamp={format(new Date(message.createAt), DATE_FORMAT)}
                    member={message.member}
                    socketUrl={socketUrl}
                    socketQuery={{ ...socketQuery, messageId: message.id }}
                  />
                ))}
            </Fragment>
          ))}
      </div>
      <div ref={bottomRef}></div>
    </div>
  );
};
