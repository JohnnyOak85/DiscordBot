import { Message } from 'discord.js';

import { logError } from './tools/utils.helper';

import { BOT_ID } from '../config.json';
import { react } from './reaction.helper';
import { executeCommand } from './command.helper';
import { incrementMessages } from './member.helper';

const isShouting = (message: string) => {
  let counter = 0;

  if (message.length < 60) return;

  for (const char of message) {
    if (char === char.toUpperCase()) counter++;
  }

  if (counter >= 60) {
    return true;
  }
};

const repeatedMessage = async (lastMessage: Message, newMessage: Message) => {
  try {
    if (!newMessage.content || !lastMessage || !lastMessage.content) return;

    if (lastMessage.id !== newMessage.id && lastMessage.content === newMessage.content) return true;
  } catch (error) {
    throw error;
  }
};

const repeatedWords = (message: string) => {
  const words = message.split(' ');

  for (const firstWord of words) {
    let counter = 0;

    if (firstWord.length < 3) continue;

    for (const secondWord of words) {
      if (firstWord.toLowerCase() === secondWord.toLowerCase()) {
        counter++;
      }

      if (words.length > 5 && counter >= words.length / 2) {
        return true;
      }
    }
  }
};

const checkMessage = async (message: Message) => {
  try {
    if (message.channel.type === 'dm' || message.channel.type === 'news') return;

    if (message.mentions.users.size >= 3) {
      return 'chill with the mention train!';
    }

    if (isShouting(message.content.replace(/[^\w]/g, ''))) {
      return 'stop shouting please!';
    }

    if (repeatedWords(message.content.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s{2,}/g, ' '))) {
      return 'is there an echo in here?';
    }

    const messages = await message.channel.messages.fetch({ limit: 25 });
    const authorMessages = messages.filter((oldMessage) => oldMessage.author.id === message.author.id);

    if (await repeatedMessage(authorMessages.array()[1], message)) {
      return 'we heard you the first time!';
    }
  } catch (error) {
    throw error;
  }
};

const illegalMessage = async (message: Message) => {
  try {
    const messages = await message.channel.messages.fetch({ limit: 25 });
    const botMessages = messages.filter((filteredMessage) => filteredMessage.author.id === BOT_ID);

    if (message.author.bot || !message.member || message.member.hasPermission('MANAGE_MESSAGES')) return;

    const reply = await checkMessage(message);

    if (!reply) return;

    const sameMessage = botMessages.find(
      (botMessage) => botMessage.content.includes(reply) && botMessage.content.includes(message.author.id)
    );

    message.delete();

    if (sameMessage) return;

    message.reply(reply);

    return true;
  } catch (error) {
    throw error;
  }
};

export const checkMessageUpdate = (message: Message | undefined) => {
  if (!message || message.channel.type === 'dm' || message.author.bot) return;

  try {
    react(message);

    illegalMessage(message);
  } catch (error) {
    logError(error);
  }
};

export const checkIncomingMessage = async (message: Message) => {
  if (message.channel.type === 'dm' || message.author.bot) return;

  try {
    if (message.guild) {
      incrementMessages(message.guild, message.author.id);
    }

    react(message);

    if (await illegalMessage(message)) return;

    executeCommand(message);
  } catch (error) {
    logError(error);
  }
};
