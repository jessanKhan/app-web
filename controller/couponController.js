const constants = require('../constants');
const userService = require('../service/userService');
const songService = require('../service/songService');
const artistService = require("../service/artistService");
const actorService = require("../service/actorService");
const categoryService = require('../service/categoryService');
const playlistService = require('../service/playlistService');
const couponService = require('../service/couponService');
const jwt = require("jsonwebtoken");
const fs = require("fs");

class ErrorHandler extends Error {
  constructor(msg, status) {
    super(msg, status);
    this.name = msg ? msg : "FancyError";
    this.status = status ? status : "500";
  }
  _errorManager() {
    return { message: this.name, status: this.status };
  }
}

exports.fetchAllCoupon = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    let search = {is_deleted:'n'};

    let songData = await couponService.getAllCoupon(search);

    if (songData.length) {
      response.status = 200;
      response.body = songData;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.DATA_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllCoupon", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.insertCoupon = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    let responseFromService = await couponService.createCoupon(req.body);
    if(responseFromService.status){
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    }else{
      response.status = 202;
      response.message = responseFromService.message;
    }

  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertSong", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteCoupon = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await couponService.getCouponById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y',updated_by:user_id};
      await couponService.updateCoupon({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.DATA_DELETED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteCoupon", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
module.exports.getCouponById = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    var responseFromService = await couponService.getCouponById(req.params);
    response.status = 200;
    response.message = constants.genericMessage.SONG_FETCHED;
    response.body = responseFromService;
  } catch (error) {
    console.log("Something went wrong: Controller: getProductById", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
exports.updateCoupon = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    const { title, value,start_date,end_date, status, value_type, no_of_usage  } = req.body;

    let data = {
      title: title,
      value:value,
      start_date:start_date,
      end_date:end_date+" 23:59:59",
      status: status,
      value_type: value_type,
      no_of_usage: no_of_usage
    };
    console.log(data);

    let updateDetails = await couponService.updateCoupon({ id: req.params.id, updateInfo: data });
    if (updateDetails) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCoupon", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
