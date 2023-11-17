const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);

module.exports = {
  generateToken: (id) => {
    payload = {
      id: id,
    };

    options = {
      expiresIn: "7d",
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, options);
    return token;
  },

  setPassword: (password) => {
    return bcrypt.hashSync(password, salt);
  },

  validatePassword: (requestPass, dbPass) => {
    return bcrypt.compareSync(requestPass, dbPass);
  },
};
