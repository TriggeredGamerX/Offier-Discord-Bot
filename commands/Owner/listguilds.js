const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'listguilds',
  description: 'List all the guilds the bot is a member of.',
  execute(message) {
    // Check if the command is executed by the bot owner
    if (message.author.id !== '1118784796198453309') {
      return message.reply('You are not authorized to use this command.');
    }

    const guilds = message.client.guilds.cache;

    const embed = new MessageEmbed()
      .setColor('#00ff00')
      .setTitle('List of Guilds')
      .setDescription(`Total Guilds: ${guilds.size}`)
      .addField('Server Name', guilds.map(guild => guild.name).join('\n'), true)
      .addField('Server ID', guilds.map(guild => guild.id).join('\n'), true)
      .setFooter('Bot by Your Name', message.client.user.displayAvatarURL())
      .setTimestamp();

    message.channel.send(embed);
  },
};
