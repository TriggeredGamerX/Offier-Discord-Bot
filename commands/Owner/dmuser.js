const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'dmuser',
  description: 'Send a message to a specific user via DM.',
  filters: ['ADMIN'],
  async execute(message, args) {
    const mentionedUser = message.mentions.users.first();

    if (!mentionedUser) {
      return message.reply('Please mention a user to send a DM to.');
    }

    const dmMessage = args.slice(1).join(' ');

    if (!dmMessage) {
      return message.reply('Please provide a message to send.');
    }

    const owner = message.guild.ownerID;

    if (mentionedUser.id === owner) {
      // Only the owner can execute the command if mentioned in the chat
      const isOwner = message.author.id === owner;
      if (!isOwner) {
        return message.reply('Only the server owner can use this command.');
      }
    }

    const dmEmbed = new MessageEmbed()
      .setColor(config.color.default)
      .setTitle('Direct Message')
      .setDescription(dmMessage)
      .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
      .setTimestamp();

    try {
      await mentionedUser.send(dmEmbed);

      const successEmbed = new MessageEmbed()
        .setColor(config.color.success)
        .setDescription(`✉️ Message sent to ${mentionedUser}`);

      message.channel.send(successEmbed);
    } catch (error) {
      console.error('Error sending DM:', error);
      return message.reply('❌ An error occurred while sending the DM.');
    }
  },
};
