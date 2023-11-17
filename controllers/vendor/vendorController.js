const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const authHelper = require("../../helpers/authHelper");
const auth = require("../../helpers/authHelper");
const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");
const Vendor = require("../../model/Vendor");
const { vendorRequestEmail, vendorRequestEmailToUser } = require("../../functions/functions");
const { vendorSchema } = require("../../validator/validationSchema");

module.exports = {
  create: async (req, res, next) => {
    let data = req.body;
    let status = 400;
    let message = "Error!";
    data.uuid = uuidv4();

    await vendorSchema
      .validateAsync(data)
      .then(() => {
        const vendor = new Vendor(data);

        vendor
          .save()
          .then((result) => {
            vendorRequestEmail(result);
            vendorRequestEmailToUser(result)
              .then(() => {
                status = 200;
                message = "Success! Vendor created successfully.";

                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, result));
              })
              .catch((err) => {
                message = "Email notification error!";
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
        message = "Error! Validation Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  view: async (req, res, next) => {
    let { uuid } = req.body;
    let status = 400;
    let message = "Error!";

    Vendor.findOne({ uuid: uuid })
      .orFail()
      .then((result) => {
        status = 200;
        message = "Success! Vendor details.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  list: async (req, res, next) => {
    let status = 200;
    let message = "Not Found!";

    Vendor.find()
      .sort({ updatedAt: -1 })
      .orFail()
      .then((result) => {
        message = "Success! List of Vendors.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },
};
