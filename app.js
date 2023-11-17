const express = require("express");

const dotenv = require("dotenv");
const passport = require("passport");
const Strategy = require("passport-google-oauth20").Strategy;
const errorHandler = require("errorhandler");

const { adminSeeder } = require("./seeders/adminSeeder");
const { countriesSeeder } = require("./seeders/countriesSeeder");
const eventController = require("./controllers/eventController");
const bodyParser = require("body-parser");

require("./middlewares/authMiddleware");

const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config({ path: ".env" });

const app = express();

require("./config/mongoose");

const adminLogin = require("./controllers/admin/adminController").login;
const userController = require("./controllers/userController");
const adminController = require("./controllers/admin/adminController");
const marketplaceController = require("./controllers/admin/marketplaceController");
const sliderController = require("./controllers/admin/sliderController");
const Payment = require("./model/Payment");
const vendorController = require("./controllers/vendor/vendorController");

app.use("/v1/webhook/stripe/", express.raw({ type: "*/*" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
      console.log("data: ", req.rawBody);
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/public", express.static("public"));
app.set("/views", express.static("views"));
app.set("view engine", "ejs");

const stripe = require("stripe")("sk_test_51JFOxZEpHAy36lvU50hVM1LUTH3tBOZqUr11YsFqjtyUh60SYOLZfGSLKdcA3HKOxra7rkMEzBbAIprjp5WzDg2i00wsHIB7Vp");


app.get("/customer", async (req, res, next) => {
  await stripe.customers
    .create({
      id: "305ca767-bf10-4e96-a1c8-85a052388546",
      name: "Suvinay Mathur",
      phone: 7410896627,
      email: "suvinaymathur@gmail.com",
      description: "My First Test Customer (created for API docs)",
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/customer/update", async (req, res, next) => {
  await stripe.customers
    .update("305ca767-bf10-4e96-a1c8-85a052388546", {
      address: {
        city: "San Francisco",
        state: "CA",
        country: "US",
        postal_code: 98140,
        line1: "c-28, Jai Kishan Colony, Jaipur",
        line2: "c-28, Jai Kishan Colony, Jaipur",
      },
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/card/create", async (req, res, next) => {
  await stripe.customers
    .createSource("305ca767-bf10-4e96-a1c8-85a052388546", {
      source: "tok_visa",
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/payment_method/create", async (req, res, next) => {
  await stripe.paymentMethods
    .create({
      type: "card",
      card: {
        number: "4242424242424242",
        exp_month: 8,
        exp_year: 2022,
        cvc: "314",
      },
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/get/payment", async (req, res, next) => {
  await stripe.paymentMethods
    .retrieve("pm_1JUVJgHN2wYyuCzbVAYxv2Og")
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/get/customer", async (req, res, next) => {
  await stripe.customers
    .retrieve("305ca767-bf10-4e96-a1c8-85a052388546")
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/product/create", async (req, res, next) => {
  await stripe.products
    .create({
      id: "0a7768d4-3dbc-401a-bed0-8f8f01f640c0",
      name: "Super",
      description: "This is a product",
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/price/create", async (req, res, next) => {
  await stripe.prices
    .create({
      unit_amount: 500,
      currency: "usd",
      recurring: { interval: "month" },
      product: "0a7768d4-3dbc-401a-bed0-8f8f01f640c0",
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/subscription/create", async (req, res, next) => {
  await stripe.subscriptions
    .create({
      customer: "305ca767-bf10-4e96-a1c8-85a052388546",
      items: [{ price: "price_1JUUqFHN2wYyuCzbVpEzw3Fe" }],
    })
    .then((data) => {
      console.log(data);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/", (req, res, next) => {
  res.render("Home", {
    key: process.env.PUBLISHABLE_KEY,
    amount: "7000",
    name: "Harsh Beniwal",
  });
});

app.post("/payment", userController.payment);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

adminSeeder();
countriesSeeder();
app.get("/v1/country/list", userController.countryList);
app.post("/v1/admin/forgotPassword", adminController.forgotPassword);
app.post("/v1/admin/reset", adminController.resetPassword);

app.post(
  "/v1/admin/login",
  passport.authenticate("adminLocal", { session: false }),
  adminLogin
);

app.post("/v1/user/create", userController.create);
app.post("/v1/user/verify/email", userController.verifyEmail);
app.post("/v1/user/login", userController.login);
app.post("/v1/user/forgotPassword", userController.forgotPassword);
app.post("/v1/user/reset", userController.resetPassword);

// Event
app.post("/v1/user/event/view", eventController.view);
app.get("/v1/user/event/listUpcoming", eventController.listUpcoming);
app.get("/v1/user/event/listPost", eventController.listPost);
app.get("/v1/user/event/list", eventController.list);
app.post("/v1/user/event/search", eventController.search);

// Social Media
app.post("/v1/user/login/social", userController.socialLogin);

// Vendor
app.post("/v1/vendor/create", vendorController.create);

// Marketplace api's
// app.get("/v1/marketplace/product/list", marketplaceController.listProduct);
app.post(
  "/v1/marketplace/product/categories/list",
  marketplaceController.listCategories
);
app.post(
  "/v1/marketplace/products/categories",
  marketplaceController.productCount
);
app.post(
  "/v1/marketplace/products/featured",
  marketplaceController.featuredProducts
);
app.post(
  "/v1/marketplace/products/by/category",
  marketplaceController.productsByCategory
);
app.post("/v1/marketplace/product", marketplaceController.productsById);
app.post("/v1/marketplace/order", marketplaceController.orderById);
// app.get("/v1/marketplace/product/reviews", marketplaceController.listReview);

// Slider
app.get("/v1/slider/list", sliderController.list);

app.post("/v1/webhook/stripe", eventController.webhookPayment);
app.use(
  "/v1/admin",
  passport.authenticate("adminJWT", { session: false }),
  adminRoutes
);

app.post(
  "/v1/admin/event/create",
  passport.authenticate("adminJWT", { session: false }),
  adminRoutes
);

app.use(
  "/v1/user",
  passport.authenticate("userJWT", { session: false }),
  userRoutes
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

passport.use(
  new Strategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:5000/v1/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
      console.log(profile);
    }
  )
);

app.get(
  "/v1/auth/google",
  passport.authenticate("google", { scope: ["profile email"] })
);

app.get(
  "/v1/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/fail" }),
  userController.socialMediaLogin
);

app.get("/v1/auth/fail", (req, res, next) => {
  res.send("user logged in failed");
});

app.get("/logout", userController.socialMediaLogout);

if (process.env.NODE_ENV === "development") {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send("Server Error");
  });
}

module.exports = app;
