const { v4: uuidv4 } = require("uuid");

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");
const Voucher = require("../../model/Voucher");
const packageHelper = require("../../helpers/packageHelper");
const voucherHelper = require("../../helpers/voucherHelper");

const { voucherSchema, updateVoucherSchema } = require("../../validator/validationSchema");

module.exports = {
  create: async (req, res, next) => {
    const data = req.body;
    data.uuid = uuidv4();
    data.expiryDate = new Date(data.expiryDate);
    data.coverImage = req.file ? req.file.path : "public/assets/images/palceholder.jpg";

    let status = 400;

    await voucherSchema
      .validateAsync(data)
      .then(() => {
        packageHelper
          .getPackageByUuid(data.membershipPackage)
          .then(() => {
            const voucher = new Voucher(data);

            voucher
              .save()
              .then((voucherData) => {
                status = 200;
                message = "Success! Voucher created successfully.";

                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, voucherData));
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
              .json(apiSuccessResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
      });
  },

  view: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    await voucherHelper
      .getVoucherByUuid(uuid)
      .then((voucher) => {
        status = 200;
        message = "Success! Details of voucher " + voucher.name + ":-";
        res.status(status).json(apiSuccessResponse(status, message, voucher));
      })
      .catch((err) => {
        message = "Error!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
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
        message = "No vouchers found!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, []));
      });
  },

  update: async (req, res, next) => {
    const data = req.body;

    for (const key in data) {
      if (data[key] == "") {
        delete data[key];
      }
    }
    if (req.file) {
      data.coverImage = req.file.path;
    }

    if (data.expiryDate) {
      data.expiryDate = new Date(data.expiryDate);
    }

    let status = 400;

    await updateVoucherSchema
      .validateAsync(data)
      .then(() => {
        query = {
          uuid: data.uuid,
        };

        delete data.uuid;
        delete data._id;

        set = data;

        option = {
          new: true,
        };

        Voucher.findOneAndUpdate(query, set, option)
          .orFail()
          .select("-_id")
          .then((result) => {
            status = 200;
            message = "Success! Voucher updated succesfully :-";
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

  delete: async (req, res, next) => {
    const { uuid } = req.body;

    await Voucher.deleteOne({ uuid: uuid })
      .then((result) => {
        status = 200;
        message = "Success! Voucher successfully deleted.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },
};
