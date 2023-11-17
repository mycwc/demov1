const { apiSuccessResponse } = require("../../helpers/responseHelper");

const stripe = require("stripe")("sk_test_51JFOxZEpHAy36lvU50hVM1LUTH3tBOZqUr11YsFqjtyUh60SYOLZfGSLKdcA3HKOxra7rkMEzBbAIprjp5WzDg2i00wsHIB7Vp");

module.exports = {
  // Cart API's
  createPaymentIntent: async (amount, currency, user, orderId) => {
    // Retrieve customer from stripe with UUID
    const customerStripeId = await stripe.customers
      .retrieve(user.uuid)
      .then((data) => {
        if (!data.deleted) {
          return data.id;
        }
        throw Error("Customer Deleted");
      })
      .catch(async (err) => {
        console.log(err);
        console.log("User Not Retrieved");

        // create customer
        await stripe.customers
          .create({
            id: user.uuid,
            name: user.name,
            email: user.email,
            address: {
              city: user.city,
              state: user.state,
              postal_code: user.zipCode,
            },
          })
          .then((data) => {
            console.log(data);
            console.log("User Created");
            // return customer uuid
            return data.id;
          })
          .catch((err) => {
            console.log("User Not Created");
            console.log(err);
            return "000000";
          });
      });

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      description: "Payment for marketplace purchase for order id " + orderId,
      customer: customerStripeId,
    });
    return paymentIntent;
  },

  retrievePaymentIntent: async (clientSecret) => {
    const paymentIntent = await stripe.paymentIntents.retrieve(clientSecret);
    return paymentIntent;
  },

  retrieveAllPaymentIntent: async (req, res, next) => {
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 300,
    });
    res.status(200).json(
      apiSuccessResponse(200, "List of payment intents", {
        paymentIntents,
      })
    );
  },

  deleteCustomer: async (req, res, next) => {
    const customerDeleted = await stripe.customers.del(req.body.userUuid);
    res.status(200).json(
      apiSuccessResponse(200, "Customer Deleted", {
        customerDeleted,
      })
    );
  },

  updateCustomer: async (req, res, next) => {
    const updateProps = req.body.property;
    const customer = await stripe.customers.update(
      req.body.userUuid,
      updateProps
    );
    res.status(200).json(
      apiSuccessResponse(200, "Customer Updated", {
        customer,
      })
    );
  },
};
