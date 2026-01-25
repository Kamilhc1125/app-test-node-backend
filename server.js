import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import pkg from "pg";
import { fileURLToPath } from 'url';
import userRouter from './routes/user.js';

const { Pool } = pkg;
dotenv.config();

const app = express();
const PORT = process.env.NODE_PORT || 5000;

// __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";

console.log(`Running in ${isProduction ? "production" : "development"} mode`);

// PostgreSQL connection pool
// const pool = new Pool(
//   isProduction
//     ? {
//       connectionString: process.env.DATABASE_URL,
//       ssl: { rejectUnauthorized: false },
//     }
//     : {
//       host: process.env.PG_HOST,
//       port: Number(process.env.PG_PORT),
//       user: process.env.PG_USER,
//       password: process.env.PG_PASSWORD,
//       database: process.env.PG_DATABASE,
//     }
// );

const pool = new Pool(
  {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
);


// Middlewares
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/users', userRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Server is running!');

});

// Test connection
pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Connection error", err));

// GET /products
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY productid");
    res.json(result.rows); // send rows as JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/env", (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
