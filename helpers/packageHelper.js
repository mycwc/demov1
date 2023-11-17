const Package = require("../model/Package");

module.exports = {
  getPackageByUuid: (uuid) => {
    return new Promise((resolve, reject) => {
      Package.findOne({ uuid: uuid }).populate("packages", "-_id ")
        .orFail()
        .select("-_id")
        .then((package) => {
          resolve(package);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getPackageByName: (name) => {
    return new Promise((resolve, reject) => {
      Package.findOne({ name: name, isActive: true })
        .orFail()
        .select("-_id")
        .then((package) => {
          resolve(package);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getListOfPackages: () => {
    return new Promise((resolve, reject) => {
      Package.find({ isActive: true })
        .orFail()
        .select(
          "-_id"
        )
        .sort("annualCost")
        .then((packages) => {
          resolve(packages);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
