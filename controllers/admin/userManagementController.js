const { v4: uuidv4 } = require("uuid");
const UserManagement = require("../../model/UserManagement");
const authHelper = require("../../helpers/authHelper");
const { userManagementSchema, updateUserManagementSchema } = require("../../validator/validationSchema");

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");

module.exports = {
  create: async (req, res, next) => {
    let status = 400;
    const data = req.body;

    await userManagementSchema
      .validateAsync(data)
      .then(() => {
        if (data.password == data.confirmPassword) {
          data.uuid = uuidv4();
          data.password = authHelper.setPassword(data.password);

          const userManagement = new UserManagement(data);
          userManagement
            .save()
            .then((result) => {
              message = "Success! ";
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
        } else {
          res.status(status).json({
            message: "Error! Invalid Password.",
          });
        }
      })
      .catch((err) => {
        message = "Error! Validation Error";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  view: async (req, res, next) => {
    const { uuid } = req.body;
    let status = 400;

    UserManagement.findOne({ uuid: uuid })
      .orFail()
      .select("-_id -password")
      .then((result) => {
        message = `Success! Details of ${result.role}`;
        res
          .status(status)
          .json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  list: async (req, res, next) => {
    let status = 200;

    UserManagement.find()
      .orFail()
      .select("-_id -password")
      .then((result) => {
        message = "Success! List of management:-";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "No management found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  update: async (req, res, next) => {
      let status = 400;
      const data = req.body;

    await updateUserManagementSchema
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

        UserManagement.findOneAndUpdate(query, set, option)
          .orFail()
          .select("-_id -password")
          .then((result) => {
            status = 200;
            message = "Success! Management updated successfully.";
            res.json(apiSuccessResponse(status, message, result));
          })
          .catch((err) => {
            status = 400;
            message = "Error! ";
            res.json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error! Validation Error!";
        res.json(apiErrorResponse(status, message, err.message));
      });
  }
};
