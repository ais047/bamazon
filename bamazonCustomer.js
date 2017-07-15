
const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('easy-table');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "L3x18990",
    database: "bamazon_DB"
});

connection.connect();

var itemDifference = 0;
var initquery = `SELECT item_id AS ID, product_name AS Items, price AS Price
                 FROM bamazon_DB.products`

connection.query(initquery, function(error, results, fields) {
    if (error) throw error;
    itemDifference = results.length;
    console.log('\n' + Table.print(results));
    customerbuy();
});

var customerbuy = function() {
    inquirer.prompt([{
        type: 'input',
        name: 'id',
        message: 'Enter the ID of item you would like to buy',
        validate: function(num){
            if (!isNaN(num) && num > 0 && num <= itemDifference){
                return true;
            } else {
                console.log("\nenter a number");
                return false;
            }
        }
    },
    {
        type:'input',
        name: 'quantity',
        message: 'How many of which do you want to buy?',
        validate: function(num){
            if(!isNaN(num) && num > 0){
                return true;
            }
            else {
                console.log("\nenter a number");
                return false;
            }
        }
    }]).then(function(input) {
        var itemID = input.id;
        var quantity = input.quantity;

        var buyQuery = `SELECT item_id AS ID, product_name AS Product, price AS Price, stock_quantity AS Quantity
                        FROM bamazon_DB.products
                        WHERE item_id = ?`;
        var buyID = [itemID];

        connection.query(buyQuery, buyID, function(err, results) {
            if (err) return console.log(err);
            console.log(results);
            var product = results[0].Product;
            var stock = results[0].Quantity;
            if(quantity > stock){
                console.log("Not enough in stock!")
                connection.end();
            }
            else if(quantity <= stock){
                var cost = quantity * results[0].Price;
                var newstock = stock - quantity;
                var updateQuery  = 'UPDATE bamazon_DB.products SET stock_quantity = ? WHERE item_id =?'
                var queryParam = [newstock, itemID];
                connection.query(updateQuery, queryParam, function(error, results){
                    if(error) throw error;
                var resultsArray = [{ 'Product': product, 'Bought': quantity, 'Total': cost }]
                console.log('\n' + Table.print(resultsArray));
                connection.end();
                })

            }
            else{
                console.log("error")
                connection.end();
        }
        });
    });
};


//             if (results.length) {
//                 var currentStock = results[0].Stock;
//                 var productName = results[0].Product;
//                 var itemID = results[0].ID;
//                 var price = results[0].Price;
//                 var currSales = results[0].Sales;

//                 if (currentStock < quantityReq) {
//                     console.log(`\nWe currently do not have ${quantityReq} ${productName}(s) available for purchase. Please check in again at a later time.`)
//                     connection.end();
//                 } else if (currentStock >= quantityReq) {
//                     var newStockLevel = currentStock - quantityReq;
//                     var totalCost = quantityReq * price;
//                     var totalSales = currSales + totalCost;

//                     var updateQuery = `UPDATE bamazon.products
//                                           SET stock_quantity = ?
//                                               , product_sales = ?
//                                         WHERE item_id = ?`;
//                     var updateValue = [newStockLevel, totalSales, itemID]

//                     connection.query(updateQuery, updateValue, function(err, results) {

//                         if (err) return console.log(err);

//                         if (results.changedRows === 0) {
//                             console.log('Boo something did\'t work');
//                         } else if (results.changedRows > 0) {
//                             var resultsArray = [{ 'Product': productName, 'Quantity': quantityReq, 'Total': totalCost }]
//                             console.log('\n' + Table.print(resultsArray));
//                         };
//                         connection.end();
//                     })
//                 }
//             } else {
//                 console.log(`\nI'm sorry that item does not exist. Thank you please visit again.`);
//                 connection.end();
//             }
//         })
//     })
// }
// }