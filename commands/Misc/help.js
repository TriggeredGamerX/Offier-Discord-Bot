const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'help',
  description: 'Display the command list.',
  filters: ['USER'], // Adjust filters as needed
  execute(message, args) {
    const { commands } = message.client;

    if (!args[0]) {
      const embed = new MessageEmbed()
        .setColor(config.color.default)
        .setTitle('Help Menu')
        .setDescription('Select a filter to view available commands:\n\n' +
          'Use `' + config.prefix + 'help USER` for User commands.\n' +
          'Use `' + config.prefix + 'help ECONOMY` for Economy commands.\n' +
          'Use `' + config.prefix + 'help PREMIUM` for Premium commands.\n' +
          'Use `' + config.prefix + 'help ADMIN` for Admin commands.\n' +
          'Use `' + config.prefix + 'help STOCKER` for Stocker commands.')
        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
        .setTimestamp()
        .setImage(config.gifurl);

      message.channel.send(embed);
      return;
    }

    const selectedFilter = args[0].toUpperCase();
    const filteredCommands = commands.filter(command => 
      command.filters && command.filters.includes(selectedFilter)
    );

    if (filteredCommands.size === 0) {
      return message.channel.send('No commands found for the selected filter.');
    }

    const embed = new MessageEmbed()
      .setColor(config.color.default)
      .setTitle(`${selectedFilter} Commands`)
      .setDescription(getCommandList(filteredCommands))
      .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
      .setTimestamp()
      .setImage(config.gifurl);

    message.channel.send(embed);
  }
};

function getCommandList(commands) {
  const uniqueCommands = new Map();

  commands.forEach(command => {
    if (command.name && !uniqueCommands.has(command.name.toLowerCase())) {
      uniqueCommands.set(command.name.toLowerCase(), command);
    }
  });

  return Array.from(uniqueCommands.values())
    .map(command => `**\`${config.prefix}${command.name}\`**: ${command.description ? command.description : '*No description provided*'}`)
    .join('\n');
}
