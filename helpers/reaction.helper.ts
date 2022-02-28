import { Message, MessageEmbed, TextChannel } from 'discord.js';

import { addRole, removeRole } from './roles.helper';
import { getRandom } from './tools/utils.helper';
import { getDoc } from './tools/database.helper';

import { DataList } from '../interfaces';

type EmojiMap = { [name: string]: string };

const cleanString = async (str: string) => {
  const chars = await getDoc<string[]>('configurations', 'chars');

  for (const char of chars) {
    const regex = new RegExp(`\\${char}`, 'g');

    str = str.replace(regex, ' ');
  }

  return str;
};

const getReply = async (message: string, file: string) => {
  message = await cleanString(message);

  const map = await getDoc<DataList>('configurations', file);
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

export const collectReactions = async (message: Message, emojiList: EmojiMap, stack = false) => {
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

      addRole(member.guild.roles.cache.array(), [member], emojiList[reaction.emoji.name], member.id);

      if (stack) return;

      for (const collectedReaction of collector.collected.array()) {
        if (collectedReaction.emoji.name === reaction.emoji.name) continue;

        const collectedUser = collectedReaction.users.resolve(user);

        if (!collectedUser) continue;

        collectedReaction.users.remove(collectedUser);
        removeRole(member.guild.roles.cache.array(), [member], emojiList[collectedReaction.emoji.name], member.id);
      }
    });

    collector.on('remove', async (reaction, user) => {
      const member = await message.guild?.members.fetch(user);
      if (!member || member.user.bot || !emojiList[reaction.emoji.name]) return;

      removeRole(member.guild.roles.cache.array(), [member], emojiList[reaction.emoji.name], member.id);
    });
  } catch (error) {
    throw error;
  }
};

export const setReactionMessage = async (embed: MessageEmbed, mapName: string, channel: TextChannel, stack = false) => {
  const messages = (await channel.messages.fetch()).array();
  const map = await getDoc<DataList>('configurations', mapName);
  const previousMessage = messages.find((oldMessage) => {
    const embeds = oldMessage.embeds.filter((oldEmbed) => oldEmbed.title === embed.title);

    if (embeds.length) return oldMessage;
  });
  let message;

  if (!messages.length || !previousMessage?.embeds.length) {
    message = await channel.send(embed);
  } else {
    message = previousMessage;
  }

  collectReactions(message, map, stack);
};

export const getQuote = () => getDoc<string[]>('', 'quotes').then((quotes) => quotes[getRandom(quotes.length, 0)]);
