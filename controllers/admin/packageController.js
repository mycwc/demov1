const { v4: uuidv4 } = require("uuid");

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");
const Package = require("../../model/Package");
const packageHelper = require("../../helpers/packageHelper");

const { packageSchema } = require("../../validator/validationSchema");
const { paginatedResults } = require("../../functions/functions");

module.exports = {
  create: async (req, res, next) => {
    const data = req.body;
    data.uuid = uuidv4();

    if (req.file) {
      data.image = req.file.path;
    }

    if (data.benefits != "") {
      data.benefits = data.benefits.split(",");
    }

    let status = 400;

    await packageSchema
      .validateAsync(data)
      .then(() => {
        const package = new Package(data);
        package
          .save()
          .then((result) => {
            status = 200;
            message = "Success! Package created successfully.";
            res
              .status(status)
              .json(apiSuccessResponse(status, message, result));
          })
          .catch((err) => {
            status = 400;
            message = "Error!";
            res
              .status(status)
              .json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        status = 400;
        message = "Error! Validation Error!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
      });
  },

  view: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    await packageHelper
      .getPackageByUuid(data.uuid)
      .then((package) => {
        status = 200;
        message = "Success! Details of package " + package.name + ":-";
        res.status(status).json(apiSuccessResponse(status, message, package));
      })
      .catch((err) => {
        status = 400;
        message = "Error!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
      });
  },

  searchPackage: async (req, res, next) => {
    const { name } = req.body;

    let status = 400;

    await packageHelper
      .getPackageByName(name)
      .then((package) => {
        status = 200;
        message = "Success! Details of " + package.name + ". :-";

        res.status(status).json(apiSuccessResponse(status, message, package));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  list: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;

    await Package.find()
      .sort({ name: 1, isActive: -1, createdAt: -1 })
      .then((packages) => {
        const results = paginatedResults(packages, page, limit);

        message = "Success! List of Packages:-";
        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No packages found!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, []));
      });
  },

  update: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    if (req.file) {
      data.image = req.file.path;
    }

    if (data.benefits != "") {
      data.benefits = data.benefits.split(",");
    }

    query = {
      uuid: data.uuid,
    };

    delete data.uuid;
    delete data._id;

    set = data;

    option = {
      new: true,
    };

    await Package.findOneAndUpdate(query, set, option)
      .orFail()
      .select("-_id")
      .then((package) => {
        status = 200;
        message = "Success! Package updates succesfully :-";
        res.status(status).json(apiSuccessResponse(status, message, package));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  toggleStatus: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    await Package.updateOne(
      { uuid: data.uuid },
      { $set: { isActive: data.isActive } }
    )
      .then((package) => {
        status = 200;
        message = "Success! Package status has been updated.";
        res.status(status).json(apiSuccessResponse(status, message, package));
      })
      .catch((err) => {
        message = "Error! Please try again!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },
};
