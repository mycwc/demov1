const { v4: uuidv4 } = require("uuid");
const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");
const {
  marketQuery,
  productQuery,
  orderQuery,
  createOrder,
  retrieveOrder,
  updateOrder,
} = require("../../functions/functions");

const { getParamData } = require("../../helpers/marketHelper");

const Cart = require("../../model/Cart");

const {
  cartSchema,
  wishlistSchema,
} = require("../../validator/validationSchema");
const {
  createPaymentIntent,
  retrievePaymentIntent,
} = require("./stripeController");
const MarketplaceOrders = require("../../model/MarketplaceOrders");
const e = require("express");
const userHelper = require("../../helpers/userHelper");

module.exports = {
  // Cart API's
  createCart: async (req, res, next) => {
    let user = req.user;
    let status = 400;
    const data = req.body;

    data.uuid = uuidv4();
    data.customerId = user.uuid;
    const cart = new Cart(data);

    cartSchema
      .validateAsync(data)
      .then(() => {
        cart
          .save()
          .then((result) => {
            status = 200;
            message = "Cart created successfully :-";

            res
              .status(status)
              .json(apiSuccessResponse(status, message, result));
          })
          .catch((err) => {
            message = "Error!";

            res
              .status(status)
              .json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error! Validation Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  updateCart: async (req, res, next) => {
    let user = req.user;
    let status = 400;
    const data = req.body;

    Cart.updateOne(
      { $and: [{ uuid: data.uuid }, { customerId: user.uuid }] },
      { $set: data }
    )
      .orFail()
      .then((result) => {
        status = 200;
        message = "Cart updated successfully :-";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listCart: async (req, res, next) => {
    let user = req.user;
    let status = 404;
    let data = req.body;

    Cart.find({ customerId: user.uuid, inWishlist: false })
      .then((result) => {
        let productIdArray = [];
        let productArray = [];
        result.forEach((item) => {
          productIdArray.push(item.productId);
          productArray.push(item);
        });

        status = 200;
        message = "List of Cart:-";

        let paramData = "products?per_page=100&include=" + productIdArray;

        marketQuery(paramData).then((cartItems) => {
          let product = [];
          cartItems.forEach((item1) => {
            productArray.forEach((item2) => {
              if (item1.id == item2.productId)
                product.push({
                  uuid: item2.uuid,
                  customerId: item2.customerId,
                  productId: item1.id,
                  name: item1.name,
                  quantity: item2.quantity,
                  regular_price: item1.regular_price,
                  sale_price: item1.sale_price,
                  category: item1.categories,
                  image: item1.images,
                });
            });
          });
          res.status(status).json(apiSuccessResponse(status, message, product));
        });
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listCartAbhijeet: async (req, res, next) => {
    let user = req.user;
    let status = 200;
    let message = "Cart items list";

    Cart.find({ customerId: user.uuid, inWishlist: false })
      .then(async (items) => {
        let productIdArray = [];
        items.forEach((item) => {
          productIdArray.push(item.productId);
        });

        let paramData = "?include=" + productIdArray;

        const cartProducts = await marketQuery(paramData).then((cartItems) => {
          return cartItems;
        });
        res
          .status(status)
          .json(apiSuccessResponse(status, message, cartProducts));
      })
      .catch((err) => {
        message = "Error!";
        status = 400;
        res.status(status).json(apiSuccessResponse(status, err.message, []));
      });
  },

  cartDelete: async (req, res, next) => {
    const { uuid } = req.body;
    let user = req.user;
    let status = 404;
    let message = "Error!";

    Cart.deleteOne({ $and: [{ uuid: uuid }, { customerId: user.uuid }] })
      .then((result) => {
        status = 200;
        message = "Cart is deleted successfully:-";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  //wishlist API's
  createWishlist: async (req, res, next) => {
    let user = req.user;
    let status = 400;
    const data = req.body;

    data.uuid = uuidv4();
    data.customerId = user.uuid;
    data.inWishlist = true;
    const cart = new Cart(data);

    wishlistSchema
      .validateAsync(data)
      .then(() => {
        cart
          .save()
          .then((result) => {
            status = 200;
            message = "Wishlist created successfully :-";

            res
              .status(status)
              .json(apiSuccessResponse(status, message, result));
          })
          .catch((err) => {
            message = "Error!";

            res
              .status(status)
              .json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error! Validation Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  updateWishlist: async (req, res, next) => {
    let user = req.user;
    let status = 400;
    const data = req.body;

    Cart.updateOne(
      { $and: [{ uuid: data.uuid }, { customerId: user.uuid }] },
      { $set: data }
    )
      .orFail()
      .then((result) => {
        status = 200;
        message = "Wishlist updated successfully :-";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listWishlist: async (req, res, next) => {
    let user = req.user;
    let status = 404;
    let data = req.body;

    Cart.find({ customerId: user.uuid, inWishlist: true })
      .then((result) => {
        let productIdArray = [];
        let productArray = [];
        result.forEach((item) => {
          productIdArray.push(item.productId);
          productArray.push(item);
        });

        status = 200;
        message = "Wishlist Items";

        let paramData = "products?per_page=100&include=" + productIdArray;

        marketQuery(paramData).then((wishlistItems) => {
          let product = [];
          wishlistItems.forEach((item1) => {
            productArray.forEach((item2) => {
              if (item1.id == item2.productId)
                product.push({
                  uuid: item2.uuid,
                  customerId: item2.customerId,
                  productId: item1.id,
                  name: item1.name,
                  regular_price: item1.regular_price,
                  sale_price: item1.sale_price,
                  category: item1.categories,
                  image: item1.images,
                });
            });
          });
          res.status(status).json(apiSuccessResponse(status, message, product));
        });
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  deleteWishlist: async (req, res, next) => {
    const { uuid } = req.body;
    let user = req.user;
    let status = 400;
    let message = "Error!";

    Cart.deleteOne({ $and: [{ uuid: uuid }, { customerId: user.uuid }] })
      .then((result) => {
        status = 200;
        message = "Data is deleted successfully:-";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  //Product
  listProduct: async (req, res, next) => {
    let status = 404;
    let message = "Error!";
    let data = req.body;

    let paramData = getParamData(data, "products");

    await marketQuery(paramData)
      .then((result) => {
        status = 200;
        message = "List of Cart:-";
        let data = result;

        res.status(status).json(apiSuccessResponse(status, message, data));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listCategories: async (req, res, next) => {
    let status = 200;
    let message = "Error!";
    let data = req.body;
    let paramData = getParamData(data, "products/categories");

    await marketQuery(paramData)
      .then((result) => {
        message = "List of categories:-";
        let data = result;

        res.status(status).json(apiSuccessResponse(status, message, data));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  productCount: async (req, res, next) => {
    let status = 404;
    let message = "Error!";
    let data = req.body;
    let paramData = getParamData(data, "products/categories");

    await marketQuery(paramData)
      .then((result) => {
        status = 200;
        message = "Product details:-";
        let data = result;

        res.status(status).json(apiSuccessResponse(status, message, data));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  featuredProducts: async (req, res, next) => {
    let status = 404;
    let message = "Error!";
    let data = req.body;
    let paramData = getParamData(data, "products");

    await marketQuery(paramData)
      .then((result) => {
        status = 200;
        message = "Product details:-";
        let data = result;

        res.status(status).json(apiSuccessResponse(status, message, data));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  productsByCategory: async (req, res, next) => {
    let status = 404;
    let message = "Error!";
    const data = req.body;

    let paramQuery = getParamData(data, "products/");
    await marketQuery(paramQuery)
      .then((result) => {
        const dataToSend = [];
        result.forEach(item => {
          if (item.status == "publish") {
            dataToSend.push(item);
          }
        });
        status = 200;
        message = "List of Products by categories:-";
        res.status(status).json(apiSuccessResponse(status, message, dataToSend));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  productsById: async (req, res, next) => {
    let status = 404;
    let message = "Error!";
    let data = req.body;

    await productQuery(data.id)
      .then((result) => {
        status = 200;
        message = "Product detail:-";
        let data = JSON.parse(result);

        res.status(status).json(apiSuccessResponse(status, message, data));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  orderCreate: async (req, res, next) => {
    let status = 400;
    let message = "Error!";
    let user = req.user;
    let reqData = req.body;
    let stripeIntent = {};
    let clientSecret = null;
    const name = req.user.name.split(" ");

    let customerAddress = {
      first_name: name[0],
      last_name: name[1],
      address_1: req.user.addressLine1 ?? "",
      address_2: req.user.addressLine2 ?? "",
      city: user.city,
      state: user.state,
      postcode: req.user.zipCode ?? "",
      country: user.country,
      email: user.email,
      phone: user.mobile ?? "",
    };

    Cart.find({ customerId: user.uuid, inWishlist: false })
      .then((cartData) => {
        let lineItems = [];
        if (cartData.length < 1) {
          return res
            .status(400)
            .json(apiErrorResponse(400, "Cart is empty", []));
        }

        cartData.forEach((item) => {
          lineItems.push({
            product_id: item.productId,
            quantity: item.quantity,
          });
        });

        let orderData = {
          payment_method: "stripe",
          payment_method_title: "Stripe",
          set_paid: false,
          billing: customerAddress,
          shipping: customerAddress,
          line_items: lineItems,
          customer_id: user.wooCustomerId ?? 0,
        };

        if (reqData.code) {
          orderData.coupon_lines = [
            {
              code: reqData.code,
            },
          ];
        }

        createOrder(orderData)
          .then(async (orderResponse) => {
            status = 200;
            message = "Order created successfully.";

            // Clear Cart
            await Cart.deleteMany({
              customerId: user.uuid,
              inWishlist: false,
            })
              .then()
              .catch((err) => {
                throw Error(err.message);
              });

            // If amount is greater than 0
            if (orderResponse.total > 0) {
              stripeIntent = await createPaymentIntent(
                orderResponse.total,
                orderResponse.currency,
                user,
                orderResponse.id
              );
              clientSecret = stripeIntent.client_secret;

              let data = {
                orderId: orderResponse.id,
                total: orderResponse.total,
                discount: orderResponse.discount_total,
                amount: orderResponse.total,
              }

              await userHelper.marketPlacePayment(data, user, stripeIntent);

              // update Order with stripe intent
              await updateOrder(orderResponse.id, {
                status: "processing",
                set_paid: "true"
              });
            }
            else {
              let data = {
                orderId: orderResponse.id,
                total: orderResponse.total,
                discount: orderResponse.discount_total,
                amount: orderResponse.total,
                type: "Free",
              }
              await userHelper.marketPlacePayment(data, user);
              // update Order with stripe intent
              await updateOrder(orderResponse.id, {
                status: "processing",
                meta_data: [
                  {
                    key: "_stripe_intent_id",
                    value: stripeIntent.id,
                  },
                ],
              });
            }
            // End 

            new MarketplaceOrders({
              userUuid: user.uuid,
              wooOrderId: orderResponse.id,
              wooResponse: orderResponse,
              stripeIntent: stripeIntent,
            }).save();

            res.status(status).json(
              apiSuccessResponse(status, message, {
                orderResponse,
                clientSecret,
              })
            );
          })
          .catch((err) => {
            message = "Error!";

            res
              .status(status)
              .json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  orderRetrieve: async (req, res, next) => {
    let status = 400;
    let message = "Error!";
    let clientSecret = req.body.clientSecret;
    console.log(clientSecret);

    const intentDetails = await retrievePaymentIntent(clientSecret);

    res.status(200).json(
      apiSuccessResponse(200, "message", {
        intentDetails,
      })
    );
  },

  listOrder: async (req, res, next) => {
    let status = 200;
    let message = "Error!";
    let user = req.user;
    let data = req.body;
    data.customer = user.wooCustomerId;
    let paramData = getParamData(data, "orders");

    await marketQuery(paramData)
      .then((result) => {
        message = "Order list.";
        let data = result;

        res.status(status).json(apiSuccessResponse(status, message, data));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  orderById: async (req, res, next) => {
    let status = 404;
    let message = "Error!";
    let data = req.body;

    let paramData = getParamData(data, "orders/" + data.id);

    await marketQuery(paramData)
      .then((result) => {
        status = 200;
        message = "Order detail :-";
        let data = result;

        res.status(status).json(apiSuccessResponse(status, message, data));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listReview: async (req, res, next) => {
    let status = 200;
    let message = "Error!";
    let data = req.body;
    let paramData = getParamData(data, "products/reviews");

    await marketQuery(paramData)
      .then((result) => {
        message = "Order list:-";
        let data = result;

        res.status(status).json(apiSuccessResponse(status, message, data));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  // Coupons

  viewCoupon: async (req, res, next) => {
    let status = 404;
    let message = "Error! Not found!";
    let data = req.body;
    let paramData = getParamData(data, "coupons");

    await marketQuery(paramData)
      .then((result) => {
        status = 200;
        message = "Details of Coupon :-";
        let couponData = result;

        res
          .status(status)
          .json(apiSuccessResponse(status, message, couponData));
      })
      .catch((err) => {
        message = "Error!";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
      });
  },

  listCoupon: async (req, res, next) => {
    let status = 200;
    let message = "Error! Not found!";
    let data = req.body;

    let paramData = getParamData(data, "coupons/");
    marketQuery(paramData)
      .then((result) => {
        message = "Details of Coupon :-";
        let couponData = result;

        res
          .status(status)
          .json(apiSuccessResponse(status, message, couponData));
      })
      .catch((err) => {
        message = "Error!";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, []));
      });
  },

  marketplaceVoucherList: async (req, res, next) => {
    let status = 200;
    let message = "Error!";
    let data = req.body;
    let paramData = getParamData(data, "coupons");

    await marketQuery(paramData)
      .then((result) => {
        message = "List of coupons.";
        let data = result;

        res.status(status).json(apiSuccessResponse(status, message, data));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },
};

