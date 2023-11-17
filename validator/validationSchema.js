const { required } = require("joi");
const Joi = require("joi");

const adminLoginSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const adminUpdateProfileSchema = Joi.object({
  name: Joi.string(),
  countryCode: Joi.string(),
  phone: Joi.string(),
  email: Joi.string().email(),
  newPassword: Joi.string().allow(""),
  confirmPassword: Joi.string().equal(Joi.ref("newPassword")),
});

const businessPartnerSchema = Joi.object({
  name: Joi.string().required(),
  logo: Joi.string().required(),
  description: Joi.string().required(),
  link: Joi.string().required(),
  type: Joi.number().required(),
  expiryDate: Joi.date().required(),
  emailId: Joi.string().email().required(),
  countryCode: Joi.string().required(),
  phoneNumber: Joi.string().required(),
});

const businessPartnerRequestSchema = Joi.object({
  name: Joi.string().required(),
  logo: Joi.string().required(),
  addressLine1: Joi.string().allow(""),
  addressLine2: Joi.string().allow(""),
  description: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  zipCode: Joi.string().required(),
  link: Joi.string().required(),
  type: Joi.number().required(),
  emailId: Joi.string().email().required(),
  phoneNumber: Joi.number().required(),
  countryCode: Joi.string().required(),
});

const userManagementSchema = Joi.object({
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().required(),
  isActive: Joi.boolean().valid(true, false).required(),
});

const updateUserManagementSchema = Joi.object({
  uuid: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().required(),
  isActive: Joi.boolean().valid(true, false).required(),
});

const packageSchema = Joi.object({
  uuid: Joi.string().required(),
  name: Joi.string().required(),
  image: Joi.string().required(),
  colour: Joi.string(),
  annualCost: Joi.number().min(1).required(),
  monthlyCost: Joi.number().min(1).allow(""),
  benefits: Joi.array()
    .items(Joi.string().regex(/^(?!\s*$).+/i))
    .required(),
  numberOfHealthHeroSessions: Joi.number().min(1).allow(""),
  numberOfWellnessSupportGroups: Joi.number().min(1).allow(""),
  packageStatus: Joi.string().lowercase(),
});

const userEmailActivationSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")),
});

const userRegisterationSchema = Joi.object({
  uuid: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().required(),
});

const userProfileSchema = Joi.object({
  mobile: Joi.string(),
  dob: Joi.date(),
  ageGroup: Joi.string().required(),
  gender: Joi.string().valid("male", "female", "Female", "Male").required(),
  city: Joi.string().required(),
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string().required(),
  state: Joi.string(),
  country: Joi.string().required(),
  zipCode: Joi.string().required(),
});

const updateUserProfileSchema = Joi.object({
  name: Joi.string().allow(""),
  email: Joi.string().allow(""),
  mobile: Joi.string().allow(""),
  dob: Joi.date().allow(""),
  coverImage: Joi.string().allow(""),
  ageGroup: Joi.string().allow(""),
  password: Joi.string().allow(""),
  confirmPassword: Joi.string().allow(""),
  gender: Joi.string().valid("male", "female", "Female", "Male", ""),
  city: Joi.string().allow(""),
  addressLine1: Joi.string().allow(""),
  addressLine2: Joi.string().allow(""),
  state: Joi.string().allow(""),
  country: Joi.string().allow(""),
  countryCode: Joi.string().allow(""),
  zipCode: Joi.string().allow(""),
});

const eventSchema = Joi.object({
  uuid: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  image: Joi.string(),
  price: Joi.number().required(),
  startTime: Joi.date(),
  endTime: Joi.date().greater(Joi.ref("startTime")),
  duration: Joi.number().required(),
  eventMode: Joi.string().valid("on-site", "online").required(),
  meetingType: Joi.string().valid("webinar", "meeting"),
  eventLink: Joi.string().allow(null),
  eventCategory: Joi.string().required(),
  membershipPackage: Joi.string().required(),
  registrationLink: Joi.string().allow(""),
  status: Joi.number().valid(0, 1, 2),
});

