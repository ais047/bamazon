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

inquirer.prompt({
	type: 'list',
	name: 'selection',
	message: 'Selection an Option',
	choices: ['View Products for sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
}).then(function(res){
	if(res.selection === 'View Products for sale'){
		viewProduct();
	}
	else if(res.selection === 'View Low Inventory'){
		viewLow();
	}
	else if(res.selection === 'Add to Inventory'){
		addInventory();

	}
	else{
		addProduct();
	}
});

var addProduct = function(){
	inquirer.prompt([{
		type: 'input',
		name: 'product_name',
		message: 'Product name'
	},{
		type: 'input',
		name: 'department_name',
		message : 'Department Name'
	},{
		type: 'input',
		name: 'cost',
		message: 'Price',
		validate: function(num){
			  if (!isNaN(num) && num > 0){
                return true;
            } else {
                console.log("\nenter a number");
                return false;
            }
		}
	},{
		type: 'input',
		name: 'stock',
		message: 'Stock',
		validate: function(num){
			  if (!isNaN(num) && num > 0){
                return true;
            } else {
                console.log("\nenter a number");
                return false;
            }
		}
	}]).then(function(res){
		var updateQuery =  'INSERT INTO bamazon_DB.products(product_name, department_name, price, stock_quantity) VALUE(?,?,?,?)'
		var queryParam = [res.product_name, res.department_name, res.cost, res.stock];
		connection.query(updateQuery, queryParam, function(error, results, fields){
			if (error) throw error;
			viewProduct();
	})
})
};

var addInventory = function(){
	viewProduct();
	inquirer.prompt([{
		type: 'input',
		name: 'id',
		message: 'Add Stock to which ID?',
		validate: function(num){
            if (!isNaN(num) && num > 0){
                return true;
            } else {
                console.log("\nenter a number");
                return false;
            }
        }
	},{		
		type: 'input',
		name: 'addedStock',
		message: 'Add how much Stock?',
		validate: function(num){
            if (!isNaN(num) && num > 0){
                return true;
            } else {
                console.log("\nenter a number");
                return false;
            }
        }
    }
	]).then(function(res){
		var updateQuery = 'UPDATE bamazon_DB.products SET stock_quantity = stock_quantity + ? WHERE item_id =?'
		var queryParam = [res.addedStock, res.id];
		connection.query(updateQuery, queryParam, function(error, results, fields){
			if (error) throw error;
			viewProduct();
		})
	});
};

var viewLow = function(){
	var initquery = `SELECT item_id AS ID, product_name AS Items, department_name AS Department, price AS Price, stock_quantity AS Stock
                	 FROM bamazon_DB.products WHERE stock_quantity < 5`
connection.query(initquery, function(error, results, fields) {
    if (error) throw error;
    console.log('\n' + Table.print(results));
	})
};

var viewProduct = function(){
	var initquery = `SELECT item_id AS ID, product_name AS Items, department_name AS Department, price AS Price, stock_quantity AS Stock
                	 FROM bamazon_DB.products`
connection.query(initquery, function(error, results, fields) {
    if (error) throw error;
    console.log('\n' + Table.print(results));
	})
};