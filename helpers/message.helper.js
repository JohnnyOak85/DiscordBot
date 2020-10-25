const { BANNED_WORDS } = require("../docs/banned-words.json");
const { BANNED_SITES } = require("../docs/banned-sites.json");

function isBanned(message) {
  if (
    BANNED_WORDS.some((word) => message.toLowerCase().includes(word)) ||
    BANNED_SITES.some((site) => message.toLowerCase().includes(site))
  ) {
    return true;
  }
}

function textRepeated(message) {
  const words = message.split(" ");

  for (const wordA of words) {
    let counter = 0;

    for (const wordB of words) {
      if (wordA.length < 3) continue;

      if (wordA.toLowerCase() === wordB.toLowerCase()) counter++;

      if (counter > 5) return true;
    }
  }
}

function isShouting(message) {
  let counter = 0;

  if (message.length < 60) return;

  for (const char of message) {
    if (char === char.toUpperCase()) counter++;
  }

  if (counter >= 60) return true;
}

async function purgeMessage(message, reply) {
  try {
    await message.delete();
    await message.reply(reply);
  } catch (error) {
    throw error;
  }
}

async function messageRepeated(channel, userID, incomingMessage) {
  try {
    if (channel.type !== 'text') return;

    let messages = await channel.messages.fetch({ limit: 25 });
    messages = messages.filter(message => message.author.id === userID);

    for (const message of messages) {
      if (message.content === incomingMessage) return true;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  isBanned: isBanned,
  textRepeated: textRepeated,
  isShouting: isShouting,
  purgeMessage: purgeMessage,
  messageRepeated: messageRepeated
}