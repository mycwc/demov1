const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../helpers/responseHelper");
const voucherHelper = require("../helpers/voucherHelper");
const EventVoucher = require("../model/EventVoucher");
const Event = require("../model/Event");

// const { voucherSchema, updateVoucherSchema } = require("../../validator/validationSchema");

module.exports = {
  apply: async (req, res, next) => {
    let user = req.user;
    let data = req.body;
    let status = 400;
    let message = "Error!";

    await EventVoucher.findOne({
      $and: [
        { name: data.voucherCode },
        { eventUuid: data.eventUuid },
        { membershipUuid: user.package.uuid },
        { status: true }
      ],
    })
      .orFail()
      .then((voucherData) => {
        EventVoucher.findOne({
          uuid: voucherData.uuid,
          expiryDate: { $gte: new Date() },
        })
          .orFail()
          .then(() => {
            Event.findOne({ uuid: voucherData.eventUuid })
              .orFail()
              .then((eventData) => {
                let resultData = {
                  discountedAmount: ((eventData.price * voucherData.discountAmount) / 100),
                  totalAmount:
                    eventData.price - ((eventData.price * voucherData.discountAmount) / 100),
                  eventDetails: eventData,
                };
                status = 200;
                message = "Success! Coupon Applied Successfully.";
                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, resultData));
              })
              .catch((err) => {
                message = "Invalid Coupon Code.";
                res
                  .status(status)
                  .json(apiErrorResponse(status, message, err.message));
              });
          })
          .catch((err) => {
            message = "Coupon Code Expired.";
            res
              .status(status)
              .json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Invalid Coupon Code.";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  list: async (req, res, next) => {
    let status = 200;

    await voucherHelper
      .getVouchers()
      .then((result) => {
        message = "Success! List of all vouchers:-";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "No Vouchers Found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },
};
