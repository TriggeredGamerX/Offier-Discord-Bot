const sqlite3 = require('sqlite3').verbose();
const config = require('../../config.json');
const dbFile = './economy.db';

const db = new sqlite3.Database(dbFile);

module.exports = {
  name: 'balance',
  description: 'Check your balance',
  filters: ['ECONOMY'],
    aliases: ['cash'],
  execute(message) {
    const user = message.author.id;

    db.get('SELECT balance FROM economy WHERE user_id = ?', user, (err, row) => {
      if (err) {
        console.error('Error fetching user data:', err);
        return;
      }

      // Check if the user data exists, if not, create it with an initial balance of 0
      if (!row) {
        db.run('INSERT INTO economy (user_id, balance) VALUES (?, ?)', user, 0, (err) => {
          if (err) {
            console.error('Error inserting new user data:', err);
            return;
          }
          message.channel.send(`${message.author}, your balance is 0 coins <a:j4r:1119705394839834644>.`);
        });
      } else {
        const balance = row.balance || 0;
        message.channel.send(`${message.author}, your balance is ${balance} coins <a:j4r:1119705394839834644>.`);
      }
    });
  },
};
