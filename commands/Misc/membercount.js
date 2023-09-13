const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'membercount',
  description: 'Get the member count of the server.',
  filters: ['USER'],
  aliases: ['mc'],
  execute(message, args) {
    const guild = message.guild;
    const memberCount = guild.memberCount;
    const serverName = guild.name;

    const formattedCount = `<:members:1124383073660833982> **__Total Members__: ${memberCount}**`;

    const embed = new MessageEmbed()
      .setColor(config.color.default)
      .setTitle(`${serverName} Member Count`) // Use backticks (`) instead of single quotes (') here
      .setDescription(formattedCount)
      .setImage(config.gifurl);

    message.channel.send(embed);
  },
};
