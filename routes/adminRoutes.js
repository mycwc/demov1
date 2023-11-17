const express = require("express");
const router = express.Router();
const mediaHelper = require("../helpers/mediaHelper");
const adminController = require("../controllers/admin/adminController");
const eventController = require("../controllers/admin/eventController");
const faqController = require("../controllers/admin/faqController");
const packageController = require("../controllers/admin/packageController");
const contentLibraryController = require("../controllers/admin/contentLibraryController");
const supportGroupController = require("../controllers/admin/supportGroupController");
const healthHeroController = require("../controllers/admin/healthHeroController");
const userHealthHeroController = require("../controllers/admin/userHealthHeroController");
const memberController = require("../controllers/admin/memberController");
const voucherController = require("../controllers/admin/voucherController");
const userManagementController = require("../controllers/admin/userManagementController");
const sliderController = require("../controllers/admin/sliderController");
const vendorController = require("../controllers/vendor/vendorController");
const businessPartnerController = require("../controllers/admin/businessPartnerController");
const eventVoucherController = require("../controllers/admin/eventVoucherController");

// Admin Profile
router.post("/profile/view", adminController.viewProfile);
router.patch("/profile/update", adminController.updateProfile);

// Business
router.post(
  "/business/create",
  mediaHelper.uploadLogo("public/images/businessPartner"),
  businessPartnerController.createBusiness
);

router.patch(
  "/business/update",
  mediaHelper.uploadLogo("public/images/businessPartner"),
  businessPartnerController.updateBusiness
);

router.post("/business/view", businessPartnerController.viewBusiness);
router.get("/business/list", businessPartnerController.listBusiness);
router.delete("/business/delete", businessPartnerController.deleteBusiness);

// Business Partner Request
router.post(
  "/business/partner/request/view",
  businessPartnerController.viewPartnerRequest
);
router.get(
  "/business/partner/request/list",
  businessPartnerController.listPartnerRequest
);

// User Management
router.post("/userManagement/create", userManagementController.create);
router.post("/userManagement/view", userManagementController.view);
router.get("/userManagement/list", userManagementController.list);
router.patch("/userManagement/update", userManagementController.update);

router.post(
  "/package/create",
  mediaHelper.uploadSingleMedia("public/images/packages"),
  packageController.create
);

// Payment
router.get("/payment/list", adminController.listPayment);
router.get("/all/payment/list", adminController.listAllPayment);

// Package Routes
router.post("/package/view", packageController.view);
router.get("/package/list", packageController.list);
router.patch(
  "/package/update",
  mediaHelper.uploadSingleMedia("public/images/packages"),
  packageController.update
);
router.patch("/package/status/update", packageController.toggleStatus);
router.post("/package/search", packageController.searchPackage);

// Event Routes
router.post(
  "/event/create",
  mediaHelper.uploadSingleMedia("public/images/events"),
  eventController.create
);
router.post("/event/search", eventController.searchEvent);
router.post("/event/view", eventController.view);
router.get("/event/listUpcoming", eventController.listUpcoming);
router.get("/event/listPast", eventController.listPast);
router.get("/event/listOngoing", eventController.listOngoing);
router.get("/event/listCancelled", eventController.listCancelled);
router.get("/event/draft/list", eventController.listDraft);
router.patch(
  "/event/update",
  mediaHelper.uploadSingleMedia("public/images/packages"),
  eventController.update
);
router.patch("/event/cancel", eventController.cancelEvent);
router.delete("/event/delete", eventController.delete);
router.post("/event/user/registered/list", eventController.listUserRegistered);

// Event Speaker Routes
router.post(
  "/event/speaker/create",
  mediaHelper.uploadSingleMedia("public/images/events"),
  eventController.createSpeaker
);

router.patch(
  "/event/speaker/update",
  mediaHelper.uploadSingleMedia("public/images/events"),
  eventController.updateSpeaker
);
router.delete("/event/speaker/delete", eventController.deleteSpeaker);

