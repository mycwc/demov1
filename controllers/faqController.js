const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../helpers/responseHelper");

const Faq = require("../model/Faq");

module.exports = {
  viewFaq: async (req, res, next) => {
    let status = 400;
    const data = req.body;

    Faq.findOne({uuid: data.uuid, isActive: true})
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

  listFaq: async (req, res, next) => {
    let status = 200;

    Faq.find({isActive: true})
      .then((result) => {
        message = "List of Faqs:-";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  }
};
