const { v4: uuidv4 } = require("uuid");

const Admin = require("../model/Admin");
const authHelper = require("../helpers/authHelper");

module.exports = {
  adminSeeder: async (req, res, next) => {
    const hashedPassword = authHelper.setPassword("lY49yKmrQY9mnLLf");

    const admin = new Admin({
      uuid: uuidv4(),
      name: "Kevin Pearson",
      countryCode: 91,
      phone: "7976063959",
      email: "developer@lancersglobal.com",
      password: hashedPassword,
    });

    await Admin.find().then((admins) => {
      if (admins.length >= 1) {
        next;
      } else {
        admin
          .save()
          .then((user) => {
            console.log("A default admin has been created");
          })
          .catch((err) => {
            console.log(err.message);
          });
      }
    });
  },
};
