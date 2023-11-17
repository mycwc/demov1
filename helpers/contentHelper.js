const ContentLibrary = require("../model/ContentLibrary");

module.exports = {
  getContentByUuid: (uuid, adminUuid = null) => {
    return new Promise((resolve, reject) => {
      let query = (adminUuid == null) ? { uuid: uuid, isActive: true } : { uuid: uuid };
      ContentLibrary.findOne(query)
        .orFail()
        .select("-_id")
        .then((content) => {
          resolve(content);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getContentByTitle: (title) => {
    return new Promise((resolve, reject) => {
      ContentLibrary.findOne({ title: title })
        .orFail()
        .select("-_id")
        .then((content) => {
          resolve(content);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getContentLibrariesMedia: () => {
    return new Promise((resolve, reject) => {
      ContentLibrary.find({ type: { $in: ["video", "audio"] } }).sort({ title: 1, isActive: -1 })
        .orFail()
        .select("-_id -video")
        .then((contents) => {
          resolve(contents);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getContentDocumentLibraries: () => {
    return new Promise((resolve, reject) => {
      ContentLibrary.find({ type: { $in: ["pdf", "pptx", "image"] } }).sort({ title: 1, isActive: -1 })
        .orFail()
        .select("-_id -video")
        .then((contents) => {
          resolve(contents);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getDocumentContentLibrariesDrafts: (type) => {
    return new Promise((resolve, reject) => {
      ContentLibrary.find({ type: { $in: ["pdf", "pptx", "image"] }, isActive: true, isDraft: true }).sort({ title: 1, isActive: -1 })
        .orFail()
        .select("-_id -video")
        .then((contents) => {
          resolve(contents);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  DeleteEventByUuid: (uuid) => {
    return new Promise((resolve, reject) => {
      ContentLibrary.deleteOne({ uuid: uuid })
        .then((content) => {
          resolve(content);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  getFilteredContent: (text) => {
    let regexObj = new RegExp(text, "i");
    return new Promise((resolve, reject) => {

      ContentLibrary.find({
        $or: [{ category: { $in: [regexObj] } }, { tags: { $in: [regexObj] } }, { speakerName: { $in: [regexObj] } }, { title: [regexObj] }]
      }).populate("packages", "-_id")
        .orFail()
        .select("-_id")
        .then((contents) => {
          resolve(contents);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
