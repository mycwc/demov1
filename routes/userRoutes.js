const express = require("express");
const router = express.Router();
const mediaHelper = require("../helpers/mediaHelper");
const userController = require("../controllers/userController");
const eventController = require("../controllers/eventController");
const supportGroupController = require("../controllers/supportGroupController");
const healthHeroController = require("../controllers/healthHeroController");
const voucherController = require("../controllers/voucherController");
const faqController = require("../controllers/faqController");
const marketplaceController = require("../controllers/admin/marketplaceController");
const reviewController = require("../controllers/reviewController");
const stripeController = require("../controllers/admin/stripeController");
const businessPartnerController = require("../controllers/businessPartnerController");

router.patch("/profile/create", userController.createProfile);
router.patch("/package/select", userController.selectPackage);
router.patch("/package/cancel", userController.cancelPackage);
router.patch("/package/update", userController.updatePackage);
router.post("/package/view", userController.viewPackage);
router.get("/package/list", userController.listPackage);

//Password
router.patch("/password/change", userController.changePassword);

// User Profile
router.post("/profile/view", userController.viewProfile);
router.patch(
  "/profile/update",
  mediaHelper.uploadSingleMedia("public/images/users"),
  userController.updateUserProfile
);

// Event Routes register
router.post("/event/register", eventController.register);
router.get("/event/register/list", eventController.listRegister);
router.get("/register/event/list", eventController.listRegisterEvents);
router.patch("/event/register/cancel", eventController.cancel);
// router.get("/event/view", eventController.view);
// router.get("/event/list_upcoming", eventController.listUpcoming);
// router.get("/event/list_post", eventController.listPost);
// router.get("/event/list", eventController.list);
// router.post("/event/search", eventController.search);

// Wellness Support Group
router.post("/supportGroup/view", supportGroupController.view);
router.get("/supportGroup/list", supportGroupController.list);
router.post("/supportGroup/search", supportGroupController.search);
router.post("/supportGroup/join", supportGroupController.joinSupportGroup);
router.get("/mywsgs", supportGroupController.listApprovedGroups);
router.get("/mywsgs/pending", supportGroupController.listPendingGroups);
router.delete("/mywsgs/leave", supportGroupController.leaveSupportGroup);

// Apply for Wellness Support Group
router.post(
  "/supportGroup/apply",
  mediaHelper.uploadSingleMedia("public/images/support_group"),
  supportGroupController.userApply
);

// Apply for Health Hero
router.post("/healtHero/apply", healthHeroController.applyForHero);
router.post("/healtHero/view", healthHeroController.view);
router.get("/healtHero/list", healthHeroController.list);
router.get("/healtHero/registered/list", healthHeroController.listRegisteredHeroes);
router.post("/healtHero/search", healthHeroController.search);
router.post(
  "/healtHero/registration",
  mediaHelper.uploadMultipleHealthHeroMedia("public/healthHero"),
  healthHeroController.registeration
);

// Spotlight Video
router.get(
  "/healthHero/spotlight/list",
  healthHeroController.listSpotlightVideo
);
// router.post("/healtHero/spotlight/view", healthHeroController.viewSpotlightvideo);

// Voucher
router.post("/voucher/apply", voucherController.apply)
router.get("/voucher/list", voucherController.list);

// Payment
router.post("/payment/create", userController.payment);
router.get("/payment/list", userController.listPayment);

// Event Payment
router.post("/event/payment", eventController.payment);

// Content Library
router.get("/contentLibrary/videos/list", userController.listVideos);
router.post("/contentLibrary/search", userController.searchContent);
router.get("/contentLibrary/podcasts/list", userController.listPodcasts);
router.get("/content/library/documents", userController.listDocs);
router.post("/contentLibrary/document/view", userController.viewDocument);
router.post("/contentLibrary/filtered/list", userController.filteredVideoList);
// Faqs
router.post("/faq/view", faqController.viewFaq);
router.get("/faq/list", faqController.listFaq);

// Cart
router.post("/marketplace/cart/create", marketplaceController.createCart);
router.patch("/marketplace/cart/update", marketplaceController.updateCart);
router.post("/marketplace/cart/list", marketplaceController.listCart);
router.delete("/marketplace/cart/delete", marketplaceController.cartDelete);

// Wishlist
router.post(
  "/marketplace/wishlist/create",
  marketplaceController.createWishlist
);
router.patch(
  "/marketplace/wishlist/update",
  marketplaceController.updateWishlist
);
router.post("/marketplace/wishlist/list", marketplaceController.listWishlist);
router.delete(
  "/marketplace/wishlist/delete",
  marketplaceController.deleteWishlist
);

// Wishlist
router.post("/review/create", reviewController.create);
// router.put("/review/update", reviewController.update)
router.get("/review/list", reviewController.list);
// router.delete("/review/delete", reviewController.delete)

// Coupons
router.post("/coupon/view", marketplaceController.viewCoupon);
router.get("/coupon/list", marketplaceController.listCoupon);

// Order
router.post("/marketplace/order/create", marketplaceController.orderCreate);

//Business Partner
router.post(
  "/business/partner/request",
  mediaHelper.uploadLogo("public/images/businessPartner"),
  businessPartnerController.partnerRequest
);
router.post("/business/view", businessPartnerController.viewBusiness);
router.get("/business/list", businessPartnerController.listBusiness);

router.post(
  "/marketplace/order/payment/retrieve",
  marketplaceController.orderRetrieve
);
router.post(
  "/marketplace/order/payment/retrieve/all",
  stripeController.retrieveAllPaymentIntent
);
router.post(
  "/marketplace/stripe/customer/delete",
  stripeController.deleteCustomer
);
router.post(
  "/marketplace/stripe/customer/update",
  stripeController.updateCustomer
);

router.post("/marketplace/order/list", marketplaceController.listOrder);

router.get("/marketPlace/voucher/list", marketplaceController.marketplaceVoucherList);

module.exports = router;
