'use client';
import { Video, VideoOff } from 'lucide-react';
import { useParams, usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import queryString from 'query-string';
import ActionTooltip from '../action-tooltip';
import { useEffect, useState } from 'react';

export const ChatVideoButon = () => {
  const router = useRouter();
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    const pathname = window.location.pathname;
    const url = queryString.stringifyUrl({
      url: pathname,
      query: {
        video: isVideo,
      },
    });
    router.push(url);
  }, [isVideo, router]);

  const onClick = () => {
    setIsVideo(!isVideo);
  };
  const Icon = isVideo ? VideoOff : Video;
  const toolTipLabel = isVideo ? 'End video call' : 'Start video call';
  console.log({ isVideo, toolTipLabel, Icon });

  return (
    <ActionTooltip side="bottom" label={toolTipLabel}>
      <button onClick={onClick} className="hover:opacity-75 transition mr-4">
        <Icon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
      </button>
    </ActionTooltip>
  );
};
