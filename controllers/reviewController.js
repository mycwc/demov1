const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../helpers/responseHelper");

const { getParamData } = require("../helpers/marketHelper");
const { marketQuery } = require("../functions/functions");

module.exports = {
  create: async (req, res, next) => {
    let status = 400;
    let user = req.user;
    let data = req.body;
    data.customer_id = user.uuid;

    let paramData = getParamData(data, "products/reviews");
    marketQuery(paramData, "POST")
      .then((result) => {
        let status = 200;
        message = "Review has been created successfully :-";
        let reviewData = result;

        res
          .status(status)
          .json(apiSuccessResponse(status, message, reviewData));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err));
      });
  },

  // update: async (req, res, next) => {
  //     let status = 400;
  //     const data = req.body;

  //     reviewQuery()
  //       .then((result) => {
  //         status = 200;
  //         message = "Review has been updated successfully :-";

  //         res.status(status).json(apiSuccessResponse(status, message, result));
  //       })
  //       .catch((err) => {
  //         message = "Error!";

  //         res.status(status).json(apiErrorResponse(status, message, err.message));
  //       });
  //   },

  list: async (req, res, next) => {
    let status = 400;
    let query = req.url;
    let data = req.body;
    
    let paramData = getParamData(data, "products/reviews");
    marketQuery(paramData, "GET")
      .then((result) => {
        status = 200;
        message = "Reviews :-";
        let reviewData = result;

        res
          .status(status)
          .json(apiSuccessResponse(status, message, reviewData));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  // delete: async (req, res, next) => {
  //   let status = 400;
  //   const data = req.body;

  //   let query = req.url;

  //   reviewQuery(query, data)
  //     .then((result) => {
  //       status = 200;
  //       message = "Review has been deleted successfully :-";
  //       let reviewData = JSON.parse(result);

  //       res.status(status).json(apiSuccessResponse(status, message, reviewData));
  //     })
  //     .catch((err) => {
  //       message = "Error!";

  //       res.status(status).json(apiErrorResponse(status, message, err.message));
  //     });
  // },
};
