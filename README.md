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
Assuming you're using the '!' prefix:
!help - displays a short list of these commands
!kick - kicks a user, you can provide a reason
!ban - bans a user, you can provide a reason
!mute - mutes a user, you need to provide a number from 1 to 100, otherwise it will default to 5 minutes
!unmute - unmutes a user
!clear - clears lines, you need to provide a number from 1 to 100
!warn - gives a user an infraction

## Author
* **João Carvalho** - [JohnnyOak](http://johnnyoak85.github.io/)

## Acknowledgments
* The cool people at [The Other Side](https://discord.gg/ZrdMG2R) for helping me test.
* My friend [André Leal](https://github.com/Agleal) who's always available for help and discussing ideas.
