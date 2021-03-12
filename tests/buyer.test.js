const expect = require("expect")
const {Buyer} = require("../Buyer");
const { Market } = require("../Market");
const {Seller} = require("../Seller")

describe("Buyer", function(){
    var market;
    beforeEach(() => {
       
        const asda = new Seller({
            "Apples":{
                quantity:100,
                price:5.25
            },
        }, "Asda", 5);

        const budgens = new Seller({
            "Apples":{
                quantity:25,
                price:4.25
            },
        }, "Budgens", 1);

        const costco = new Seller({
            "Apples":{
                quantity:250,
                price:6.25
            },
        }, "Costco", 10);

        const iper = new Seller({
            "Apples":{
                quantity:250,
                price:5.99
            },
        }, "Iper", 10);
        
         market = new Market([asda, budgens, costco, iper])
    })

    it("should thrown an exception if the product is not present in the market ", ()=> {
        let sut = new Buyer(market)
    
        expect(()=>{sut.getProductListFromMarket("fakeProduct")}).toThrow('No sellers found in the market for fakeProduct')
    });

    it("should get the best price for a given product", ()=> {
        let sut = new Buyer(market)
        const result = sut.getBestPrice("Apples")
        expect(result).toEqual(4.25) //Budgens price
    });

    
    it("should optimise price when filling an order and quantity can be accomodated by one or more sellers", ()=> {
        let sut = new Buyer(market)
        const result = sut.completelyFill("Apples", 90)
        expect(result).toEqual(5.25) //Asda price
    });

    it("should take the lowest price when filling an order and quantity can not be accomodated by any seller", ()=> {
        let sut = new Buyer(market)
        const result = sut.completelyFill("Apples", 300)
        expect(result).toEqual(4.25) //Budgens price
    });


    it("should take the largest inventory and the lower price when filling an order and one or more seller can accomodate the quantiy", ()=> {
        let sut = new Buyer(market)
        const result = sut.quicklyFill("Apples", 90)
        expect(result).toEqual(5.99) //Iper price
    });


    it("should take the largest inventory and the lower price when filling an order and no seller can accomoate the quantity", ()=> {
        let sut = new Buyer(market)
        const result = sut.quicklyFill("Apples", 300)
        expect(result).toEqual(5.99) //Iper price
    });

})