const eventUpdateSchema = Joi.object({
  uuid: Joi.string().required(),
  name: Joi.string(),
  description: Joi.string(),
  image: Joi.string(),
  price: Joi.number(),
  startTime: Joi.date(),
  endTime: Joi.date(),
  duration: Joi.number(),
  eventMode: Joi.string().valid("on-site", "online"),
  meetingType: Joi.string().valid("webinar", "meeting"),
  eventLink: Joi.string().allow(null),
  eventCategory: Joi.string(),
  membershipPackage: Joi.string(),
  registrationLink: Joi.string().allow(""),
  status: Joi.number().valid(0, 1, 2),
});

const eventSpeakerSchema = Joi.object({
  eventUuid: Joi.string().required(),
  name: Joi.string().required(),
  designation: Joi.string().required(),
  image: Joi.string().required(),
  description: Joi.string().required(),
  linkedInProfile: Joi.string().allow(""),
});

const mediaScenario1Schema = Joi.object({
  uuid: Joi.string().required(),
  title: Joi.string().required(),
  membershipType: Joi.string().required(),
  category: Joi.array().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  tags: Joi.array().allow(""),
  metaTags: Joi.array().allow(""),
  speakerName: Joi.array().allow(""),
  coverImage: Joi.string().required(),
});

const mediaScenario2Schema = Joi.object({
  uuid: Joi.string().required(),
  title: Joi.string().required(),
  type: Joi.string().required(),
  upload: Joi.string().required(),
  uploadDate: Joi.date().required(),
  description: Joi.string().required(),
});

const documentScenarioSchema = Joi.object({
  uuid: Joi.string().required(),
  tags: Joi.array().allow(""),
  metaTags: Joi.array().allow(""),
  authorName: Joi.string().allow(""),
  coverImage: Joi.string().required(),
  membershipType: Joi.string().required(),
  category: Joi.array().required(),
  title: Joi.string().required(),
  type: Joi.string().required(),
  upload: Joi.string().required(),
  description: Joi.string().required(),
  isDraft: Joi.boolean(),
});

const documentScenario2Schema = Joi.object({
  uuid: Joi.string().required(),
  upload: Joi.string().required(),
});

const supportGroupSchema = Joi.object({
  uuid: Joi.string().required(),
  name: Joi.string(),
  coverImage: Joi.string(),
  description: Joi.string(),
  groupLeader: Joi.string().allow(""),
  numberOfMembers: Joi.number(),
  membershipPackage: Joi.string().required(),
  state: Joi.string().allow(""),
  city: Joi.string().allow(""),
  country: Joi.string(),
  groupCategory: Joi.string(),
  groupLink: Joi.string().allow(""),
});

const healthHeroSchema = Joi.object({
  uuid: Joi.string().required(),
  userUuid: Joi.string().required(),
  ageBracket: Joi.string()
    .valid("Elderly", "Senior", "Matured", "Youth")
    .required(),
  image: Joi.string().allow(null),
  category: Joi.string().required(),
  diseaseType: Joi.array().required(),
  experience: Joi.string().required(),
  areaOfMentoring: Joi.array().required(),
  preferrableDays: Joi.array()
    .items(
      Joi.string().valid(
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      )
    )
    .options({ stripUnknown: { arrays: true } }),
  mentoringChannel: Joi.string().valid("on-site", "online").required(),
  numberOfHours: Joi.number().allow(0),
  membershipPackage: Joi.string().required(),
  reasonForMentoring: Joi.string().allow(""),
});

const userHealthHeroSchema = Joi.object({
  uuid: Joi.string().required(),
  healthHeroUuid: Joi.string().required(),
  userUuid: Joi.string().required(),
  sessionDate: Joi.date().allow(""),
  sessionTime: Joi.date().allow(""),
  sessionPurpose: Joi.string().allow(""),
  otherProblems: Joi.string().allow(""),
  consultation: Joi.string().valid("no", "yes", "Yes", "No"),
});

const registrationSchema = Joi.object({
  uuid: Joi.string().required(),
  userUuid: Joi.string().required(),
  mobile: Joi.string().required(),
  uploadStory: Joi.string().required(),
  uploadDocuments: Joi.string().allow(null),
  ageGroup: Joi.string().required(),
  category: Joi.string().required(),
  mentoringChannel: Joi.string().valid("online", "on-site", "both").required(),
  numberOfHours: Joi.number().allow(""),
  areaOfMentoring: Joi.string().required(),
  membershipPackage: Joi.string().required(),
});

