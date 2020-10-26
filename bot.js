const { Client, Collection } = require('discord.js');
const { TOKEN, PREFIX } = require(`./docs/config.json`);

const { buildCommands, promote, buildDoc, setGuild } = require('./helpers/login.helper');
const { logError, logInfo } = require('./helpers/log.helper');
const { checkTimers } = require('./helpers/time.helper');
const { checkMessage } = require('./helpers/message.helper');
const { registerMember, updateMember } = require('./helpers/member.helper');
const { registerBan } = require('./helpers/ban.helper');
const { getDate } = require('./helpers/time.helper');

// Initialize Discord Bot
const bot = new Client();
bot.commands = new Collection();

bot.login(TOKEN);

bot.on('ready', async () => {
    try {
        await buildCommands(bot.commands);
        await promote(bot.guilds.cache, bot.user.id);
        await buildDoc(bot.guilds.cache);
        await setGuild(bot.guilds.cache);
        logInfo(`The bot went online at: ${getDate()}`);

        bot.setInterval(async () => {
            await checkTimers(bot.guilds.cache);
        }, 5000);
    } catch (error) {
        logError(error);
    }
})

bot.on('message', async message => {
    try {
        if (message.channel.type === 'dm') return;

        await checkMessage(message);

        if (!message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        if (!bot.commands.has(command)) {
            await message.channel.send('Invalid command.');
            return;
        }

        await bot.commands.get(command).execute(message, args)
    } catch (error) {
        await message.channel.send('There was an error trying to execute that command!');
        logError(error);
    }
});

bot.on("messageUpdate", async (oldMessage, newMessage) => {
    try {
        await checkMessage(newMessage);
    } catch (error) {
        logError(error);
    }
});

bot.on('guildMemberAdd', async member => {
    try {
        await registerMember(member);
    } catch (error) {
        logError(error);
    }
});

bot.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
        await updateMember(newMember);
    } catch (error) {
        logError(error);
    }
})

bot.on("guildBanAdd", async (guild, member) => {
    try {
        await registerBan(guild.id, member, true);
    } catch (error) {
        logError(error);
    }
});

bot.on("guildBanRemove", async (guild, member) => {
    try {
        await registerBan(guild.id, member, false);
    } catch (error) {
        logError(error);
    }
});

bot.on('error', error => logError(error));