const Notification = require('../database/models/notificationModel');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const constants = require('../constants');

module.exports.createNotification = async (serviceData) => {
  try {
    let product_type = new Notification({ ...serviceData });
    let result = await product_type.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createNotification', error);
    return new Error(error);
  }
}

module.exports.getAllNotification = async (find, sort = "") => {
  try {
    //let find = {};
    let sort_by = { _id:1 };
    if(sort!=""){
      sort_by = {order:1}
    } 
    let items = await Notification.find(find).sort(sort_by);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllNotifications', error);
    return new Error(error);
  }
}
module.exports.getNotificationList = async () => {
  try {
    let product_types = await Notification.find({});
    return formatMongoData(product_types);
  } catch (error) {
    console.log('Something went wrong: Service: getAllNotifications', error);
    return new Error(error);
  }
}


module.exports.getNotificationById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await Notification.findById(id);
    if (!product_type) {
      return new Error(constants.NotificationMessage.Notification_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getNotificationById', error);
    return new Error(error);
  }
}

module.exports.updateNotification = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let product_type = await Notification.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true }
    )
    if (!product_type) {
      return new Error(constants.NotificationMessage.Notification_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: updateNotification', error);
    return new Error(error);
  }
}

module.exports.searchNotification = async (searchdata) => {
  try {
    let Notification = await Notification.findOne(searchdata);
    if(Notification){
      return formatMongoData(Notification);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchNotification', error);
    throw new Error(error);
  }
}
exports.deleteNotification = async ({ id }) => {
  try {
    await Notification.deleteOne({ _id: id });
    return true;
  } catch (error) {
    console.log('Something went wrong: Service: deleteImages', error.stack);
    throw new Error(error.stack);
  }
};
module.exports.findPlayByTitle = async (val) => {
  try {
    let Song = await Notification.findOne({ title: val });
    if(Song){
      return formatMongoData(Song);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchSongs', error);
    throw new Error(error);
  }
}

