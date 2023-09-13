const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'invite',
  description: 'Generate a bot invite link with the provided user ID and permissions.',
  execute(message, args) {
    if (!args[0]) {
      return message.channel.send('Please provide a user ID.');
    }

    const clientId = args[0];
    const defaultPermissions = 379904; // Default permissions scope (Read Messages, Send Messages, Read Message History, Embed Links)

    let permissions = defaultPermissions;

    // Check if 'ADMIN' is specified in the arguments
    if (args.includes('ADMIN')) {
      permissions |= 8; // Add 'Administrator' permission
    }

    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot`;

    const embed = new MessageEmbed()
      .setColor('#00ff00')
      .setTitle('Bot Invite Link')
      .setDescription(`Click [here](${inviteLink}) to invite the bot to your server.\n\nIf you want to customize the permissions, you can use the [Discord Permissions Calculator](https://discordapi.com/permissions.html) to get the desired permissions scope.`);

    message.channel.send(embed);
  },
};
