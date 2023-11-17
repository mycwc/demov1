const Admin = require("../model/Admin");

module.exports = {
    getadminByemail: (email) => {
        return new Promise((resolve, reject) => {
            Admin.findOne({ email: email })
            .orFail()
            .select('-_id -uuid')
            .then((admin) => {
                resolve(admin)
            }).catch((err) => {
                reject(err)
            })
        })
    },
}