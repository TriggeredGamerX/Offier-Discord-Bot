module.exports = {
  name: 'pick',
  description: 'Randomly pick an item from a list of options.',
  filters: ['USER'],
  execute(message, args) {
    if (args.length < 2) {
      return message.reply('Usage: .pick <option1> <option2> ... <optionN>');
    }

    const randomIndex = Math.floor(Math.random() * args.length);
    const pickedOption = args[randomIndex];
    message.reply(`Randomly picked: ${pickedOption}`);
  },
};
