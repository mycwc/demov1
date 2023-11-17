const { v4: uuidv4 } = require("uuid");
const Event = require("../model/Event");
const userEvent = require("../model/UserEvent");
const Payment = require("../model/Payment");
const MarketplaceOrders = require("../model/MarketplaceOrders");
const dayjs = require("dayjs");
const {
  createPaymentIntent,
} = require("../controllers/admin/stripeController");

module.exports = {
  getEventByUuid: (uuid) => {
    return new Promise((resolve, reject) => {
      Event.findOne({ uuid: uuid })
        .populate("packages", "-_id ")
        .orFail()
        .select("-_id")
        .then((event) => {
          resolve(event);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  // TODO Improve helped - introduce status - status update logic correction
  getEvents: () => {
    return new Promise((resolve, reject) => {
      Event.find()
        .select("-_id")
        .then((event_data) => {
          event_data.forEach((item) => {
            if (item.status != "draft") {
              item.status == "cancelled"
                ? (item.status = "cancelled")
                : new Date(item.startTime).toLocaleDateString() ==
                  new Date().toLocaleDateString() &&
                  item.startTime <= item.endTime
                  ? (item.status = "ongoing")
                  : item.endTime < new Date()
                    ? (item.status = "completed")
                    : (item.status = "upcoming");
              Event.updateOne(
                { uuid: item.uuid },
                { $set: { status: item.status } }
              )
                .then()
                .catch((err) => reject(err));
            }
          });
          Event.find()
            .sort({ startTime: -1 })
            .populate("packages", "-_id ")
            .populate("EventRegisteredUsers")
            .select("-_id")
            .then((result) => {
              resolve(result);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getDraftEvents: () => {
    return new Promise((resolve, reject) => {
      Event.find({ status: 2 })
        .populate("packages", "-_id ")
        .orFail()
        .select("-_id")
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getRegisteredUsers: (uuid) => {
    return new Promise((resolve, reject) => {
      userEvent
        .find({ eventUuid: uuid })
        .populate("Users", "-_id -password")
        .orFail()
        .select("-_id")
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getEventByname: (name) => {
    return new Promise((resolve, reject) => {
      Event.findOne({ name: name })
        .orFail()
        .select("-_id")
        .then((user) => {
          resolve(user);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getRegisteredEvents: (uuid) => {
    // console.log(dayjs("2023-01-06T09:53:46.688+00:00").subtract(1, "year"));
    return new Promise((resolve, reject) => {
      userEvent
        .find({
          userUuid: uuid,
          $or: [
            { createdAt: { $gt: dayjs().subtract(1, "year") } },
            { createdAt: { $gt: new Date() } },
          ],
        })
        .populate("packages", "-_id ")
        .orFail()
        .select("-_id")
        .then((events) => {
          const event_array = [];
          events.forEach((item) => {
            event_array.push(item.eventUuid);
            // console.log(event_array);
          });
          Event.find({
            uuid: {
              $in: event_array,
            },
            $or: [
              { startTime: { $gt: dayjs().subtract(1, "year") } },
              { startTime: { $gt: new Date() } },
            ],
          })
            .select(
              "-_id  -eventCategory -membershipPackage -locationLink -registrationLink -duration -image -speakers"
            )
            .orFail()
            .then(() => {
              Event.find({
                uuid: { $in: event_array },
              })
                .populate("packages", "-_id")
                .then((result) => {
                  // console.log(result)
                  resolve(result);
                })
                .catch((err) => {
                  reject(err);
                });
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getUpcomingEvents: () => {
    return new Promise((resolve, reject) => {
      Event.find({ status: 1, startTime: { $gt: new Date() } })
        .populate("packages", "-_id ")
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getPostEvents: () => {
    return new Promise((resolve, reject) => {
      Event.updateMany(
        {
          $and: [{ date: { $lte: new Date() } }, { status: { $ne: 0 } }],
        },
        { $set: { status: 1 } }
      )
        .then(() => {
          Event.find({ status: 1, startTime: { $lt: new Date() } })
            .populate("packages", "-_id ")
            .then((data) => {
              resolve(data);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getEventByName: (name) => {
    return new Promise((resolve, reject) => {
      Event.findOne({ name: new RegExp(name, "i") })
        .orFail()
        .select("-_id")
        .then((event) => {
          resolve(event);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  DeleteEventByUuid: (uuid) => {
    return new Promise((resolve, reject) => {
      Event.deleteOne({ uuid: uuid })
        .then((event) => {
          resolve(event);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  eventPayment: (data = null, user, eventData, eventVoucherData = null) => {
    return new Promise((resolve, reject) => {
      let stripeOrderId = uuidv4();


      eventData.price = eventData.price * data.quantity;

      let price = eventVoucherData != null
        ? eventData.price -
        ((eventData.price * eventVoucherData.discountAmount) / 100)
        : eventData.price - ((eventData.price * user.Package[0].eventDiscount) / 100);

      createPaymentIntent(price, "usd", user, stripeOrderId)
        .then((stripeData) => {
          new MarketplaceOrders({
            userUuid: user.uuid,
            wooOrderId: stripeOrderId,
            wooResponse: {},
            stripeIntent: stripeData,
          })
            .save()
            .then((result) => {
              let paymentData = {
                transactionId: Math.random().toString(36).slice(2),
                userUuid: user.uuid,
                eventUuid: eventData.uuid,
                promoCodeUuid: eventVoucherData != null ? eventVoucherData.uuid : null,
                payment_intent: stripeData.id,
                client_secret: stripeData.client_secret,
                transactionDate: new Date(),
                amount: eventData.price,
                discountAmount:
                  eventVoucherData != null
                    ? ((eventData.price * eventVoucherData.discountAmount) / 100)
                    : ((eventData.price * user.Package[0].eventDiscount) / 100),
                total: price,
                status: false,
              };
              const payment = new Payment(paymentData);
              payment
                .save()
                .then(() => {
                  resolve(result);
                })
                .catch((err) => {
                  reject(err);
                });
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