const eventVoucherSchema = Joi.object({
  eventUuid: Joi.string().required(),
  membershipUuid: Joi.string().required(),
  name: Joi.string().required(),
  discountAmount: Joi.number().required(),
  quantity: Joi.number().required(),
  expiryDate: Joi.string().required(),
  status: Joi.boolean(),
  description: Joi.string().required(),
});

const memberSchema = Joi.object({
  uuid: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().allow(""),
  gender: Joi.string().valid("male", "female", "Female", "Male").required(),
  ageGroup: Joi.string().required(),
  dob: Joi.string().allow(""),
  zipCode: Joi.string().allow(""),
  city: Joi.string().required(),
  state: Joi.string().allow(""),
  country: Joi.string().required(),
  countryCode: Joi.string().allow(""),
  addressLine1: Joi.string().allow(""),
  addressLine2: Joi.string().allow(""),
  coverImage: Joi.string().required(),
  membershipPackage: Joi.string().required(),
});

const voucherSchema = Joi.object({
  uuid: Joi.string().required(),
  name: Joi.string().required(),
  companyName: Joi.string().required(),
  membershipPackage: Joi.string().required(),
  description: Joi.string().required(),
  discountType: Joi.string().valid("Flat", "flat", "%").required(),
  discount: Joi.number().max(100).required(),
  expiryDate: Joi.date().greater("now").required(),
  coverImage: Joi.string(),
  voucherCode: Joi.string().required(),
  numberOfVouchers: Joi.number().required(),
  termsAndConditions: Joi.string().required(),
});

const updateVoucherSchema = Joi.object({
  uuid: Joi.string().required(),
  name: Joi.string(),
  companyName: Joi.string(),
  membershipPackage: Joi.string(),
  description: Joi.string(),
  discountType: Joi.string().valid("Flat", "flat", "%"),
  discount: Joi.number(),
  expiryDate: Joi.date().greater("now"),
  isActive: Joi.boolean(),
  coverImage: Joi.string(),
  voucherCode: Joi.string(),
  numberOfVouchers: Joi.number(),
  termsAndConditions: Joi.string(),
});

socialMediaLoginSchema = Joi.object({
  provider: Joi.string().valid("facebook", "apple.com", "google").required(),
  id: Joi.string().required(),
  email: Joi.string().email().optional().allow(null, "null", ""),
  name: Joi.string().optional().allow(null, "null", "null null", ""),
  image: Joi.string().optional().allow(null, "null", ""),
});

cartSchema = Joi.object({
  uuid: Joi.string().required(),
  productId: Joi.string().required(),
  quantity: Joi.number().required(),
  categoryId: Joi.string().required(),
  customerId: Joi.string().required(),
});

wishlistSchema = Joi.object({
  uuid: Joi.string().required(),
  productId: Joi.string().required(),
  categoryId: Joi.string().required(),
  customerId: Joi.string().required(),
  inWishlist: Joi.boolean().required(),
});

vendorSchema = Joi.object({
  uuid: Joi.string().required(),
  store_name: Joi.string().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  address_1: Joi.string(),
  address_2: Joi.string(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  zipCode: Joi.string().required(),
  account_name: Joi.string().allow(""),
  account_no: Joi.string().allow(""),
  bank_name: Joi.string().allow(""),
  bank_address: Joi.string().allow(""),
  iban: Joi.string().allow(""),
  swift_code: Joi.string().allow(""),
  paypal_link: Joi.string().allow(""),
});

module.exports = {
  adminLoginSchema,
  adminUpdateProfileSchema,
  businessPartnerSchema,
  businessPartnerRequestSchema,
  userManagementSchema,
  updateUserManagementSchema,
  packageSchema,
  userRegisterationSchema,
  userEmailActivationSchema,
  userProfileSchema,
  updateUserProfileSchema,
  eventSchema,
  eventUpdateSchema,
  eventVoucherSchema,
  eventSpeakerSchema,
  mediaScenario1Schema,
  mediaScenario2Schema,
  documentScenarioSchema,
  documentScenario2Schema,
  supportGroupSchema,
  healthHeroSchema,
  userHealthHeroSchema,
  memberSchema,
  voucherSchema,
  updateVoucherSchema,
  registrationSchema,
  socialMediaLoginSchema,
  cartSchema,
  wishlistSchema,
  vendorSchema,
};
