// Dependencies
import { Collection, Message } from 'discord.js';

// Helpers
import { BOT_ID } from '../config.json';

/**
 * @description Checks if a message has too many uppercase letters.
 * @param message
 */
const isShouting = (message: string): boolean | undefined => {
  let counter = 0;

  if (message.length < 60) return;

  for (const char of message) {
    if (char === char.toUpperCase()) counter++;
  }

  if (counter >= 60) return true;
};

/**
 * @description Check if the message has been sent before by the same author in a short span.
 * @param channel
 * @param author
 * @param newMessage
 */
const repeatedMessage = async (messages: Collection<string, Message>, newMessage: Message): Promise<boolean | undefined> => {
  try {
    const lastMessage = messages.array()[1];

    if (!newMessage.content || !lastMessage || !lastMessage.content) return;

    if (lastMessage.id !== newMessage.id && lastMessage.content === newMessage.content) return true;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Check if the message is composed of repeated words.
 * @param message
 */
const repeatedWords = (message: string): boolean | undefined => {
  const words = message.split(' ');

  for (const firstWord of words) {
    let counter = 0;

    if (firstWord.length < 3) continue;

    for (const secondWord of words) {
      if (firstWord.toLowerCase() === secondWord.toLowerCase()) counter++;

      if (words.length > 5 && counter >= words.length / 2) return true;
    }
  }
};

/**
 * @description Checks to see if the messaged doesn't contain anything not permitted.
 * @param message
 */
const checkMessage = async (message: Message): Promise<string | undefined> => {
  try {
    if (message.channel.type === 'dm' || message.channel.type === 'news') return;

    if (message.mentions.users.size >= 3) return 'chill with the mention train!';

    if (isShouting(message.content.replace(/[^\w]/g, ''))) return 'stop shouting please!';

    if (repeatedWords(message.content.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').replace(/\s{2,}/g, ' ')))
      return 'is there an echo in here?';

    const messages = await message.channel.messages.fetch({ limit: 25 });
    const authorMessages = messages.filter((oldMessage) => oldMessage.author.id === message.author.id);

    if (await repeatedMessage(authorMessages, message)) return 'we heard you the first time!';
  } catch (error) {
    throw error;
  }
};

/**
 * @description Processes the message to be checked.
 * @param message
 */
const illegalMessage = async (message: Message): Promise<boolean | undefined> => {
  try {
    const messages = await message.channel.messages.fetch({ limit: 25 });
    const botMessages = messages.filter((message) => message.author.id === BOT_ID);

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

export { illegalMessage };
