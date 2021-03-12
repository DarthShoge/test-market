class Buyer {
    constructor(market) {
        this.market = market;
    }
    
    /**
     * This method should get the best price for a given product 
     * across all sellers
     */
    getBestPrice(product) {
        const fullProductList = this.getProductListFromMarket(product)

        return this.getMinValue(fullProductList.map(x => x.price))
    }


    /**
     * This method should optimise price when filling an order
     * if the quantity is greater than any single seller can accomodate
     * then the next cheapest seller should be used.
     */
    completelyFill(product, quantity) {
        const fullProductList = this.getProductListFromMarket(product)
        const sellersCanAccomodate = fullProductList.filter(x => x.quantity >= quantity)
        const finalList = sellersCanAccomodate.length > 0 ? sellersCanAccomodate : fullProductList
        
        return this.getMinValue(finalList.map(x => x.price))
    }


    /**
     * This method should optimise for sellers with the largest inventory when filling an order
     * if the quantity is greater than any single seller can accomodate
     * then the next largest seller should be used.
     * if multiple sellers have the same amount of inventory
     * you should use the cheaper of the two.
     */
    quicklyFill(product, quantity) {
        const fullProductList = this.getProductListFromMarket(product)
        const sellersCanAccomodate = fullProductList.filter(x => x.quantity >= quantity)
        
        const finalList = sellersCanAccomodate.length > 0 ? sellersCanAccomodate : fullProductList

        const maxQuantityFound = this.getMaxValue(finalList.map(x => x.quantity))
        const sellersWithMaxInventory = finalList.filter(x => x.quantity == maxQuantityFound)

        return this.getMinValue(sellersWithMaxInventory.map(x => x.price))
    }

    /**
     * returns the list of the products found in the full seller inventories in the market
     */
    getProductListFromMarket(productName) {
        const productList = this.market.sellers.map(x => x.inventory).filter(y => y[productName] != undefined).map(x => x[productName])
        
        if(productList.length == 0) {
            throw new Error('No sellers found in the market for ' + productName)
        }

        return productList
    }

    /**
     * returns the min value from an array of numeric values
     */
    getMinValue(numberList) {
        return Math.min.apply(Math, numberList)
    }

    /**
     * returns the max value from an array of numeric values
     */
    getMaxValue(numberList) {
        return Math.max.apply(Math, numberList)
    }
}

module.exports = {Buyer}
