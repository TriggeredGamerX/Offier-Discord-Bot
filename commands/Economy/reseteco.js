const sqlite3 = require('sqlite3').verbose();

const dbFile = './economy.db';

const db = new sqlite3.Database(dbFile);

module.exports = {
  name: 'economyreset',
  description: 'Reset user economy balance (Admin use only)',
  filters: ['ECONOMY','ADMIN'],
  aliases: ['reseteco'],
  execute(message, args) {
    // Check if the user has the required role/permission to use this command
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      message.channel.send('You do not have permission to use this command.');
      return;
    }

    const user = message.mentions.users.first();

    if (!user) {
      message.channel.send('Invalid command usage. Use !economyreset @user');
      return;
    }

    db.run('UPDATE economy SET balance = 0 WHERE user_id = ?', user.id, (err) => {
      if (err) {
        console.error('Error updating user data:', err);
        return;
      }
      message.channel.send(`${user} economy balance has been reset to 0 coins.`);
    });
  },
};
