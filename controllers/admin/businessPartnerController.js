const { v4: uuidv4 } = require("uuid");
const BusinessPartner = require("../../model/BusinessPartner");
const BusinessPartnerRequest = require("../../model/BusinessPartnerRequest");
const { businessPartnerSchema } = require("../../validator/validationSchema");
const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");

module.exports = {
  createBusiness: async (req, res, next) => {
    let data = req.body;
    let status = 400;
    let message = "Error!";

    if (req.file) {
      data.logo = req.file.path;
    }

    await businessPartnerSchema
      .validateAsync(data)
      .then(() => {
        data.uuid = uuidv4();
        let businessPartner = new BusinessPartner(data);
        businessPartner
          .save()
          .then((result) => {
            status = 201;
            message =
              "Success! Business Partner have been created successfully";
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

  updateBusiness: async (req, res, next) => {
    let data = req.body;
    let status = 400;
    let message = "Error!";

    if (req.file) {
      data.logo = req.file.path;
    }

    let query = { uuid: data.uuid };
    let set = data;
    let options = {
      new: true,
    };

    BusinessPartner.findOneAndUpdate(query, set, options)
      .orFail()
      .then((result) => {
        status = 200;
        message = "Success! Business Partner updated successfully.";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  viewBusiness: async (req, res, next) => {
    let { uuid } = req.body;
    let status = 400;
    let message = "Error!";

    BusinessPartner.findOne({ uuid: uuid })
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

    BusinessPartner.find()
      .sort({ updatedAt: -1 })
      .orFail()
      .then((result) => {
        message = "Success! Business Partners.";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  deleteBusiness: async (req, res, next) => {
    let { uuid } = req.body;
    let status = 400;
    let message = "Error!";

    BusinessPartner.deleteOne({ uuid: uuid })
      .orFail()
      .then((result) => {
        status = 200;
        message = "Success! Business Partner is deleted.";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  viewPartnerRequest: async (req, res, next) => {
    let { uuid } = req.body;
    let status = 400;
    let message = "Error!";

    BusinessPartnerRequest.findOne({ uuid: uuid })
      .orFail()
      .then((result) => {
        status = 200;
        message = "Success! Business Partner request details.";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listPartnerRequest: async (req, res, next) => {
    let status = 200;
    let message = "Error! Not Found.";

    BusinessPartnerRequest.find()
      .sort({ updatedAt: -1 })
      .orFail()
      .then((result) => {
        message = "Success! Business Partner requests.";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },
};
