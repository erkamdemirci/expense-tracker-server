const express = require("express");
const cron = require("node-cron");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const i18n = require("i18n");

const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const authRoutes = require("./routes/auth");
const auditRoutes = require("./routes/audit");
const transactionRoutes = require("./routes/transaction");
const ledgerRoutes = require("./routes/ledger");
const accountRoutes = require("./routes/account");
const currentAccountRoutes = require("./routes/current-account");
const debtLoanAccountRoutes = require("./routes/debt-loan-account");
const cashItemRoutes = require("./routes/cash-item");
const goalRoutes = require("./routes/goal");
const paymentRoutes = require("./routes/payment");
const { getCurrencyRates } = require("./services/currency");

dotenv.config();

i18n.configure({
  locales: ["en", "tr"],
  directory: __dirname + "/locales",
  defaultLocale: "en",
  objectNotation: true,
  autoReload: true,
  updateFiles: false,
  api: {
    __: "t",
    __n: "tn",
  },
});

const app = express();
app.use(cors());
app.use(i18n.init);
app.use((req, res, next) => {
  const userLanguage = req.headers["accept-language"] || "en";
  req.setLocale(userLanguage);
  // console the path of route that requested
  console.log(req.path, req.method);
  next();
});

app.use(bodyParser.json());
let cachedCurrencyRates = null;

// cron.schedule("*/60 * * * *", async () => {
//   console.log("Fetching currency rates...");
//   cachedCurrencyRates = await getCurrencyRates();
// });

const fetchInitialCurrencyRates = async () => {
  console.log("Fetching initial currency rates...");
  cachedCurrencyRates = await getCurrencyRates();
};
fetchInitialCurrencyRates();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/category", categoryRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/goal", goalRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/current-account", currentAccountRoutes);
app.use("/api/debt-loan-account", debtLoanAccountRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/cash-item", cashItemRoutes);

app.get("/api/currency-rates", (req, res) => {
  if (!cachedCurrencyRates) {
    return res.status(503).json({ message: "Currency rates not available" });
  }
  res.json(cachedCurrencyRates);
});

module.exports = app;
