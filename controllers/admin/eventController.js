const { v4: uuidv4 } = require("uuid");
const Event = require("../../model/Event");
const EventCategory = require("../../model/EventCategory");
const eventHelper = require("../../helpers/eventHelper");
const packageHelper = require("../../helpers/packageHelper");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const {
  paginatedResults,
  registrantsEventCancelMail,
} = require("../../functions/functions");
const {
  zoomRegistration,
  zoomDelete,
  zoomUpdate,
  zoomMeetingUpdate,
  zoomMeeting,
} = require("../../functions/functions");

const {
  apiSuccessResponse,
  apiErrorResponse,
} = require("../../helpers/responseHelper");

const {
  eventSchema,
  eventUpdateSchema,
  eventSpeakerSchema,
} = require("../../validator/validationSchema");
const User = require("../../model/User");
const UserEvent = require("../../model/UserEvent");
const NodeCache = require("node-cache");
const myCache = new NodeCache();

module.exports = {
  create: async (req, res, next) => {
    const data = req.body;

    data.uuid = uuidv4();
    data.startTime = new Date(data.startTime);
    data.endTime = new Date(data.endTime);

    // let startTime = new dayjs(data.startTime).tz("America/Los_Angeles", true);
    // let endTime = new dayjs(data.endTime).tz("America/Los_Angeles", true);

    let startTime = new dayjs(data.startTime);
    let endTime = new dayjs(data.endTime);

    data.duration = endTime.diff(startTime) / 60 / 1000;
    data.image = req.file.path;

    let status = 400;

    await eventSchema
      .validateAsync(data)
      .then(() => {
        packageHelper
          .getPackageByUuid(data.membershipPackage)
          .then((package) => {
            if (data.eventMode == "online") {
              if (data.meetingType == "webinar") {
                zoomRegistration(
                  data.name,
                  data.startTime,
                  data.duration,
                  data.description
                )
                  .then((zoomResponse) => {
                    data.zoomEventId = zoomResponse.message.body.id;
                    data.eventLink = zoomResponse.message.body.join_url;
                    data.registrationLink =
                      zoomResponse.message.body.registration_url;
                    eventSave(data);
                  })
                  .catch((err) => {
                    message = "Error!";

                    res
                      .status(status)
                      .json(apiErrorResponse(status, message, err));
                  });
              } else if (data.meetingType == "meeting") {
                zoomMeeting(data.name, data.startTime, data.duration)
                  .then((zoomResponse) => {
                    data.zoomEventId = zoomResponse.message.body.id;
                    data.eventLink = zoomResponse.message.body.join_url;
                    data.registrationLink = zoomResponse.message.body.start_url;
                    eventSave(data);
                  })
                  .catch((err) => {
                    message = "Error!";

                    res
                      .status(status)
                      .json(apiErrorResponse(status, message, err));
                  });
              } else {
                status = 200;
                message = "Please select a meeting type to create an event. :-";

                res
                  .status(status)
                  .json(apiSuccessResponse(status, message, ""));
              }
            } else {
              eventSave(data);
            }

            function eventSave(data) {
              const event = new Event(data);
              event
                .save()
                .then((eventData) => {
                  status = 200;
                  message = "Success! An event has been created. :-";

                  res
                    .status(status)
                    .json(apiSuccessResponse(status, message, eventData));
                })
                .catch((err) => {
                  message = "Error!";

                  res
                    .status(status)
                    .json(apiErrorResponse(status, message, err.message));
                });
            }
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

  view: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;
    if (myCache.has(`e${uuid}`)) {
      eventData = myCache.get(`e${uuid}`);
      status = 200;
      message = `Success! Details of ${eventData.name} event.`;
      res.status(status).json(apiSuccessResponse(status, message, eventData));
    }
    await eventHelper
      .getEventByUuid(uuid)
      .then((event) => {
        myCache.set(`e${uuid}`, event);
        status = 200;
        message = "Success! Details of event. :-";

        res.status(status).json(apiSuccessResponse(status, message, event));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  searchEvent: async (req, res, next) => {
    const { name } = req.body;

    let status = 400;

    await eventHelper
      .getEventByname(name)
      .then((member) => {
        status = 200;
        message = "Success! Details of " + member.name + ". :-";

        res.status(status).json(apiSuccessResponse(status, message, member));
      })
      .catch((err) => {
        message = "Error!";

        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listUpcoming: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;

    await Event.find({ status: 1, startTime: { $gt: new Date() } })
      .then((events) => {
        const results = paginatedResults(events, page, limit);
        message = "Success! List of all upcoming events. :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No events found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listPast: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;

    await Event.find({
      status: 1,
      $and: [
        { startTime: { $lt: new Date() } },
        { endTime: { $lt: new Date() } },
      ],
    })
      .then((events) => {
        const results = paginatedResults(events, page, limit);
        message = "Success! List of all past events. :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No events found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listCancelled: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;

    await Event.find({ status: 0 })
      .then((events) => {
        const results = paginatedResults(events, page, limit);
        message = "Success! List of all cancelled events. :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No events found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listOngoing: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;

    await Event.find({
      $and: [
        { startTime: { $lte: new Date() } },
        { endTime: { $gte: new Date() } },
      ],
    })
      .then((events) => {
        const results = paginatedResults(events, page, limit);
        message = "Success! List of all ongoing events. :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No events found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listDraft: async (req, res, next) => {
    const { page, limit } = req.query;
    let status = 200;

    await eventHelper
      .getDraftEvents()
      .then((events) => {
        const results = paginatedResults(events, page, limit);
        message = "Success! List of all drafts. :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No Drafts found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  listUserRegistered: async (req, res, next) => {
    const { page, limit } = req.query;
    const { uuid } = req.body;
    let status = 200;

    await eventHelper
      .getRegisteredUsers(uuid)
      .then((events) => {
        const results = paginatedResults(events, page, limit);
        message = "Success! List of all events. :-";

        res.status(status).json(apiSuccessResponse(status, message, results));
      })
      .catch((err) => {
        message = "No events found!";

        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  update: async (req, res, next) => {
    const data = req.body;

    if (req.file) {
      data.image = req.file.path;
    }

    // let startTime = new dayjs(data.startTime).tz("America/Los_Angeles", true);
    // let endTime = new dayjs(data.endTime).tz("America/Los_Angeles", true);

    let startTime = new dayjs(data.startTime);
    let endTime = new dayjs(data.endTime);

    data.startTime = startTime.format();
    data.endTime = endTime.format();

    data.duration = endTime.diff(startTime) / 60 / 1000;

    let status = 400;

    await eventUpdateSchema
      .validateAsync(data)
      .then(() => {
        eventHelper
          .getEventByUuid(data.uuid)
          .then((event) => {
            packageHelper
              .getPackageByUuid(event.membershipPackage)
              .then((package) => {
                if (event.eventMode == "online") {
                  if (event.meetingType == "webinar") {
                    zoomUpdate(
                      event.zoomEventId,
                      data.name,
                      data.startTime,
                      data.duration,
                      data.description
                    )
                      .then(() => {
                        eventUpdate();
                      })
                      .catch((err) => {
                        message = "Error!";
                        res
                          .status(status)
                          .json(apiErrorResponse(status, message, err.message));
                      });
                  } else if (event.meetingType == "meeting") {
                    zoomMeetingUpdate(
                      event.zoomEventId,
                      data.name,
                      data.startTime,
                      data.duration,
                      data.description
                    )
                      .then(() => {
                        eventUpdate();
                      })
                      .catch((err) => {
                        message = "Error!";
                        res
                          .status(status)
                          .json(apiErrorResponse(status, message, err.message));
                      });
                  }
                } else {
                  eventUpdate();
                }
                function eventUpdate() {
                  query = {
                    uuid: data.uuid,
                  };

                  delete data.uuid;
                  delete data._id;

                  set = data;

                  option = {
                    new: true,
                  };

                  Event.findOneAndUpdate(query, set, option)
                    .orFail()
                    .select("-_id")
                    .then((event) => {
                      if (myCache.has(`e${data.uuid}`)) {
                        myCache.del(`e${data.uuid}`);
                      }
                      status = 200;
                      message = "Success! Event updated successfully :-";
                      res
                        .status(status)
                        .json(apiSuccessResponse(status, message, event));
                    })
                    .catch((err) => {
                      message = "Error!";
                      res
                        .status(status)
                        .json(apiErrorResponse(status, message, err.message));
                    });
                }
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

  cancelEvent: async (req, res, next) => {
    const eventUuid = req.body.uuid;
    let status = 400;

    eventHelper
      .getEventByUuid(eventUuid)
      .then((eventData) => {
        Event.updateOne({ uuid: eventUuid }, { $set: { status: 0 } })
          .orFail()
          .then((result) => {
            if (eventData.eventMode == "online") {
              zoomDelete(eventData.zoomEventId, eventData.meetingType)
                .then(() => {
                  if (myCache.has(`e${eventUuid}`)) {
                    myCache.del(`e${eventUuid}`);
                  }
                  status = 200;
                  message = "Success! Event has been cancelled successfully.";
                  res
                    .status(status)
                    .json(apiSuccessResponse(status, message, result));
                })
                .catch((err) => {
                  message = "Error!";
                  res
                    .status(status)
                    .json(apiErrorResponse(status, message, err.message));
                });
            } else {
              UserEvent.find({ eventUuid: eventData.uuid })
                .populate("Users", "_id email")
                .then((userEventData) => {
                  let eventUsers = [];
                  userEventData.forEach((item) => {
                    eventUsers.push(item.Users[0].email);
                  });
                  registrantsEventCancelMail(eventData.name, eventUsers)
                    .then((result) => {
                      status = 200;
                      message = `Event has been cancelled successfully.`;
                      res
                        .status(status)
                        .json(apiSuccessResponse(status, message, result));
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
            }
          })
          .catch((err) => {
            message = `Error! Unable to cancel event.`;
            res
              .status(status)
              .json(apiErrorResponse(status, message, err.message));
          });
      })
      .catch((err) => {
        message = `Error! Unable to cancel event.`;
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  delete: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    await eventHelper
      .getEventByUuid(uuid)
      .then((event) => {
        eventHelper.DeleteEventByUuid(uuid).then((result) => {
          if (event.eventMode == "online") {
            zoomDelete(event.zoomEventId, event.meetingType);
          }
          else {
            UserEvent.find({ eventUuid: event.uuid })
              .populate("Users", "_id email")
              .then((userEventData) => {
                let eventUsers = [];
                userEventData.forEach((item) => {
                  eventUsers.push(item.Users[0].email);
                });
                registrantsEventCancelMail(event.name, eventUsers)
                  .then((result) => {
                    if (myCache.has(`e${eventUuid}`)) {
                      myCache.del(`e${eventUuid}`);
                    }
                    status = 200;
                    message = `Event has been deleted successfully.`;
                    res
                      .status(status)
                      .json(apiSuccessResponse(status, message, result));
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
          }
          status = 200;
          message = "Success! Event has been deleted successfully.";
          res.status(status).json(apiSuccessResponse(status, message, result));
        });
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  createSpeaker: async (req, res, next) => {
    const data = req.body;

    const eventUuid = data.eventUuid;
    const speakerData = {};
    speakerData.name = data.name;
    speakerData.description = data.description;
    speakerData.designation = data.designation;
    speakerData.linkedInProfile = data.linkedInProfile;

    !req.file || req.file == undefined
      ? (data.image = "public/assets/images/palceholder.jpg")
      : (data.image = req.file.path);
    speakerData.image = data.image;

    let status = 400;

    await eventSpeakerSchema
      .validateAsync(data)
      .then(() => {
        Event.updateOne(
          { uuid: eventUuid },
          { $push: { speakers: speakerData } }
        )
          .then(() => {
            if (myCache.has(`e${eventUuid}`)) {
              myCache.del(`e${eventUuid}`);
            }
            status = 200;
            message =
              "Success! Speaker details have been updated in events table.";
            res.status(status).json(apiSuccessResponse(status, message, null));
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

  updateSpeaker: async (req, res, next) => {
    const data = req.body;

    let status = 400;

    await Event.updateOne(
      { uuid: data.eventUuid, "speakers.name": data.name },
      { $set: { "speakers.$": data } }
    )
      .orFail()
      .then(() => {
        if (myCache.has(`e${data.eventUuid}`)) {
          myCache.del(`e${data.eventUuid}`);
        }
        status = 200;
        message = "Speaker has been updated successfully";
        res.status(status).json(apiSuccessResponse(status, message, null));
      })
      .catch((err) => {
        message = "Unable to update speaker.";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  deleteSpeaker: async (req, res, next) => {
    const { eventUuid, name } = req.body;

    let status = 400;

    await Event.updateOne(
      { uuid: eventUuid },
      { $pull: { speakers: { name: name } } }
    )
      .then(() => {
        if (myCache.has(`e${eventUuid}`)) {
          myCache.del(`e${eventUuid}`);
        }
        status = 200;
        message = "Success! Speaker has been deleted successfully";
        res.status(status).json(apiSuccessResponse(status, message, null));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  testUploadVideo: async (req, res, next) => {
    const data = req.file;
    console.log(data);
  },

  createCategory: async (req, res, next) => {
    const data = req.body;

    const eventCategory = new EventCategory(data);

    let status = 400;

    await eventCategory
      .save()
      .then((data) => {
        status = 200;
        message = "Success! Event Category has been created successfully.";
        res.status(status).json(apiSuccessResponse(status, message, data));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },

  listCategory: async (req, res, next) => {
    let status = 200;

    await EventCategory.find()
      .then((data) => {
        message = "Success! Event Category has been created successfully.";
        res.status(status).json(apiSuccessResponse(status, message, data));
      })
      .catch((err) => {
        message = "No event categories found!";
        res.status(status).json(apiSuccessResponse(status, message, []));
      });
  },

  cancel: async (req, res, next) => {
    const { uuid } = req.body;

    let status = 400;

    await Event.updateOne({ uuid: uuid }, { $set: { status: "cancel" } })
      .then(() => {
        if (myCache.has(`e${uuid}`)) {
          myCache.del(`e${uuid}`);
        }
        status = 200;
        message = "Success! The event has been successfully cancelled.";
        res.status(status).json(apiSuccessResponse(status, message, null));
      })
      .catch((err) => {
        message = "Error!";
        res.status(status).json(apiErrorResponse(status, message, err.message));
      });
  },
};
