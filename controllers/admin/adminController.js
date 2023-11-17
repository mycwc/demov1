const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const authHelper = require("../../helpers/authHelper");
const auth = require("../../helpers/authHelper");
const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");
const adminHelper = require("../../helpers/adminHelper");
const Admin = require("../../model/Admin");
const Payment = require("../../model/Payment");

const {
  adminLoginSchema,
  adminUpdateProfileSchema,
} = require("../../validator/validationSchema");

module.exports = {
  login: async (req, res, next) => {
    let status = 400;

    await adminLoginSchema
      .validateAsync(req.body)
      .then(() => {
        if (req.user) {
          status = 200;
          message = "Success! Admin logged in.";
          data = {
            user: req.user,
            token: auth.generateToken(req.user.id),
          };
          res.status(status).json(apiSuccessResponse(status, message, data));
        } else {
          message = "Error! Admin not found.";
          res.status(status).json(apiErrorResponse(status, message, NULL));
        }
      })
      .catch((err) => {
        message = "Error! Validation Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  forgotPassword: async (req, res, next) => {
    const { email } = req.body;
    await adminHelper
      .getadminByemail(email)
      .then(() => {
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
          expiresIn: "60m",
        });

        const mailoptions = {
          from: process.env.MAIL_FROM, // sender address
          to: email, // list of receivers
          subject: "Account Activation Link", // Subject line
          html: `<a href=${process.env.ADMIN_CLIENT_URL}/reset/${token}>${process.env.ADMIN_CLIENT_URL}/reset</a>`, // html body
        };

        let status = 400;

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
        message = "Email not found. :-";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },
  resetPassword: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    if (!data.token) {
      message = "Error! Something wen't wrong.";
      res.json(apiSuccessResponse(status, message, null));
    } else {
      jwt.verify(
        data.token,
        process.env.JWT_SECRET_KEY,
        (err, decodedToken) => {
          if (err) {
            status = 400;
            message = "Error! Something wen't wrong.";
            res.json(apiSuccessResponse(status, message, err));
          } else {
            const { email } = decodedToken;

            adminHelper
              .getadminByemail(email)
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
                Admin.updateOne(
                  { email: admin.email },
                  { $set: { password: hashedPassword } }
                )
                  .then((admin) => {
                    status = 200;
                    message =
                      "Success! Your new password has been updated succesfully.";
                    res.json(apiSuccessResponse(status, message, admin));
                  })
                  .catch((err) => {
                    status = 400;
                    message = "Error!";
                    res
                      .status(status)
                      .json(apiErrorResponse(status, message, err.message));
                  });
              })
              .catch((err) => {
                status = 400;
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

  // createProfile: async (req, res, next) => {
  //   const data = req.body;
  //   const user = req.user;

  //   let status = 400;

  //   await userProfileSchema
  //     .validateAsync(data)
  //     .then(() => {
  //       query = {
  //         _id: user.id,
  //       };

  //       delete data.uuid;
  //       delete data._id;

  //       set = data;

  //       option = {
  //         new: true,
  //       };

  //       User.findOneAndUpdate(query, set, option)
  //         .orFail()
  //         .then(() => {
  //           status = 200;
  //           message = "Success! User Profile updated successfully.";
  //           url = "http://localhost:3000/user/package/select";
  //           res.json(apiSuccessResponse(status, message, url));
  //         })
  //         .catch((err) => {
  //           status = 400;
  //           message = "Error!";
  //           res.json(apiErrorResponse(status, message, err.message));
  //         });
  //     })
  //     .catch((err) => {
  //       message = "Error! Validation Error!";
  //       res.json(apiErrorResponse(status, message, err.message));
  //     });
  // },

  viewProfile: async (req, res, next) => {
    const user = req.user;
    let status = 404;

    Admin.findOne({ uuid: user.uuid })
      .orFail()
      .select("uuid name phone countryCode phone email")
      .then((user) => {
        status = 200;
        message = "Success! Details of admin :-.";
        res.json(apiSuccessResponse(status, message, user));
      })
      .catch((err) => {
        message = "Error! Not Found";
        res.json(apiErrorResponse(status, message, err.message));
      });
  },

  updateProfile: async (req, res, next) => {
    const data = req.body;
    const admin = req.user;

    let status = 400;

    await adminUpdateProfileSchema
      .validateAsync(data)
      .then(() => {
        data.newPassword == "" || data.confirmPassword == ""
          ? delete data.password
          : (data.password = authHelper.setPassword(data.newPassword));
        query = {
          uuid: admin.uuid,
        };

        delete data.uuid;
        delete data._id;

        set = data;

        option = {
          new: true,
        };

        Admin.findOneAndUpdate(query, set, option)
          .orFail()
          .select("-_id -password")
          .then((result) => {
            status = 200;
            message = "Success! Admin Profile updated successfully :-";
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
  listPayment: async (req, res, next) => {
    let userUuid = req.query.uuid;
    let status = 200;
    Payment.find({ userUuid: userUuid })
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

  listAllPayment: async (req, res, next) => {
    let status = 200;
    Payment.find().sort({ created_at: 1 })
      .populate("Event", "-_id").populate('User', '-_id name')
      .then((result) => {
        message = "Success! List of All Payment :-";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Not Found";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },
};
