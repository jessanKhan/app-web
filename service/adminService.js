const User = require('../database/models/userModel');
const Customer = require("../database/models/customerModel");
const constants = require('../constants');
const { formatMongoData } = require('../helper/dbHelper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.login = async ({ email, password, IP="" }) => {
  try {
    const user = await User.findOne({ email,status: "active", is_deleted: "n",user_type:"admin" });
    if (!user) {
      return { status: false, message: constants.userMessage.USER_NOT_FOUND };
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { status: false, message: constants.userMessage.INVALID_PASSWORD };
    }
    let userDetail = await User.findOneAndUpdate(
      {
        _id: user.id,
      },
      { last_login: new Date(),last_login_ip: IP?IP:"" },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    return { status: true, message: "success", data: formatMongoData(userDetail) };
    
  } catch (error) {
    console.log('Something went wrong: Service: login', error);
    throw new Error(error);
  }

}
module.exports.getCustomerList = async ({skip=0,limit=10, download = false}) => {
  try {
    let find = {};
    let findData;
    if(download){
      findData = await Customer.find({});
    }else{
      findData = await Customer.find(find).limit(limit).sort({_id:-1});
    }
    
    return formatMongoData(findData);
  } catch (error) {
    console.log('Something went wrong: Service: getCustomerList', error);
    return new Error(error);
  }
}
module.exports.updateCustomer = async ({ id, updateInfo }) => {
  try {
     
    //checkObjectId(id);
    let updateData = await Customer.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!updateData) {
      return new Error(constants.genericMessage.DATA_NOT_FOUND);
    }
    return formatMongoData(updateData);
  } catch (error) {
    console.log('Something went wrong: Service: updateCustomer', error);
    return new Error(error);
  }
}