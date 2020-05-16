// Importeren van ms voor het omvormen van de tijd naar milliseconden.
const ms = require("ms");

module.exports.run = async (bot, message, args) => {

    // !tempban gebruiker reden tijd

    // Nakijken als je wel het command mag gebruiken.
    if (!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send("Sorry je hebt geen toestemming om dit command te gebruiken.");

    // User opvragen en nakijken als je wel een user meegeeft.
    var user = message.guild.member(message.mentions.users.first());

    if (!user) return message.channel.send("Je maakt als volgt gebruik van het command: !tempban gebruiker tijd reden.");

    // Nakijken als je de gebruiker wel kunt bannen.
    if (user.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Deze gebruiker kan je niet temp bannen.");

    // Redenen verkrijgen en nakijken als je wel een redenen opgeeft.
    var reason = args.join(" ").slice(22);

    if (!reason) return message.channel.send("Geef een reden op");

    // Verkrijgen van de tijd.
    var tempBanTime = args[1];

    // Nakijken als de tijd geldig is zie https://www.npmjs.com/package/ms voor meer info.
    if (ms(tempBanTime)) {

        // We gaan een await gebruiken die de user bant en na een tijd deze unbant.
        // Een await gaat wachten tot er een "belofte" komt.
        await message.guild.member(user).ban(reason);

        message.channel.send(`${user} is gebanned voor ${tempBanTime}`);

        // We gaan een timeout zetten voor terug te unbannen.
        setTimeout(function () {
            
            // Hier moet je het ID meegeven om te kunnen unbannen. (Moet zo volgens discord.js).
            message.guild.unban(user.id);

            message.channel.send(`${user} is niet meer gebanned.`);

        }, ms(tempBanTime));

    // Als je geen geldige tijd hebt opgegeven.
    } else {
        return message.channel.send("Geef en geldige tijd op.");
    }

}

module.exports.help = {
    name: "tempban"
}