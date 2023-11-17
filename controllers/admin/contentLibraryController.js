const { v4: uuidv4 } = require("uuid");
const ContentLibrary = require("../../model/ContentLibrary");
const contentHelper = require("../../helpers/contentHelper");
const packageHelper = require("../../helpers/packageHelper");
const {
  mediaScenario1Schema,
  documentScenarioSchema,
  documentScenario2Schema,
} = require("../../validator/validationSchema");

const NodeCache = require("node-cache");
const myCache = new NodeCache();

const { paginatedResults } = require("../../functions/functions");

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");

module.exports = {
  createMedia: async (req, res, next) => {
    const data = req.body;

    data.uuid = uuidv4();
    data.coverImage = req.files.image[0].location;

    data.category && data.category != [] && data.category != ""
      ? (data.category = data.category.split(","))
      : delete data.category;

    data.speakerName && data.speakerName != [] && data.speakerName != ""
      ? (data.speakerName = data.speakerName.split(","))
      : delete data.speakerName;

    data.tags && data.tags != [] && data.tags != ""
      ? (data.tags = data.tags.split(","))
      : delete data.tags;

    data.metaTags && data.metaTags != [] && data.metaTags != ""
      ? (data.metaTags = data.metaTags.split(","))
      : delete data.metaTags;

    let status = 400;

    if (data.category && data.category != [] && data.category != "") {
      data.category = data.category.map(function (el) {
        return el.trim();
      });
    }

    if (data.speakerName && data.speakerName != [] && data.speakerName != "") {
      data.speakerName = data.speakerName.map(function (el) {
        return el.trim();
      });
    }

    if (data.tags && data.tags != [] && data.tags != "") {
      data.tags = data.tags.map(function (el) {
        return el.trim();
      });
    }

    if (data.metaTags && data.metaTags != [] && data.metaTags != "") {
      data.metaTags = data.metaTags.map(function (el) {
        return el.trim();
      });
    }

    await mediaScenario1Schema
      .validateAsync(data)
      .then(() => {
        const contentLibrary = new ContentLibrary(data);

        packageHelper
          .getPackageByUuid(data.membershipType)
          .then(() => {
            contentLibrary
              .save()
              .then((contentData) => {
                if (myCache.has('allVideos')) {
                  myCache.del('allVideos');
                }
                status = 200;
                message = "Content Library created successfully.";
                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, contentData));
              })
              .catch((err) => {
                message = "Unable to create content media.";

                res
                  .status(status)
                  .json(apiErrorResponse(status, message, err.message));
              });
          })
          .catch((err) => {
            message = "No package found.";

            res
              .status(status)
              .json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Validation schema error.";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
      });
  },

  saveMedia: async (req, res, next) => {
    const data = req.body;
    let upload = "";

    data.uploadDate = new Date();

    let status = 400;

    if (req.files.upload) {
      data.upload = req.files.upload[0].location;
    } else {
      delete data.upload;
    }

    data.category && data.category != [] && data.category != ""
      ? (data.category = data.category.split(","))
      : delete data.category;

    data.tags && data.tags != [] && data.tags != ""
      ? (data.tags = data.tags.split(","))
      : delete data.tags;

    data.metaTags && data.metaTags != [] && data.metaTags != ""
      ? (data.metaTags = data.metaTags.split(","))
      : delete data.metaTags;

    data.speakerName && data.speakerName != [] && data.speakerName != ""
      ? (data.speakerName = data.speakerName.split(","))
      : delete data.speakerName;

    query = {
      uuid: data.uuid,
    };

    if (data.category && data.category != [] && data.category != "") {
      data.category = data.category.map(function (el) {
        return el.trim();
      });
    }

    if (data.speakerName && data.speakerName != [] && data.speakerName != "") {
      data.speakerName = data.speakerName.map(function (el) {
        return el.trim();
      });
    }

    if (data.tags && data.tags != [] && data.tags != "") {
      data.tags = data.tags.map(function (el) {
        return el.trim();
      });
    }

    if (data.metaTags && data.metaTags != [] && data.metaTags != "") {
      data.metaTags = data.metaTags.map(function (el) {
        return el.trim();
      });
    }

    delete data.uuid;
    delete data._id;

    set = data;

    option = {
      new: true,
    };

    ContentLibrary.findOneAndUpdate(query, set, option)
      .orFail()
      .select("-_id -uuid")
      .then((content) => {
        if (myCache.has('allVideos')) {
          myCache.del('allVideos');
        }
        status = 200;
        message = "Success! Content Library updated successfully :-";
        res.status(status).json(apiSuccessResponse(status, message, content));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  updateContentDocument: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    data.category && data.category != [] && data.category != ""
      ? (data.category = data.category.split(","))
      : delete data.category;

    data.tags && data.tags != [] && data.tags != ""
      ? (data.tags = data.tags.split(","))
      : delete data.tags;

    data.metaTags && data.metaTags != [] && data.metaTags != ""
      ? (data.metaTags = data.metaTags.split(","))
      : delete data.metaTags;

    if (req.files.image) {
      data.coverImage = req.files.image[0].location;
    }

    if (data.category && data.category != [] && data.category != "") {
      data.category = data.category.map(function (el) {
        return el.trim();
      });
    }

    if (data.tags && data.tags != [] && data.tags != "") {
      data.tags = data.tags.map(function (el) {
        return el.trim();
      });
    }

    if (data.metaTags && data.metaTags != [] && data.metaTags != "") {
      data.metaTags = data.metaTags.map(function (el) {
        return el.trim();
      });
    }

    query = {
      uuid: data.uuid,
    };

    delete data.uuid;
    delete data._id;

    set = data;

    option = {
      new: true,
    };

    ContentLibrary.findOneAndUpdate(query, set, option)
      .orFail()
      .select("-_id")
      .then((content) => {
        status = 200;
        message = "Success! Content Library updated successfully :-";
        res.status(status).json(apiSuccessResponse(status, message, content));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  updateMedia: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    data.category && data.category != [] && data.category != ""
      ? (data.category = data.category.split(","))
      : delete data.category;

    data.tags && data.tags != [] && data.tags != ""
      ? (data.tags = data.tags.split(","))
      : delete data.tags;

    data.metaTags && data.metaTags != [] && data.metaTags != ""
      ? (data.metaTags = data.metaTags.split(","))
      : delete data.metaTags;

    data.speakerName && data.speakerName != [] && data.speakerName != ""
      ? (data.speakerName = data.speakerName.split(","))
      : delete data.speakerName;

    if (req.files.image) {
      data.coverImage = req.files.image[0].location;
    }
    if (data.category && data.category != [] && data.category != "") {
      data.category = data.category.map(function (el) {
        return el.trim();
      });
    }

    if (data.speakerName && data.speakerName != [] && data.speakerName != "") {
      data.speakerName = data.speakerName.map(function (el) {
        return el.trim();
      });
    }

    if (data.tags && data.tags != [] && data.tags != "") {
      data.tags = data.tags.map(function (el) {
        return el.trim();
      });
    }

    if (data.metaTags && data.metaTags != [] && data.metaTags != "") {
      data.metaTags = data.metaTags.map(function (el) {
        return el.trim();
      });
    }
    data.uploadDate = new Date();

    await packageHelper
      .getPackageByUuid(data.membershipType)
      .then(() => {
        query = {
          uuid: data.uuid,
          type: "video",
        };

        delete data.uuid;
        delete data._id;

        set = data;

        option = {
          new: true,
        };

        ContentLibrary.findOneAndUpdate(query, set, option)
          .orFail()
          .select("-_id")
          .then((content) => {
            status = 200;
            message = "Success! Content Library media updated successfully :-";
            res
              .status(status)
              .json(apiSuccessResponse(status, message, content));
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

  createPodcast: async (req, res, next) => {
    const data = req.body;

    data.uuid = uuidv4();
    data.coverImage = req.files.image[0].location;

    data.category && data.category != [] && data.category != ""
      ? (data.category = data.category.split(","))
      : delete data.category;

    data.tags && data.tags != [] && data.tags != ""
      ? (data.tags = data.tags.split(","))
      : delete data.tags;

    data.metaTags && data.metaTags != [] && data.metaTags != ""
      ? (data.metaTags = data.metaTags.split(","))
      : delete data.metaTags;

    let status = 400;

    if (data.category && data.category != [] && data.category != "") {
      data.category = data.category.map(function (el) {
        return el.trim();
      });
    }

    if (data.tags && data.tags != [] && data.tags != "") {
      data.tags = data.tags.map(function (el) {
        return el.trim();
      });
    }

    if (data.metaTags && data.metaTags != [] && data.metaTags != "") {
      data.metaTags = data.metaTags.map(function (el) {
        return el.trim();
      });
    }

    await mediaScenario1Schema
      .validateAsync(data)
      .then(() => {
        const contentLibrary = new ContentLibrary(data);

        packageHelper
          .getPackageByUuid(data.membershipType)
          .then(() => {
            contentLibrary
              .save()
              .then((contentData) => {
                status = 200;
                message = "Success! Podcast created. :-";

                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, contentData));
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
      })
      .catch((err) => {
        message = "Error! Validation Error!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
      });
  },

  savePodcast: async (req, res, next) => {
    const data = req.body;
    const upload = req.files.upload[0].location;
    data.uploadDate = new Date();

    let status = 400;

    data.upload = upload;
    query = {
      uuid: data.uuid,
    };

    delete data.uuid;
    delete data._id;

    set = data;

    option = {
      new: true,
    };

    ContentLibrary.findOneAndUpdate(query, set, option)
      .orFail()
      .select("-_id -uuid")
      .then((content) => {
        status = 200;
        message = "Success! Content Library updated successfully :-";
        res.status(status).json(apiSuccessResponse(status, message, content));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  updatePodcastScenario1: async (req, res, next) => {
    const data = req.body;

    if (req.files.image) {
      data.coverImage = req.files.image[0].location;
    }

    data.category && data.category != [] && data.category != ""
      ? (data.category = data.category.split(","))
      : delete data.category;

    data.tags && data.tags != [] && data.tags != ""
      ? (data.tags = data.tags.split(","))
      : delete data.tags;

    data.metaTags && data.metaTags != [] && data.metaTags != ""
      ? (data.metaTags = data.metaTags.split(","))
      : delete data.metaTags;

    let status = 400;

    if (data.category && data.category != [] && data.category != "") {
      data.category = data.category.map(function (el) {
        return el.trim();
      });
    }

    if (data.tags && data.tags != [] && data.tags != "") {
      data.tags = data.tags.map(function (el) {
        return el.trim();
      });
    }

    if (data.metaTags && data.metaTags != [] && data.metaTags != "") {
      data.metaTags = data.metaTags.map(function (el) {
        return el.trim();
      });
    }

    query = {
      uuid: data.uuid,
    };

    delete data.uuid;
    delete data._id;

    set = data;

    option = {
      new: true,
    };

    ContentLibrary.findOneAndUpdate(query, set, option)
      .orFail()
      .select("-_id")
      .then((content) => {
        status = 200;
        message = "Success! Content Library updated successfully :-";
        res.status(status).json(apiSuccessResponse(status, message, content));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  view: async (req, res, next) => {
    const { uuid } = req.body;
    const adminUuid = req.user.uuid;

    let status = 400;

    await contentHelper
      .getContentByUuid(uuid, adminUuid)
      .then((contents) => {
        status = 200;
        message = "Success! Details of Content Library :-";
        res.status(status).json(apiSuccessResponse(status, message, contents));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listMedia: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;

    await contentHelper
      .getContentLibrariesMedia()
      .then((contents) => {
        const results = paginatedResults(contents, page, limit);
        message = "Success! List of Content Libraries :-";
        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No Content Libraries found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  delete: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    await contentHelper
      .DeleteEventByUuid(uuid)
      .then((contents) => {
        status = 200;
        message = "Success! Deleted Content Library successfully :-";
        res.status(status).json(apiSuccessResponse(status, message, contents));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  createDocument: async (req, res, next) => {
    const data = req.body;

    const image = req.files.image[0].location;
    const upload = req.files.upload[0].location;

    data.uuid = uuidv4();

    let status = 400;

    data.coverImage = image;
    data.upload = upload;

    data.category && data.category != [] && data.category != ""
      ? (data.category = data.category.split(","))
      : delete data.category;

    data.tags && data.tags != [] && data.tags != ""
      ? (data.tags = data.tags.split(","))
      : delete data.tags;

    data.metaTags && data.metaTags != [] && data.metaTags != ""
      ? (data.metaTags = data.metaTags.split(","))
      : delete data.metaTags;

    if (data.category && data.category != [] && data.category != "") {
      data.category = data.category.map(function (el) {
        return el.trim();
      });
    }

    if (data.tags && data.tags != [] && data.tags != "") {
      data.tags = data.tags.map(function (el) {
        return el.trim();
      });
    }

    if (data.metaTags && data.metaTags != [] && data.metaTags != "") {
      data.metaTags = data.metaTags.map(function (el) {
        return el.trim();
      });
    }

    documentScenarioSchema.validateAsync(data).then(() => {
      data.uploadDate = new Date();
      const contentLibrary = new ContentLibrary(data);

      packageHelper
        .getPackageByUuid(data.membershipType)
        .then(() => {
          contentLibrary
            .save()
            .then((contentData) => {
              status = 200;
              message = "Success! Content Library created. :-";

              res
                .status(status)
                .json(apiSuccessResponse(status, message, contentData));
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
    });
  },

  saveDocument: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    await documentScenario2Schema
      .validateAsync(data)
      .then(() => {
        query = {
          uuid: data.uuid,
        };

        delete data.uuid;
        delete data._id;

        set = data;

        option = {
          new: true,
        };

        ContentLibrary.findOneAndUpdate(query, set, option)
          .orFail()
          .select("-_id -uuid")
          .then((content) => {
            status = 200;
            message = "Success! Content Library updated successfully :-";
            res
              .status(status)
              .json(apiSuccessResponse(status, message, content));
          })
          .catch((err) => {
            message = "Error!";
            res
              .status(status)
              .json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = "Error! Validation Error!";
        res
          .status(status)
          .json(apiSuccessResponse(status, message, err.message));
      });
  },

  viewDocument: async (req, res, next) => {
    const data = req.body;
    const user = req.user;
    let status = 200;

    await contentHelper
      .getContentByUuid(data.uuid, user.uuid)
      .then((result) => {
        message = "Success! Details of Content Libraries Document :-";
        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "No Documents found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listDocumentDrafts: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;
    const type = "document";

    await contentHelper
      .getDocumentContentLibrariesDrafts(type)
      .then((contents) => {
        const results = paginatedResults(contents, page, limit);
        message = "Success! List of Content Libraries Documents :-";
        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No Documents found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listDocument: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;

    await contentHelper
      .getContentDocumentLibraries()
      .then((contents) => {
        const results = paginatedResults(contents, page, limit);
        message = "Success! List of Content Libraries Documents :-";
        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No Documents found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  searchContent: async (req, res, next) => {
    const { title } = req.body;

    let status = 400;

    await contentHelper
      .getContentByTitle(title)
      .then((content) => {
        status = 200;
        message = "Success! Details of " + content.title + ". :-";

        res.status(status).json(apiSuccessResponse(status, message, content));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  deleteDocument: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    await contentHelper
      .DeleteEventByUuid(uuid)
      .then((contents) => {
        status = 200;
        message = "Success! Deleted Content Library successfully :-";
        res.status(status).json(apiSuccessResponse(status, message, contents));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  statusUpdate: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    ContentLibrary.updateOne(
      { uuid: data.uuid },
      { $set: { isActive: data.isActive } }
    )
      .then((result) => {
        status = 200;
        message = "Success! Content Library status updated successfully.";

        res.status(status).json(apiSuccessResponse(status, message, result));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  removeSpaces: async (req, res, next) => {
    let status = 400;
    await ContentLibrary.find()
      .then((contentLibraries) => {
        contentLibraries.forEach(element => {
          let newTags = [];
          let allTags = element.tags;
          if (allTags.length > 0) {
            allTags.forEach(item => {
              newItem = item.trim();
              if (newItem.length >= 1) {
                newTags.push(newItem);
              }
            });
          }

          let newMetaTags = [];
          let allMetaTags = element.metaTags;
          if (allMetaTags.length > 0) {
            allMetaTags.forEach(item => {
              newItem = item.trim();
              if (newItem.length >= 1) {
                newMetaTags.push(newItem);
              }
            });
          }

          let newSpeakerNames = [];
          let allSpeakerNames = element.metaTags;
          if (allSpeakerNames.length > 0) {
            allSpeakerNames.forEach(item => {
              newItem = item.trim();
              if (newItem.length >= 1) {
                newSpeakerNames.push(newItem);
              }
            });
          }

          ContentLibrary.findOneAndUpdate({ uuid: element.uuid }, { $set: { tags: newTags, metaTags: newMetaTags, speakerName: newSpeakerNames } }).orFail().then
            (() => {
              console.log('Updated');
            });
        });
      });
    status = 200;
    message = "Success! Updated list of Multimedia";
    res.status(status).json(apiSuccessResponse(status, message, []));
  }
};
