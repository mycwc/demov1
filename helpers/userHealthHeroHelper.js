const UserHealthHero = require("../model/UserHealthHero");

module.exports = {
    getPendingUserHealthHeroesRequest: () => {
    return new Promise((resolve, reject) => {
      UserHealthHero.find({ isActive: null }).populate("packages", "-_id ")
        .orFail()
        .select("-_id -uuid")
        .then((userHealthHero) => {
          resolve(userHealthHero);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
