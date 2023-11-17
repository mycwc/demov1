const { v4: uuidv4 } = require("uuid");
const SupportGroup = require("../../model/SupportGroup");
const packageHelper = require("../../helpers/packageHelper");
const supportHelper = require("../../helpers/supportHelper");
const { supportGroupSchema } = require("../../validator/validationSchema");

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");
const { paginatedResults } = require("../../functions/functions");
const MemberSupportGroup = require("../../model/memberSupportGroup");

module.exports = {
  create: async (req, res, next) => {
    const data = req.body;

    data.uuid = uuidv4();
    data.coverImage = req.file
      ? req.file.path
      : "public/assets/images/palceholder.jpg";

    let status = 400;

    await supportGroupSchema
      .validateAsync(data)
      .then(() => {
        packageHelper
          .getPackageByUuid(data.membershipPackage)
          .then(() => {
            const supportGroup = new SupportGroup(data);

            supportGroup
              .save()
              .then((supportGroup) => {
                if (data.groupLeader != "") {
                  const memberSupportGroup = new MemberSupportGroup({
                    userUuid: data.groupLeader,
                    supportGroupUuid: data.uuid,
                    isActive: true,
                  });
                  memberSupportGroup.save();
                }
                status = 200;
                message = "Success! New Wellness Support Group created. !";

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
  },

  update: async (req, res, next) => {
    const data = req.body;

    if (req.file) {
      data.coverImage = req.file.path;
    }

    data.approved == undefined || data.approved == ""
      ? delete data.approved
      : data.approved;

    data.groupLeader == "" ? delete data.groupLeader : data.groupLeader;
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

    SupportGroup.findOneAndUpdate(query, set, option)
      .orFail()
      .select("-_id")
      .then((content) => {
        if (data.groupLeader) {
          const memberSupportGroup = new MemberSupportGroup({
            userUuid: data.groupLeader,
            supportGroupUuid: content.uuid,
            isActive: true,
          });
          memberSupportGroup.save();
        }
        status = 200;
        message = "Success! Support Group updated successfully!";
        res.status(status).json(apiSuccessResponse(status, message, content));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  view: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    await SupportGroup.findOne({ uuid: uuid })
      .populate("packages", "-_id ")
      .orFail()
      .select("-_id")
      .then((supportGroup) => {
        status = 200;
        message = "Success! Details of " + supportGroup.name + ". :-";

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
    const { page, limit } = req.query;
    let status = 200;

    await supportHelper
      .getSupportGroupsAdmin()
      .then((supportGroups) => {
        const results = paginatedResults(supportGroups, page, limit);
        message = "Success! List of all Wellness Support Groups. :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No Support Groups found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listPending: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;

    await supportHelper
      .getPendingSupportGroups()
      .then((supportGroups) => {
        const results = paginatedResults(supportGroups, page, limit);
        message = "Success! List of all Pending Wellness Support Groups. :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No pending support group found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  approve: async (req, res, next) => {
    const { uuid } = req.body;

    query = {
      uuid: uuid,
    };

    delete uuid;

    set = {
      isActive: true,
    };

    option = {
      new: true,
    };

    let status = 400;

    SupportGroup.findOneAndUpdate(query, set, option)
      .then((supportGroup) => {
        status = 200;
        message = "Success! Support Group has been approved. :-";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, supportGroup));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  reject: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    await SupportGroup.remove({ uuid: uuid })
      .orFail()
      .then((supportGroup) => {
        status = 200;
        message = "Success! Support Group has been removed from the list.";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, supportGroup));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  statusUpdate: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    await SupportGroup.updateOne(
      { uuid: data.uuid },
      { $set: { isActive: data.isActive } }
    )
      .then((result) => {
        status = 200;
        message = "Success! Support Group status updated successfully.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  myWSGRequestToggle: async (req, res, next) => {
    const data = req.body;

    query = {
      userUuid: data.userUuid,
      supportGroupUuid: data.supportGroupUuid,
    };

    delete uuid;

    set = {
      isActive: data.isActive,
    };

    option = {
      new: true,
    };

    let status = 400;

    MemberSupportGroup.findOneAndUpdate(query, set, option)
      .orFail()
      .then((supportGroup) => {
        status = 200;
        message =
          "Success! The request for Support Group has been approved. :-";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, supportGroup));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  rejectMyWSGRequest: async (req, res, next) => {
    const { userUuid, supportGroupUuid } = req.body;
    let status = 400;

    MemberSupportGroup.remove({
      userUuid: userUuid,
      supportGroupUuid: supportGroupUuid,
    })
      .orFail()
      .then((result) => {
        SupportGroup.updateOne(
          { uuid: supportGroupUuid },
          { $pull: { members: userUuid } }
        )
          .then(() => {
            status = 200;
            message =
              "Success! Member Request has been removed successfully. :-";

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
