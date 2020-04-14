const fs = require('fs');
const winston = require('winston');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

// Initialize Discord Bot
const client = new Discord.Client();
client.commands = new Discord.Collection();

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
    client.commands.set(command.name, command);
}

// When the client is ready, run this code
// This event will only trigger one time after logging in
// client.on('ready', () => logger.log('info', 'The bot is now online.'));
client.on('ready', () => {
    console.log('The bot is now online.')
})

client.on('debug', m => logger.log('debug', m));
client.on('warn', m => logger.log('warn', m));
client.on('error', m => logger.log('error', m));
process.on('uncaughtException', error => logger.log('error', error));

// Login to Discord with your app's token
client.login(token);

// Listen to messages
client.on('message', message => {
    // console.log(message.member)
    // console.log(message.guild.roles)
    if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) return;

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        logger.log(error);
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
})

setInterval(() => {
    const muteListUrl = './lists/muted.json';
    if (fs.pathExistsSync(muteListUrl)) return;
    let mutedList = fs.readJsonSync(muteListUrl);
    const users = Object.keys(mutedList);
    for (const user of users) {
        if(user.time.isBefore(Date.now())) return;
    }
    
}, 5000);