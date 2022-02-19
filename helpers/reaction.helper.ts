import { Message, MessageEmbed, MessageManager, NewsChannel, TextChannel } from 'discord.js';

import { giveRole, removeRole } from './roles.helper';
import { getDoc } from './storage.helper';

import { Dictionary } from '../interfaces/dictionary.interface';

const getMessages = async (manager: MessageManager) => {
  try {
    const messages = await manager.fetch();

    return messages.array();
  } catch (error) {
    throw error;
  }
};

async function cleanString(str: string) {
  const chars = await getDoc<string[]>(`configurations/chars`);

  for (const char of chars) {
    const regex = new RegExp(`\\${char}`, 'g');

    str = str.replace(regex, ' ');
  }

  return str;
}

/**
 * @description Returns an reply based on trigger expressions.
 */
const getReply = async (message: string, file: string) => {
  message = await cleanString(message);

  const map = await getDoc<Dictionary<string>>(`configurations/${file}`);
  const words = message.split(' ');

  for (const word of words) {
    const specialIndex = `${word} ${words[words.indexOf(word) + 1]}`;

    if (map[word]) {
      return map[word];
    } else if (map[specialIndex]) {
      return map[specialIndex];
    }
  }
};

export const react = async (message: Message) => {
  try {
    const reply = await getReply(message.content.toLowerCase(), 'replies');
    const reaction = await getReply(message.content.toLowerCase(), 'reactions');

    if (reply) message.channel.send(reply);
    if (reaction) message.react(reaction);
  } catch (error) {
    throw error;
  }
};

/**
 * @description Listens to all reactions to a given message.
 */
export const collectReactions = async (message: Message, emojiList: EmojiMap) => {
  try {
    for (const emoji of Object.keys(emojiList)) {
      if (!message.reactions.cache.array().length) {
        message.react(emoji);
      }
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

export const setReactionMessage = async (embed: MessageEmbed, mapName: string, channel: TextChannel | NewsChannel) => {
  const messages = await getMessages(channel.messages);
  const map = await getDoc<Dictionary<string>>(`configurations/emojis/${mapName}`);
  const previousMessage = messages.find((oldMessage) => {
    const embeds = oldMessage.embeds.filter((oldEmbed) => oldEmbed.title === embed.title);

    if (embeds.length) return oldMessage;
  });
  let message;
  let print = false;

  if (mapName === 'roles') {
    print = true;
  }

  if (!messages.length || !previousMessage?.embeds.length) {
    message = await channel.send(embed);
  } else {
    message = previousMessage;
  }

  collectReactions(message, map);
};
