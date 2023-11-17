const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const authHelper = require("../helpers/authHelper");
const userHelper = require("../helpers/userHelper");
const packageHelper = require("../helpers/packageHelper");
const contentHelper = require("../helpers/contentHelper");
const { v4: uuidv4 } = require("uuid");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const bcrypt = require("bcrypt");
const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../helpers/responseHelper");
const User = require("../model/User");
const Payment = require("../model/Payment");
const ContentLibrary = require("../model/ContentLibrary");
const Countries = require("../model/Countries");
const stripe = require("stripe")("sk_test_51JFOxZEpHAy36lvU50hVM1LUTH3tBOZqUr11YsFqjtyUh60SYOLZfGSLKdcA3HKOxra7rkMEzBbAIprjp5WzDg2i00wsHIB7Vp");

const { createCustomer, marketQuery } = require("../functions/functions");
const {
  userEmailActivationSchema,
  userProfileSchema,
  updateUserProfileSchema,
  socialMediaLoginSchema,
} = require("../validator/validationSchema");
const Package = require("../model/Package");
const { config } = require("dotenv");

module.exports = {
  create: async (req, res, next) => {
    const { email, password } = req.body;
    let status = 400;

    await userEmailActivationSchema
      .validateAsync(req.body)
      .then(() => {
        User.findOne({ email: email })
          .then((user) => {
            if (user == null) {
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

              const token = jwt.sign(
                { email, password },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "60m" }
              );

              const mailoptions = {
                from: process.env.MAIL_FROM, // sender address
                to: email, // list of receivers
                subject: "Account Activation Link", // Subject line
                html: `<h2>WELCOME to CWC</h2>
    <br><h3>Personalise your wellbeing with our offerings, resources and experts.</h3>
    <h3>Here is the link to verify your account:</h3>
    <a href=${process.env.USER_CLIENT_URL}/verify/email/${token}>${process.env.USER_CLIENT_URL}/verify/email</a>
    <h3>Stay Happy & Keep Well!</h3><br>
    <h2>CWC Team</h2>`, // html body
              };

              transporter.sendMail(mailoptions, (error, info) => {
                if (error) {
                  message = "Oops! Something wen't wrong! Please try again later.";
                  res
                    .status(status)
                    .json(apiErrorResponse(status, message, error));
                }
                status = 200;
                message =
                  "Success! A verification link has been sent to your email.:-";
                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, info));
              });
            } else {
              status = 400;
              message = "An account with this email already exist!";
              res.status(status).json(apiSuccessResponse(status, message, []));
            }
          })
          .catch((err) => {
            message = "Error!";
            res
              .status(status)
              .json(apiSuccessResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error! Validation Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  login: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    userHelper
      .getuserByemail(data.email)
      .then((user) => {
        bcrypt.compare(data.password, user.password, function (err, result) {
          if (err) {
            message = "Error! Incorrect credentials. Please try again.";

            res
              .status(status)
              .json(apiErrorResponse(status, message, err.message));
          } else {
            if (result) {
              if (user.name == null) {
                status = 200;
                message =
                  "Error! You have not completed your registration details.";
                redirect = {
                  url: `${process.env.USER_CLIENT_URL}/profile/update`,
                  token: authHelper.generateToken(user.id),
                  data: user,
                };
                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, redirect));
              } else if (user.package.uuid == "") {
                User.findOne({ uuid: user.uuid })
                  .select("-_id -password")
                  .then((result) => {
                    status = 200;
                    message = "Error! You have not selected any package.";
                    redirect = {
                      user: result,
                      url: `${process.env.USER_CLIENT_URL}/package/select`,
                      token: authHelper.generateToken(user.id),
                    };

                    res
                      .status(status)
                      .json(apiSuccessResponse(status, message, redirect));
                  });
              } else {
                const actualDate = user.package.expiry;

                if (new Date() >= actualDate) {
                  packageHelper
                    .getPackageByName("Starter")
                    .then((packageData) => {
                      User.updateOne(
                        { uuid: user.uuid },
                        {
                          $set: {
                            package: {
                              uuid: packageData.uuid,
                              name: packageData.name,
                              status:
                                packageData.isActive == true
                                  ? "active"
                                  : "inactive",
                              type: "",
                              date: new Date(),
                              cost: 0,
                              expiry: "",
                            },
                          },
                        }
                      )
                        .then((admin) => {
                          status = 200;
                          message =
                            "Error! The subscription has expired, so for the time being we have allotted you the free subscription package. And You are successfully logged in.";
                          let data = {
                            token: authHelper.generateToken(user.id),
                            user: user,
                          };
                          res
                            .status(status)
                            .json(apiSuccessResponse(status, message, data));
                        })
                        .catch((err) => {
                          message = "Error!";
                          res
                            .status(status)
                            .json(
                              apiErrorResponse(status, message, err.message)
                            );
                        });
                    })
                    .catch((err) => {
                      message = "Error!";
                      res
                        .status(status)
                        .json(apiErrorResponse(status, message, err.message));
                    });
                } else {
                  status = 200;
                  message = "Success! You are successfully logged in.";

                  const result = {
                    user: user,
                    token: authHelper.generateToken(user.id),
                  };
                  res
                    .status(status)
                    .json(apiSuccessResponse(status, message, result));
                }
              }
            } else {
              message = "Error! Password is invalid.";
              res.status(status).json(apiErrorResponse(status, message, null));
            }
          }
        });
      })
      .catch((err) => {
        message = "You haven't registered yet.";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  forgotPassword: async (req, res, next) => {
    const { email } = req.body;

    let status = 400;
    let message = "Error!";

    User.findOne({ email: email })
      .orFail()
      .then(async (user) => {
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
          subject: "Password Reset Link", // Subject line
          html: `   <h3>You can reset the password for CWC Khushi account with the help of the below mentioned link.</h3>
          <h3>Here is the link to reset password:</h3><a href=${process.env.USER_CLIENT_URL}/reset/${token}>${process.env.USER_CLIENT_URL}/reset</a><br>  
          <h3>In case, if you are unable to login, kindly let us know at info@mycwc.org</h3>`, // html body
        };

        transporter.sendMail(mailoptions, (error, info) => {
          if (error) {
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
      })
      .catch((err) => {
        message = "Please create an account first.";
        const link = "http://13.58.122.224:3000/v1/user/create";
        res.status(status).json(apiErrorResponse(status, message, link));
      });
  },

  resetPassword: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    if (!data.token) {
      message = "Error! Something went wrong.";
      res.json(apiSuccessResponse(status, message, null));
    } else {
      jwt.verify(
        data.token,
        process.env.JWT_SECRET_KEY,
        (err, decodedToken) => {
          if (err) {
            status = 400;
            message = "Error! Something went wrong.";
            res.json(apiSuccessResponse(status, message, err));
          } else {
            const { email } = decodedToken;
            userHelper
              .getuserByemail(email)
              .then((admin) => {
                if (!(data.newPassword == data.confirmPassword)) {
                  status = 400;
                  message = "Error! Password do not match!";
                  res
                    .status(status)
                    .json(apiErrorResponse(status, message, null));
                }
                const hashedPassword = authHelper.setPassword(
                  data.confirmPassword
                );
                User.updateOne(
                  { email: admin.email },
                  { $set: { password: hashedPassword } }
                )
                  .then((admin) => {
                    status = 200;
                    message =
                      "Success! Your password has been updated successfully.";
                    res.json(apiSuccessResponse(status, message, admin));
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
                res
                  .status(status)
                  .json(apiErrorResponse(status, message, err.message));
              });
          }
        }
      );
    }
  },

  socialMediaLogin: async (req, res, next) => {
    const data = req.user;
    const socialId = data.id;

    let status = 400;

    User.findOne({ googleId: data.id })
      .then((userData) => {
        if (userData == null) {
          data.uuid = uuidv4();
          data.name = data.displayName;
          data.email = data.emails[0].value;
          data.googleId = socialId;

          const user = new User(data);
          user
            .save()
            .then((user) => {
              status = 200;
              message = "Success! You are registered as a user!.";
              redirect = {
                url: `${process.env.USER_CLIENT_URL}/profile/create`,
                token: authHelper.generateToken(user.id),
              };
              res
                .status(status)
                .json(apiSuccessResponse(status, message, redirect));
            })
            .catch((err) => {
              res.send(err);
            });
        } else {
          if (userData.age == null) {
            message =
              "Error! You have not completed your registration details.";
            redirect = {
              url: `${process.env.USER_CLIENT_URL}/profile/create`,
              token: authHelper.generateToken(userData.id),
            };
            res
              .status(status)
              .json(apiErrorResponse(status, message, redirect));
          } else if (userData.packageUuid == null) {
            message = "Error! You have not selected any package.";
            redirect = {
              url: `${process.env.USER_CLIENT_URL}/package/select`,
              token: authHelper.generateToken(userData.id),
            };
            res
              .status(status)
              .json(apiErrorResponse(status, message, redirect));
          } else {
            status = 200;
            message = "Success! You are successfully logged in.";
            Token = {
              token: authHelper.generateToken(userData.id),
            };
            res.status(status).json(apiSuccessResponse(status, message, Token));
          }
        }
      })
      .catch((err) => {
        message = "Success! You are successfully logged in.";

        res.status(status).json(apiErrorResponse(status, message, err));
      });
  },

  socialMediaLogout: async (req, res, next) => {
    req.logout();
    console.log(req.isAuthenticated());
    res.redirect("https://accounts.google.com/logout");
  },

  verifyEmail: async (req, res, next) => {
    const { token } = req.body;

    let status = 400;

    if (!token) {
      status = 400;
      message = "Error! Token not received.";
      res.json(apiSuccessResponse(status, message, null));
    } else {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
        if (err) {
          status = 400;
          message = "Error! Something went wrong.";
          res.json(apiErrorResponse(status, message, err));
        } else {
          const { email, password } = decodedToken;
          const hashedPassword = authHelper.setPassword(password);

          let userData = {
            uuid: uuidv4(),
            email: email,
            password: hashedPassword,
          };

          const user = new User(userData);
          user
            .save()
            .then((user) => {
              status = 200;
              message = "Success! User created successfully!";
              response = {
                message: "Success! User created successfully!",
                url: `${process.env.USER_CLIENT_URL}/profile/update`,
                token: authHelper.generateToken(user.id),
              };
              res.json(apiSuccessResponse(status, message, response));
            })
            .catch((err) => {
              status = 400;
              message = "Error! Unable to create user";
              res.json(apiErrorResponse(status, message, err.message));
            });
        }
      });
    }
  },

  socialLogin: async (req, res, next) => {
    const data = req.body;
    let status = 400;
    let userQuery = {};
    let socialQuery = {};
    let set = {};
    let option = {};
    let message = "";

    // use validation for provider & id

    switch (data.provider) {
      case "facebook":
        socialQuery = { facebookId: data.id };
        break;

      case "google":
        socialQuery = { googleId: data.id };
        break;

      case "apple.com":
        socialQuery = { appleId: data.id };
        break;

      default:
        socialQuery = {};
        socialType = null;
    }

    socialMediaLoginSchema
      .validateAsync(data)
      .then(() => {
        // check if user exists with email
        if (data.email) {
          userHelper
            .getuserByemail(data.email)
            .then((existingUser) => {
              if (existingUser) {
                // check if user already logged in via same social media

                User.findOne(socialQuery)
                  .then((socialData) => {
                    message = "You are successfully logged in";
                    status = 200;
                    if (socialData) {
                      response = {
                        userData: existingUser,
                        token: authHelper.generateToken(existingUser.id),
                      };
                      res.json(apiSuccessResponse(status, message, response));
                    } else {
                      userQuery = { email: existingUser.email };
                      set = socialQuery;
                      option = {
                        new: true,
                      };
                      userUpdate();
                    }
                  })
                  .catch((err) => {
                    message = "Error! Something went wrong";
                    res.json(apiErrorResponse(status, message, err.message));
                  });
              } else {
                User.findOne(socialQuery)
                  .then((socialData) => {
                    if (socialData) {
                      message =
                        "Error! Invalid user information. Please try again later!";
                      res.json(apiErrorResponse(status, message, ""));
                    } else {
                      message = "You are registered successfully";
                      status = 200;
                      socialQuery.uuid = uuidv4();
                      socialQuery.email = data.email;
                      socialQuery.name = data.name ?? "";
                      socialQuery.image = data.image ?? "";

                      set = socialQuery;
                      userQuery = { _id: { $exists: false } };
                      option = {
                        new: true,
                        upsert: true,
                      };
                      userUpdate();
                    }
                  })
                  .catch((err) => {
                    message = "Error! Something went wrong";
                    res.json(apiErrorResponse(status, message, err.message));
                  });
              }
            })
            .catch((err) => {
              message = "Error! Something went wrong";
              res.json(apiErrorResponse(status, message, err.message));
            });
        } else {
          User.findOne(socialQuery)
            .then((socialData) => {
              // if (existingUser === null && socialData === null) {
              // } else if (existingUser != null && socialData == null) {
              // } else if (existingUser != null && socialData != null) {
              // }

              if (socialData != null) {
                if (socialData.email != null) {
                  status = 200;
                  message = "You are successfully logged in";
                  response = {
                    userData: socialData,
                    token: authHelper.generateToken(socialData.id),
                  };
                  res.json(apiSuccessResponse(status, message, response));
                } else {
                  message =
                    "Error! Invalid user information. Please try again later!";
                  res.json(apiErrorResponse(status, message, ""));
                }
              } else {
                message =
                  "Error! Invalid user information. Please try again later!";
                res.json(apiErrorResponse(status, message, ""));
              }
            })
            .catch((err) => {
              message = "Error! Something went wrong";
              res.json(apiErrorResponse(status, message, err.message));
            });
        }

        function userUpdate() {
          User.findOneAndUpdate(userQuery, set, option)
            .then((result) => {
              status = 200;
              response = {
                userData: result,
                token: authHelper.generateToken(result.id), // Generating Token
              };
              res.json(apiSuccessResponse(status, message, response));
            })
            .catch((err) => {
              message = "Error! Something went wrong";
              res.json(apiErrorResponse(status, message, err.message));
            });
        }
      })
      .catch((err) => {
        message = "Error! Validation Error!";
        res.json(apiErrorResponse(status, message, err.message));
      });
  },

  createProfile: async (req, res, next) => {
    const data = req.body;
    const user = req.user;

    let status = 400;

    await userProfileSchema
      .validateAsync(data)
      .then(() => {
        query = {
          _id: user.id,
        };

        delete data.uuid;
        delete data._id;

        set = data;

        option = {
          new: true,
        };

        User.findOneAndUpdate(query, set, option)
          .select("-password")
          .orFail()
          .then((user) => {
            status = 200;
            message = "Success! User Profile updated successfully.";
            url = `${process.env.USER_CLIENT_URL}/package/select`;
            result = {
              url: url,
              result: user,
            };
            res.json(apiSuccessResponse(status, message, result));
          })
          .catch((err) => {
            status = 400;
            message = "Error!";
            res.json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error! Validation Error!";
        res.json(apiErrorResponse(status, message, err.message));
      });
  },

  viewProfile: async (req, res, next) => {
    const user = req.user;
    let status = 404;
    console.log(user);
    User.findOne({ uuid: user.uuid })
      .populate("Package", "-_id")
      .orFail()
      .select("-_id -password -googleId -facebookId -LinkedInnId")
      .then((user) => {
        Package.findOne({ uuid: user.package.uuid })
          .select("image")
          .then((package) => {
            user.package.image = package.image;
            status = 200;
            message = "Success! Details of user :-.";
            res.json(apiSuccessResponse(status, message, user));
          })
          .catch((err) => {
            message = "Error! Not Found";
            res.json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error! Not Found";
        res.json(apiErrorResponse(status, message, err.message));
      });
  },

  updateUserProfile: async (req, res, next) => {
    const data = req.body;
    const user = req.user;

    let status = 400;

    if (req.file) {
      data.coverImage = req.file.path;
    }

    await updateUserProfileSchema
      .validateAsync(data)
      .then(async () => {
        if (
          user.zipCode == null &&
          user.city == null &&
          (user.password == "" || user.password == null)
        ) {
          if (data.password != "" || data.password) {
            if (data.password == data.confirmPassword) {
              data.password = authHelper.setPassword(data.password);
            } else {
              status = 200;
              message = "Password and Confirm Password doesn't match.";
              return res
                .status(status)
                .json(apiErrorResponse(status, message, null));
            }
          }
        } else {
          delete data.password;
          delete data.confirmPassword;
        }

        query = {
          uuid: user.uuid,
        };

        delete data.uuid;
        delete data._id;

        option = {
          new: true,
        };

        if (!user.wooCustomerId) {
          // check if customers exist on WooCommerce
          let wooCustomerId = await marketQuery(
            "customers/?email=" + user.email
          )
            .then((result) => {
              console.log("Customer found on woo");
              return result[0].id;
            })
            .catch((err) => {
              return null;
            });

          if (!wooCustomerId) {
            // create woocommerce customer
            const userName = data.name ? data.name.split(" ") : ["", ""];
            const customerData = {
              email: user.email,
              first_name: userName[0],
              last_name: userName[1],
              password: user.password ?? data.password,
            };

            wooCustomerId = await createCustomer(customerData)
              .then((result) => {
                console.log("Customer created on woo");
                return result.id;
              })
              .catch((err) => {
                return null;
              });
          }
          // set woocommerce customer Id
          data.wooCustomerId = wooCustomerId;
        }

        set = data;

        User.findOneAndUpdate(query, set, option)
          .orFail()
          .select("-_id -password -appleId -facebookId -googleId")
          .then((result) => {
            status = 200;
            message = "Success! User Profile updated successfully.";
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
        res.json(apiErrorResponse(status, message, err.message));
      });
  },

  changePassword: async (req, res, next) => {
    const user = req.user;
    const data = req.body;
    let status = 400;

    userHelper
      .getuserByemail(user.email)
      .then((user) => {
        bcrypt.compare(data.oldPassword, user.password, (err, result) => {
          if (err) {
            message = "Error! Something went wrong!";
            res.json(apiErrorResponse(status, message, err.message));
          } else {
            if (!(data.newPassword == data.confirmPassword)) {
              message =
                "Error! The new Password does not match the Confirm Password!";
              res.json(apiErrorResponse(status, message, ""));
            } else {
              if (!result) {
                message = "Error! The Old Password is invalid!";
                res.json(apiErrorResponse(status, message, ""));
              } else {
                query = {
                  uuid: user.uuid,
                };

                delete data.uuid;
                delete data._id;

                set = {
                  password: authHelper.setPassword(data.newPassword),
                };

                option = {
                  new: true,
                };

                User.findOneAndUpdate(query, set, option)
                  .orFail()
                  .select("-_id -uuid")
                  .then((result) => {
                    status = 200;
                    message = "Success! Password updated successfully :-";
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
              }
            }
          }
        });
      })
      .catch((err) => {
        message = "Error! Invalid User!";
        res.json(apiErrorResponse(status, message, err.message));
      });
  },

  selectPackage: async (req, res, next) => {
    const { packageUuid, subscriptionType } = req.body;
    const user = req.user;
    let currentDate = new Date();

    let status = 400;

    await packageHelper
      .getPackageByUuid(packageUuid)
      .then((package) => {
        let data = {};
        if (subscriptionType == "monthly") {
          const expiry_date = new Date(
            currentDate.setDate(currentDate.getDate() + 30)
          );

          data.package = {
            uuid: package.uuid,
            name: package.name,
            status: package.isActive == true ? "active" : "inactive",
            type: "monthly",
            date: new Date(),
            cost: package.monthlyCost,
            expiry: expiry_date,
            eventDiscount: package.eventDiscount ? package.eventDiscount : 0,
          };
        } else {
          const expiry_date = new Date(
            currentDate.setDate(currentDate.getDate() + 365)
          );

          data.package = {
            uuid: package.uuid,
            name: package.name,
            status: package.isActive == true ? "active" : "inactive",
            type: "yearly",
            date: new Date(),
            cost: package.annualCost,
            expiry: expiry_date,
            eventDiscount: package.eventDiscount ? package.eventDiscount : 0,
          };
        }
        User.findOneAndUpdate(
          { _id: user.id },
          {
            package: data.package,
          },
          {
            new: true,
          }
        )
          .then((result) => {
            // const email = user.email;
            // const subject = "Subscription Upgraded";
            // const notificationMessage = `<p>Hello ${user.name},<br>

            // Thank you for becoming a member of CWC ${package.name}.<br>
            // Below are the subscription details:<br>
            // Duration:<br>
            // Start Date: ${dayjs(result.package.date).format('DD/MM/YYYY')}<br>
            // End Date: ${dayjs(result.package.expiry).format('DD/MM/YYYY')}<br><br>

            // Enjoy full access to the subscription and add on features.<br>
            // For any queries, Reach out to us at http://info@mycwc.org<br>
            // Thank you for choosing us.<br><br>

            // Stay Happy and Keep Well,<br>
            // CWC Team
            // </p>`;
            // userHelper
            //   .emailNotifications(email, subject, notificationMessage)
            //   .then(() => {
            status = 200;
            message = "Success! Package selected successfully.";
            res.json(apiSuccessResponse(status, message, result));
            // }).catch((err) => {
            //   message = "Error!";
            //   res.json(apiErrorResponse(status, message, err.message));
            // })
          })
          .catch((err) => {
            message = "Error!";
            res.json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error!";
        res.json(apiErrorResponse(status, message, err.message));
      });
  },

  cancelPackage: async (req, res, next) => {
    const user = req.user;

    let status = 400;

    await User.updateOne(
      { _id: user.id },
      {
        $set: {
          packageName: "free",
          subscriptionDate: new Date(),
          subscriptionType: null,
        },
      }
    )
      .then((package) => {
        status = 200;
        message = "Success! Package cancelled successfully.";
        res.json(apiSuccessResponse(status, message, package));
      })
      .catch((err) => {
        message = "Error!";
        res.json(apiErrorResponse(status, message, err.message));
      });
  },

  updatePackage: async (req, res, next) => {
    const { packageUuid, subscriptionType } = req.body;
    const user = req.user;
    let currentDate = new Date();

    let status = 400;

    await packageHelper
      .getPackageByUuid(packageUuid)
      .then((package) => {
        let data = {};
        if (subscriptionType == "monthly") {
          const expiry_date = new Date(
            currentDate.setDate(currentDate.getDate() + 30)
          );

          data.package = {
            uuid: package.uuid,
            name: package.name,
            status: package.isActive == true ? "active" : "inactive",
            type: "monthly",
            date: new Date(),
            cost: package.monthlyCost,
            expiry: expiry_date,
            eventDiscount: package.eventDiscount ? package.eventDiscount : 0,
          };
        } else {
          const expiry_date = new Date(
            currentDate.setDate(currentDate.getDate() + 365)
          );

          data.package = {
            uuid: package.uuid,
            name: package.name,
            status: package.isActive == true ? "active" : "inactive",
            type: "yearly",
            date: new Date(),
            cost: package.annualCost,
            expiry: expiry_date,
            eventDiscount: package.eventDiscount ? package.eventDiscount : 0,
          };
        }
        query = {
          uuid: user.uuid,
        };

        set = {
          package: data.package,
        };

        option = {
          new: true,
        };
        User.findOneAndUpdate(query, set, option)
          .then((user) => {
            status = 200;
            message = "Success! Package upgraded successfully.";
            res.json(apiSuccessResponse(status, message, user));
          })
          .catch((err) => {
            message = "Error!";
            res.json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error!";
        res.json(apiErrorResponse(status, message, err.message));
      });
  },

  viewPackage: async (req, res, next) => {
    const { uuid } = req.body;
    let status = 400;
    await packageHelper
      .getPackageByUuid(uuid)
      .then((package) => {
        status = 200;
        message = "Success! Details of package " + package.name + ":-";
        res.status(status).json(apiSuccessResponse(status, message, package));
      })
      .catch((err) => {
        message = "Error!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
      });
  },

  listPackage: async (req, res, next) => {
    let status = 200;
    await packageHelper
      .getListOfPackages()
      .then((packages) => {
        message = "Success! List of packages :-";
        res.status(status).json(apiSuccessResponse(status, message, packages));
      })
      .catch((err) => {
        message = "No Packages found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  payment: async (req, res, next) => {
    let status = 400;
    console.log(req.body)
    // await userHelper
    //   .getuserByemail(req.body.stripeEmail)
    //   .then((user) => {
    //     stripe.customers
    //       .create({
    //         email: req.body.stripeEmail,
    //         source: req.body.stripeToken,
    //         name: user.name,
    //         address: {
    //           line1: "TC 9/4 Old MES colony",
    //           postal_code: "110092",
    //           city: "New Delhi",
    //           state: "Delhi",
    //           country: "India",
    //         },
    //       })
    //       .then((customer) => {
    //         return stripe.charges.create({
    //           amount: 7000,
    //           description: "CWC Project",
    //           currency: "INR",
    //           customer: customer.id,
    //         });
    //       })
    //       .then((charge) => {
    //         const data = {
    //           transactionId: charge.id,
    //           status: charge.status,
    //           userUuid: user.uuid,
    //           transactionDate: new Date(charge.created * 1000),
    //           amount: charge.amount,
    //         };
    //         const payment = new Payment(data);

    //         payment
    //           .save()
    //           .then((result) => {
    //             console.log(result);
    //           })
    //           .catch((err) => {
    //             console.log(err);
    //           });

    //         res.send("Success");
    //       })
    //       .catch((err) => {
    //         console.log(err);
    //         res.send(err);
    //       });
    //   })
    //   .catch((err) => {
    //     status = 200;
    //     message = "Error!";
    //     res.status(status).json(apiErrorResponse(status, message, err.message));
    //   });
  },

  listPayment: async (req, res, next) => {
    let user = req.user;
    let status = 200;
    let message = "Error!";

    Payment.find({ userUuid: user.uuid })
      .populate("Event", "-_id")
      .then((result) => {
        message = "Success! List of Payment :-";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Not Found";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  subscriptionPayment: async (req, res, next) => {
    let status = 400;
    let message = "Error!";

    await userHelper
      .getuserByemail(req.body.stripeEmail)
      .then((user) => {
        stripeHelper
          .stripeGetCustomer(user.uuid)
          .then((customer) => {
            stripeHelper.stripeSubscriptionCreate(customer, user);
          })
          .catch((err) => {
            stripeHelper
              .stripeAddCustomer(req.body.stripeEmail)
              .then((customer) => {
                stripeHelper.stripeSubscriptionCreate(customer, user);
              })
              .catch((err) => {
                res
                  .status(status)
                  .json(apiErrorResponse(status, message, err.message));
              });
          });
      })
      .catch((err) => {
        status = 400;
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listVideos: async (req, res, next) => {
    let status = 200;
    if (myCache.has('allVideos')) {
      contents = myCache.get('allVideos');
      message = "Success! List of Medias :-";
      res.status(status).json(apiSuccessResponse(status, message, contents));
    } else {
      ContentLibrary.find({
        type: "video",
        isActive: true,
      })
        .populate("packages", "-_id")
        .orFail()
        .then((contents) => {
          data = myCache.set('allVideos', contents);
          message = "Success! List of Medias :-";
          res.status(status).json(apiSuccessResponse(status, message, contents));
        })
        .catch((err) => {
          message = "No Media Found!";
          res.status(status).json(apiSuccessResponse(status, message, []));
        });
    }
  },

  searchContent: async (req, res, next) => {
    const data = req.body;

    let status = 200;
    let query = {};

    query = ContentLibrary.find({
      $and: [{ category: { $in: data.category } }, { type: data.type }],
    })
      .populate("packages", "-_id")
      .sort({ uploadDate: 1 });


    query
      .orFail()
      .then((content) => {
        message = "Details of " + data.category + "category videos :-";

        res.status(status).json(apiSuccessResponse(status, message, content));
      })
      .catch((err) => {
        message = "Data not found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listPodcasts: async (req, res, next) => {
    // const data = req.user;
    let status = 200;
    // let packages = [];

    // Package.find({ annualCost: { $lte: data.package.cost } })
    //   .orFail()
    //   .then((result) => {
    //     result.forEach((item) => {
    //       packages.push(item.uuid);
    //     });
    ContentLibrary.find({
      type: "audio",
      // membershipType: { $in: packages },
      isActive: true,
    })
      .populate("packages", "-_id")
      .orFail()
      .then((contents) => {
        message = "Success! List of Podcasts :-";
        res.status(status).json(apiSuccessResponse(status, message, contents));
      })
      .catch((err) => {
        message = "No Podcast Found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
    // })
    // .catch((err) => {
    //   message = "No Packages Found!";
    //   res.status(status).json(apiSuccessResponse(status, message, []));
    // });
  },

  viewDocument: async (req, res, next) => {
    const data = req.body;
    let status = 200;

    await contentHelper
      .getContentByUuid(data.uuid)
      .then((result) => {
        message = "Success! Details of Content Libraries Document :-";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "No Documents found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listDocs: async (req, res, next) => {
    // const data = req.user;
    let status = 200;
    // const packages = [];

    // Package.find({ annualCost: { $lte: data.package.cost } })
    //   .orFail()
    //   .then((result) => {
    //     result.forEach((item) => {
    //       packages.push(item.uuid);
    //     });
    ContentLibrary.find({
      type: { $in: ["pdf", "image"] },
      // membershipType: { $in: packages },
      isActive: true,
    })
      .populate("packages", "-_id")
      .orFail()
      .then((contents) => {
        message = "Success! List of Documents :-";
        res.status(status).json(apiSuccessResponse(status, message, contents));
      })
      .catch((err) => {
        message = "No Docs Found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
    // })
    // .catch((err) => {
    //   message = "No Packages Found!";
    //   res.status(status).json(apiSuccessResponse(status, message, []));
    // });
  },

  filteredVideoList: async (req, res, next) => {
    let status = 400;
    let data = req.body;

    await contentHelper.getFilteredContent(data.text)
      .then((contents) => {
        status = 200;
        message = "Success! List of Medias :-";
        res.status(status).json(apiSuccessResponse(status, message, contents));
      })
      .catch((err) => {
        status = 404;
        message = "No Media Found!";
        res.status(status).json(apiSuccessResponse(status, message, err.message));
      });
  },

  countryList: (req, res, next) => {
    let status = 200;

    Countries.find()
      .then((result) => {
        message = "Success! List of Country Codes :-";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "No Country Codes found";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },
};
