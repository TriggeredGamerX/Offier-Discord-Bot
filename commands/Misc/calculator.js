module.exports = {
  name: 'calculate',
  description: 'Perform simple calculations directly in Discord.',
  filters: ['USER'],
  execute(message, args) {
    if (args.length !== 1) {
      return message.reply('Usage: .calculate <expression>');
    }

    try {
      const result = eval(args[0]);
      message.reply(`Result: ${result}`);
    } catch (error) {
      message.reply('Invalid expression. Please check your input.');
    }
  },
};
