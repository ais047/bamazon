
const mySQL = require('mySQL');
const inquirer = require('inquirer');
const Table = require('easy-table');

const connection = mySQL.createConnection({
    host: "localhost",
    port: 3000,
    user: "root",
    password: "L3x18990",
    database: "bamazon_DB"
});


connection.connect();
var idMax = 0;
var initquery = `SELECT item_id AS ID
                    , product_name AS Product
                    , price AS Price
                 FROM bamazon.products`

connection.query(initquery, function(error, results, fields) {
    if (error) return console.log(error);
    idMax = results.length;
    console.log('\n' + Table.print(results));
    inquirerInitial();
});

var inquirerInitial = function() {
    inquirer.prompt([{
        type: 'input',
        name: 'itemID',
        message: 'Please enter the id of the item you would like to purchase:',
        validate: function(num){
            if (!isNaN(num) && num > 0 && num <= idMax){
                return true;
            } else {
                return false;
            }
        }
    }, {
        type: 'input',
        name: 'quantityRequested',
        message: 'How many units would you like you to purchase?'
    }]).then(function(userInput) {
        var itemID = userInput.itemID;
        var quantityReq = userInput.quantityRequested;

        var reqQuery = `SELECT item_id AS ID
                            , product_name AS Product
                            , price AS Price
                            , stock_quantity AS Stock
                            , product_sales AS Sales
                        FROM bamazon.products
                        WHERE item_id = ?`;
        var reqValues = [itemID];

        connection.query(reqQuery, reqValues, function(err, results) {

            if (err) return console.log(err);

            if (results.length) {
                var currentStock = results[0].Stock;
                var productName = results[0].Product;
                var itemID = results[0].ID;
                var price = results[0].Price;
                var currSales = results[0].Sales;

                if (currentStock < quantityReq) {
                    console.log(`\nWe currently do not have ${quantityReq} ${productName}(s) available for purchase. Please check in again at a later time.`)
                    connection.end();
                } else if (currentStock >= quantityReq) {
                    var newStockLevel = currentStock - quantityReq;
                    var totalCost = quantityReq * price;
                    var totalSales = currSales + totalCost;

                    var updateQuery = `UPDATE bamazon.products
                                          SET stock_quantity = ?
                                              , product_sales = ?
                                        WHERE item_id = ?`;
                    var updateValue = [newStockLevel, totalSales, itemID]

                    connection.query(updateQuery, updateValue, function(err, results) {

                        if (err) return console.log(err);

                        if (results.changedRows === 0) {
                            console.log('Boo something did\'t work');
                        } else if (results.changedRows > 0) {
                            var resultsArray = [{ 'Product': productName, 'Quantity': quantityReq, 'Total': totalCost }]
                            console.log('\n' + Table.print(resultsArray));
                        };
                        connection.end();
                    })
                }
            } else {
                console.log(`\nI'm sorry that item does not exist. Thank you please visit again.`);
                connection.end();
            }
        })
    })
}
}