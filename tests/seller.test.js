const expect = require("expect")
const {Seller, SellerTypes} = require("../Seller")


describe("Seller", function(){
    var sellerInventory;
    beforeEach(() => {
        sellerInventory = {
            "Apples":{
                quantity:100,
                price:5.25
            },
            "Oranges":{
                quantity:150,
                price:8.0
            },
            "Pears":{
                quantity:10,
                price:15.0
            }
        }
    })

    it("should reduce quantity when i sell", ()=> {
        let sut = new Seller(sellerInventory)
        sut.sell("Apples", 25)
        expect(sut.inventory["Apples"].quantity).toEqual(75)
    });

    it("should cap at 0 if I sell more than i have", () =>{
        let sut = new Seller(sellerInventory);
        sut.sell("Apples", 105);
        expect(sut.inventory["Apples"].quantity).toEqual(0);
    });

    it('should be maximally stingy when empty inventory', () => {
        let sut = new Seller(sellerInventory);
        sut.sell("Apples", 105);
        expect(sut.inventory["Apples"].stingyness).toEqual(1);
    });

    it("should be minimally stingy when full inventory", () => {
        let sut = new Seller(sellerInventory);
        expect(sut.inventory["Apples"].stingyness).toEqual(0);
    });

    it("should be somewhat stingy when half inventory", () => {
        let sut = new Seller(sellerInventory);
        sut.sell("Apples", sut.inventory["Apples"].quantity/2);
        expect(sut.inventory["Apples"].stingyness).toEqual(0.5);
    });

    it("should quote initial price on first ask", ()=>{
        let sut = new Seller(sellerInventory);
        expect(sut.inventory["Oranges"].price).toEqual(8.0);
    });

    it("should raise prices after seller buys", () =>{
        let sut = new Seller(sellerInventory, "Kwiksave");
        sut.sell("Oranges", sut.inventory["Oranges"].quantity/2);
        expect(sut.inventory["Oranges"].price).toBeGreaterThan(8.0);
    });

    it("should get deliveries after seller buys once", () =>{
        const deliveryCadence = 1;
        let sut = new Seller(sellerInventory,"Asda",deliveryCadence);
        sut.sell("Oranges", 1);
        expect(sut.inventory["Oranges"].quantity).toBeGreaterThan(sut.inventory["Oranges"].startingQuantity);
    });

    it("should be able to set delivery schedule", () => {
        const deliveryCadence = 3;
        let sut = new Seller(sellerInventory,"Asda",deliveryCadence);
        allOranges = sut.inventory["Oranges"].quantity;
        sut.sell("Oranges", allOranges);
        expect(sut.inventory["Oranges"].quantity).toEqual(0);
        sut.tick("Oranges");
        expect(sut.inventory["Oranges"].quantity).toEqual(0);
        sut.tick("Oranges");
        expect(sut.inventory["Oranges"].quantity).toBeGreaterThan(0);
    });

    it("should return correct receipt when seller sells single unit", () =>{
        let sut = new Seller(sellerInventory);
        const buyAmount = 10;
        let receipt = sut.sell("Oranges", buyAmount);
        expect(receipt.cost).toEqual(sut.inventory["Oranges"].priceHistory[0] * buyAmount);
        expect(receipt.boughtQuantity).toEqual(buyAmount);
    })

    it("should return correct receipt when seller sells all stock", () =>{
        let sut = new Seller(sellerInventory);
        const overboughtAmount = 1000;
        const expectedBuyAmount = sut.inventory["Oranges"].startingQuantity;
        let receipt = sut.sell("Oranges", overboughtAmount);
        expect(receipt.cost).toEqual(sut.inventory["Oranges"].priceHistory[0] * expectedBuyAmount);
        expect(receipt.boughtQuantity).toEqual(expectedBuyAmount);
    })

    it("should avoid 'Infinity' result when the inventory is 0", () =>{
        let sut = new Seller(sellerInventory);
       
        sut.sell("Pears", 10); // then the inventory stock goes to 0

        expect(isFinite(sut.inventory["Pears"].price)).toEqual(true);
    })

    it("should change price if Seller is not a  type 'fairy price policy' Seller", () =>{
        let sut = new Seller(sellerInventory, "Costco", 10);

        const expected = sut.inventory["Pears"].price;
        sut.sell("Pears", 4);
        sut.sell("Pears", 5);

        expect(sut.inventory["Pears"].priceHistory[0] === expected).toBe(true);
        expect(sut.inventory["Pears"].priceHistory[1] === expected).toBe(false);
        expect(sut.inventory["Pears"].priceHistory[2] === expected).toBe(false);
    })

    it("should not change price if Seller is a 'fairy price policy' type Seller", () =>{
        let sut = new Seller(sellerInventory, "Costco", 10, SellerTypes.FairyPrice);

        const expected = sut.inventory["Pears"].price;
        sut.sell("Pears", 4);
        sut.sell("Pears", 5);

        expect(sut.inventory["Pears"].priceHistory[0]).toEqual(expected);
        expect(sut.inventory["Pears"].priceHistory[1]).toEqual(expected);
        expect(sut.inventory["Pears"].priceHistory[2]).toEqual(expected);
    })
})

