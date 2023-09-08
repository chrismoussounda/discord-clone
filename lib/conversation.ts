import { db } from './db';

export const getOrCreateConversation = async (membreOneId: string, memberTwoId: string) => {
  let conversation =
    (await finConversation(membreOneId, memberTwoId)) ||
    (await finConversation(memberTwoId, membreOneId));

  if (!conversation) conversation = await createNewConversation(membreOneId, memberTwoId);
  return conversation;
};

const finConversation = async (memberOneId: string, memberTwoId: string) =>
  await db.conversation.findFirst({
    where: {
      AND: [{ memberOneId }, { memberTwoId }],
    },
    include: {
      memberOne: {
        include: {
          profile: true,
        },
      },
      memberTwo: {
        include: {
          profile: true,
        },
      },
    },
  });

const createNewConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    return await db.conversation.create({
      data: {
        memberOneId,
        memberTwoId,
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          },
        },
        memberTwo: {
          include: {
            profile: true,
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};
