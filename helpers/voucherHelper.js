const Voucher = require("../model/Voucher");

module.exports = {
  getVoucherByUuid: (uuid) => {
    return new Promise((resolve, reject) => {
      Voucher.findOne({ uuid: uuid })
        .orFail()
        .select("-_id -uuid -coverImage")
        .then((vouchers) => {
          resolve(vouchers);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
  getVouchers: () => {
    return new Promise((resolve, reject) => {
      Voucher.find()
      .sort({ isActive: -1 })
        .populate("Package")
        .orFail()
        // .select("-_id")
        .then((vouchers) => {
          resolve(vouchers);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
