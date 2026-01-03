require("dotenv").config();

const mysql = require('mysql2');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended : true}));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 2020,
  ssl: {
    rejectUnauthorized: true
  }
});

connection.connect(err => {
  if(err){
    console.error("DB connection failed", err.message);
  }else{
    console.log("MySql Connected");
  }
})

//Home Route
app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM products`;
    try{
    connection.query(q, (err, result) => {
    if(err) throw err;
    let count = result[0]["count(*)"];
    res.render("home.ejs", {count});
    });
} catch (err) {
    console.log(err);
    res.send("Some error in DB");
}
});

//Show Route
app.get("/products", (req, res) => {
    let q = `SELECT * FROM products ORDER BY id ASC`;
    try{
    connection.query(q, (err, items) => {
    if(err) throw err;
    res.render("showproducts.ejs", {items});
    });
} catch (err) {
    console.log(err);
    res.send("Some error in DB");
}
});

//Edit Route
app.get("/products/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM products WHERE id='${id}'`;
    try{
    connection.query(q, (err, result) => {
    if(err) throw err;
    let item = result[0];
    res.render("edit.ejs", {item});
    });
} catch (err) {
    console.log(err);
    res.send("Some error in DB");
}
});

//Update Route
app.patch("/products/:id", (req, res) => {
    let { id } = req.params;
    let {Item: newItem, Price: newPrice, Stock: newStock, Supplier: newSupplier} = req.body;
    let q = `SELECT * FROM products WHERE id='${id}'`;
    try{
    connection.query(q, (err, result) => {
    if(err) throw err;
    let item = result[0];
    let q2 = `UPDATE products SET Item='${newItem}', Price=${newPrice}, Stock='${newStock}', Supplier='${newSupplier}' WHERE id='${id}'`;
    connection.query(q2, (err, result) => {
        if (err) throw err;
        res.redirect("/products");
    })
    });
} catch (err) {
    console.log(err);
    res.send("Some error in DB");
}
})

//New Product
app.get("/products/new", (req, res) => {
    res.render("new.ejs");
});

// app.post("/products/new", (req, res) => {
//     let { id, item, Price, Stock, Supplier} = req.body;
//     let q = `INSERT INTO products VALUES ('${id}','${item}', ${Price}, '${Stock}', '${Supplier}')`;
//       try {
//     connection.query(q, (err, result) => {
//       if (err) throw err;
      //console.log("added new user");
//       res.redirect("/products");
//     });
//   } catch (err) {
//     res.send("some error occurred");
//   }
// });

app.post("/products/new", (req, res) => {
  const { id, item, Price, Stock, Supplier } = req.body;

  // Step 1: Check if the Product ID already exists
  const checkQuery = `SELECT * FROM products WHERE id = ?`;

  connection.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.send("❌ Database error occurred. Please try again.");
    }

    // Step 2: If ID already exists, re-render the form with an error
    if (results.length > 0) {
      return res.render("new", {
        errorMessage: "❌ Product ID already exists. Please choose another ID.",
        productData: { id, item, Price, Stock, Supplier },
      });
    }

    // Step 3: If ID is unique, insert the product
    const insertQuery = `
      INSERT INTO products (id, item, Price, Stock, Supplier)
      VALUES (?, ?, ?, ?, ?)
    `;

    connection.query(insertQuery, [id, item, Price, Stock, Supplier], (err, result) => {
      if (err) {
        console.error("Error adding product:", err);
        return res.send("⚠️ Some error occurred while adding the product.");
      }

      // Step 4: Redirect to the products page
      res.redirect("/products");
    });
  });
});


//Delete Item
app.get("/products/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM products WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let item = result[0];
        let q2 = `DELETE FROM products WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/products");
          }
        });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

const PORT = process.env.PORT || 2020;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;