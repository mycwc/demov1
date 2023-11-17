const SupportGroup = require("../model/SupportGroup");
const User = require("../model/User");

module.exports = {
  getSupportGroupByUuid: (uuid) => {
    return new Promise((resolve, reject) => {
      SupportGroup.findOne({ uuid: uuid, isActive: true }).populate("packages", "-_id ")
        .orFail()
        .select("-_id -isActive -groupCategory -country -state")
        .then((supportGroup) => {
          resolve(supportGroup);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getGroupMembers: (uuid) => {
    return new Promise((resolve, reject) => {
      SupportGroup.findOne({ uuid: uuid, isActive: true })
        .orFail()
        .then((supportGroup) => { 
          User.find({ uuid: { $in: supportGroup.members }})
          .then((userDetails) => {
            resolve(userDetails)
          })
          .catch((err) => {
            reject(err)
          })
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getSupportGroupsByLike: (name) => {
    return new Promise((resolve, reject) => {
      SupportGroup.find({ name: new RegExp(name, "i"), isActive: true }).populate("packages", "-_id ")
        .orFail()
        .select()
        .then((supportGroup) => {
          resolve(supportGroup);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  getSupportGroupsAdmin: () => {
    return new Promise((resolve, reject) => {
      SupportGroup.find().sort({isActive: -1, createdAt: -1}).populate("packages", "-_id ")
        .orFail()
        .select("-_id ")
        .then((supportGroup) => {
          resolve(supportGroup);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getSupportGroupsUser: () => {
    return new Promise((resolve, reject) => {
      SupportGroup.find({ isActive: true }).sort({createdAt: -1}).populate("packages", "-_id ")
        .orFail()
        .select("-_id ")
        .then((supportGroup) => {
          resolve(supportGroup);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getPendingSupportGroups: () => {
    return new Promise((resolve, reject) => {
      SupportGroup.find({ isActive: false }).sort({name: 1}).populate("packages", "-_id ")
        .orFail()
        .select("-_id -uuid -description -groupLeader -numberOfMembers -state -city -coverImage")
        .then((supportGroup) => {
          resolve(supportGroup);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
