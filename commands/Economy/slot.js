const sqlite3 = require('sqlite3').verbose();
const { MessageEmbed } = require('discord.js');

const dbFile = './economy.db';
const db = new sqlite3.Database(dbFile);

module.exports = {
  name: 'slot',
  description: 'Play the slot machine game and try your luck!',
  filters: ['ECONOMY'],
  execute(message) {
    const user = message.author.id;
    const betAmount = 50; // The amount to bet for each slot machine play
    const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉'];

    // Proceed with the slot machine play
    db.get('SELECT balance FROM economy WHERE user_id = ?', user, (err, row) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return;
      }

      if (!row || row.balance < betAmount) {
        message.channel.send(`${message.author}, you don't have enough coins to play the slot machine.`);
        return;
      }

      const { balance } = row;
      const result1 = symbols[Math.floor(Math.random() * symbols.length)];
      const result2 = symbols[Math.floor(Math.random() * symbols.length)];
      const result3 = symbols[Math.floor(Math.random() * symbols.length)];

      let winnings = 0;

      if (result1 === result2 && result2 === result3) {
        // All symbols match
        winnings = betAmount * 5;
      } else if (result1 === result2 || result2 === result3 || result1 === result3) {
        // Two symbols match
        winnings = betAmount * 2;
      }

      // Calculate the new balance after the slot machine play
      const updatedBalance = balance + winnings - betAmount;

      db.run('UPDATE economy SET balance = ? WHERE user_id = ?', updatedBalance, user, (err) => {
        if (err) {
          console.error('Error updating user data:', err);
          return;
        }

        message.channel.send(
          `${message.author}, you played the slot machine!\n${result1} | ${result2} | ${result3}\n${
            winnings > 0 ? `You won ${winnings} coins!` : 'Better luck next time!'
          }`
        );
      });
    });
  },
};
