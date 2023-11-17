const HealthHero = require("../model/HealthHero");
const UserHealthHero = require("../model/UserHealthHero");

module.exports = {
  getHealthHeroByUuid: (uuid) => {
    return new Promise((resolve, reject) => {
      HealthHero.findOne({ uuid: uuid })
        .populate("User", "-_id name city country")
        .populate("packages", "-_id ")
        .orFail()
        .select(
          "-_id"
        )
        .then((healthHero) => {
          resolve(healthHero);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getHealthHeroByUuidForUser: (uuid) => {
    return new Promise((resolve, reject) => {
      HealthHero.findOne({ uuid: uuid })
        .populate("User", "-_id name city country")
        .populate("packages", "-_id")
        .orFail()
        .select(
          "-_id -uuid -status"
        )
        .then((healthHero) => {
          resolve(healthHero);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getHealthHeroByName: (name) => {
    return new Promise((resolve, reject) => {
      HealthHero.findOne({ name: name })
        .orFail()
        .select("-_id")
        .then((healthHero) => {
          resolve(healthHero);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  searchHealthHeroByName: (name) => {
    return new Promise((resolve, reject) => {
      HealthHero.find({ name: new RegExp(name, "i") })
        .populate("User", "-_id name city country")
        .populate("packages", "-_id ")
        .orFail()
        .select("-_id")
        .then((healthHeroes) => {
          resolve(healthHeroes);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getHealthHeroesForAdmin: () => {
    return new Promise((resolve, reject) => {
      HealthHero.find().sort({ isActive: -1, createdAt: -1 })
        .populate("User", "-_id name email city country")
        .populate("packages", "-_id ")
        .orFail()
        .select("-_id")
        .then((healthHero) => {
          resolve(healthHero);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getHealthHeroesForUser: () => {
    return new Promise((resolve, reject) => {
      HealthHero.find({ isActive: true }).sort({ name: 1 })
        .populate("User", "-_id name city country")
        .populate("packages", "-_id ")
        .orFail()
        .select("-_id")
        .then((healthHero) => {
          resolve(healthHero);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getHealthHeroByStatus: (status) => {
    return new Promise((resolve, reject) => {
      HealthHero.find({ status: status }).populate("packages", "-_id ")
        .orFail()
        .select("-_id -uuid -preferrableDays -mentoringHours -reasonForMentoring")
        .then((healthHero) => {
          resolve(healthHero);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getRegisteredHealthHero: (uuid) => {
    return new Promise((resolve, reject) => {
      UserHealthHero.find({ userUuid: uuid })
        .orFail()
        .select("-_id -uuid -healthHeroUuid -userUuid -mobile -emailId -consultation -existentialDiseases -otherProblems")
        .then((healthHero) => {
          resolve(healthHero);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};
