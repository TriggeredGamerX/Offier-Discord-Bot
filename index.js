require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const CatLoggr = require('cat-loggr');
const server = require('./server.js');
const { Client, MessageEmbed, WebhookClient } = require('discord.js');
const webhook = new WebhookClient('1140483650698367026', '4sjkfsEZgRK8yET8SazF4pLZ7VX-SSdsx89I5wJeJl1bz42wZUk5UDZxZK0XGSowR-pk');
const client = new Discord.Client();
const log = new CatLoggr();
client.commands = new Discord.Collection();

if (config.debug === true) client.on('debug', stream => log.debug(stream));
client.on('warn', message => log.warn(message));
client.on('error', error => log.error(error));
const commandFolders = fs.readdirSync('./commands');

for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    log.init(`Loaded command ${file.split('.')[0] === command.name ? file.split('.')[0] : `${file.split('.')[0]} as ${command.name}`}`);
    client.commands.set(command.name, command);

    if (command.aliases && Array.isArray(command.aliases)) {
      command.aliases.forEach(alias => {
        client.commands.set(alias, command);
      });
    }
  }
}

client.login(process.env.TOKEN);

client.once('ready', () => {
  log.info(`I am logged in as ${client.user.tag} to Discord!`);
  client.user.setActivity(`${config.prefix}help • ${config.status}`, { type: "LISTENING" });
});
client.on('guildCreate', async guild => {
  const embed = new MessageEmbed()
    .setColor('#00ff00')
    .setTitle('Bot Joined a Guild')
    .setDescription(`Bot has joined the guild: ${guild.name} (${guild.id})`)
    .setThumbnail(guild.iconURL())
    .addField('Guild Name', guild.name, true)
    .addField('Guild ID', guild.id, true)
    .setTimestamp();

  try {
    await webhook.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send message:', error);
  }
});

client.on('guildDelete', async guild => {
  const embed = new MessageEmbed()
    .setColor('#ff0000')
    .setTitle('Bot Left a Guild')
    .setDescription(`Bot has left the guild: ${guild.name} (${guild.id})`)
    .setThumbnail(guild.iconURL())
    .addField('Guild Name', guild.name, true)
    .addField('Guild ID', guild.id, true)
    .setTimestamp();

  try {
    await webhook.send({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to send message:', error);
  }
});

client.on('message', (message) => {
  if (!message.content.startsWith(config.prefix)) return;
  if (message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    return message.channel.send(
      new Discord.MessageEmbed()
        .setColor(config.color.red)
        .setTitle('Unknown command :(')
        .setDescription(`Sorry, but I cannot find the \`${commandName}\` command!`)
        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
        .setTimestamp()
    );
  }

  try {
    command.execute(message, args, client); // Pass the client object to the execute function
  } catch (error) {
    log.error(error);

    if (config.command.error_message === true) {
      message.channel.send(
        new Discord.MessageEmbed()
          .setColor(config.color.red)
          .setTitle('Error occurred!')
          .setDescription(`An error occurred while executing the \`${commandName}\` command!`)
          .addField('Error', `\`\`\`js\n${error}\n\`\`\``)
          .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
          .setTimestamp()
      );
    }
  }
});

// Closing curly brace for the entire file
