const nodemailer = require("nodemailer");
const async = require("async");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const request = require("request");
const dotenv = require("dotenv");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;

dotenv.config({ path: ".env" });

const WooCommerce = new WooCommerceRestApi({
  url: "https://mycwc.org", // Your store URL
  consumerKey: process.env.MARKET_USERNAME, // Your consumer key
  consumerSecret: process.env.MARKET_PASSWORD, // Your consumer secret
  version: "wc/v3", // WooCommerce WP REST API version
});

module.exports = {
  timeDate: (time, dateString) => {
    const hours = time.slice(0, 2);
    const minutes = time.slice(3, 5);
    let timeDate = dateString.setHours(hours, minutes);
    let date = new Date(timeDate);
    return date;
  },

  emailSend: async () => {
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

    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15m",
    });

    const mailoptions = {
      from: process.env.MAIL_FROM, // sender address
      to: email, // list of receivers
      subject: "Account Activation Link", // Subject line
      html: `<p>${process.env.CLIENT_URL}/authentication/activate/${token}</p>`, // html body
    };

    let status = 400;

    transporter.sendMail(mailoptions, (error, info) => {
      if (error) {
        status = 400;
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, error));
      }
      status = 200;
      message =
        "Success! A verification link has been sent to your account. :-";
      res
        .status(status)
        .json(apiSuccessResponse(status, message, info.messageId));
    });
  },

  vendorRequestEmail: async (vendor) => {
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

      // const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
      //   expiresIn: "15m",
      // });
      var body = `Store Name: ${vendor.store_name}<br> Name: ${vendor.first_name} ${vendor.last_name}<br> Email: ${vendor.email}<br> Phone: ${vendor.phone}<br>`;
      if (vendor.address_1) {
        body += `Address Line 1: ${vendor.address_1}<br>`;
      }
      if (vendor.address_2) {
        body += `Address Line 2: ${vendor.address_2}<br>`;
      }
      body += `City: ${vendor.city}<br>
      State: ${vendor.state}<br>
      Country: ${vendor.country}<br>
      ZipCode: ${vendor.zipCode}<br>`;

      if (vendor.account_no) {
        body += `Account no: ${vendor.account_no}<br>`;
      }
      if (vendor.bank_name) {
        body += `Bank Name: ${vendor.bank_name}<br>`;
      }
      if (vendor.swift_code) {
        body += `Swift Code: ${vendor.swift_code}<br>`;
      }
      if (vendor.iban) {
        body += `IBAN: ${vendor.iban}<br>`;
      }
      if (vendor.paypal_link) {
        body += `Paypal Link: ${vendor.paypal_link}<br>`;
      }

      const mailoptions = {
        from: process.env.MAIL_FROM, // sender address
        to: process.env.ADMIN_EMAIL, // list of receivers
        subject: "New Vendor Request", // Subject line
        html: `<head>
      <style>
      table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
        text-align: center;
      }
      </style>
      </head>
      <p>This is to share with you that a user with name as ${vendor.first_name} ${vendor.last_name} & email as ${vendor.email}
       has requested to register as a vendor on marketplace.</p>
       <p>All details are written below:-</p>
       <p>${body}</p><br>

       <br><br> <p>Kindly contact & verify the concerned user at the earliest.</p>`, // html body
      };

      transporter.sendMail(mailoptions, (error, info) => {
        if (error) {
          reject(error);
        }
        resolve(info.messageId);
      });
    });
  },

  vendorRequestEmailToUser: async (vendor) => {
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
      var body = `Store Name: ${vendor.store_name}<br> Name: ${vendor.first_name} ${vendor.last_name}<br> Email: ${vendor.email}<br> Phone: ${vendor.phone}<br>`;
      if (vendor.address_1) {
        body += `Address Line 1: ${vendor.address_1}<br>`;
      }
      if (vendor.address_2) {
        body += `Address Line 2: ${vendor.address_2}<br>`;
      }
      body += `City: ${vendor.city}<br>
      State: ${vendor.state}<br>
      Country: ${vendor.country}<br>
      ZipCode: ${vendor.zipCode}<br>`;

      if (vendor.account_no) {
        body += `Account no: ${vendor.account_no}<br>`;
      }
      if (vendor.bank_name) {
        body += `Bank Name: ${vendor.bank_name}<br>`;
      }
      if (vendor.swift_code) {
        body += `Swift Code: ${vendor.swift_code}<br>`;
      }
      if (vendor.iban) {
        body += `IBAN: ${vendor.iban}<br>`;
      }
      if (vendor.paypal_link) {
        body += `Paypal Link: ${vendor.paypal_link}<br>`;
      }

      // const token = jwt.sign({email}, process.env.JWT_SECRET_KEY, {
      //   expiresIn: "15m",
      // });

      const mailoptions = {
        from: process.env.MAIL_FROM, // sender address
        to: vendor.email, // list of receivers
        subject: "Vendor Request Details", // Subject line
        html: `<head>
                  <style>
                    table, th, td {
                      border: 1px solid black;
                    border-collapse: collapse;
                    text-align: center;
      }
                  </style>
                </head>
                <p>Hi,</p>
                <p>This is to share with you that your request for becoming a vendor on CWC marketplace has been successfully recorded with the following details.</p>
                <p>${body}</p><br><br> <p>Regards <br /> CWC Team</p>`, // html body
      };

      transporter.sendMail(mailoptions, (error, info) => {
        if (error) {
          reject(error);
        }
        resolve(info.messageId);
      });
    });
  },


  userNotification: (eventData) => {
    return new Promise((resolve, reject) => {
      User.find()
        .orFail()
        .select("email")
        .then((users) => {
          let userEmails = [];
          users.forEach((item) => {
            userEmails.push(item.email);
          });

          let transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.PORT,
            auth: {
              user: process.env.USER,
              pass: process.env.PASS,
            },
            tls: {
              // do not fail on invalid certs
              rejectUnauthorized: false,
            },
          });
          const mailoptions = {
            from: process.env.MAIL_FROM, // sender address
            to: userEmails.toString(), // list of receivers
            subject: eventData.eventName, // Subject line
            html: `<h2>A new event has been created, named ${eventData.name}</h2>`, // html body
          };

          let status = 400;

          transporter.sendMail(mailoptions, (error, info) => {
            if (error) {
              reject(error);
            }
            resolve(info.messageId);
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  paginatedResults: (data, page, limit) => {
    let pages = parseInt(page);
    let limits = parseInt(limit);

    const startIndex = (pages - 1) * limit;
    const endIndex = pages * limits;

    const results = {};

    if (endIndex < data.length) {
      results.next = {
        page: parseInt(pages) + 1,
        limit: limits,
        count: data.length,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: pages - 1,
        limit: limits,
        count: data.length,
      };
    }

    results.list = data.slice(startIndex, endIndex);

    return results;
  },

  zoomRegistration: (name, startTime, duration, description) => {
    return new Promise((resolve, reject) => {
      try {
        let options = {
          url: `https://api.zoom.us/v2/users/${process.env.ZOOM_EMAIL}/webinars`,
          method: "POST",
          headers: {
            Authorization: "Bearer " + process.env.ZOOM_TOKEN_KEY,
          },
          json: true,
          body: {
            agenda: description,
            duration: duration,
            contact_email: "info@mycwc.org",
            contact_name: "CWC Team",
            emailLanguage: "en-us",
            start_time: dayjs(startTime).utc().format(),
            template_id: "iqFT-e90SHKPRQJdNOlw1w",
            topic: name,
            type: 5,
          },
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === 201) {
            resolve({ message: response });
          } else {
            reject({ message: body });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  zoomMeeting: (name, startTime, duration, description) => {
    return new Promise((resolve, reject) => {
      try {
        let options = {
          url: `https://api.zoom.us/v2/users/${process.env.ZOOM_EMAIL}/meetings`,
          method: "POST",
          headers: {
            Authorization: "Bearer " + process.env.ZOOM_TOKEN_KEY,
          },
          json: true,
          body: {
            created_at: new Date(),
            duration: duration,
            host_id: "AbcDefGHi",   // Its an actual zoom genetrated id value
            id: 1100000,
            join_url: "https://zoom.us/j/1100000",
            settings: {
              alternative_hosts: "",
              approval_type: 2,
              audio: "both",
              auto_recording: "local",
              close_registration: false,
              cn_meeting: false,
              enforce_login: false,
              enforce_login_domains: "",
              global_dial_in_countries: ["US"],
              global_dial_in_numbers: [],
              host_video: false,
              in_meeting: false,
              join_before_host: true,
              mute_upon_entry: false,
              participant_video: false,
              registrants_confirmation_email: true,
              use_pmi: false,
              waiting_room: false,
              watermark: false,
              registrants_email_notification: true,
            },
            start_time: dayjs(startTime).utc().format(),
            start_url:
              "https://zoom.us/s/1100000?iIifQ.wfY2ldlb82SWo3TsR77lBiJjR53TNeFUiKbLyCvZZjw",
            status: "waiting",
            topic: name,
            type: 2,
            uuid: "ng1MzyWNQaObxcf3+Gfm6A==",
          },
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === 201) {
            resolve({ message: response });
          } else {
            reject({ message: body });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  zoomUpdate: async (zoomEventId, name, startTime, duration, description) => {
    return new Promise((resolve, reject) => {
      try {
        let options = {
          url: `https://api.zoom.us/v2/webinars/${zoomEventId}`,
          method: "PATCH",
          auth: {
            bearer: process.env.ZOOM_TOKEN_KEY,
          },
          json: true,
          body: {
            topic: name,
            agenda: description,
            duration: duration,
            start_time: startTime,
          },
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === 204) {
            resolve({ message: response });
          } else {
            reject({ message: body.message });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  zoomMeetingUpdate: async (zoomMeetingId, name, startTime, duration, description) => {
    return new Promise((resolve, reject) => {
      try {
        let options = {
          url: `https://api.zoom.us/v2/meetings/${zoomMeetingId}`,
          method: "PATCH",
          auth: {
            bearer: process.env.ZOOM_TOKEN_KEY,
          },
          json: true,
          body: {
            topic: name,
            agenda: description,
            duration: duration,
            start_time: startTime,
          },
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === 204) {
            resolve({ message: response });
          } else {
            reject({ message: body.message });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  zoomDelete: async (zoomEventId, type) => {
    return new Promise((resolve, reject) => {
      let url = '';
      if (type == 'webinar') {
        url = `https://api.zoom.us/v2/webinars/${zoomEventId}?cancel_webinar_reminder=${true}`;
      }
      else {
        url = `https://api.zoom.us/v2/meetings/${zoomEventId}`;
      }
      try {
        let options = {
          url: url,
          method: "DELETE",
          auth: {
            bearer: process.env.ZOOM_TOKEN_KEY,
          },
          json: true,
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === 204) {
            resolve({ message: response });
          } else {
            reject({ message: body.message });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  zoomView: async (zoomEventId) => {
    return new Promise((resolve, reject) => {
      try {
        let options = {
          url: `https://api.zoom.us/v2/webinars/${zoomEventId}`,
          method: "GET",
          auth: {
            bearer: process.env.ZOOM_TOKEN_KEY,
          },
          json: true,
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === 201) {
            resolve({ message: response });
          } else {
            reject({ message: body.message });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  zoomRegistrants: async (
    zoomEventId,
    firstName,
    lastName,
    email,
    city,
    phone
  ) => {
    return new Promise((resolve, reject) => {
      try {
        let options = {
          url: `https://api.zoom.us/v2/webinars/${zoomEventId}/registrants`,
          method: "POST",
          auth: {
            bearer: process.env.ZOOM_TOKEN_KEY,
          },
          json: true,
          body: {
            first_name: firstName,
            last_name: lastName,
            email: email,
            city: city,
            phone: phone,
          },
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === 201) {
            resolve({ message: response });
          } else {
            reject({ message: body.message });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  eventbriteEventCreate: async (eventName, description, startTime, endTime) => {
    return new Promise((resolve, reject) => {
      try {
        let options = {
          url: `https://www.eventbriteapi.com/v3/organizations/567963075797/events/`,
          method: "POST",
          auth: {
            bearer: process.env.ZOOM_TOKEN_KEY,
          },
          json: true,
          body: {
            first_name: firstName,
            last_name: lastName,
            email: email,
            city: city,
            phone: phone,
          },
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === 201) {
            resolve({ message: response });
          } else {
            reject({ message: body.message });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  eventAttendeesList: async (eventId) => {
    return new Promise((resolve, reject) => {
      try {
        let options = {
          url: `https://www.eventbriteapi.com/v3/events/${eventId}/attendees/`,
          method: "GET",
          auth: {
            bearer: "UCFSXBZLXYOEQPGGWJQJ",
          },
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            resolve(body);
          } else {
            reject({ message: body.message });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  marketQuery: async (paramQuery, requestMethod = "GET", data = {}) => {
    console.log(paramQuery);
    return new Promise((resolve, reject) => {
      if (requestMethod == "POST") {
        WooCommerce.post(paramQuery, data)
          .then((response) => {
            console.log(response.data);
            resolve(response.data);
          })
          .catch((error) => {
            console.log(error.response.data);
            reject(error.response.data);
          });
      } else {
        WooCommerce.get(paramQuery)
          .then((response) => {
            console.log(response.data);
            resolve(response.data);
          })
          .catch((error) => {
            console.log(error.response.data);
            reject(error.response.data);
          });
      }
    });
  },

  createOrder: async (orderData) => {
    console.log(orderData);
    return new Promise((resolve, reject) => {
      WooCommerce.post("orders", orderData)
        .then((response) => {
          console.log(response.data);
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error.response.data);
          reject(error.response.data);
        });
    });
  },

  updateOrder: async (orderId, updateData) => {
    return new Promise((resolve, reject) => {
      WooCommerce.put("orders/" + orderId, updateData)
        .then((response) => {
          console.log(response.data);
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error.response.data);
          reject(error.response.data);
        });
    });
  },

  createCustomer: async (customerData) => {
    return new Promise((resolve, reject) => {
      WooCommerce.post("customers", customerData)
        .then((response) => {
          console.log(response.data);
          resolve(response.data);
        })
        .catch((error) => {
          console.log(error.response.data);
          reject(error.response.data);
        });
    });
  },

  productQuery: async (id) => {
    return new Promise((resolve, reject) => {
      let basicAuth =
        "Basic " +
        Buffer.from(
          process.env.MARKET_USERNAME + ":" + process.env.MARKET_PASSWORD
        ).toString("base64");

      try {
        let options = {
          url: `https://mycwc.org/wp-json/wc/v3/products/${id}`,
          method: "GET",
          headers: {
            Authorization: basicAuth,
          },
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === 200) {
            resolve(body);
          } else {
            console.log("Error2:" + error);
            reject({ message: body.message });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  reviewQuery: async (query, data) => {
    console.log(data);
    let reviewData = data != {} ? data : delete data;
    let reviewUrl = "";
    let method = "GET";
    let status = 200;
    return new Promise((resolve, reject) => {
      switch (query) {
        case `/review/create`:
          reviewUrl = `https://mycwc.org/wp-json/wc/v3/products/reviews?product_id=${reviewData.product_id}&review=${reviewData.review}&reviewer=${reviewData.reviewer}&reviewer_email=${reviewData.reviewer_email}&customer_id=${reviewData.customer_id}`;
          method = "POST";
          status = 201;
          break;
        case `/review/list`:
          reviewUrl = `http://mycwc.org/wp-json/wc/v3/products/reviews/`;
          break;
        case `/review/update`:
          reviewUrl = `http://mycwc.org/wp-json/wc/v3/products/reviews/7`;
          method = "PUT";
          break;
        case `/review/delete`:
          reviewUrl = `http://mycwc.org/wp-json/wc/v3/products/reviews/${reviewData.reviewId}`;
          console.log(reviewUrl);
          method = "DELETE";
          break;
      }
      let basicAuth =
        "Basic " +
        Buffer.from(
          process.env.MARKET_USERNAME + ":" + process.env.MARKET_PASSWORD
        ).toString("base64");

      try {
        let options = {
          url: reviewUrl,
          method: method,
          headers: {
            Authorization: basicAuth,
          },
        };
        request(options, (error, response, body) => {
          console.log(response.statusCode);
          if (!error && response.statusCode === status) {
            resolve(body);
          } else {
            console.log("Error2:" + error);
            reject({ message: body.message });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  couponById: async (couponCode) => {
    let status = 200;
    return new Promise((resolve, reject) => {
      let basicAuth =
        "Basic " +
        Buffer.from(
          process.env.MARKET_USERNAME + ":" + process.env.MARKET_PASSWORD
        ).toString("base64");

      try {
        let options = {
          url: `https://mycwc.org/wp-json/wc/v3/coupons/?code=${couponCode}`,
          method: "GET",
          headers: {
            Authorization: basicAuth,
          },
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === status) {
            resolve(body);
          } else {
            console.log("Error2:" + error);
            reject({ message: body.message });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  couponList: async (couponId) => {
    let status = 200;
    return new Promise((resolve, reject) => {
      let basicAuth =
        "Basic " +
        Buffer.from(
          process.env.MARKET_USERNAME + ":" + process.env.MARKET_PASSWORD
        ).toString("base64");

      try {
        let options = {
          url: `https://mycwc.org/wp-json/wc/v3/coupons/`,
          method: "GET",
          headers: {
            Authorization: basicAuth,
          },
        };
        request(options, (error, response, body) => {
          if (!error && response.statusCode === status) {
            resolve(body);
          } else {
            console.log("Error2:" + error);
            reject({ message: body.message });
          }
        });
      } catch (e) {
        reject(e.toString());
      }
    });
  },

  registrantsEventCancelMail: async (eventName, eventUsers) => {
    return new Promise((resolve, reject) => {
      let transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      async.each(eventUsers, function (eventUsers) {
        if (eventUsers) {
          const mailoptions = {
            from: process.env.MAIL_FROM, // sender address
            to: eventUsers, // list of receivers
            subject: "Event Cancelled", // Subject line
            html: `Sorry! The Event: ${eventName} has been cancelled.<br>
                                                  Stay Happy and Keep Well,<br>
                                                    CWC Team`, // html body
          };

          transporter.sendMail(mailoptions);
        } else {
          reject(err);
        }
      });
      resolve("");
    });
  },
};
