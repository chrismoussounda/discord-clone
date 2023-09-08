import { CurrentProfilePages } from '@/lib/current-profile-pages';
import { db } from '@/lib/db';
import { NextApiResponseServerIo } from '@/types';
import { NextApiRequest } from 'next';
import { utapi } from 'uploadthing/server';

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIo) {
  try {
    if (req.method === 'POST') {
      const profile = await CurrentProfilePages(req);
      const { content, fileUrl } = req.body;
      const { serverId, channelId } = req.query;
      if (!profile) throw new Error('401|Not Authorized');
      if (!serverId || !channelId || !content)
        throw new Error('400|Data missing serverId, channelId and content must be provided');

      const server = await db.server.findUnique({
        where: {
          id: serverId as string,
          members: {
            some: {
              profileId: profile.id,
            },
          },
        },
        include: {
          members: true,
        },
      });
      if (!server) throw new Error('404|Server not found');
      const channel = await db.channel.findUnique({
        where: {
          id: channelId as string,
          serverId: server.id,
        },
      });
      if (!channel) throw new Error('404|Channel not found');
      const member = server.members.find((member) => member.profileId === profile.id);
      if (!member) throw new Error('404|Member not found');
      const message = await db.message.create({
        data: {
          content,
          channelId: channel.id,
          memberId: member.id,
          fileUrl,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
      const channelKey = `chat:${channelId}:messages`;
      res?.socket?.server.io.emit(channelKey, message);
      console.log({ channelKey, message });
      res.status(201).end();
    } else if (req.method === 'PATCH' || req.method === 'DELETE') {
      const isPatch = req.method === 'PATCH';
      const profile = await CurrentProfilePages(req);
      const { content } = req.body;
      const { serverId, channelId, messageId } = req.query;
      if (!profile) throw new Error('401|Not Authorized');
      if (!serverId || !channelId || (isPatch && !content) || !messageId)
        throw new Error(
          '400|Data missing serverId, channelId, content and messageId must be provided'
        );
      const server = await db.server.findUnique({
        where: {
          id: serverId as string,
          members: {
            some: {
              profileId: profile.id,
            },
          },
        },
        include: {
          members: true,
        },
      });
      if (!server) throw new Error('404|Server not found');
      const member = server.members.find((member) => member.profileId === profile.id);
      if (!member) throw new Error('404|Member not found');
      const channel = await db.channel.findUnique({
        where: {
          id: channelId as string,
          serverId: server.id,
        },
      });
      if (!channel) throw new Error('404|Channel not found');
      const message = await db.message.findUnique({
        where: {
          id: messageId as string,
          channelId: channel.id,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
      if (!message) throw new Error('404|Message not found');
      const isOwner = message.member.profileId === profile.id,
        isAdmin = member.role === 'ADMIN',
        isModerator = member.role === 'MODERATOR',
        canModify = isOwner || isAdmin || isModerator;
      if (!canModify) throw new Error('401|Not Authorized');

      const commonQuery = {
        where: { id: messageId },
        include: { member: { include: { profile: true } } },
      } as any;
      let updatedMessage: any;
      if (isPatch) {
        if (!isOwner) throw new Error('401|Not Authorized');
        updatedMessage = await db.message.update({
          data: { content },
          ...commonQuery,
        });
      } else {
        if (message.fileUrl) {
          try {
            const data = message.fileUrl.split('/');
            const key = data.pop() || '';
            await utapi.deleteFiles(decodeURIComponent(key));
          } catch (error) {
            console.log(error);
          }
        }
        updatedMessage = await db.message.update({
          data: { fileUrl: null, content: 'This message has been deleted', deleted: true },
          ...commonQuery,
        });
      }
      const channelKey = `chat:${channelId}:messages:update`;
      res?.socket?.server.io.emit(channelKey, updatedMessage);
      console.log({ channelKey, updatedMessage });
      res.status(200).json(updatedMessage);
    } else res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    let [code, message] = error.message.split('|');
    res.status(isFinite(code) ? +code : 500).json({ error: message || error.message });
  }
}
