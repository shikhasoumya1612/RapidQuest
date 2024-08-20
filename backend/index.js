require("dotenv").config({ path: ".env" });
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const { getDateAggregation } = require("./utils");
const app = express();

let db, orderCollection, productCollection, customerCollection;

async function run() {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    db = client.db("RQ_Analytics");
    orderCollection = db.collection("shopifyOrders");
    productCollection = db.collection("shopifyProducts");
    customerCollection = db.collection("shopifyCustomers");

    console.log("Connected to Mongo DB");
  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/home", async (req, res) => {
  res.send("Welcome to Ecommerce Data Analysis");
});

// Calculate total sales over a period - "/api/v1/sales?interval={}"
app.get("/api/v1/sales", async (req, res) => {
  try {
    const { interval } = req.query; // 'daily', 'monthly', 'quarterly', or 'yearly'
    const dateAggregation = getDateAggregation(interval, "$created_at");

    const sales = await orderCollection
      .aggregate([
        {
          $addFields: {
            created_at: { $toDate: "$created_at" },
            "total_price_set.shop_money.amount": {
              $toDouble: "$total_price_set.shop_money.amount",
            },
          },
        },
        {
          $group: {
            _id: dateAggregation,
            totalSales: { $sum: "$total_price_set.shop_money.amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ])
      .toArray();

    res.status(200).json(sales);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Calculate sales growth over a period - "/api/v1/salesgrowth?interval={}"
app.get("/api/v1/salesgrowth", async (req, res) => {
  try {
    const { interval } = req.query; // 'daily', 'monthly', 'quarterly', or 'yearly'

    const dateAggregation = getDateAggregation(interval, "$created_at");

    const sales = await orderCollection
      .aggregate([
        {
          $addFields: {
            created_at: { $toDate: "$created_at" },
            "total_price_set.shop_money.amount": {
              $toDouble: "$total_price_set.shop_money.amount",
            },
          },
        },
        {
          $group: {
            _id: dateAggregation,
            totalSales: { $sum: "$total_price_set.shop_money.amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ])
      .toArray();

    const salesGrowth = sales.map((sale, index) => {
      if (index === 0) {
        return { ...sale, growthRate: 0 };
      } else {
        const previousSale = sales[index - 1];
        const growthRate =
          ((sale.totalSales - previousSale.totalSales) /
            previousSale.totalSales) *
          100;
        return { ...sale, growthRate };
      }
    });

    res.status(200).json(salesGrowth);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Calculate new customers over a period - "/api/v1/newcustomers?interval={}"
app.get("/api/v1/newcustomers", async (req, res) => {
  try {
    const { interval } = req.query;
    const dateAggregation = getDateAggregation(interval, "$created_at");

    const newCustomers = await customerCollection
      .aggregate([
        {
          $addFields: {
            created_at: { $toDate: "$created_at" },
          },
        },
        {
          $group: {
            _id: dateAggregation,
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ])
      .toArray();

    res.status(200).json(newCustomers);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Calculate repeated customers over a period - "/api/v1/repeatcustomers?interval={}"
app.get("/api/v1/repeatcustomers", async (req, res) => {
  try {
    const { interval } = req.query;
    const dateAggregation = getDateAggregation(interval, "$created_at");

    const repeatCustomers = await orderCollection
      .aggregate([
        {
          $addFields: {
            created_at: { $toDate: "$created_at" },
          },
        },
        {
          $group: {
            _id: { customer: "$customer.id", date: dateAggregation },
            count: { $sum: 1 },
          },
        },
        {
          $match: {
            count: { $gt: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.date",
            repeatCustomers: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ])
      .toArray();

    res.status(200).json(repeatCustomers);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Geographical Distribution of Customers - "/api/v1/customerDistribution"
app.get("/api/v1/customerDistribution", async (req, res) => {
  try {
    const customerDistribution = await customerCollection
      .aggregate([
        {
          $group: {
            _id: "$default_address.city",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray();

    res.status(200).json(customerDistribution);
  } catch (err) {
    res.status(500).send(err);
  }
});

// CLV based on month of first purchase - "/api/v1/clvByMonth"
app.get("/api/v1/clvByMonth", async (req, res) => {
  try {
    const customerCohorts = await orderCollection
      .aggregate([
        {
          $addFields: {
            created_at: { $toDate: "$created_at" },
            "total_price_set.shop_money.amount": {
              $toDouble: "$total_price_set.shop_money.amount",
            },
          },
        },
        {
          $group: {
            _id: { customer: "$customer.id" },
            firstPurchaseDate: { $min: "$created_at" },
            totalPrice: { $sum: "$total_price_set.shop_money.amount" },
          },
        },
        {
          $addFields: {
            firstPurchaseMonth: {
              $dateToString: {
                format: "%Y-%m",
                date: "$firstPurchaseDate",
              },
            },
          },
        },
        {
          $group: {
            _id: "$firstPurchaseMonth",
            customers: {
              $push: {
                customer: "$_id.customer",
                totalPrice: "$totalPrice",
              },
            },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    for (let i = 0; i < customerCohorts.length; i++) {
      let cohort = customerCohorts[i];
      let totalLifetimeAmount = 0;

      for (let j = 0; j < cohort.customers.length; j++) {
        totalLifetimeAmount += cohort.customers[j].totalPrice;
      }

      cohort.totalLifetimeAmount = totalLifetimeAmount;
    }

    res.status(200).json(customerCohorts);
  } catch (err) {
    res.status(500).send(err);
  }
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on ${process.env.PORT}`);
});