// Content Library Video
router.post(
  "/contentLibrary/video/createMedia",
  mediaHelper.uploadContentMediaImage(),
  contentLibraryController.createMedia
);
router.patch(
  "/contentLibrary/video/saveMedia",
  mediaHelper.uploadContentMediaVideo(),
  contentLibraryController.saveMedia
);
router.post(
  "/contentLibrary/podcast/create",
  mediaHelper.uploadContentPodcastImage(),
  contentLibraryController.createPodcast
);
router.patch(
  "/contentLibrary/podcast/upload",
  mediaHelper.uploadContentPodcastAudio(),
  contentLibraryController.savePodcast
);
router.patch(
  "/contentLibrary/podcast/updateScenario1",
  mediaHelper.uploadContentPodcastImage(),
  contentLibraryController.updatePodcastScenario1
);
router.patch(
  "/contentLibrary/media/update",
  mediaHelper.uploadContentMediaImage(),
  contentLibraryController.updateMedia
);
router.post("/contentLibrary/view", contentLibraryController.view);
router.get("/contentLibrary/list", contentLibraryController.listMedia);
router.delete("/contentLibrary/delete", contentLibraryController.delete);

// Content Library Document
router.post(
  "/contentLibrary/document/create",
  mediaHelper.uploadMultipleMedia(),
  contentLibraryController.createDocument
);
router.patch(
  "/contentLibrary/document/saveDocument",
  mediaHelper.uploadSingleDocument("public/videos/multimedia"),
  contentLibraryController.saveDocument
);
router.patch(
  "/contentLibrary/document/update",
  mediaHelper.uploadContentMediaDocumentImage(),
  contentLibraryController.updateContentDocument
);
router.get(
  "/contentLibrary/document/listDocument",
  contentLibraryController.listDocument
);
router.get(
  "/contentLibrary/document/drafts",
  contentLibraryController.listDocumentDrafts
);
router.delete(
  "/contentLibrary/document/deleteDocument",
  contentLibraryController.deleteDocument
);

router.post(
  "/contentLibrary/document/view",
  contentLibraryController.viewDocument
);

router.patch(
  "/contentLibrary/status/update",
  contentLibraryController.statusUpdate
);
router.post("/contentLibrary/search", contentLibraryController.searchContent);

// Wellness Support Group
router.patch("/supportGroup/approve", supportGroupController.approve);
router.delete("/supportGroup/reject", supportGroupController.reject);
router.post(
  "/supportGroup/create",
  mediaHelper.uploadSingleMedia("public/images/support_group"),
  supportGroupController.create
);
router.patch(
  "/supportGroup/update",
  mediaHelper.uploadSingleMedia("public/images/support_group"),
  supportGroupController.update
);
router.post("/supportGroup/view", supportGroupController.view);
router.get("/supportGroup/list", supportGroupController.list);
router.get("/supportGroup/listPending", supportGroupController.listPending);
router.patch(
  "/supportGroup/status/update",
  supportGroupController.statusUpdate
);
router.patch(
  "/mywsg/request/status/toggle",
  supportGroupController.myWSGRequestToggle
);
router.delete("/mywsg/reject", supportGroupController.rejectMyWSGRequest);

// Health Hero
router.post(
  "/healthHero/create",
  mediaHelper.uploadSingleMedia("public/images/health_hero"),
  healthHeroController.create
);
router.post("/healthHero/view", healthHeroController.view);
router.get("/healthHero/list", healthHeroController.list);
router.patch(
  "/healthHero/update",
  mediaHelper.uploadSingleMedia("public/images/healthHero"),
  healthHeroController.update
);
router.get(
  "/userHealthHero/list/pending",
  userHealthHeroController.listPending
);
router.delete("/healthHero/delete", healthHeroController.delete);
router.patch("/healthHero/status/update", healthHeroController.statusUpdate);
router.patch("/userHealthHero/request/approve", healthHeroController.approve);
router.patch(
  "/healthhero/user/request/status/toggle",
  healthHeroController.UserRequestActiveInactive
);
router.patch(
  "/healthhero/user/request/reject",
  healthHeroController.rejectUserRequest
);
router.post(
  "/user/healthhero/list/pending",
  healthHeroController.pendingRequests
);
router.post(
  "/user/healthhero/list/approved",
  healthHeroController.approvedRequests
);

