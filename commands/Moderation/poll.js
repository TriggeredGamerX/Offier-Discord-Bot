module.exports = {
  name: 'poll',
  description: 'Create a poll to gather opinions or votes.',
  filters: ['USER'],
  execute(message, args) {
    const question = args.join(' ');
    if (!question) {
      return message.reply('Usage: .poll <question>');
    }

    message.channel.send(`📊 **Poll:** ${question}`).then((pollMessage) => {
      pollMessage.react('👍');
      pollMessage.react('👎');
      pollMessage.react('🤷');
    });
  },
};
