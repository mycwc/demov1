const { v4: uuidv4 } = require("uuid");
const slug = require("slug");

module.exports = {
  generateUuid: () => {
    return uuidv4();
  },

  generateSlug: (name) => {
    return slug(name);
  },
};