// Health Hero Registrations
router.get(
  "/healthHeroRegistration/list",
  healthHeroController.listRegistrations
);
router.post(
  "/healthHeroRegistration/view",
  healthHeroController.viewRegistrations
);

// Spotlight
router.patch(
  "/healthHero/spotlight/create",
  mediaHelper.uploadSpotlightVideo(),
  healthHeroController.createSpotlight
);
router.get("/healthHero/spotlight/list", healthHeroController.listSpotlight);
router.delete(
  "/healthHero/spotlight/delete",
  healthHeroController.deleteSpotlight
);

// Event Category
router.post("/event/category/create", eventController.createCategory);
router.get("/event/category/list", eventController.listCategory);

// Members
router.post(
  "/members/create",
  mediaHelper.uploadSingleMedia("public/images/members"),
  memberController.create
);
router.patch(
  "/members/update",
  mediaHelper.uploadSingleMedia("public/images/members"),
  memberController.update
);
router.post("/members/view", memberController.view);
router.get("/members/list", memberController.list);
router.post(
  "/members/supportGroup/list",
  memberController.listMembersOfSupportGroup
);
router.post(
  "/members/listPending/request",
  memberController.listPendingRequest
);
router.post(
  "/members/listApproved/request",
  memberController.listApprovedRequest
);
router.patch("/members/add", memberController.add);
router.patch("/members/approve", memberController.approve);
router.patch("/members/remove", memberController.remove);
router.delete("/members/reject", memberController.reject);
router.patch("/members/add/groupLeader", memberController.addGroupLeader);
router.post("/members/search", memberController.searchMember);
router.patch("/members/status/update", memberController.statusUpdate);

// Vouchers
router.post(
  "/voucher/create",
  mediaHelper.uploadSingleMedia("public/images/vouchers"),
  voucherController.create
);
router.post("/voucher/view", voucherController.view);
router.get("/voucher/list", voucherController.list);
router.patch(
  "/voucher/update",
  mediaHelper.uploadSingleMedia("public/images/vouchers"),
  voucherController.update
);
router.delete("/voucher/delete", voucherController.delete);

// S3 Bucket File Upload
// router.post("/s3bucket/upload", adminController.s3BucketUpload)

// router.get("/s3bucket/retrieve", adminController.s3BucketRetrieve)
// router.patch("/s3bucket/update", adminController.s3BucketUpdate)

// Faqs
router.post("/faqs/create", faqController.createFaq);
router.patch("/faqs/update", faqController.updateFaq);
router.post("/faqs/view", faqController.viewFaq);
router.delete("/faqs/delete", faqController.deleteFaq);
router.get("/faqs/list", faqController.listFaq);

// Slider
router.post(
  "/slider/create",
  mediaHelper.uploadSliderImage("public/images/slider"),
  sliderController.create
);

router.patch(
  "/slider/update",
  mediaHelper.uploadSliderImage("public/images/slider"),
  sliderController.update
);
router.delete("/slider/delete", sliderController.delete);

// // vendor
// router.patch("/vendor/update", vendorController.update);
router.post("/vendor/view", vendorController.view);
router.get("/vendor/list", vendorController.list);

// Coupon
router.post("/event/voucher/create", eventVoucherController.Create);
router.patch("/event/voucher/update", eventVoucherController.Update);
router.get("/event/voucher/list", eventVoucherController.List);
// Marketplace
// Product
// router.get("/marketplace/product/list", marketplaceController.listProduct)

router.patch("/multimedia/removeSpaces", contentLibraryController.removeSpaces);

module.exports = router;
