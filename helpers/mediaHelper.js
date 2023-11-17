const path = require("path");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const fs = require("fs");
const s3 = new AWS.S3({
  accessKeyId: process.env.ID,
  secretAccessKey: process.env.SECRET,
});

const { generateSlug } = require("../helpers/generalHelper");

module.exports = {
  uploadSingleMedia: (destination) => {
    var storage = multer.diskStorage({
      destination: (req, file, cb) => {
        fs.mkdirSync(destination, { recursive: true });
        cb(null, destination);
      },
      filename: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
          return cb(new Error("Please upload an image"));
        }
        cb(
          null,
          file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
      },
    });

    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 2000000, // 10000000 Bytes = 2 MB
      },
    });
    return upload.single("image");
  },

  uploadLogo: (destination) => {
    var storage = multer.diskStorage({
      destination: (req, file, cb) => {
        fs.mkdirSync(destination, { recursive: true });
        cb(null, destination);
      },
      filename: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
          return cb(new Error("Please upload an image"));
        }
        cb(
          null,
          file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
      },
    });

    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 2000000, // 10000000 Bytes = 2 MB
      },
    });
    return upload.single("logo");
  },

  uploadSliderImage: (destination) => {
    var storage = multer.diskStorage({
      destination: (req, file, cb) => {
        fs.mkdirSync(destination, { recursive: true });
        cb(null, destination);
      },
      filename: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
          return cb(new Error("Please upload an image"));
        }
        cb(
          null,
          file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
      },
    });

    const upload = multer({
      storage: storage,
      limits: {
        fileSize: 1000000,
      },
    });
    return upload.single("image");
  },

  uploadSingleDocument: (destination) => {
    var storage = multer.diskStorage({
      destination: (req, file, cb) => {
        fs.mkdirSync(destination, { recursive: true });
        cb(null, destination);
      },
      filename: (req, file, cb) => {
        if (!file.originalname.match(/\.(pdf|docx|csv|ppt)$/)) {
          return cb(new Error("Please upload a document"));
        }
        cb(
          null,
          file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
      },
    });

    const upload = multer({ storage: storage });
    return upload.single("upload");
  },

  uploadMedia: (destination) => {
    var storage = multer.diskStorage({
      destination: (req, file, cb) => {
        fs.mkdirSync(destination, { recursive: true });
        cb(null, destination);
      },
      filename: (req, file, cb) => {
        if (!file.originalname.match(/\.(mp4|MPEG-4|mkv)$/)) {
          return cb(new Error("Please upload a video"));
        } else {
          cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
          );
        }
      },
    });

    const upload = multer({ storage: storage });
    return upload.single("upload");
  },

  uploadPodcast: (destination) => {
    var storage = multer.diskStorage({
      destination: (req, file, cb) => {
        fs.mkdirSync(destination, { recursive: true });
        cb(null, destination);
      },
      filename: (req, file, cb) => {
        if (
          !file.originalname.match(
            /\.(mp3|aac|ogg|flac|alac|wav|aiff|dsd|pcm)$/
          )
        ) {
          return cb(new Error("Please upload an audio"));
        } else {
          cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
          );
        }
      },
    });

    const upload = multer({ storage: storage });
    return upload.single("upload");
  },

  uploadMultipleMedia: () => {
    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: process.env.MULTIMEDIA_DOCS_BUCKET,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          cb(null, file.originalname);
        },
      }),
    });
    var uploadMultiple = upload.fields([
      { name: "image", maxCount: 1 },
      { name: "upload", maxCount: 1 },
    ]);
    return uploadMultiple;
  },

  uploadMultipleHealthHeroMedia: () => {
    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: process.env.MULTIMEDIA_DOCS_BUCKET,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          cb(null, file.originalname);
        },
      }),
    });
    var uploadMultiple = upload.fields([
      { name: "uploadStory", maxCount: 1 },
      { name: "uploadDocuments", maxCount: 1 },
      { name: "signature", maxCount: 1 },
    ]);
    return uploadMultiple;
  },

  uploadContentMediaImage: () => {
    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: process.env.MULTIMEDIA_VIDEO_BUCKET,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          console.log(file);
          cb(null, file.originalname);
        },
      }),
    });
    var uploadMultiple = upload.fields([{ name: "image", maxCount: 1 }]);
    return uploadMultiple;
  },

  uploadContentMediaVideo: () => {
    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: process.env.MULTIMEDIA_VIDEO_BUCKET,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          cb(null, file.originalname);
        },
      }),
    });
    var uploadMultiple = upload.fields([{ name: "upload", maxCount: 1 }]);
    return uploadMultiple;
  },

  uploadContentPodcastImage: () => {
    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: process.env.MULTIMEDIA_AUDIO_BUCKET,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          cb(null, file.originalname);
        },
      }),
    });
    var uploadMultiple = upload.fields([{ name: "image", maxCount: 1 }]);
    return uploadMultiple;
  },

  uploadSpotlightVideo: () => {
    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: process.env.MULTIMEDIA_SPOTLIGHT_BUCKET,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
          );
        },
      }),
    });
    var uploadMultiple = upload.fields([{ name: "video", maxCount: 1 }]);
    return uploadMultiple;
  },

  uploadContentPodcastAudio: () => {
    var upload = multer({
      storage: multerS3({
        s3: s3,
        bucket: process.env.MULTIMEDIA_AUDIO_BUCKET,
        acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
          cb(null, file.originalname);
        },
      }),
    });
    var uploadMultiple = upload.fields([{ name: "upload", maxCount: 1 }]);
    return uploadMultiple;
  },

  uploadContentMediaDocumentImage: () => {
    try {
      var upload = multer({
        storage: multerS3({
          s3: s3,
          bucket: process.env.MULTIMEDIA_DOCS_BUCKET,
          contentType: multerS3.AUTO_CONTENT_TYPE,
          acl: "public-read",
          metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
          },
          key: function (req, file, cb) {
            // if(!(file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png")) {
            //   return cb(new Error('Please upload an image'))
            // }
            cb(null, file.originalname);
          },
        }),
      });
      var uploadMultiple = upload.fields([{ name: "image", maxCount: 1 }]);
      return uploadMultiple;
    } catch (err) {
      console.log(err);
    }
  },
};
