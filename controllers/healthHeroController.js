const { v4: uuidv4 } = require("uuid");
const healthHeroHelper = require("../helpers/healthHeroHelper");
const packageHelper = require("../helpers/packageHelper");
const UserHealthHero = require("../model/UserHealthHero");
const HealthHeroRegistration = require("../model/HealthHeroRegistration");
const User = require("../model/User");
//userHealthHero,
const {
  userHealthHeroSchema,
  registrationSchema,
} = require("../validator/validationSchema");
const { paginatedResults } = require("../functions/functions");

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../helpers/responseHelper");
const HealthHero = require("../model/HealthHero");

module.exports = {
  applyForHero: async (req, res, next) => {
    const data = req.body;
    const user = req.user;

    data.uuid = uuidv4();
    data.userUuid = user.uuid;
    data.sessionDate = new Date(data.sessionDate);
    data.sessionTime = new Date(data.sessionTime);

    let status = 400;

    await userHealthHeroSchema
      .validateAsync(data)
      .then(() => {
        healthHeroHelper
          .getHealthHeroByUuid(data.healthHeroUuid)
          .then((healthHero) => {
            data.healthHeroUuid = healthHero.uuid;
            UserHealthHero.findOne({
              userUuid: user.uuid,
              healthHeroUuid: healthHero.uuid,
              isActive: {$in:[ true, null ]},
            })
              .then((memberSupport) => {
                if (memberSupport == null) {
                  packageHelper
                    .getPackageByUuid(user.package.uuid)
                    .then((package) => {
                      if (user.package.cost >= package.annualCost) {
                        UserHealthHero.find({
                          $and: [{ userUuid: user.uuid }, { isActive: {$in:[ true, null ]} }],
                        })
                          .then((result) => {
                            if (
                              result.length + 1 >
                              package.numberOfHealthHeroSessions
                            ) {
                              status = 402;
                              message =
                                "Sorry! Your have exceeded you Hero sessions limit.";

                              res
                                .status(status)
                                .json(
                                  apiSuccessResponse(status, message, null)
                                );
                            } else {
                              data.name = user.name;
                              data.email = user.email;
                              const userHealthHero = new UserHealthHero(data);
                              userHealthHero
                                .save()
                                .then((userHealthHero) => {
                                  status = 200;
                                  message =
                                    "Success! You have successfully applied for the session with your Health Hero.";

                                  res
                                    .status(status)
                                    .json(
                                      apiSuccessResponse(
                                        status,
                                        message,
                                        userHealthHero
                                      )
                                    );
                                })
                                .catch((err) => {
                                  message = "Error!";

                                  res
                                    .status(status)
                                    .json(
                                      apiErrorResponse(
                                        status,
                                        message,
                                        err.message
                                      )
                                    );
                                });
                            }
                          })
                          .catch((err) => {
                            message = "Error!";

                            res
                              .status(status)
                              .json(
                                apiErrorResponse(status, message, err.message)
                              );
                          });
                      } else {
                        status = 200;
                        message = `Sorry! But only members with ${healthHero.membershipPackage} subscription can apply for this Health Hero Session.`;

                        res
                          .status(status)
                          .json(apiSuccessResponse(status, message, null));
                      }
                    })
                    .catch((err) => {
                      message = "Error!";

                      res
                        .status(status)
                        .json(apiErrorResponse(status, message, err.message));
                    });
                } else {
                  status = 200;
                  message =
                    "You have already requested to join this Health Hero.";
                  res
                    .status(status)
                    .json(apiErrorResponse(status, message, null));
                }
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
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listRegisteredHeroes: async (req, res, next) => {
    const user = req.user;

    let status = 200;

    await healthHeroHelper
      .getRegisteredHealthHero(user.uuid)
      .then((healthHeroes) => {
        message = "Success! List of registered health hero:-";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, healthHeroes));
      })
      .catch((err) => {
        message = "No registered health heroes found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  view: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    await healthHeroHelper
      .getHealthHeroByUuidForUser(uuid)
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
    let status = 200;

    await healthHeroHelper
      .getHealthHeroesForUser()
      .then((healthHero) => {
        message = "Success! List of Health Hero's :-";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, healthHero));
      })
      .catch((err) => {
        message = "No Health Heroes found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  search: async (req, res, next) => {
    const { name } = req.body;

    let status = 200;

    await healthHeroHelper
      .searchHealthHeroByName(name)
      .then((healthHero) => {
        message = "Success!. :-";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, healthHero));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  registeration: async (req, res, next) => {
    const data = req.body;
    let status = 400;
    let message = "Error!";

    User.findOne({ uuid: data.userUuid })
      .then((result) => {
        data.uuid = uuidv4();

        req.files.uploadStory
          ? (data.uploadStory = req.files.uploadStory[0].location)
          : delete data.uploadStory;

        req.files.uploadDocuments
          ? (data.uploadDocuments = req.files.uploadDocuments[0].location)
          : (data.uploadDocuments = null);

        req.files.signature
          ? (data.signature = req.files.signature[0].location)
          : delete data.signature;

        data.membershipPackage = result.package.uuid;

        registrationSchema
          .validateAsync(data)
          .then(() => {
            const healthheroregistration = new HealthHeroRegistration(data);

            healthheroregistration
              .save()
              .then((result) => {
                status = 200;
                message = "You are registered successfully as a Health Hero:-";

                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, result));
              })
              .catch((err) => {
                message = "Error!";

                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, err.message));
              });
          })
          .catch((err) => {
            message = "Validation Error!";

            res
              .status(status)
              .json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error!";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
      });
  },

  listSpotlightVideo: async (req, res, next) => {
    const { page, limit } = req.query;

    let status = 200;

    await HealthHero.find({ spotlightVideo: { $exists: true, $ne: [] } })
      .select("-_id uuid userUuid image spotlightVideo membershipPackage")
      .populate("User", "-_id name")
      .populate("packages", "-_id")
      .orFail()
      .then((spotlightData) => {
        let result = [];
        spotlightData.forEach((item1) => {
          item1.spotlightVideo.forEach((item2) => {
            result.push({
              name: item1.User[0].name,
              image: item1.image,
              title: item2.title,
              video: item2.video,
              package: item1.packages,
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
          .json(apiSuccessResponse(status, message, err.message));
      });
  },
};
