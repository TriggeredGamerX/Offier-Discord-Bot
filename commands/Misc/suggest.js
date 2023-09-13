const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('suggestions.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the suggestions database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id INTEGER PRIMARY KEY,
        suggestion_text TEXT NOT NULL,
        suggested_by TEXT,
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0
      )
    `);
  }
});

module.exports = {
  name: 'suggest',
  description: 'Suggest something and allow others to vote on it.',
  filters: 'USER',
  execute(message, args) {
    const suggestionText = args.join(' ');
    if (!suggestionText) {
      return message.channel.send('Please provide a suggestion.');
    }

    // Replace 'suggestions-channel-id' with the ID of the specific channel where you want to send the suggestions
    const suggestionsChannel = message.guild.channels.cache.get('1138172215599300770');
    if (!suggestionsChannel || suggestionsChannel.type !== 'text') {
      return message.channel.send('The suggestions channel is not available. Please contact the server administrator.');
    }

    db.run(
      'INSERT INTO suggestions (suggestion_text, suggested_by) VALUES (?, ?)',
      [suggestionText, message.author.id],
      (err) => {
        if (err) {
          console.error('Error inserting suggestion into the database:', err.message);
          return message.channel.send('An error occurred while processing your suggestion.');
        }

        // Send the suggestion to the suggestions channel and add voting reactions
        const embed = new MessageEmbed()
          .setColor('#00ff00')
          .setTitle('New Suggestion')
          .setDescription(suggestionText)
          .addField('Suggested By', message.author.tag);

        suggestionsChannel.send(embed)
          .then(sentMessage => {
            sentMessage.react('👍'); // Thumbs up emoji
            sentMessage.react('👎'); // Thumbs down emoji
          });

        message.channel.send('Your suggestion has been recorded and sent to the suggestions channel for voting!');
      }
    );
  },
};
