const Member = require("../model/Member");
const MemberSupportGroup = require("../model/memberSupportGroup");

module.exports = {
  getMembers: () => {
    return new Promise((resolve, reject) => {
      Member.find({ isActive: true })
        .orFail()
        .select("-_id -uuid -mobile -gender -age -dob -addressLine1 -addressLine2 -zipCode -city -state -coverImage")
        .then((members) => {
          resolve(members);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getMembersPendingRequest: (supportGroupUuid) => {
    return new Promise((resolve, reject) => {
      MemberSupportGroup.find({ supportGroupUuid: supportGroupUuid, isActive: null })
      .populate("User", "-_id")
        .orFail()
        .select("-_id")
        .then((members_request) => {
          resolve(members_request);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getMembersApprovedRequest: (supportGroupUuid) => {
    return new Promise((resolve, reject) => {
      MemberSupportGroup.find({ supportGroupUuid: supportGroupUuid, isActive: { $ne: null }})
      .populate("User", "-_id")
        .orFail()
        .select("-_id")
        .then((members_request) => {
          resolve(members_request);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
