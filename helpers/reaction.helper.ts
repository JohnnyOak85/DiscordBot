// Dependencies
import { Message } from 'discord.js';

// Helpers
import { giveRole, removeRole } from './roles.helper';

/**
 * @description Returns an emoji id based on trigger expressions.
 * @param message
 */
export const getReaction = (message: string) => {
  if (message.includes('this guy')) return '748203492480516138';
  if (message.includes('that guy')) return '767354452646035496';
  if (message.includes('gross')) return '835068013018349629';
  if (message.includes('oof')) return '767355833319030795';
  if (message.includes('ninja')) return '674906124167675904';
  if (message.includes(' sun')) return '670297733038604322';
  if (message.includes('sosig') || message.includes('sausage')) return '835068012968935445';
  if (message.includes('derp') || message.includes('derpy')) return '672740902048890880';
};

/**
 * @description Listens to all reactions to a given message.
 * @param message
 */
export const collectReactions = async (message: Message, emojiList: EmojiMap) => {
  try {
    for (const emoji of Object.keys(emojiList)) {
      if (!message.reactions.cache.array().length) message.react(emoji);
    }

    const collector = message.createReactionCollector((reaction) => Object.keys(emojiList).includes(reaction.emoji.name), {
      dispose: true
    });

    collector.on('collect', async (reaction, user) => {
      const member = await message.guild?.members.fetch(user);
      if (!member || member.user.bot || !emojiList[reaction.emoji.name]) return;

      for (const collectedReaction of collector.collected.array()) {
        if (collectedReaction.emoji.name === reaction.emoji.name) continue;

        const collectedUser = collectedReaction.users.resolve(user);

        if (!collectedUser) continue;

        collectedReaction.users.remove(collectedUser);
        removeRole(member, emojiList[collectedReaction.emoji.name]);
      }

      giveRole(member, emojiList[reaction.emoji.name]);
    });

    collector.on('remove', async (reaction, user) => {
      const member = await message.guild?.members.fetch(user);
      if (!member || member.user.bot || !emojiList[reaction.emoji.name]) return;

      removeRole(member, emojiList[reaction.emoji.name]);
    });
  } catch (error) {
    throw error;
  }
};
