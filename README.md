# DiscordBot
Custom made discord bot for moderation purposes

## How to start
You need to create a configuration file first. It should be a JSON with two at least two arguments:
```
{
    "token": "",
    "prefix": ""
}
```
The token should be your bot token from [Discord developers](https://discordapp.com/developers/applications/).
The prefix can be whatever you feel like, I normally use '!'.

This will install all the dependencies needed:
```
npm install --save
```

To actually start the bot type:
```
npm start
```

## But what does it do?
Moderation functions:
Kick, ban, temporary ban, unban, mute, temporary mute, unmute, issue a warning, remove a warning.

Information function:
List banned users, list user's infractions.

Others:
Clear lines, list commands, give information on one command.

## Author
* **João Carvalho** - [JohnnyOak](http://johnnyoak85.github.io/)

## Acknowledgments
* The cool people at [The Other Side](https://discord.gg/ZrdMG2R) for helping me test.
* My friend [André Leal](https://github.com/Agleal) who's always available for help and discussing ideas.
