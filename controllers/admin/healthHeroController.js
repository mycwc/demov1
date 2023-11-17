const { v4: uuidv4 } = require("uuid");
const userHelper = require("../../helpers/userHelper");
const packageHelper = require("../../helpers/packageHelper");
const HealthHero = require("../../model/HealthHero");
const UserHealthHero = require("../../model/UserHealthHero");
const HealthHeroRegistration = require("../../model/HealthHeroRegistration");
const { healthHeroSchema } = require("../../validator/validationSchema");
const AWS = require("aws-sdk");

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");
const healthHeroHelper = require("../../helpers/healthHeroHelper");
const { paginatedResults } = require("../../functions/functions");

module.exports = {
  create: async (req, res, next) => {
    const data = req.body;

    data.uuid = uuidv4();
    data.diseaseType = data.diseaseType.split(",");
    data.areaOfMentoring = data.areaOfMentoring.split(",");
    data.preferrableDays = data.preferrableDays.split(",");

    let status = 400;

    userHelper
      .getUserByUuid(data.userUuid)
      .then((user) => {
        healthHeroSchema
          .validateAsync(data)
          .then(() => {
            packageHelper
              .getPackageByUuid(data.membershipPackage)
              .then(() => {
                data.image =
                  !req.file || req.file == undefined
                    ? user.coverImage == null
                      ? "public/assets/images/palceholder.jpg"
                      : user.coverImage
                    : req.file.path;

                data.userUuid = user.uuid;
                data.name = user.name;
                const healthHero = new HealthHero(data);
                healthHero
                  .save()
                  .then((healthHero) => {
                    // const email = user.email;
                    // const subject = "Welcome Onboard as a Health Hero";
                    // const notificationMessage = `<p>Hello ${user.name}<br><br>

                    // Congratulations!<br>
                    // Your application to be a Health Hero has been approved.<br>
                    // Starting today you are officially a verified Health Hero at CWC.<br>
                    // We are excited to have you onboard.<br><br>

                    // Stay Happy and Keep Well<br>
                    // CWC Team
                    // </p>`;
                    // userHelper
                    //   .emailNotifications(email, subject, notificationMessage)
                    //   .then(() => {
                    status = 200;
                    message =
                      "Success! Health Hero has been registered successfully. :-";

                    res
                      .status(status)
                      .json(apiSuccessResponse(status, message, healthHero));
                    // })
                    // .catch((err) => {
                    //   message = "Error!";
                    //   res
                    //     .status(status)
                    //     .json(apiErrorResponse(status, message, err.message));
                    // });
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
                  .json(apiErrorResponse(status, message, err.message));
              });
          })
          .catch((err) => {
            message = "Error! Validation Error!";
            res
              .status(status)
              .json(apiSuccessResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  view: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    await healthHeroHelper
      .getHealthHeroByUuid(uuid)
      .then((healthHero) => {
        status = 200;
        message = "Success! Details of Health Hero " + healthHero.name + " :-";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, healthHero));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  list: async (req, res, next) => {
    const { page, limit } = req.query;

    let status = 200;

    await healthHeroHelper
      .getHealthHeroesForAdmin()
      .then((healthHero) => {
        const results = paginatedResults(healthHero, page, limit);
        message = "Success! List of Health Heroes :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No Health Heroes found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  delete: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    HealthHero.deleteOne({ uuid: uuid })
      .then((result) => {
        status = 200;
        message = "Success! Health Hero successfully deleted.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  update: async (req, res, next) => {
    const data = req.body;

    data.areaOfMentoring &&
      data.areaOfMentoring != [] &&
      data.areaOfMentoring != ""
      ? (data.areaOfMentoring = data.areaOfMentoring.split(","))
      : delete data.areaOfMentoring;

    data.preferrableDays &&
      data.preferrableDays != [] &&
      data.preferrableDays != ""
      ? (data.preferrableDays = data.preferrableDays.split(","))
      : delete data.preferrableDays;

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

    let status = 400;

    await HealthHero.findOneAndUpdate(query, set, option)
      .orFail()
      .select("-_id")
      .then((content) => {
        status = 200;
        message = "Success! Health Hero updated succesfully :-";
        res.status(status).json(apiSuccessResponse(status, message, content));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  statusUpdate: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    await HealthHero.updateOne(
      { uuid: data.uuid },
      { $set: { isActive: data.isActive } }
    )
      .then((result) => {
        status = 200;
        message = "Success! Health Hero status updated successfully.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  approve: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    await UserHealthHero.updateOne(
      { healthHeroUuid: uuid },
      { $set: { approved: true } }
    )
      .then((result) => {
        status = 200;
        message = "Success! Health Hero has been approved.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  UserRequestActiveInactive: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    await UserHealthHero.updateOne(
      { userUuid: data.userUuid, healthHeroUuid: data.healthHeroUuid },
      { $set: { isActive: data.isActive } }
    )
      .then((result) => {
        status = 200;
        message = "Health Hero status has been updated.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  rejectUserRequest: async (req, res, next) => {
    const { userUuid, healthHeroUuid } = req.body;

    let status = 400;

    UserHealthHero.remove({
      userUuid: userUuid,
      healthHeroUuid: healthHeroUuid,
    })
      .orFail()
      .then((result) => {
        status = 200;
        message = "Success! Request for Health Hero has been rejected.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  pendingRequests: async (req, res, next) => {
    const { page, limit } = req.query;
    const { healthHeroUuid } = req.body;

    let status = 200;

    await UserHealthHero.find({
      healthHeroUuid: healthHeroUuid,
      isActive: null,
    })
      .orFail()
      .then((userHealthHero) => {
        const results = paginatedResults(userHealthHero, page, limit);
        message = "Success! List of pending request for Health Hero :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No pending Health Hero found";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  approvedRequests: async (req, res, next) => {
    const { page, limit } = req.query;
    const { healthHeroUuid } = req.body;

    let status = 200;

    await UserHealthHero.find({
      healthHeroUuid: healthHeroUuid,
      isActive: true,
    })
      .orFail()
      .then((userHealthHero) => {
        const results = paginatedResults(userHealthHero, page, limit);
        message = "Success! List of approved request for Health Hero :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No approved Health Hero found";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listRegistrations: async (req, res, next) => {
    let status = 200;
    let message = "Not Found!";

    HealthHeroRegistration.find()
      .populate("User", "-_id name email city country")
      .orFail()
      .then((HealthHeroes) => {
        message = "List of Health Hero Registrations:-";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, HealthHeroes));
      })
      .catch((err) => {
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  viewRegistrations: async (req, res, next) => {
    let { healthHeroUuid } = req.body;
    let status = 400;
    let message = "Error!";

    HealthHeroRegistration.findOne({ uuid: healthHeroUuid })
      .populate("User", "-_id name email city country")
      .orFail()
      .then((HealthHero) => {
        status = 200;
        message = "Health Hero Details:-";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, HealthHero));
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  createSpotlight: async (req, res, next) => {
    const data = req.body;
    let status = 400;

    data.uuid = uuidv4();
    data.video = req.files.video[0].location;

    let spotlightData = {
      title: data.title,
      video: data.video,
    };

    query = {
      uuid: data.healthHeroUuid,
    };

    delete data._id;

    set = {
      $push: { spotlightVideo: spotlightData },
    };

    option = {
      new: true,
    };

    await HealthHero.findOneAndUpdate(query, set, option)
      .orFail()
      .then((result) => {
        status = 200;
        message = "Spotlight video is saved successfully.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listSpotlight: async (req, res, next) => {
    const { page, limit } = req.query;

    let status = 200;

    await HealthHero.find({ spotlightVideo: { $exists: true, $ne: [] } })
      .select("-_id uuid userUuid image spotlightVideo")
      .populate("User", "-_id name")
      .orFail()
      .then((spotlightData) => {
        let result = [];
        spotlightData.forEach((item1) => {
          item1.spotlightVideo.forEach((item2) => {
            result.push({
              uuid: item1.uuid,
              name: item1.User[0].name,
              image: item1.image,
              title: item2.title,
              video: item2.video,
            });
          });
        });
        const results = paginatedResults(result, page, limit);
        message = "Success! List of Spotlights :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No Spotlight found!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, []));
      });
  },

  deleteSpotlight: async (req, res, next) => {
    const data = req.body;
    let status = 400;
    let message = "Error!";

    const s3 = new AWS.S3({
      accessKeyId: process.env.ID,
      secretAccessKey: process.env.SECRET,
    });

    HealthHero.findOne({ uuid: data.healthHeroUuid })
      .then((healthHero) => {
        let spotVideo;
        healthHero.spotlightVideo.forEach((item) => {
          item.video.slice(item.video.indexOf("m/") + 2) == data.spotlightVideo
            ? (spotVideo = item)
            : next;
        });
        if (spotVideo != false) {
          s3.deleteObject(
            {
              Bucket: process.env.MULTIMEDIA_SPOTLIGHT_BUCKET,
              Key: data.spotlightVideo,
            },
            function (err, data1) {
              if (err) {
                res
                  .status(status)
                  .json(apiErrorResponse(status, message, err.message));
              } else {
                HealthHero.updateOne(
                  { uuid: data.healthHeroUuid },
                  { $pull: { spotlightVideo: spotVideo } }
                )
                  .orFail()
                  .then((result) => {
                    status = 200;
                    message = "Spotlight video is deleted successfully";
                    res
                      .status(status)
                      .json(apiSuccessResponse(status, message, result));
                  })
                  .catch((err) => {
                    res
                      .status(status)
                      .json(apiErrorResponse(status, message, err.message));
                  });
              }
            }
          );
        } else {
          message = "Invalid Video";
          res.status(status).json(apiErrorResponse(status, message, null));
        }
      })
      .catch((err) => {
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },
};
