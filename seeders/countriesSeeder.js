const { v4: uuidv4 } = require("uuid");

const Countries = require("../model/Countries");
const fs = require("fs");
var path = require('path');

module.exports = {
  countriesSeeder: async (req, res, next) => {
    Countries.find().then((result) => {
      if (result.length >= 1) {
        // Read countries.json file
        next;
      } else {
        let filePath = process.cwd() + '/public/countries.json';
        fs.readFile(filePath, function (err, data) {

          // Check for errors
          if (err) throw err;

          // Converting to JSON
          const countryCodes = JSON.parse(data);

          for (let key in countryCodes) {
            let name = countryCodes[key]['name'];
            let dial_code = countryCodes[key]['dial_code'].replace('+', '');
            let code = countryCodes[key]['code'];
            let countries = new Countries({
              countryName: name,
              countryCallingCode: dial_code,
              countryCode: code,
            });
            countries.save();
          }
        });
      }
    });
  }
}
