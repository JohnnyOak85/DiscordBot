const fs = require('fs-extra');
const moment = require('moment');
const winston = require('winston');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

// Initialize Discord Bot
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

// Initialize the logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
    defaultMeta: { service: 'user-service' },
    transports: [new winston.transports.File({ filename: 'log' })]
});

// Get a list of commands
const commandFiles = fs.readdirSync('./commands');

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

// When the client is ready, run this code
// This event will only trigger one time after logging in
// client.on('ready', () => logger.log('info', 'The bot is now online.'));
bot.on('ready', () => {
    console.log('The bot is now online.');
    const muteListUrl = './lists/muted.json';
    bot.setInterval(() => {
        if (!fs.pathExistsSync(muteListUrl)) return;
        const mutedList = fs.readJsonSync(muteListUrl);
        if (!Object.keys(mutedList).length) return
        const users = Object.keys(mutedList);
        for (const user of users) {
            let mutedUser = mutedList[user];
            mutedUser.id = user;
            if (moment(mutedUser.time).isAfter(moment().format())) continue;

            const guild = bot.guilds.cache.get(mutedUser.guild);
            mutedUser = guild.members.cache.get(mutedUser.id);
            const mutedRole = mutedUser.guild.roles.cache.find(role => role.name === 'Muted');

            const channel = guild.channels.cache.find(channel => channel.name === 'general');
            mutedUser.roles.remove(mutedRole);
            delete mutedList[user];
            fs.writeJsonSync(muteListUrl, mutedList);

            channel.send(`${mutedUser.user.username} has been unmuted!`)
        }

    }, 5000);
})

bot.on('debug', m => logger.log('debug', m));
bot.on('warn', m => logger.log('warn', m));
bot.on('error', m => logger.log('error', m));
process.on('uncaughtException', error => logger.log('error', error));

// Login to Discord with your app's token
bot.login(token);

// Listen to messages
bot.on('message', message => {
    // console.log(message.member)
    // console.log(message.guild.roles)
    // console.log(bot.channels);
    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (!bot.commands.has(command)) return;

    try {
        bot.commands.get(command).execute(message, args);
    } catch (error) {
        logger.log(error);
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
})

client.on("guildMemberAdd", function(member){
    console.log(`a user joins a guild: ${member.tag}`);
});

client.on("messageReactionAdd", function(messageReaction, user){
    console.log(`a reaction is added to a message`);
});

client.on("messageReactionRemove", function(messageReaction, user){
    console.log(`a reaction is removed from a message`);
});