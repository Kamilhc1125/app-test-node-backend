import express from 'express';
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production",
  });
});

export default router;
