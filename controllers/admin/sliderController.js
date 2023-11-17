const { v4: uuidv4 } = require("uuid");

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");
const Slider = require("../../model/Slider");

module.exports = {
  create: async (req, res, next) => {
    const data = req.body;
    let message = "";
    data.uuid = uuidv4();

    if (req.file) {
      data.image = req.file.path;
    }

    let status = 400;
    if (data.type == 0) {
      saveSlider(data);
    } else {
      Slider.find({ type: data.type })
        .then((result) => {
          if (result.length > 0) {
            status = 200;
            message =
              "Sorry! The Slider for type " +
              data.type +
              " can only be entered once.";
            res.status(status).json(apiSuccessResponse(status, message, ""));
          } else {
            saveSlider(data);
          }
        })
        .catch((err) => {
          status = 400;
          message = "Error!";
          res
            .status(status)
            .json(apiErrorResponse(status, message, err.message));
        });
    }

    function saveSlider(data) {
      const slider = new Slider(data);
      slider
        .save()
        .then((result) => {
          status = 200;
          message = "Success! Slider created succesfully.";
          res.status(status).json(apiSuccessResponse(status, message, result));
        })
        .catch((err) => {
          status = 400;
          message = "Error!";
          res
            .status(status)
            .json(apiErrorResponse(status, message, err.message));
        });
    }
  },

  update: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    if (req.file) {
      data.image = req.file.path;
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

    await Slider.findOneAndUpdate(query, set, option)
      .orFail()
      .select("-_id")
      .then((result) => {
        status = 200;
        message = "Success! Slider updated succesfully :-";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  list: async (req, res, next) => {
    const data = req.body;
    let message = "Error!";
    let status = 200;

    await Slider
      .find()
      .select("-_id")
      .then((result) => {
        message = "Success! Sliders :-";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  delete: async (req, res, next) => {
    const data = req.body;
    let message = "Error!";
    let status = 400;

    await Slider
      .deleteOne({uuid: data.uuid})
      .then((result) => {
        status = 200;
        message = "Success! Deleted Slider successfully :-";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  }
};
