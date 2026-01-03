require("dotenv").config();
const { Pool } = require("pg");

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

/* PostgreSQL (Neon) */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await pool.connect();
    console.log("✅ Neon PostgreSQL connected");
  } catch (err) {
    console.error("❌ DB connection error", err);
  }
})();

/* ROUTES */

// Home
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM products");
    res.render("home.ejs", { count: result.rows[0].count });
  } catch (err) {
    console.error(err);
    res.send("Some error in DB");
  }
});

// Show
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.render("showproducts.ejs", { items: result.rows });
  } catch (err) {
    console.error(err);
    res.send("Some error in DB");
  }
});

// Edit
app.get("/products/:id/edit", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [req.params.id]
    );
    res.render("edit.ejs", { item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.send("Some error in DB");
  }
});

// Update
app.patch("/products/:id", async (req, res) => {
  try {
    const { Item, Price, Stock, Supplier } = req.body;
    await pool.query(
      `UPDATE products
       SET item=$1, price=$2, stock=$3, supplier=$4
       WHERE id=$5`,
      [Item, Price, Stock, Supplier, req.params.id]
    );
    res.redirect("/products");
  } catch (err) {
    console.error(err);
    res.send("Some error in DB");
  }
});

// New
app.get("/products/new", (req, res) => {
  res.render("new.ejs");
});

// Create
app.post("/products/new", async (req, res) => {
  try {
    const { id, item, Price, Stock, Supplier } = req.body;

    const exists = await pool.query(
      "SELECT 1 FROM products WHERE id=$1",
      [id]
    );

    if (exists.rows.length > 0) {
      return res.render("new", {
        errorMessage: "❌ Product ID already exists",
        productData: req.body,
      });
    }

    await pool.query(
      `INSERT INTO products (id, item, price, stock, supplier)
       VALUES ($1,$2,$3,$4,$5)`,
      [id, item, Price, Stock, Supplier]
    );

    res.redirect("/products");
  } catch (err) {
    console.error(err);
    res.send("Some error occurred");
  }
});

// Delete
app.get("/products/:id/delete", async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id=$1", [req.params.id]);
    res.redirect("/products");
  } catch (err) {
    console.error(err);
    res.send("Some error with DB");
  }
});

/* SERVER */
const PORT = process.env.PORT || 2020;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
