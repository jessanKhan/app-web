const Coupon = require('../database/models/couponModel');
const Mood = require('../database/models/moodModel');
const { formatMongoData, checkObjectId, vaidObjectId } = require('../helper/dbHelper');
const constants = require('../constants');
const Karaoke = require('../database/models/karaokeModel');
const userKaraokeModel = require('../database/models/userKaraokeModel');
const Artist = require('../database/models/artistModel');
const Podcast = require('../database/models/podcastModel');
const promotionalBanner = require('../database/models/promotionalBannerModel');
const playListModel = require('../database/models/playlistModel');
const Banner = require('../database/models/mainBannerModel');
const CMS = require('../database/models/cmsModel');
module.exports.getAllCoupon = async (find) => {
  try {
    //let find = {};
    console.log(find)
    let items = await Coupon.find(find);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllCoupon', error);
    return new Error(error);
  }
}
module.exports.createCoupon = async (serviceData) => {
    function randomString(length, chars) {
      var result = "";
      for (var i = length; i > 0; --i)
        result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    }

     var existCheck = async (coupon_code) => {
      var exist = await Coupon.findOne({
        coupon_code: coupon_code,
      });
      if (exist) {
        coupon_code =
          "D" + randomString(6, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        return await existCheck(coupon_code);
      } else {
        return coupon_code;
      }
    };
    if(serviceData.type == 'generic'){
      for(var i=0;i<serviceData.no_of_coupon;i++){
        var coupon_code = "D" + randomString(6, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        coupon_code = await existCheck(coupon_code);
        var data = new Coupon({
          title: serviceData.title,
          value:serviceData.value,
          coupon_code:coupon_code,
          start_date:serviceData.start_date,
          end_date:serviceData.end_date+" 23:59:59",
          status: serviceData.status,
          is_deleted: "n",
          value_type: serviceData.value_type,
          no_of_usage: serviceData.no_of_usage
        });
        await data.save();
      }
      return { status:true, message : "Coupon code created" }
    }else{
      let checkcouponcode = await Coupon.findOne({coupon_code:serviceData.coupon_code});
      if(!checkcouponcode){
        var data = new Coupon({
          title: serviceData.title,
          value:serviceData.value,
          coupon_code:serviceData.coupon_code,
          start_date:serviceData.start_date,
          end_date:serviceData.end_date+" 23:59:59",
          status: serviceData.status,
          is_deleted: "n",
          value_type: serviceData.value_type,
          no_of_usage: serviceData.no_of_usage
        });
        await data.save();
        return { status:true, message : "Coupon code created" }
      }else{
        return { status:false, message : "Coupon code already exists" }
      }
    }


}
module.exports.searchCoupon = async (searchdata) => {
  try {
    let coupon = await Coupon.findOne(searchdata);
    if(coupon){
      return formatMongoData(coupon);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchCoupon', error);
    throw new Error(error);
  }
}
module.exports.getCouponById = async ({id}) => {
  try {
    //checkObjectId(id);
    let song = await Coupon.findById(id);
    if (!song) {
      return new Error(constants.genericMessage.DATA_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: getCouponById', error);
    return new Error(error);
  }
}
module.exports.updateCoupon = async ({ id, updateInfo }) => {
  try {
    console.log(id);
    console.log(updateInfo);
    
    checkObjectId(id);
    let song = await Coupon.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!song) {
      return new Error(constants.SongsMessage.Songs_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: updateCoupon', error);
    return new Error(error);
  }
}