const User = require("../model/User");
const nodemailer = require("nodemailer");
const Payment = require("../model/Payment");

module.exports = {
  getuserByemail: (email) => {
    return new Promise((resolve, reject) => {
      User.findOne({ email: email })
        .populate("Package", "eventDiscount")
        .then((user) => {
          resolve(user);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getUserByUuid: (uuid) => {
    return new Promise((resolve, reject) => {
      User.findOne({ uuid: uuid })
        .orFail()
        .then((user) => {
          resolve(user);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getUserByname: (name) => {
    return new Promise((resolve, reject) => {
      User.findOne({ name: name })
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

  getUserByLike: (name) => {
    return new Promise((resolve, reject) => {
      User.find({ name: new RegExp(name, "i") })
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

  getUsers: () => {
    return new Promise((resolve, reject) => {
      User.find()
        .populate("Package", "-_id colour")
        .sort({ name: 1 })
        .orFail()
        .select("-_id -password")
        .then((members) => {
          resolve(members);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  emailNotifications: (email, subject, notificationMessage) => {
    return new Promise((resolve, reject) => {
      let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        tls: {
          // do not fail on invalid certs
          rejectUnauthorized: false,
        },
      });

      const mailoptions = {
        from: process.env.MAIL_FROM, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: notificationMessage, // html body
      };

      transporter.sendMail(mailoptions, (error, info) => {
        if (error) {
          reject(error);
        }
        resolve(info);
      });
    });
  },

  marketPlacePayment: (data, user, stripeData = null) => {
    return new Promise((resolve, reject) => {
      let paymentData = {
        transactionId: Math.random().toString(36).slice(2),
        userUuid: user.uuid,
        payment_intent: stripeData ? stripeData.id : null,
        client_secret: stripeData ? stripeData.client_secret : null,
        transactionDate: new Date(),
        amount: data.amount,
        type: data.type ? data.type : "Stripe",
        discountAmount: data.discount,
        total: data.total,
        status: true,
        orderId: data.orderId,
        remarks: "Payment for Marketplace Order ID: #" + data.orderId,
      };
      const payment = new Payment(paymentData);
      payment
        .save()
        .then(() => {
          resolve(payment);
        })
        .catch((err) => {
          reject(err);
        });
    })
  },
};
