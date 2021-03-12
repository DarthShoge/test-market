const stream = require('stream');
const rand = require('random-seed');


function getExpectedChange(generator) {
    return generator(100) / 100;
}

function getDeliveries(iProduct, generator) {
    let fluctuation = getExpectedChange(generator);
    let newDeliveries = fluctuation * iProduct.startingQuantity;
    iProduct.quantity += iProduct.quantity + newDeliveries;
    return iProduct;
}

const SellerTypes = {
  Regular: 1,
  FairyPrice: 2,
}

class Seller {
    constructor(inventory, id = "Safeway", deliveryWait = 5, sellerType = SellerTypes.Regular) {
        this.inventory = inventory;
        this.deliveryWait = deliveryWait;
        this.random_generator = rand(id);
        this.id = id;
        this.sellerType = sellerType;
        for (let [key, value] of Object.entries(inventory)) {
            value.startingQuantity = value.quantity;
            value.priceHistory = [value.price];
            value.stingyness = 0;
        }
    }
    quote(product) {
        const inventory = this.inventory[product];
        return inventory.price;
    }

    calculatePriceChange(product){
        const inventory = this.inventory[product];
        const v = 0.1
        const ec = getExpectedChange(this.random_generator);
        const alpha = inventory.startingQuantity
        const beta = inventory.quantity
        
        let sentimentChange = 0;
        
        if((beta / alpha) > 0){ // TO AVOID Math.log10(0) AND GET INFINITE VALUE
            const inv_based_change = Math.log10(beta / alpha) * (-v);
            sentimentChange = inv_based_change + ((ec - 0.5)*v)
        } 
        return sentimentChange;
    }
    
    sell(product, buyQuantity) {
        const inventory = this.inventory[product];
        const boughtQuantity = buyQuantity > inventory.quantity ? inventory.quantity : buyQuantity;
        const cost = boughtQuantity * this.quote(product);
        inventory.quantity -= boughtQuantity;
        inventory.stingyness = 1 - inventory.quantity / inventory.startingQuantity;
        this.tick();
        return {boughtQuantity, cost};
    }


    tick() {
        for (let [product, value] of Object.entries(this.inventory)) {
            let inventory = value;
            const isReadyForDelivery = (inventory.priceHistory.length % this.deliveryWait) == 0;
            if (isReadyForDelivery) {
                inventory = getDeliveries(inventory, this.random_generator);
            }

            switch(this.sellerType) {
                case SellerTypes.FairyPrice : { // should not apply any variation to the price
                    inventory.priceHistory.push(inventory.price);
                    break;
                }
                default: {
                    let chg = this.calculatePriceChange(product);
                    inventory.price = inventory.price + (inventory.price*chg)
                    inventory.priceHistory.push(inventory.price);
                    break;
                }
            }
        }
    }
}


module.exports = {Seller, SellerTypes}
