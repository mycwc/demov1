const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");
const userHealthHeroHelper = require("../../helpers/userHealthHeroHelper");
const { paginatedResults } = require("../../functions/functions");

module.exports = {
  listPending: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;

    await userHealthHeroHelper
      .getPendingUserHealthHeroesRequest()
      .then((userHealthHero) => {
        const results = paginatedResults(userHealthHero, page, limit)
        message = "Success! Lis of pending request for Health Heroes :-";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No pending Health Heroes found";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });    
  },
};
