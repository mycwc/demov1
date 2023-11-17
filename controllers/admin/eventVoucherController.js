const { v4: uuidv4 } = require("uuid");
const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");
const Event = require("../../model/Event");
const EventVoucher = require("../../model/EventVoucher");
const { eventVoucherSchema } = require("../../validator/validationSchema");

module.exports = {
  Create: async (req, res, next) => {
    let data = req.body;
    let status = 400;
    let message = "Error!";

    await eventVoucherSchema
      .validateAsync(data)
      .then(() => {
        Event.findOne({ uuid: data.eventUuid })
          .orFail()
          .then((eventData) => {
            if (data.discountAmount > 100) {
              status = 400;
              message =
                "Discount can't be greater then 100%";
              res
                .status(status)
                .json(apiSuccessResponse(status, message, err.message));
            }
            // }
            data.uuid = uuidv4();
            console.log(data.name);
            EventVoucher.findOne({ eventUuid: data.eventUuid, name: data.name }).then((voucher) => {
              if (voucher) {
                status = 400;
                message =
                  "Coupon with same name already exists.";
                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, []));
              }
            });
            const eventVoucher = new EventVoucher(data);
            eventVoucher
              .save()
              .then((result) => {
                status = 200;
                message = "Success! Event Voucher is created successfully. :-";

                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, result));
              })
              .catch((err) => {
                message = "An error occurred while creating voucher. Please try again";
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
        message = "Validation Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  Update: async (req, res, next) => {
    let data = req.body;
    let status = 400;
    let message = "Error!";

    let query = {
      uuid: data.uuid,
    };

    delete data.uuid;
    delete data._id;

    let set = data;

    let option = {
      new: true,
    };

    EventVoucher.findOneAndUpdate(query, set, option)
      .orFail()
      .then((result) => {
        status = 200;
        message = "Success! Coupon updated successfully :-";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  List: async (req, res, next) => {
    let status = 200;
    let message = "Error! Not Found";

    EventVoucher.find()
      .orFail()
      .then((result) => {
        message = "Success! List of Coupons :-";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },
};
