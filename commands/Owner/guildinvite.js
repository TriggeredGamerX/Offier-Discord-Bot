const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'guildinvite',
  description: 'Generate an invite link for a guild using its ID.',
  filters: 'USER',
  execute(message, args) {
    if (args.length !== 1) {
      return message.reply('Usage: .guildinvite <guild_id>');
    }

    const guildId = args[0];
    const guild = message.client.guilds.cache.get(guildId);

    if (!guild) {
      return message.reply('Guild not found.');
    }

    guild.channels.create('invite-channel', { type: 'text' }).then(channel => {
      channel.createInvite().then(invite => {
        const embed = new MessageEmbed()
          .setColor('#00ff00')
          .setTitle(`Invite Link for ${guild.name}`)
          .setDescription(`Here is the invite link for the guild: ${invite.url}`)
          .setFooter('Bot by Your Name', message.client.user.displayAvatarURL())
          .setTimestamp();

        message.channel.send(embed);
      }).catch(error => {
        console.error(error);
        return message.reply('An error occurred while generating the invite link.');
      });
    }).catch(error => {
      console.error(error);
      return message.reply('An error occurred while creating a channel.');
    });
  },
};
