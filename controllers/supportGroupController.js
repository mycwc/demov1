const { v4: uuidv4 } = require("uuid");
const SupportGroup = require("../model/SupportGroup");
const MemberSupportGroup = require("../model/memberSupportGroup");
const packageHelper = require("../helpers/packageHelper");
const supportHelper = require("../helpers/supportHelper");
const dayjs = require("dayjs");

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../helpers/responseHelper");
const userHelper = require("../helpers/userHelper");

module.exports = {
  view: async (req, res, next) => {
    const { supportGroupUuid } = req.body;

    let status = 400;

    await supportHelper
      .getSupportGroupByUuid(supportGroupUuid)
      .then((supportGroup) => {
        status = 200;
        message = "Success! Details of Wellness Support Group. :-";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, supportGroup));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },
  list: async (req, res, next) => {
    let status = 200;

    await supportHelper
      .getSupportGroupsUser()
      .then((supportGroups) => {
        message = "Success! List of all Wellness Support Group. :-";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, supportGroups));
      })
      .catch((err) => {
        message = "No support group found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  search: async (req, res, next) => {
    const { name } = req.body;

    let status = 200;

    await supportHelper
      .getSupportGroupsByLike(name)
      .then((supportGroups) => {
        message = "Success! Support Groups. :-";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, supportGroups));
      })
      .catch((err) => {
        message = "Data not found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  userApply: async (req, res, next) => {
    const data = req.body;

    data.uuid = uuidv4();

    data.image = req.file ? req.file.path : "public/assets/images/palceholder.jpg";

    data.coverImage = data.image;

    const supportGroup = new SupportGroup(data);

    let status = 400;

    await packageHelper
      .getPackageByName(data.membershipPackage)
      .then(() => {
        supportGroup
          .save()
          .then((supportGroup) => {
            status = 200;
            message = "Success! Your Application has been send. :-";

            res
              .status(status)
              .json(apiSuccessResponse(status, message, supportGroup));
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

  joinSupportGroup: async (req, res, next) => {
    const { supportGroupUuid } = req.body;
    const user = req.user;
    const data = {
      uuid: uuidv4(),
      userUuid: user.uuid,
      supportGroupUuid: supportGroupUuid,
    };
    const memberSupportGroup = new MemberSupportGroup(data);

    let status = 400;

    MemberSupportGroup.findOne({
      userUuid: user.uuid,
      supportGroupUuid: data.supportGroupUuid,
    })
      .then((memberSupport) => {
        if (memberSupport == null) {
          userHelper
            .getUserByUuid(user.uuid)
            .then((user) => {
              supportHelper
                .getSupportGroupByUuid(supportGroupUuid)
                .then((supportGroup) => {
                  MemberSupportGroup.find({
                    $and: [{ userUuid: user.uuid }],
                  })
                    .then((result) => {
                      packageHelper
                        .getPackageByUuid(user.package.uuid)
                        .then((package) => {
                          if (
                            result.length + 1 >
                            package.numberOfWellnessSupportGroups
                          ) {
                            status = 402;
                            message =
                              "Sorry! You have exceeded your wellness support group joining limit. Please upgrade your package to join more.";
                            res
                              .status(status)
                              .json(apiErrorResponse(status, message, null));
                          } else {
                            memberSupportGroup
                              .save()
                              .then(() => {
                                let email = "";
                                let subject = "";
                                let notificationMessage = "";

                                email = process.env.ADMIN_EMAIL;
                                subject = "Request to join a Support Group.";
                                notificationMessage = `<p>Subject: ${user.name == null ? "User" : user.name
                                  } requested to join ${supportGroup.name
                                  } group.<br>
                                Hey,<br><br> 
                                ${user.name == null ? "A user" : user.name
                                  } has requested to join ${supportGroup.name
                                  } group and requires your actions for that.<br>
                                Date: ${dayjs(new Date()).format("YYYY-MM-DD")}<br>
                                Time: ${dayjs(new Date()).format("HH:mmA")} <br>
                                `;
                                userHelper
                                  .emailNotifications(
                                    email,
                                    subject,
                                    notificationMessage
                                  ).then(() => {
                                    status = 200;
                                    message =
                                      "Your request to join a group has been recorded.";
                                    res
                                      .status(status)
                                      .json(
                                        apiSuccessResponse(
                                          status,
                                          message,
                                          null
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

              res
                .status(status)
                .json(apiErrorResponse(status, message, err.message));
            });
        } else {
          status = 400;
          message = "You have already requested to join this group.";

          res.status(status).json(apiErrorResponse(status, message, null));
        }
      })
      .catch((err) => {
        status = 400;
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listApprovedGroups: async (req, res, next) => {
    const user = req.user;
    let status = 200;

    MemberSupportGroup.find({ userUuid: user.uuid, isActive: { $ne: null } })
      .orFail()
      .then((memberGroups) => {
        let groups = [];
        memberGroups.forEach((item) => {
          groups.push(item.supportGroupUuid);
        });
        SupportGroup.find({ uuid: { $in: groups } })
          .populate("packages", "-_id")
          .select("-_id -members")
          .orFail()
          .then((result) => {
            message = "Success! List of approved Support Groups.";

            res
              .status(status)
              .json(apiSuccessResponse(status, message, result));
          })
          .catch((err) => {
            message = "Error! No Support Groups found.";

            res.status(status).json(apiSuccessResponse(status, message, []));
          });
      })
      .catch((err) => {
        message = "Error! No requested Support Groups found.";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listPendingGroups: async (req, res, next) => {
    const user = req.user;
    let status = 200;

    MemberSupportGroup.find({ userUuid: user.uuid, isActive: null })
      .select("supportGroupUuid")
      .orFail()
      .then((memberGroups) => {
        message = "Success! List of pending requested Support Groups.";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, memberGroups));
      })
      .catch((err) => {
        message = "No pending Support Groups found.";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  leaveSupportGroup: async (req, res, next) => {
    const { supportGroupUuid } = req.body;
    const user = req.user;

    let status = 400;

    await MemberSupportGroup.deleteOne({
      userUuid: user.uuid,
      supportGroupUuid: supportGroupUuid,
      isActive: true,
    })
      .orFail()
      .then((result) => {
        SupportGroup.updateOne(
          { uuid: supportGroupUuid },
          { $pull: { members: user.uuid } }
        )
          .orFail()
          .then(() => {
            status = 200;
            message = "Success! You are removed from the suport group.";

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
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },
};
