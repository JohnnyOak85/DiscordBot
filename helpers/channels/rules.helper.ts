import { Guild, NewsChannel, TextChannel } from 'discord.js';
import { RULE_LIST } from '../../config.json';
import { buildInfoChannel } from '../channels.helper';

export const setRulesChannel = async (guild: Guild) => {
  try {
    const rulesChannel = await buildInfoChannel(guild, 'rules');

    if (rulesChannel && rulesChannel.isText()) {
      setRules(rulesChannel, RULE_LIST);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * @description Sends a message with the rules list to the system channel.
 */
export const setRules = async (channel: TextChannel | NewsChannel, rules: string[]) => {
  try {
    let reply = '```markdown\n';

    for (const rule of rules) {
      reply += `* ${rule}\n`;
    }

    reply += '```';

    const messages = await channel.messages.fetch();

    for await (const message of messages.array()) {
      if (message.content !== reply) {
        message.delete();
      }
    }

    if (!messages.array().length) {
      channel.send(reply);
    }
  } catch (error) {
    throw error;
  }
};
