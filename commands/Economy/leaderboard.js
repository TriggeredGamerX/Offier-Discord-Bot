const sqlite3 = require('sqlite3').verbose();
const { MessageEmbed } = require('discord.js');

const dbFile = './economy.db';
const db = new sqlite3.Database(dbFile);

module.exports = {
  name: 'leaderboard',
  description: 'Display the leaderboard of economy balances',
  filters: ['ECONOMY'],
  aliases: ['lb'],
  execute(message, args) {
    const page = parseInt(args[0]) || 1;
    const resultsPerPage = 10;

    const leaderboardEmbed = new MessageEmbed()
      .setTitle('Economy Leaderboard')
      .setColor('#FFD700')
      .setDescription('<a:j4r:1119705394839834644> Top 10 users with the highest economy balance <a:j4r:1119705394839834644>');

    db.all('SELECT user_id, balance FROM economy ORDER BY balance DESC', (err, rows) => {
      if (err) {
        console.error('Error fetching leaderboard data:', err);
        return;
      }

      const authorId = message.author.id;
      const authorPosition = rows.findIndex(row => row.user_id === authorId);

      const pageCount = Math.ceil(rows.length / resultsPerPage);
      const startIndex = (page - 1) * resultsPerPage;
      const endIndex = startIndex + resultsPerPage;
      const currentPage = rows.slice(startIndex, endIndex);

      currentPage.forEach((row, index) => {
        const user = message.guild.members.cache.get(row.user_id);
        if (user) {
          const rank = startIndex + index + 1;
          const balance = row.balance;
          leaderboardEmbed.addField(
            `${rank}. ${user.user.tag} ${row.user_id === authorId ? ' (You)' : ''}`,
            `Balance: ${balance} coins <a:j4r:1119705394839834644>`
          );
        }
      });

      leaderboardEmbed.setFooter(`Page ${page} of ${pageCount}`);
      message.channel.send(leaderboardEmbed);
    });
  },
};
