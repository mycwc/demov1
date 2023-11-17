const { v4: uuidv4 } = require("uuid");
const BusinessPartner = require("../model/BusinessPartner");
const BusinessPartnerRequest = require("../model/BusinessPartnerRequest");
const {
  businessPartnerRequestSchema,
} = require("../validator/validationSchema");
const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../helpers/responseHelper");

module.exports = {
  partnerRequest: async (req, res, next) => {
    let data = req.body;
    let status = 400;
    let message = "Error!";

    if (req.file) {
      data.logo = req.file.path;
    }

    await businessPartnerRequestSchema
      .validateAsync(data)
      .then(() => {
        data.uuid = uuidv4();
        let businessPartnerRequest = new BusinessPartnerRequest(data);
        businessPartnerRequest
          .save()
          .then((result) => {
            status = 201;
            message =
              "Success! Business Partner request have been created successfully";
            res
              .status(status)
              .json(apiSuccessResponse(status, message, result));
          })
          .catch((err) => {
            res
              .status(status)
              .json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error! Validation Error.";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  viewBusiness: async (req, res, next) => {
    let { uuid } = req.body;
    let status = 400;
    let message = "Error!";

    BusinessPartner.findOne({
      $and: [
        { uuid: uuid },
        { expiryDate: { $gte: new Date() } },
        { status: 1 },
      ],
    })
      .orFail()
      .then((result) => {
        status = 200;
        message = "Success! Business Partner details.";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listBusiness: async (req, res, next) => {
    let status = 200;
    let message = "Error! Not Found.";

    BusinessPartner.find({
      $and: [{ expiryDate: { $gte: new Date() } }, { status: true }],
    })
      .orFail()
      .then((result) => {
        status = 200;
        message = "Success! Business Partners.";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },
};
