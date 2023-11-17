const { v4: uuidv4 } = require("uuid");
const authHelper = require("../../helpers/authHelper");
const auth = require("../../helpers/authHelper");
const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");

const Faq = require("../../model/Faq");

module.exports = {
  createFaq: async (req, res, next) => {
    let data = req.body;
    let status = 400;

    data.uuid = uuidv4();
    const faq = new Faq(data);

    faq
      .save()
      .then((result) => {
        status = 200;
        message = "Faq is created successfully.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  updateFaq: async (req, res, next) => {
    let data = req.body;
    let status = 400;

    query = {
      uuid: data.uuid,
    };

    delete data.uuid;
    delete data._id;

    set = data;

    option = {
      new: true,
    };

    Faq.findOneAndUpdate(query, set, option)
      .then((result) => {
        status = 200;
        message = "Faq is updated successfully.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },
  viewFaq: async (req, res, next) => {
    let status = 400;
    const data = req.body;

    Faq.findOne({uuid: data.uuid})
      .then((result) => {
        status = 200;
        message = "Faq details :-";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  deleteFaq: async (req, res, next) => {
    let status = 400;
    const data = req.body;

    Faq.deleteOne({uuid: data.uuid})
      .then((result) => {
        status = 200;
        message = "Faq is deleted successfully :-";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listFaq: async (req, res, next) => {
    let status = 200;
    const data = req.body;

    Faq.find()
      .then((result) => {
        message = "List of Faqs:-";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Data not found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  }
};
