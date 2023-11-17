const { v4: uuidv4 } = require("uuid");
const request = require("request");
const eventHelper = require("../helpers/eventHelper");
const userHelper = require("../helpers/userHelper");
const packageHelper = require("../helpers/packageHelper");
const User = require("../model/User");
const Event = require("../model/Event");
const UserEvent = require("../model/UserEvent");
const Payment = require("../model/Payment");
const Package = require("../model/Package");
const EventVoucher = require("../model/EventVoucher");
const dayjs = require("dayjs");
const NodeCache = require("node-cache");
const myCache = new NodeCache();

const {
  zoomRegistrants,
  createOrder,
  updateOrder,
} = require("../functions/functions");
const MarketplaceOrders = require("../model/MarketplaceOrders");
const stripe = require("stripe")("sk_test_51JFOxZEpHAy36lvU50hVM1LUTH3tBOZqUr11YsFqjtyUh60SYOLZfGSLKdcA3HKOxra7rkMEzBbAIprjp5WzDg2i00wsHIB7Vp");
const endpointSecret = process.env.WEBHOOK_SECRET_KEY;

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../helpers/responseHelper");

module.exports = {
  register: async (req, res, next) => {
    const userUuid = req.user.uuid;
    const eventUuid = req.body.eventUuid;
    const quantity = req.body.quantity;
    let status = 400;

    await eventHelper
      .getEventByUuid(eventUuid)
      .then((event) => {
        userHelper
          .getUserByUuid(userUuid)
          .then((user) => {
            packageHelper
              .getPackageByUuid(user.package.uuid)
              .then((package) => {
                packageHelper
                  .getPackageByUuid(event.membershipPackage)
                  .then((eventPackage) => {
                    if ((eventPackage.annualCost > package.annualCost) && (event.price == 0)) {
                      status = 400;
                      message = `Error! Sorry but only members of ${eventPackage.name} or higher membership are allowed to access this event. `;

                      res
                        .status(status)
                        .json(apiErrorResponse(status, message, null));
                    } else {
                      UserEvent.findOne({
                        userUuid: user.uuid,
                        eventUuid: event.uuid,
                        isActive: true
                      })
                        .then((record) => {
                          if (record) {
                            status = 400;
                            message = `Sorry but you can register on event only once. `;
                            res
                              .status(status)
                              .json(apiErrorResponse(status, message, null));
                          }
                        });
                      let firstName = user.name.slice(
                        0,
                        user.name.indexOf(" ")
                      );
                      let lastName = user.name.slice(
                        user.name.indexOf(" ")
                      );

                      if (event.eventMode == "online") {
                        zoomRegistrants(
                          event.zoomEventId,
                          firstName,
                          lastName,
                          user.email,
                          user.city,
                          user.mobile
                        )
                          .then((zoomRegistrantData) => {
                            const data = {
                              userUuid: user.uuid,
                              eventUuid: event.uuid,
                              isActive: true,
                              quantity: 1,
                            };
                            EventSaveData(data, user, event);
                          })
                          .catch((err) => {
                            message = "Error!";

                            res
                              .status(status)
                              .json(
                                apiErrorResponse(
                                  status,
                                  message,
                                  err.message
                                )
                              );
                          });
                      } else {
                        const data = {
                          userUuid: user.uuid,
                          eventUuid: event.uuid,
                          isActive: true,
                          quantity: quantity,
                        };
                        EventSaveData(data, user, event);
                      }

                      function EventSaveData(data, user, event) {
                        const userEvent = new UserEvent(data);
                        userEvent
                          .save().then(() => {
                            const email = user.email;
                            const subject = "Registration Successful";
                            const notificationMessage = `<p>Hello ${user.name},<br>Thank you for registering
                                      on ${event.name}. We hope to see you there and appreciate your active involvement.<br>
                                      Event Details:<br>
                                      Name: ${event.name}<br>
                                      Date: ${dayjs(event.startTime).format("DD-MM-YYYY")}<br>
                                      Time: ${dayjs(event.startTime).format("HH:mmA")}<br>
                                      Location / Venue: ${event.eventLink}<br/>
                                      Ticket Quantity: ${data.quantity}
                                      <br/>
                                      For any further queries, you can reach us at http://info@mycwc.org.
                                      <br><br>
                                      Stay Happy and Keep Well.<br>
                                      CWC Team
                               </p>`;
                            userHelper
                              .emailNotifications(
                                email,
                                subject,
                                notificationMessage
                              )
                          }).then(() => {
                            status = 200;
                            message =
                              "Success! Event Registered successfully!";

                            res
                              .status(status)
                              .json(
                                apiSuccessResponse(status, message, "")
                              );
                          })
                          .catch((err) => {
                            message = "Error!";

                            res
                              .status(status)
                              .json(
                                apiErrorResponse(
                                  status,
                                  message,
                                  err.message
                                )
                              );
                          });
                      }
                    }
                  })
                  .catch((err) => {
                    message = "Error!";

                    res
                      .status(status)
                      .json(apiErrorResponse(status, message, err.message));
                  });
              })
              .catch((err) => {
                res
                  .status(status)
                  .json(apiErrorResponse(status, message, err.message));
              });
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

  listRegister: async (req, res, next) => {
    const uuid = req.user.uuid;

    let status = 200;

    await eventHelper
      .getRegisteredEvents(uuid)
      .then((events) => {
        message = "Success! List of all registered events. :-";

        res.status(status).json(apiSuccessResponse(status, message, events));
      })
      .catch((err) => {
        message = "Error! You haven't register for any event yet.";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, []));
      });
  },

  listRegisterEvents: async (req, res, next) => {
    const uuid = req.user.uuid;

    let status = 200;

    await UserEvent.find({
      userUuid: uuid,
      $or: [
        { createdAt: { $gt: dayjs().subtract(1, "year") } },
        { createdAt: { $gt: new Date() } },
      ],
    })
      .then((userEventData) => {
        message = "Success! List registered events. :-";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, userEventData));
      })
      .catch((err) => {
        message = "Error! You haven't register for any event yet.";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, []));
      });
  },

  view: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    if (myCache.has(`e${uuid}`)) {
      eventData = myCache.get(`e${uuid}`);
      status = 200;
      message = `Success! Details of ${eventData.name} event.`;
      res.status(status).json(apiSuccessResponse(status, message, eventData));
    }
    eventHelper
      .getEventByUuid(uuid)
      .then((eventData) => {
        myCache.set(`e${uuid}`, eventData);
        status = 200;
        message = `Success! Details of ${eventData.name} event.`;
        res.status(status).json(apiSuccessResponse(status, message, eventData));
      })
      .catch((err) => {
        status = 400;
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listUpcoming: async (req, res, next) => {
    let status = 200;

    eventHelper
      .getUpcomingEvents()
      .then((event) => {
        message = `Success! List of all upcoming events.`;

        res.status(status).json(apiSuccessResponse(status, message, event));
      })
      .catch((err) => {
        message = "No Upcoming Events found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listPost: async (req, res, next) => {
    let status = 200;

    await eventHelper
      .getPostEvents()
      .then((event) => {
        message = `Success! List of all post events.`;

        res.status(status).json(apiSuccessResponse(status, message, event));
      })
      .catch((err) => {
        message = "No Post events found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  list: async (req, res, next) => {
    let status = 200;
    await eventHelper
      .getEvents()
      .then((events) => {
        message = "Success! List of all events. :-";

        res.status(status).json(apiSuccessResponse(status, message, events));
      })
      .catch((err) => {
        message = "No Events found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  search: async (req, res, next) => {
    const { name } = req.body;

    let status = 400;

    await eventHelper
      .getEventByName(name)
      .then((event) => {
        status = 200;
        message = `Success! Details of ${event.name} event. :-`;

        res.status(status).json(apiSuccessResponse(status, message, event));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  cancel: async (req, res, next) => {
    const { eventUuid } = req.body;
    const user = req.user;

    let status = 400;
    let message = "Error";

    UserEvent.findOne({
      userUuid: user.uuid,
      eventUuid: eventUuid,
      isActive: true,
    })
      .populate("Event", "-_id startTime")
      .then((eventData) => {
        let eventDate = eventData.Event[0].startTime.toDateString();
        eventDate = new Date(eventDate);
        let currentDate = new Date().toDateString();
        currentDate = new Date(currentDate);
        if (eventDate > currentDate) {
          UserEvent.findOneAndUpdate(
            {
              userUuid: user.uuid,
              eventUuid: eventData.eventUuid,
              isActive: true,
            },
            { $set: { isActive: false } },
            { new: true }
          ).populate("Event", "-_id name startTime")
            .then((data) => {
              let name = user.name;
              let email = user.email;
              let eventName = "";
              if (data.Event.name) {
                eventName = data.Event.name;
              } else {
                eventHelper
                  .getEventByUuid(eventUuid)
                  .then((eventData) => {
                    eventName = eventData.name;
                  }
                  );
              }
              const adminEmail = 'info@mycwc.org';
              const subject = "Event Cancellation";
              const notificationMessage = `<p>Hello ,<br>${name} has requested cancellation for the Event : ${eventName} that was to be held on Date: ${dayjs(data.Event.startTime).format("DD-MM-YYYY")}, Time: ${dayjs(data.Event.startTime).format("HH:mmA")}. with user email : ${email} <br>
               </p>`;
              userHelper
                .emailNotifications(adminEmail, subject, notificationMessage).then(() => {
                  const notificationMessage = `<p>Hello ${name},<br>Your request for cancellation has been accepted for the Event : ${eventName} that was to be held on Date: ${dayjs(data.Event.startTime).format("DD-MM-YYYY")}, Time: ${dayjs(data.Event.startTime).format("HH:mmA")}<br> stands cancelled.<br>
                      Your refund will be initiated within 7 business working days. (If any)<br><br>
                      Stay Happy and Keep Well,
                      CWC Team
                   </p>`;
                  userHelper
                    .emailNotifications(email, subject, notificationMessage)
                }).then(() => {
                  status = 200;
                  message = "Success! The event has been successfully cancelled.";
                  res
                    .status(status)
                    .json(apiSuccessResponse(status, message, data));
                })
            })
            .catch((err) => {
              message = "Error!";
              res
                .status(status)
                .json(apiErrorResponse(status, message, err.message));
            });
        } else {
          status = 200;
          message =
            "Sorry but you can't cancel your registration on the same day or after the event date has passed. Please prefer to cancel day before event date.";
          res.status(status).json(apiSuccessResponse(status, message, ""));
        }
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  payment: async (req, res, next) => {
    let user = req.user;
    let data = req.body;
    let status = 400;
    let message = "Error!";

    await User.findOne({ uuid: user.uuid })
      .populate("Package", "eventDiscount")
      .then((userData) => {
        Event.findOne({ uuid: data.eventUuid })
          .populate("packages", "eventDiscount")
          .orFail()
          .then((eventData) => {
            if (data.promoCode != "") {
              EventVoucher.findOne({
                eventUuid: eventData.uuid,
                membershipUuid: userData.package.uuid,
                name: data.promoCode,
                status: true
              })
                .then((eventVoucherData) => {
                  let eventPrice = eventData.price - ((eventData.price * eventVoucherData.discountAmount) / 100);
                  if (eventPrice == 0) {
                    let paymentData = {
                      transactionId: uuidv4(),
                      userUuid: userData.uuid,
                      eventUuid: eventData.uuid,
                      transactionDate: new Date(),
                      amount: eventData.price,
                      discountAmount:
                        (eventData.price * eventVoucherData.discountAmount) / 100,
                      total: eventData.price,
                      status: false,
                    };
                    const payment = new Payment(paymentData);
                    payment
                      .save()
                      .then((result) => {
                        status = 200;
                        message = "Success!.";
                        res
                          .status(status)
                          .json(apiSuccessResponse(status, message, result));
                      })
                      .catch((err) => {
                        res
                          .status(status)
                          .json(apiErrorResponse(status, message, err.message));
                      });
                  } else {
                    eventHelper
                      .eventPayment(data, userData, eventData, eventVoucherData)
                      .then((result) => {
                        status = 200;
                        message = "Success!.";
                        res
                          .status(status)
                          .json(apiSuccessResponse(status, message, result));
                      })
                      .catch((err) => {
                        res
                          .status(status)
                          .json(apiErrorResponse(status, message, err.message));
                      });
                  }
                })
                .catch((err) => {
                  res
                    .status(status)
                    .json(apiErrorResponse(status, message, err.message));
                });
            } else {
              console.log('1');
              eventHelper
                .eventPayment(data, userData, eventData)
                .then((result) => {
                  status = 200;
                  message = "Success!.";
                  res
                    .status(status)
                    .json(apiSuccessResponse(status, message, result));
                })
                .catch((err) => {
                  res
                    .status(status)
                    .json(apiErrorResponse(status, message, err.message));
                });
            }
          })
          .catch((err) => {
            res.status(status).json(apiErrorResponse(status, message, err.message));
          });
      }).catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      })
  },

  webhookPayment: async (req, res, next) => {
    let status = 400;
    let message = "Error!";
    const sig = req.headers["stripe-signature"];
    let event;
    let paymentData = req.body;
    try {
      event = stripe.webhooks.constructEvent(paymentData, sig, endpointSecret);
      // TODO Register On event by searching for user uuid and event uuid stored in transaction with payment intent.
    } catch (err) {
      console.log("Webhook Error", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object.id;
        console.log(paymentIntent);

        Payment.findOneAndUpdate(
          { payment_intent: paymentIntent },
          { $set: { status: true } },
          { new: true }
        )
          .orFail()
          .then((paymentData) => {
            const userEvent = new UserEvent({
              uuid: uuidv4(),
              userUuid: paymentData.userUuid,
              eventUuid: paymentData.eventUuid,
              isActive: true,
            });
            userEvent
              .save()
              .then((result) => {
                User.findOne({ uuid: paymentData.userUuid })
                  .populate("Package", "eventDiscount")
                  .then((userData) => {
                    Event.findOne({ uuid: paymentData.eventUuid })
                      .populate("packages", "eventDiscount")
                      .orFail()
                      .then((eventData) => {
                        UserEvent.findOne(
                          {
                            userUuid: user.uuid,
                            eventUuid: eventData.eventUuid,
                            isActive: true,
                          }).then((userEventData) => {
                            const email = userData.email;
                            const subject = "Registration Successful";
                            const notificationMessage = `<p>Hello ${userData.name},<br>Thank you for registering
                                      on ${eventData.name}. We hope to see you there and appreciate your active involvement.<br>
                                      Event Details:<br>
                                      Name: ${eventData.name}<br>
                                      Date: ${dayjs(eventData.startTime).format("DD-MM-YYYY")}<br>
                                      Time: ${dayjs(eventData.startTime).format("HH:mmA")}<br>
                                      Location / Venue: ${eventData.eventLink}<br>
                                      Ticket Quantity: ${userEventData.quantity}}<br>
                                      <br>For any further queries, you can reach us at http://info@mycwc.org.
                                      <br><br>
                                      Stay Happy and Keep Well.<br>
                                      CWC Team
                               </p>`;
                            userHelper
                              .emailNotifications(
                                email,
                                subject,
                                notificationMessage
                              )
                          });
                      });
                  });
                console.log(result);
              })
              .catch((err) => {
                console.log(err.message);
              });
          })
          .catch((err) => {
            console.log(err.message);
            // res
            //   .status(status)
            //   .json(apiErrorResponse(status, message, err.message));
          });
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    status = 200;
    message = "Success!.";
    res
      .status(status)
      .json(apiSuccessResponse(status, message, "Payment Successful"));
  },
};
