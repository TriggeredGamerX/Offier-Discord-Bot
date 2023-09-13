// Dependencies
const { MessageEmbed, Message, DiscordAPIError } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');
const CatLoggr = require('cat-loggr');

// Functions
const log = new CatLoggr();
const generated = new Set();

module.exports = {
    name: 'gen', // Command name
    description: 'Generate a specified service if stocked.', // Command description
    filters: ['USER'],
    /**
     * Command execute
     * @param {Message} message The message sent by the user
     * @param {Array[]} args Arguments split by spaces after the command name
     */
    execute(message, args) {
        // If the generator channel is not given in the config or is invalid
        try {
            message.client.channels.cache.get(config.genChannel).id; // Try to get the channel's id
        } catch (error) {
            if (!message.member.roles.cache.has(config.freegenrole)) {
                return message.channel.send(
                    new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Insufficient Permissions')
                        .setDescription('You do not have the required role to use this command.')
                        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                        .setTimestamp()
                );
            }

            // Send error message if the "error_message" field is "true" in the configuration
            if (config.command.error_message === true) {
                return message.channel.send(
                    new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Error occurred!')
                        .setDescription('Not a valid gen channel specified!')
                        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                        .setTimestamp()
                );
            } else return;
        }

        // If the message channel id is the generator channel id in configuration
        if (message.channel.id === config.genChannel) {
            // If the user has cooldown on the command
            if (generated.has(message.author.id)) {
                return message.channel.send(
                    new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Cooldown!')
                        .setDescription(`Please wait **${config.genCooldownsec}** seconds before executing that command again!`)
                        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                        .setTimestamp()
                );
            } else {
                // Parameters
                const service = args[0];

                // If the "service" parameter is missing
                if (!service) {
                    return message.channel.send(
                        new MessageEmbed()
                            .setColor(config.color.red)
                            .setTitle('Missing parameters!')
                            .setDescription('You need to give a service name!')
                            .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                            .setTimestamp()
                    );
                }

                // File path to find the given service
                const filePath = `${__dirname}/../stock/${args[0]}.txt`;

                // Read the service file
                fs.readFile(filePath, function (error, data) {
                    // If no error
                    if (!error) {
                        data = data.toString(); // Stringify the content

                        const position = data.toString().indexOf('\n'); // Get position
                        const firstLine = data.split('\n')[0]; // Get the first line

                        // If the service file is empty
                        if (position === -1) {
                            return message.channel.send(
                                new MessageEmbed()
                                    .setColor(config.color.red)
                                    .setTitle('Generator error!')
                                    .setDescription(`I do not find the \`${args[0]}\` service in my stock!`)
                                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                    .setTimestamp()
                            );
                        }

                        // Send messages to the user
                        const embedMessage = new MessageEmbed()
                            .setColor(config.color.green)
                            .setTitle('Generated account')
                            .addField('Service', `\`\`\`${args[0][0].toUpperCase()}${args[0].slice(1).toLowerCase()}\`\`\``, true)
                            .addField('Account', `\`\`\`${firstLine}\`\`\``, true)
                            .setTimestamp();

                        // Try sending a direct message to the user
                        message.author.send(`__Here is your generated account:__\n\nService: **${args[0][0].toUpperCase()}${args[0].slice(1).toLowerCase()}**\nAccount: *${firstLine}*`)
                            .then(() => {
                                // Direct message sent successfully
                                message.author.send(embedMessage);

                                // Send message to the channel if the user received the message
                                if (position !== -1) {
                                    data = data.substr(position + 1); // Remove the generated account line

                                    // Write changes
                                    fs.writeFile(filePath, data, function (error) {
                                        if (error) {
                                            log.error(error);
                                        } else {
                                            message.channel.send(
                                                new MessageEmbed()
                                                    .setColor(config.color.green)
                                                    .setTitle('Account generated successfully!')
                                                    .setDescription(`**Check your private messages!** **If you do not receive the message, please enable your direct messages!**`)
                                                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                                    .setTimestamp()
                                            );

                                            generated.add(message.author.id); // Add user to the cooldown set

                                            // Set cooldown time
                                            setTimeout(() => {
                                                generated.delete(message.author.id); // Remove the user from the cooldown set after expire
                                            }, config.genCooldown);
                                        }
                                    });
                                } else {
                                    // If the service is empty
                                    message.channel.send(
                                        new MessageEmbed()
                                            .setColor(config.color.red)
                                            .setTitle('Generator error!')
                                            .setDescription(`The \`${args[0]}\` service is empty!`)
                                            .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                            .setTimestamp()
                                    );
                                }
                            })
                            .catch((error) => {
                                // Error sending direct message
                                if (error instanceof DiscordAPIError && (error.code === 50035 || error.code === 50007)) {
                                    // Handle the specific error related to embed length or cannot send messages
                                    message.channel.send(
                                        new MessageEmbed()
                                            .setColor(config.color.red)
                                            .setTitle('Error Sending Message')
                                            .setDescription(`The generated message is too long to send via direct message. Please try again.`)
                                            .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                            .setTimestamp()
                                    );
                                } else {
                                    // Handle other errors
                                    message.channel.send(
                                        new MessageEmbed()
                                            .setColor(config.color.red)
                                            .setTitle('Error Sending Message')
                                            .setDescription(`An error occurred while sending you a direct message. Please try again later.`)
                                            .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                            .setTimestamp()
                                    );
                                    log.error(error);
                                }
                            });
                    } else {
                        // If the service does not exist
                        return message.channel.send(
                            new MessageEmbed()
                                .setColor(config.color.red)
                                .setTitle('Generator error!')
                                .setDescription(`Service \`${args[0]}\` does not exist!`)
                                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                .setTimestamp()
                        );
                    }
                });
            }
        } else {
            // If the command is executed in another channel
            message.channel.send(
                new MessageEmbed()
                    .setColor(config.color.red)
                    .setTitle('Wrong command usage!')
                    .setDescription(`You cannot use the \`gen\` command in this channel! Try it in <#${config.genChannel}>!`)
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp()
            );
        }
    }
};
