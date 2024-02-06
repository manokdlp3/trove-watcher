/* ------------------------------------------------------------------------------------------------------------
  This is a simple Node program that listens to Trove Marketplace events and writes out when items are listed,
  updated, or sold. From here, additional features may be added such as checking when a specific item is
  listed for an attractive price and buying it, etc.
  ------------------------------------------------------------------------------------------------------------ */

const wallet = require('./json/wallet.json');
const Web3 = require('web3');
const web3 = new Web3(wallet.wss_alchemy);
const colors = require('colors');
const helper = require('./helper');
const contracts = require('./contracts/contracts');
const items = require('./refdata');

const contract = new web3.eth.Contract(contracts.market.abi, contracts.market.address);

async function main() {
  try {
    console.log(colors.blue("Trove Watcher v0.1 listening..."));

    contract.events.ItemListed()
        .on ('data', (data) => {

          evaluate(data);

          // TODO: Move this code snippet into a common function.  
          let collection = null;
          if (contracts.addr[data.returnValues.nftAddress] == contracts.TREASURE) {
            collection = items.TREASURES;
          } else if (contracts.addr[data.returnValues.nftAddress] == contracts.CONSUMABLE) {
            collection = items.CONSUMABLES;
          } else if (contracts.addr[data.returnValues.nftAddress] == contracts.SMOLTREASURE) {
            collection = items.SMOLTREASURES;
          }

          let nft = contracts.addr[data.returnValues.nftAddress];
          if (nft == undefined) {
            nft = data.returnValues.nftAddress
          }
          let name = (collection == null) ? (nft + " #" + data.returnValues.tokenId) : collection[Number.parseInt(data.returnValues.tokenId)];

          console.log(colors.cyan(new Date().toLocaleString('en-US') + " - Item Listed: " 
          + data.returnValues.quantity + " "
          + name + " for $MAGIC "
          + helper.formatPrice(data.returnValues.pricePerItem)));

        })
        .on ('error', console.error);
        
    contract.events.ItemUpdated()
        .on ('data', (data) => {

          evaluate(data);

          let collection = null;
          if (contracts.addr[data.returnValues.nftAddress] == contracts.TREASURE) {
            collection = items.TREASURES;
          } else if (contracts.addr[data.returnValues.nftAddress] == contracts.CONSUMABLE) {
            collection = items.CONSUMABLES;
          } else if (contracts.addr[data.returnValues.nftAddress] == contracts.SMOLTREASURE) {
            collection = items.SMOLTREASURES;
          }
          let nft = contracts.addr[data.returnValues.nftAddress];
          if (nft == undefined) {
            nft = data.returnValues.nftAddress
          }
          let name = (collection == null) ? (nft + " #" + data.returnValues.tokenId) : collection[Number.parseInt(data.returnValues.tokenId)]; 

          console.log(colors.yellow(new Date().toLocaleString('en-US') + " - Item Updated: " 
          + data.returnValues.quantity + " "
          + name + " for $MAGIC "
          + helper.formatPrice(data.returnValues.pricePerItem)));
        })
        .on ('error', console.error);

      contract.events.ItemSold()
      .on ('data', (data) => {
          let collection = null;
          if (contracts.addr[data.returnValues.nftAddress] == contracts.TREASURE) {
            collection = items.TREASURES;
          } else if (contracts.addr[data.returnValues.nftAddress] == contracts.CONSUMABLE) {
            collection = items.CONSUMABLES;
          } else if (contracts.addr[data.returnValues.nftAddress] == contracts.SMOLTREASURE) {
            collection = items.SMOLTREASURES;
          }

          let nft = contracts.addr[data.returnValues.nftAddress];
          if (nft == undefined) {
            nft = data.returnValues.nftAddress
          }
          let name = (collection == null) ? (nft + " #" + data.returnValues.tokenId) : collection[Number.parseInt(data.returnValues.tokenId)]; 

          console.log(colors.green(new Date().toLocaleString('en-US') + " - Item Sold: " 
          + data.returnValues.quantity + " "
          + name + " for $MAGIC "
          + helper.formatPrice(data.returnValues.pricePerItem)));  
        })
      .on ('error', console.error);

  } catch (err) {
    console.error(err);
  }
}

/* ------------------------------------------------------------------------------------------------------------
  Check if an item is below our target buy price. If it is, buy it.
  TODO: Add implementation of snipe feature. Simple implementation below.
  ------------------------------------------------------------------------------------------------------------ */
async function evaluate(data) {
  let SMOL_PRICE = 200;
  let GENESIS_PRICE = 800;

  switch(contracts.addr[data.returnValues.nftAddress]) {
    case contracts.SMOLS:      
      if (helper.formatPrice(data.returnValues.pricePerItem) < SMOL_PRICE) {
        console.log(colors.green(new Date().toLocaleString('en-US') + " - Buy SMOL!" ));
      }
      break;
    case contracts.GENESIS:
      if (helper.formatPrice(data.returnValues.pricePerItem) < GENESIS_PRICE) {        
        console.log(colors.green(new Date().toLocaleString('en-US') + " - Buy GENESIS LEGION!" ));
      }
      break;
    default:
      // do nothing
  }
}

main();