var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table2");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Mlpftw13!",
    database: "bamazon",
});
console.log(connection);
connection.connect(function (err) {
    if (err) throw err;
    runSearch();
});
var display = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log("============================");
        console.log("     -Welcome To Bamazon-     ");
        console.log("============================");
        console.log("");
        console.log("Our Products List!");
        console.log("");
        var table = new Table({
            head: ["Product Id", "Product Description", "Cost"],
            colWidths: [12, 50, 8],
            colAligns: ["center", "left", "right"],
            style: {
                head: ["aqua"],
                compact: true,
            },
        });
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].id, res[i].products_name, res[i].price]);
        }
        console.log(table.toString());
        console.log("");
        shopping();
    });
};
var shopping = function () {
    inquirer
        .prompt({
            name: "productToBuy",
            type: "input",
            message: "Please Enter The Product Id of The Item You Wish To Purchase!",
        })
        .then(function (answer1) {
            var selection = answer1.productToBuy;
            connection.query(
                "SELECT * FROM products WHERE Id=?",
                selection,
                function (err, res) {
                    if (err) throw err;
                    if (res.length === 0) {
                        console.log(
                            "That Product Doesn't Exist, Please Enter A Product Id From The List Above!"
                        );
                        shopping();
                    } else {
                        inquirer
                            .prompt({
                                name: "quantity",
                                type: "input",
                                message: "How Many Items Would You Like To Purchase?",
                            })
                            .then(function (answer2) {
                                var quantity = answer2.quantity;
                                if (quantity > res[0].stock_quantity) {
                                    console.log(
                                        "Our Apologies We Only Have " +
                                        res[0].stock_quantity +
                                        " Items of The Product Selected"
                                    );
                                    shopping();
                                } else {
                                    console.log("");
                                    console.log(res[0].products_name + " purchased");
                                    console.log(quantity + " qty @ $" + res[0].price);
                                    var newQuantity = res[0].stock_quantity - quantity;
                                    connection.query(
                                        "UPDATE products SET stock_quantity = " +
                                        newQuantity +
                                        " WHERE id = " +
                                        res[0].id,
                                        function (err, resUpdate) {
                                            if (err) throw err;
                                            console.log("");
                                            console.log("Your Order Has Been Processed!");
                                            console.log("Thank You For Shopping With Bamazon!");
                                            console.log("");
                                            connection.end();
                                        }
                                    );
                                }
                            });
                    }
                }
            );
        });
};
display();
