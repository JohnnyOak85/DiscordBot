import moment from 'moment';

const fs = module.require('fs-extra');
const infractorDoc = './lists/muted.json';

export const name = 'mute';
export const description = 'Mute a member';
export async function execute(message, args) {
    // Check if the user that issued the command has permissions
    if (!message.member.hasPermission('MANAGE_MESSAGES'))
        return message.reply('you do not have permission for this command!');

    // Get the infractor to apply the command to
    const infractor = message.mentions.members.first();
    if (!infractor || !infractor.manageable)
        return message.reply('you need to mention a valid user!');

    // Check if the muted role exists
    let role = message.guild.roles.cache.find(mR => mR.name === 'Muted');
    if (!role) {
        role = await message.guild.roles.create({
            data: {
                name: 'Muted',
                permissions: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY']
            }
        });

        // Prevent the muted role from sending messages or reacting to messages
        message.guild.channels.cache.forEach(async (channel, id) => {
            await channel.updateOverwrite(role, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false
            })
                .catch(err => { throw err; });
        });
    }

    // Check to see if the infractor is already muted
    if (infractor.roles.cache.has(role.id))
        return message.channel.send('This user is already muted!');

    // Get the amount of time to mute the infractor and check if it's a valid amount
    let amount = parseInt(args[1]);
    if (!amount || amount < 1 || amount > 100 || isNaN(amount))
        amount = 5;

    // Set the timer
    const time = moment().add(amount, 'minutes').format();

    // Check if a list of infractors exists
    if (!fs.pathExistsSync(infractorDoc))
        fs.outputFileSync(infractorDoc, '{}');
    let infractorList = fs.readJsonSync(infractorDoc);

    // Check if the infractor is on the list
    if (infractorList[infractor.id])
        infractorList.splice(infractorList.indexOf(infractor.id), 1);

    // Apply the command
    await infractor.roles.add(role);
    infractorList[infractor.id] = {
        guild: message.guild.id,
        time: time
    };
    fs.writeJsonSync(infractorDoc, infractorList);
    message.channel.send(`${infractor.user.username} has been muted for ${amount} minutes!`);
}