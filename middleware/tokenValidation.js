const constants = require('../constants');
const jwt = require('jsonwebtoken');
const AccountDeleteRequest = require("../database/models/customerAccountDeleteRequestModel");


module.exports.validateToken = async(req, res, next) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.headers.authorization) {
      throw new Error(constants.requestValidationMessage.TOKEN_MISSING);
    }
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    const token = req.headers.authorization.split('Bearer')[1].trim();
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'my-secret-key');
    if (decoded) {
      let _ip = ip.split(":");

      req.body.user_id = decoded.id;
      req.body.user_role = decoded.user_type;
      req.body.email = decoded.email;
      req.body.ip = _ip ? _ip[_ip.length - 1] : "";
      console.log(decoded);
      

      if (decoded.id && decoded.user_type && decoded.name){
        //Check if account Deleted
        let search = {user_id: decoded.id, status: false};
        let findRequest = await AccountDeleteRequest.findOne(search);
        if(findRequest){
          console.log("Please login again.");
          response.message = `Your account deleted. If you want to join us again pleae contact info@dhakarecord.app`;
          response.status = 401;
        }
        else return next();

        
      }
      else {
        console.log("Please login again.");
        response.message = `Please login again.`;
        response.status = 401;
      }
    } else {
      console.log("Please login again.");
      response.message = `Please login again.`;
      response.status = 401;
    }
  } catch (error) {
    console.log('Error', error);
    response.message = error.message;
    response.status = 401;
  }
  return res.status(response.status).send(response);
}

module.exports._userAccess = (permissions) => {
  let response = { ...constants.defaultServerResponse };
  return async (req, res, next) => {
    try {
      const userRole = req.body.user_role;
      if (permissions.includes(userRole)) {
        req.body.accessPermission = true;
        next();
      } else {
        response.message = "You are not authorised!!!";
        response.status = 401;
        return res.status(response.status).send(response);
      }
    } catch (error) {
      response.message = "Sorry, an unexpected error has occurred";
      response.status = error.status ? error.status : "500";
      return res.status(response.status).send(response);
    }
  };
};