const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'Unban a user from the server.',
  filters: ['ADMIN'],

  async execute(message, args) {
    // Check if the user has the necessary permissions to unban
    if (!message.member.hasPermission('BAN_MEMBERS')) {
      return message.reply('You do not have permission to use this command.');
    }

    let userId = args[0];
    if (!userId) {
      return message.reply('Please provide a user ID or mention to unban.');
    }

    // If the argument is a mention, extract the user ID from it
    if (userId.startsWith('<@') && userId.endsWith('>')) {
      userId = userId.slice(2, -1);
      if (userId.startsWith('!')) {
        userId = userId.slice(1);
      }
    }

    try {
      const bannedUsers = await message.guild.fetchBans();
      const bannedUser = bannedUsers.get(userId);
      if (!bannedUser) {
        return message.reply('User not found in the ban list.');
      }

      await message.guild.members.unban(userId);

      const unbannedUser = `<@${userId}>`;

      const unbanEmbed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle(`Unbanned User`)
        .addField('User', unbannedUser, true)
        .addField('Moderator', message.author.tag, true)
        .setTimestamp();

      message.channel.send(unbanEmbed);
    } catch (error) {
      console.error(error);
      message.reply('An error occurred while trying to unban the user.');
    }
  },
};
