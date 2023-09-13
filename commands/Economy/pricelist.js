const fs = require('fs');

const stockDir = '../stock';

function generatePriceList() {
  const pricelist = {};

  fs.readdirSync(stockDir).forEach((file) => {
    if (file.endsWith('.txt')) {
      const itemName = file.replace('.txt', '');
      pricelist[itemName] = {
        price: 200,
      };
    }
  });

  return pricelist;
}

module.exports = { generatePriceList };
