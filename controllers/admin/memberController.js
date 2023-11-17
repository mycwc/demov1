const { v4: uuidv4 } = require("uuid");

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");
const User = require("../../model/User");
const SupportGroup = require("../../model/SupportGroup");
const MemberSupportGroup = require("../../model/memberSupportGroup");
const packageHelper = require("../../helpers/packageHelper");
const userHelper = require("../../helpers/userHelper");
const MemberHelper = require("../../helpers/memberHelper");
const supportHelper = require("../../helpers/supportHelper");

const { paginatedResults } = require("../../functions/functions");
const {
  memberSchema,
  updateUserProfileSchema,
} = require("../../validator/validationSchema");
const Package = require("../../model/Package");

module.exports = {
  create: async (req, res, next) => {
    const data = req.body;
    data.uuid = uuidv4();

    data.coverImage =
      !req.files || req.files == undefined
        ? (data.coverImage = "public/assets/images/palceholder.jpg")
        : req.files.path;

    let status = 400;

    await memberSchema
      .validateAsync(data)
      .then(() => {
        packageHelper
          .getPackageByUuid(data.membershipPackage)
          .then((package) => {
            data.isActive = true;
            data.package = {
              uuid: package.uuid,
              name: package.name,
              status: "active",
              date: new Date(),
              type: "annual",
              cost: package.annualCost,
              expiry: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
              ),
            };

            const user = new User(data);

            user
              .save()
              .then((memberData) => {
                status = 200;
                message = "Success! Member registered successfully.";

                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, memberData));
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
              .json(apiSuccessResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
      });
  },

  update: async (req, res, next) => {
    const data = req.body;

    data.coverImage =
      !req.file || req.file == undefined
        ? (data.coverImage = "public/assets/images/palceholder.jpg")
        : req.file.path;

    let status = 400;

    if (data.membershipPackage) {
      Package.findOne({ uuid: data.membershipPackage })
        .then((packageData) => {
          data.package = {
            uuid: packageData.uuid,
            name: packageData.name,
            status: packageData.isActive == true ? "active" : "inactive",
            date: new Date(),
            cost: packageData.annualCost,
          };

          query = {
            uuid: data.uuid,
          };

          delete data.uuid;
          delete data._id;

          set = data;

          option = {
            new: true,
          };

          User.findOneAndUpdate(query, set, option)
            .orFail()
            .select("-_id")
            .then((result) => {
              status = 200;
              message = "Success! Member updated succesfully :-";
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
          res
            .status(status)
            .json(apiErrorResponse(status, message, err.message));
        });
    } else {
      query = {
        uuid: data.uuid,
      };

      delete data.uuid;
      delete data._id;

      set = data;

      option = {
        new: true,
      };

      User.findOneAndUpdate(query, set, option)
        .orFail()
        .select("-_id -uuid")
        .then((result) => {
          status = 200;
          message = "Success! Member updated succesfully :-";
          res.status(status).json(apiSuccessResponse(status, message, result));
        })
        .catch((err) => {
          message = "Error!";
          res
            .status(status)
            .json(apiErrorResponse(status, message, err.message));
        });
    }
  },

  statusUpdate: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    await User.updateOne(
      { uuid: data.uuid },
      { $set: { isActive: data.isActive } }
    )
      .then((result) => {
        status = 200;
        message = "Success! Member status updated successfully.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  view: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    await userHelper
      .getUserByUuid(uuid)
      .then((member) => {
        status = 200;
        message = "Success! Details of " + member.name + ". :-";

        res.status(status).json(apiSuccessResponse(status, message, member));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  searchMember: async (req, res, next) => {
    const { name } = req.body;

    let status = 400;

    await userHelper
      .getUserByLike(name)
      .then((member) => {
        status = 200;
        message = "Success! Details of " + member.name + ". :-";

        res.status(status).json(apiSuccessResponse(status, message, member));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  list: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;

    await userHelper
      .getUsers()
      .then((members) => {
        const results = paginatedResults(members, page, limit);
        message = "Success! List of all members:-";
        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No Members Found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listMembersOfSupportGroup: async (req, res, next) => {
    const { supportGroupUuid } = req.body;

    let status = 200;

    await supportHelper
      .getSupportGroupByUuid(supportGroupUuid)
      .then((supportGroup) => {
        supportHelper
          .getGroupMembers(supportGroup.uuid)
          .then((members) => {
            message =
              "Success! List of all " + supportGroup.name + " group members:-";
            res
              .status(status)
              .json(apiSuccessResponse(status, message, members));
          })
          .catch((err) => {
            status = 200;
            message = "No members found!";
            res.status(status).json(apiSuccessResponse(status, message, []));
          });
      })
      .catch((err) => {
        message = "Error!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
      });
  },

  add: async (req, res, next) => {
    const { supportGroupUuid, member } = req.body;

    let status = 400;

    SupportGroup.findOne({ uuid: supportGroupUuid })
      .then((supportGroup) => {
        const supportGroupMembersLength = supportGroup.members.length;

        if (supportGroupMembersLength + 1 > supportGroup.numberOfMembers) {
          message =
            "Error! You have crossed the maximum limit to add members in the respective support group.";
          res.status(status).json(apiErrorResponse(status, message, ""));
        } else {
          SupportGroup.updateOne(
            { uuid: supportGroupUuid },
            { $push: { members: member } }
          )
            .then(() => {
              const membersupportgroups = new MemberSupportGroup({
                userUuid: member,
                supportGroupUuid: supportGroupUuid,
                isActive: true,
              });
              membersupportgroups
                .save()
                .then(() => {
                  status = 200;
                  message =
                    "Success! Successfully added the members to the Support Group:-";
                  res
                    .status(status)
                    .json(apiSuccessResponse(status, message, null));
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
        }
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  approve: async (req, res, next) => {
    const { userUuid, supportGroupUuid } = req.body;

    let status = 400;

    await MemberSupportGroup.updateOne(
      {
        $and: [{ userUuid: userUuid }, { supportGroupUuid: supportGroupUuid }],
      },
      { $set: { isActive: true } }
    )
      .then(() => {
        SupportGroup.updateOne(
          { uuid: supportGroupUuid },
          { $push: { members: userUuid } }
        )
          .then(() => {
            MemberSupportGroup.findOne({
              $and: [
                { userUuid: userUuid },
                { supportGroupUuid: supportGroupUuid },
              ],
            })
              .populate("User", "name email")
              .populate("SupportGroup", "name groupLink")
              .then((memberData) => {
                let message = `<h3>Hi, ${memberData.User[0].name}</h3>
                              <h4>This is to share with you that your joining request for WSG - ${memberData.SupportGroup[0].name} has been accepted. To be a part of the group, kindly click on below button to join.<br/>
                              <button type="button" style="border:none; border-radius:10px; background-color: #ff8b88 !important ; margin-top:20px !important; padding:5px 10px; color: #fff !important;"><a href="${memberData.SupportGroup[0].groupLink}">Join Now</a></button></h4><br/><br/><h4>Regards,</h4><h4>CWC Team</h4>`;
                userHelper
                  .emailNotifications(
                    memberData.User[0].email,
                    "Request Accepted",
                    message
                  )
                  .then(() => {
                    status = 200;
                    message =
                      "Success! Successfully added the members to the Support Group.";
                    res
                      .status(status)
                      .json(apiSuccessResponse(status, message, null));
                  })
                  .catch((err) => {
                    res
                      .status(status)
                      .json(apiErrorResponse(status, message, err.message));
                  });
              })
              .catch((err) => {
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

  addGroupLeader: async (req, res, next) => {
    const { supportGroupUuid, userUuid } = req.body;

    let status = 400;

    await SupportGroup.updateOne(
      { uuid: supportGroupUuid },
      { $set: { groupLeader: userUuid } }
    )
      .then(() => {
        status = 200;
        message =
          "Success! Successfully added the Group Leader to the Support Group:-";
        res.status(status).json(apiSuccessResponse(status, message, null));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  remove: async (req, res, next) => {
    const { userUuid, supportGroupUuid } = req.body;

    let status = 400;

    await SupportGroup.updateOne(
      { uuid: supportGroupUuid },
      { $pull: { members: userUuid } }
    )
      .then((supportGroup) => {
        MemberSupportGroup.updateOne(
          {
            $and: [
              { userUuid: userUuid },
              { supportGroupUuid: supportGroupUuid },
            ],
          },
          {
            $set: {
              isActive: false,
            },
          }
        )
          .orFail()
          .then(() => {
            status = 200;
            message = "Success! Member has been cancelled.";

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

  reject: async (req, res, next) => {
    const { userUuid, supportGroupUuid } = req.body;

    let status = 400;

    await MemberSupportGroup.remove({
      $and: [{ userUuid: userUuid }, { supportGroupUuid: supportGroupUuid }],
    })
      .then((memberSupportGroup) => {
        status = 200;
        message = "Success! Member Request has been removed successfully.";

        res
          .status(status)
          .json(apiSuccessResponse(status, message, memberSupportGroup));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listPendingRequest: async (req, res, next) => {
    const data = req.body;
    let status = 200;

    await MemberHelper.getMembersPendingRequest(data.supportGroupUuid)
      .then((result) => {
        message = "Success! List of all pending requests:-";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "No pending requests found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listApprovedRequest: async (req, res, next) => {
    const data = req.body;
    let status = 200;

    await MemberHelper.getMembersApprovedRequest(data.supportGroupUuid)
      .then((result) => {
        message = "Success! List of all approved requests:-";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "No approved requests found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },
};
