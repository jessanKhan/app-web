const User = require('../database/models/userModel');
const constants = require('../constants');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var otpGenerator = require("otp-generator");
const CustomerOtp = require("../database/models/customerOtp");
const Customer = require("../database/models/customerModel");
const AccountDeleteRequest = require("../database/models/customerAccountDeleteRequestModel");
const Wishlist = require('../database/models/wishlistModel');
const userplaylistModel = require('../database/models/userplaylistModel');
const notificationModel = require('../database/models/notificationModel');
const notificationWatchModel = require('../database/models/userNotificationModel');
const playlistSongModel = require('../database/models/playlistSongModel');
const userKaraokeModel = require('../database/models/userKaraokeModel');
const subscriptionLog = require('../database/models/subscriptionLogModel');
const songPlayLog = require('../database/models/songPlayLogModel');
const packageModel = require('../database/models/packageModel');
const transactionLogModel = require('../database/models/transactionLogModel');
const songModel = require('../database/models/songModel');

var moment = require("moment");
function changeTimezone(date, ianatz) {
  var invdate = new Date(
    date.toLocaleString("en-US", {
      timeZone: ianatz,
    })
  );
  return invdate;
}

module.exports.loginByOtp = async ({ mobile="", email="", device_id="" }) => {
  try {
    if(!email && !mobile){
      return { status: false, message: "Email/Mobile number is required" };
    }

    if(mobile){
      mobile = "880"+mobile.slice(-10)
    }
    var there = new Date();
    
    let customer = await Customer.findOne({ mobile });
    // if(customer){
    //   if(customer.device_id && (device_id!="") && (customer.device_id!=device_id)){
    //     return { status: false, message: "You are already logged in on another device. Please logout from the other device/contact support" };
    //   }
    // }

    if(customer){
      if(customer.is_deleted == 'Y'){
        return { status: false, message: "Your account and all related information deleted by administrator." };
      }
    }

    let randomString = (length, chars) => {
      let result = "";
      for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    };
    
    var otp_code = randomString(4, "0123456789");
    //var otp_code = "1234";

    var updateData = {
      mobile: mobile,
      otp_code: otp_code,
      email: email,
      is_active: "1",
      is_verified: "0",
    };
    //Delete Previous OTP
    if(mobile){
      var customerOtp = await CustomerOtp.findOne({ mobile });
      if (customerOtp) {
        await CustomerOtp.deleteMany({ mobile });
      }
    }
    if(email){
      var customerOtp = await CustomerOtp.findOne({ email });
      if (customerOtp) {
        await CustomerOtp.deleteMany({ email });
      }
    }
    var newCustomerOtp = new CustomerOtp(updateData);
    await newCustomerOtp.save();

    return { status: true, message: "success", data: updateData };
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    // throw new Error(error);
    return { status: false, message: error };
  }
};
module.exports.otpValidation = async ({
  mobile,
  otp_code,
  email,
  device_id = ""
}) => {
  try {
    if(!email && !mobile){
      return { status: false, message: "Email/Mobile number is required" };
    }
    //checkObjectId(id);
    let find = {otp_code:otp_code, is_active: "1"};
    if(mobile){
      mobile = "880"+mobile.slice(-10);
      find['mobile'] = mobile;
    }
    if(email){
      find['email'] = email;
    }

    const user = await CustomerOtp.findOne(find);
    if (!user) {
      return false;
    }
    var a = moment(user.createdAt); //now
    var b = moment();
    var minutes = b.diff(a, "minutes");
    console.log(minutes); // 44700
    if (minutes > 10) {
      return false;
    }

    await CustomerOtp.findOneAndUpdate(
      { _id: user.id },
      { is_active: "0", is_verified: "1" },
      { new: true, useFindAndModify: false }
    );
    // E.g.
    var there = new Date();
    var date_ob = changeTimezone(there, "Asia/Kolkata");
    var customer;
    if(mobile){
      customer = await Customer.findOne({ mobile });
    }else{
      customer = await Customer.findOne({ email });
    }

    if(customer){
      var updateData = { last_login: date_ob.toISOString(), device_id: device_id};
      await Customer.findOneAndUpdate({ _id: customer.id }, updateData, { new: true, useFindAndModify: false });
      let profile_pic = process.env.MEDIA_PATH+"deault_image.jpg";
      if(customer.profile_pic && customer.profile_pic!=""){
        if(customer.profile_pic.includes('http')){
          profile_pic = customer.profile_pic;
        }else{
          profile_pic = process.env.MEDIA_PATH+"profile_pic/"+customer.profile_pic;
        }
      }
      let user_data = { name: customer.name,subscription_status:customer.subscription_status, gender: customer.gender, profile_pic: profile_pic  };

      let user_id = customer.id;
      const token = jwt.sign({ id: customer.id, name: customer.name, user_type: "frontend_user" }, process.env.SECRET_KEY || "my-secret-key", { expiresIn: "1y" });
      return { status: true, token, user_id, user_data };
    }else{
      return { status: false, message: "User Not found" };
    }
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    throw new Error(error);
  }
};
module.exports.socialLogin = async ({
  email,
  device_id = "",
  name="",
  gender="",
  social_image = "",
  login_source = ""
}) => {
  try {
    let find = {};
    
    if(email){
      find['email'] = email;
    }
    // E.g.
    var there = new Date();
    var date_ob = changeTimezone(there, "Asia/Kolkata");
    var customer = await Customer.findOne({ email });

    if(customer){
      // if(customer.device_id && (device_id!="") && (customer.device_id!=device_id)){
      //   return { status: false, message: "You are already logged in on another device. Please logout from the other device/contact support" };
      // }


      var updateData = { last_login: date_ob.toISOString(), device_id: device_id, name: name, profile_pic: social_image};
      await Customer.findOneAndUpdate({ _id: customer.id }, updateData, { new: true, useFindAndModify: false });

      let profile_pic = process.env.MEDIA_PATH+"deault_image.jpg";
      if(customer.profile_pic && customer.profile_pic!=""){
        if(customer.profile_pic.includes('http')){
          profile_pic = customer.profile_pic;
        }else{
          profile_pic = process.env.MEDIA_PATH+"profile_pic/"+customer.profile_pic;
        }
      }
      let user_data = { name: customer.name,subscription_status:customer.subscription_status, gender: customer.gender, profile_pic: profile_pic  };

      let user_id = customer.id;
      const token = jwt.sign({ id: customer.id, name: customer.name, user_type: "frontend_user" }, process.env.SECRET_KEY || "my-secret-key", { expiresIn: "1y" });
      return { status: true, token, user_id, user_data };
    }else{
      let insertData = {
        name :  name, 
        email :  email, 
        gender : gender, 
        profile_pic : social_image,
        profile_completed_flg : false,
        last_login: date_ob.toISOString(),
        login_source : login_source,
        device_id : device_id
      };
  
      const newCustomer = new Customer(insertData);
      var result = await newCustomer.save();
      if (result) {
        let profile_pic = process.env.MEDIA_PATH+"deault_image.jpg";
        if(result.profile_pic && result.profile_pic!=""){
          if(result.profile_pic.includes('http')){
            profile_pic = result.profile_pic;
          }else{
            profile_pic = process.env.MEDIA_PATH+"profile_pic/"+result.profile_pic;
          }
        }
        let user_data = { name: result.name,subscription_status:result.subscription_status, gender: result.gender, profile_pic: profile_pic  };
  
        let user_id = result.id;
        const token = jwt.sign({ id: result.id, name: result.name, user_type: "frontend_user" }, process.env.SECRET_KEY || "my-secret-key", { expiresIn: "1y" });
        return { status: true, token, user_id, user_data };
      }
    }
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    throw new Error(error);
  }
};
module.exports.signup = async ({
  email = '',
  mobile = '',
  password = '',
  name,
  country,
  dob, 
  gender ,
  profile_pic = '',
  social_image = '',
  login_source = '',
  device_id = ''
 }) => {
  try {
    if(!email && !mobile){
      return { status: false, message: "Email/Mobile number is required" };
    }

    if(email){
      let customer = await Customer.findOne({ email });
      if(customer){
        return { status: false, message: "Email id already exists" };
      }
    }

    if(mobile){
      mobile = "880"+mobile.slice(-10);
      let customer = await Customer.findOne({ mobile });
      if(customer){
        return { status: false, message: "Mobile already exists" };
      }
    }
    var there = new Date();
    var date_ob = changeTimezone(there, "Asia/Kolkata");

    if(password){
      const saltRounds = 12;
      password = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function(err, hash) {
          if (err) reject(err)
          resolve(hash)
        });
      })

    }

    let insertData = {
      name :  name, 
      dob :  dob, 
      mobile :  mobile, 
      email :  email, 
      password : password,
      gender : gender, 
      country: country,
      profile_pic : social_image?social_image:profile_pic,
      profile_completed_flg : true,
      last_login: date_ob.toISOString(),
      login_source : login_source,
      device_id : device_id
    };

    const newCustomer = new Customer(insertData);
    var result = await newCustomer.save();
    if (result) {
      let profile_pic = process.env.MEDIA_PATH+"deault_image.jpg";
      if(result.profile_pic && result.profile_pic!=""){
        if(result.profile_pic.includes('http')){
          profile_pic = result.profile_pic;
        }else{
          profile_pic = process.env.MEDIA_PATH+"profile_pic/"+result.profile_pic;
        }
      }
      let user_data = { name: result.name,subscription_status:result.subscription_status, gender: result.gender, profile_pic: profile_pic  };

      let user_id = result.id;
      const token = jwt.sign({ id: result.id, name: result.name, user_type: "frontend_user" }, process.env.SECRET_KEY || "my-secret-key", { expiresIn: "1y" });
      return { status: true, token, user_id, user_data };
    }else{
      return { status: false, message: "Something went wrong. Please try again later" };
    }
  } catch (error) {
    console.log('Something went wrong: Service: signup', error);
    throw new Error(error);
  }
}
module.exports.updateProfile = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let data = await Customer.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true, useFindAndModify: false }
    )
    if (!data) {
      return new Error(constants.genericMessage.DATA_NOT_FOUND);
    }
    return formatMongoData(data);
  } catch (error) {
    console.log('Something went wrong: Service: updateArtist', error);
    return new Error(error);
  }
}
module.exports.login = async ({ email, password, device_id = ""}) => {
  try {
    const user = await Customer.findOne({ email });
    if (!user || !user.password) {
      return { status: false, message: constants.userMessage.USER_NOT_FOUND };
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { status: false, message: constants.userMessage.INVALID_PASSWORD };
    }

    // if(user.device_id && (device_id!="") && (user.device_id!=device_id)){
    //   return { status: false, message: "You are already logged in on another device. Please logout from the other device/contact support" };
    // }
    
    var there = new Date();
    var date_ob = changeTimezone(there, "Asia/Kolkata");
    var updateData = { last_login: date_ob.toISOString(), device_id: device_id};
    await Customer.findOneAndUpdate({ _id: user.id }, updateData, { new: true, useFindAndModify: false });

    let profile_pic = process.env.MEDIA_PATH+"deault_image.jpg";
      if(user.profile_pic && user.profile_pic!=""){
        if(user.profile_pic.includes('http')){
          profile_pic = user.profile_pic;
        }else{
          profile_pic = process.env.MEDIA_PATH+"profile_pic/"+user.profile_pic;
        }
      }
    let user_data = { name: user.name,subscription_status:user.subscription_status, gender: user.gender, profile_pic: profile_pic  };

    let user_id = user.id;
    const token = jwt.sign({ id: user.id, name: user.name, user_type: "frontend_user" }, process.env.SECRET_KEY || "my-secret-key", { expiresIn: "1y" });
    return { status: true, token, user_id, user_data };
  } catch (error) {
    console.log('Something went wrong: Service: login', error);
    throw new Error(error);
  }

}

module.exports.findWishList = async ({ id, user_id, song_id }) => {
  try {
    let find = {is_deleted: "0"}
    if(user_id){
      find['user_id'] = user_id;
    }
    if(song_id){
      find['song_id'] = song_id;
    }
    if(id){
      find['_id'] = id;
    }
    let wishlists = await Wishlist.find(find).populate({ path: "song_id", select: ["title", "thumb_image", "artists", "playCount", "downloadCount", "description", "thumb_img", "media_file"] });
    return formatMongoData(wishlists);
  } catch (error) {
    console.log("Something went wrong: Service: getWishlist", error);
    throw new Error(error);
  }
};
module.exports.insertWishList = async ({ ...serviceData }) => {
  try {
    let log = new Wishlist({ ...serviceData });
    let result = await log.save();
    return formatMongoData(result);
  } catch (error) {
    console.log("Something went wrong: Service: getWishlist", error);
    throw new Error(error);
  }
};
module.exports.deleteWishlist = async ({ id }) => {
  try {
    await Wishlist.findOneAndUpdate(
      { _id: id },
      { is_deleted: "1" },
      { new: true, useFindAndModify: false }
    );
  } catch (error) {
    console.log("Something went wrong: Service: updateSongs", error);
    return new Error(error);
  }
};
module.exports.playlistcreate = async ({id,title,image}) => {
   try {
    let user = await Customer.findOne({ _id: id })
    if (user) {
        let insertData = {
          title: title,
          image: image,
          user_id: id
        };
        const newPlaylist = new userplaylistModel(insertData);
        await newPlaylist.save();
        return { status : true, message : 'Playlist Created' };
    }else{
      return { status : false, message : 'User Not Exists' };
    }
  } catch (error) {
    console.log("Something went wrong: Service: signup", error);
    throw new Error(error);
  }
};
module.exports.fetchPlaylist = async ({ id, count = false }) => {
  try {
    if (count) return await userplaylistModel.countDocuments({ user_id: id });

    let userData = await userplaylistModel.find({ user_id: id }).sort({_id:-1});
    return userData;
  } catch (error) {
    console.log("Something went wrong: Service: updateCategory", error);
    return new Error(error);
  }
}
module.exports.countPlaylistSong = async ({ id }) => {
  try {
    let countSongs = await playlistSongModel.find({playlist_id:id}).countDocuments()
    return (countSongs)
  } catch (error) {
    console.log("Something went wrong: Service: getAllSongss", error);
    return new Error(error);
  }
};
module.exports.findPlayList = async ({ id, user_id }) => {
  try {
    let find = {}
    if(user_id){
      find['user_id'] = user_id;
    }
    if(id){
      find['_id'] = id;
    }
    let wishlists = await userplaylistModel.find(find);
    return formatMongoData(wishlists);
  } catch (error) {
    console.log("Something went wrong: Service: getWishlist", error);
    throw new Error(error);
  }
};
module.exports.deletePlaylist = async ({ id }) => {
  try {
    await userplaylistModel.findOneAndDelete({ _id: id });
  } catch (error) {
    console.log("Something went wrong: Service: updateSongs", error);
    return new Error(error);
  }
};
module.exports.addplaylistSong = async ({user_id,playlist_id,songs}) => {
  try {
   let user = await Customer.findOne({ _id: user_id })
   if (user) {
     let findPlaylist = await userplaylistModel.findOne({ _id: playlist_id });
     if(findPlaylist){
      for(song in songs){
        let findSong = await songModel.find({_id:songs[song]});
        if(findSong.length){
          let checkPlaylistSongAdded = await playlistSongModel.findOne({ user_id: user_id, song_id: songs[song], playlist_id: playlist_id });
          if(!checkPlaylistSongAdded){
            let insertData = {
              user_id: user_id,
              song_id:songs[song],
              playlist_id: playlist_id
            };
            const newPlaylist = new playlistSongModel(insertData);
            await newPlaylist.save();
          }
        }else{
          return { status : false, message : 'Song Not Found' };
        }

        
      }
       return { status : true, message : 'Playlist Song Added' };
     }else{
      return { status : false, message : 'Playlist Not Found' };
     }
     
   }else{
     return { status : false, message : 'User Not Exists' };
   }
 } catch (error) {
   console.log("Something went wrong: Service: signup", error);
   throw new Error(error);
 }
};
module.exports.removeplaylistSong = async ({ user_id, playlist_id, songs }) => {
  try {
   let user = await Customer.findById(user_id);
   if (user) {
     let findPlaylist = await userplaylistModel.findOne({ _id: playlist_id });
     if(findPlaylist){
       for (let song in songs) {
         let findsong = await playlistSongModel.findOne({ playlist_id: playlist_id, song_id: songs[song]})
         console.log(findsong);
         if (findsong) {
          let Data = {
            user_id: user_id,
            song_id:songs[song],
            playlist_id: playlist_id
          };
          const newPlaylist =await playlistSongModel.deleteOne(Data);
         } else {
          return { status : false, message : 'Invalid song id' };
         }
       
      
      }
       return { status : true, message : 'Playlist Song Deleted' };
     }else{
      return { status : false, message : 'Playlist Not Found' };
     }
     
   }else{
     return { status : false, message : 'User Not Exists' };
   }
 } catch (error) {
   console.log("Something went wrong: Service: signup", error);
   throw new Error(error);
 }
};
module.exports.playlistDetails = async ({ id, user_id}) => {
  try {
    checkObjectId(id)
    let result = await playlistSongModel.find({ playlist_id: id, user_id:user_id }).populate({ path: "song_id", select: ["title", "thumb_image", "artists", "playCount", "downloadCount", "description", "thumb_img", "media_file",  "duration"] });
    if (result) {
      return formatMongoData (result)
    } else {
      return { status : false, message : 'Invalid playlist id' };
    }
  } catch (error) {
    console.log("Something went wrong: Service: updateSongs", error);
    return new Error(error);
  }
};

module.exports.searchWishList = async ({ user_id, song_id, id }) => {
  try {
    let find = {is_deleted: "0"}
    if(user_id){
      find['user_id'] = user_id;
    }
    if(song_id){
      find['song_id'] = song_id;
    }
    if(id){
      find['_id'] = id;
    }
    let wishlists = await Wishlist.find(find);
    return formatMongoData(wishlists);
  } catch (error) {
    console.log("Something went wrong: Service: getWishlist", error);
    throw new Error(error);
  }
};

module.exports.insertUserKaraoke = async (serviceData) => {
  try {
    let data = new userKaraokeModel({ ...serviceData });
    let result = await data.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: insertUserKaraoke', error);
    return new Error(error);
  }
}
module.exports.getAllUserKaraoke = async (find,count=false) => {
  try {
    //let find = {};
    if (count) return await userKaraokeModel.countDocuments(find);
    let items = await userKaraokeModel.find(find).populate({ path: "song_id", select: ["title", "vocal", "lyricist", "composer", "song", "image","description", "duration", "playCount", "downloadCount"] });
    return formatMongoData(items);
    
  } catch (error) {
    console.log('Something went wrong: Service: userKaraokeModel', error);
    return new Error(error);
  }
}
module.exports.getUserById = async ({ id }) => {
  try {
    checkObjectId(id);
    let user = await Customer.findById(id);
    if (!user) {
      return false;
      // return new Error(constants.userMessage.USER_NOT_FOUND);
    }

    let userDetail = formatMongoData(user);

    return userDetail;
  } catch (error) {
    console.log("Something went wrong: Service: Get User ", error);
    throw new Error(error);
  }
};

module.exports.getAllPackage = async (find) => {
  try {
    //let find = {};
    let items = await packageModel.find(find);
    return formatMongoData(items);
    
  } catch (error) {
    console.log('Something went wrong: Service: getAllPackage', error);
    return new Error(error);
  }
}
module.exports.getPackageById = async ({ id }) => {
  try {
    checkObjectId(id);
    let packageInfo = await packageModel.findById(id);
    if (!packageInfo) {
      return false;
      // return new Error(constants.userMessage.USER_NOT_FOUND);
    }

    let userDetail = formatMongoData(packageInfo);

    return userDetail;
  } catch (error) {
    console.log("Something went wrong: Service: Get package ", error);
    throw new Error(error);
  }
};
module.exports.insertUserSubscriptionLog = async (serviceData) => {
  try {
    let data = new subscriptionLog({ ...serviceData });
    let result = await data.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: subscriptionLog', error);
    return new Error(error);
  }
}
module.exports.insertTransactionLogModel = async (serviceData) => {
  try {
    let data = new transactionLogModel({ ...serviceData });
    let result = await data.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: subscriptionLog', error);
    return new Error(error);
  }
}
module.exports.findTrnasactionLogModel = async (searchData) => {
  try {
    let data = await transactionLogModel.findOne(searchData);
    if(data){
      return formatMongoData(data);
    }else{
      return false
    }
  } catch (error) {
    console.log('Something went wrong: Service: subscriptionLog', error);
    return new Error(error);
  }
}
module.exports.updateTrnasactionLog = async ({id,updateData}) => {
  try {
    await transactionLogModel.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true, useFindAndModify: false }
    );
  } catch (error) {
    console.log("Something went wrong: Service: logoutUser", error);
    return new Error(error);
  }
};
module.exports.insertUserPlayLog = async (serviceData) => {
  try {
    let data = new songPlayLog({ ...serviceData });
    let result = await data.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: songPlayLog', error);
    return new Error(error);
  }
}
module.exports.logoutUser = async (id) => {
  try {
    await Customer.findOneAndUpdate(
      { _id: id },
      { device_id: "" },
      { new: true, useFindAndModify: false }
    );
  } catch (error) {
    console.log("Something went wrong: Service: logoutUser", error);
    return new Error(error);
  }
};
module.exports.findSongPlayLog = async ({ user_id }) => {
  try {
    let find = {}
    if(user_id){
      find['user_id'] = user_id;
    }
    let wishlists = await songPlayLog.find(find).populate({ path: "song_id", select: ["title", "thumb_image", "artists", "playCount", "downloadCount", "description", "thumb_img", "media_file"] });
    return formatMongoData(wishlists);
  } catch (error) {
    console.log("Something went wrong: Service: getWishlist", error);
    throw new Error(error);
  }
};
module.exports.findAccount = async ({
  email_mobile,
  reset_token
}) => {
  try {
    let userData;
    if(email_mobile){
      userData = await Customer.findOne({ email: email_mobile });
      if(!userData){
        email_mobile = "880"+email_mobile.slice(-10)
        userData = await Customer.findOne({ mobile: email_mobile });
      }
    }
    
    if(reset_token){
      userData = await Customer.findOne({ reset_token: reset_token });
    }

    if(userData){
      return formatMongoData(userData);
    }else{
      return false;
    }
    
    
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    throw new Error(error);
  }
};
module.exports.findAccountDeleteRequest = async ({
  user_id,
  status,
  id
}) => {
  try {
    let search = {}
    if(user_id) search["user_id"] = user_id;
    if(id) search["_id"] = id;
    if(status=="1") search["status"] = true;

    //let searchData = [];
    let findRequest = await AccountDeleteRequest.find(search).populate({ path: "user_id", select: ["name", "mobile", "email","country", "_id"] });
    return findRequest;
    
    
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    throw new Error(error);
  }
};
module.exports.insertAccountDeleteRequest = async (data) => {
  try {
    
    const newRequest = new AccountDeleteRequest(data);
    var result = await newRequest.save();
    return result;
    
  } catch (error) {
    console.log("Something went wrong: Service: insertAccountDeleteRequest", error);
    throw new Error(error);
  }
};
module.exports.updateAccountDeleteRequest = async ({ id, updateInfo }) => {
  try {
     
    checkObjectId(id);
    let updateData = await AccountDeleteRequest.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!updateData) {
      return new Error(constants.genericMessage.DATA_NOT_FOUND);
    }
    return formatMongoData(updateData);
  } catch (error) {
    console.log('Something went wrong: Service: updateAccountDeleteRequest', error);
    return new Error(error);
  }
}
module.exports.loginByOtpEmail = async ({  email="" }) => {
  try {
   

    let randomString = (length, chars) => {
      let result = "";
      for (let i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    };
    
    var otp_code = randomString(4, "0123456789");
    //var otp_code = "1234";

    var updateData = {
      otp_code: otp_code,
      email: email,
      is_active: "1",
      is_verified: "0",
    };
    
    if(email){
      var customerOtp = await CustomerOtp.findOne({ email });
      if (customerOtp) {
        await CustomerOtp.deleteMany({ email });
      }
    }
    var newCustomerOtp = new CustomerOtp(updateData);
    await newCustomerOtp.save();

    return { status: true, message: "success", data: updateData };
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    // throw new Error(error);
    return { status: false, message: error };
  }
};
module.exports.otpValidationEmailMobile = async ({
  otp_code,
  email,
  mobile
}) => {
  try {
    let find = {otp_code:otp_code, is_active: "1"};
  
    if(email){
      find['email'] = email;
    }
    if(mobile){
      mobile = "880"+mobile.slice(-10);
      find['mobile'] = mobile;
    }

    const user = await CustomerOtp.findOne(find);
    if (!user) {
      return { status: false, message: "invalid OTP" };;
    }else{
      await CustomerOtp.findOneAndUpdate(
        { _id: user.id },
        { is_active: "0", is_verified: "1" },
        { new: true, useFindAndModify: false }
      );
      return { status: true, message: "OTP Validated" };
    }
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    throw new Error(error);
  }
};
module.exports.findCustomer = async (search) => {
  try {
    let findCustomer = await Customer.findOne(search)
    if(findCustomer){
      return formatMongoData(findCustomer)
    }else{
      return false;
    }
    
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    throw new Error(error);
  }
};
module.exports.fetcNotificationlist = async ({ search, count = false }) => {
  try {
    if (count) return await notificationModel.countDocuments(search);

    let userData = await notificationModel.find(search).sort({_id:-1});
    return userData;
  } catch (error) {
    console.log("Something went wrong: Service: fetcNotificationlist", error);
    return new Error(error);
  }
}
module.exports.findNotificationWatch = async ({ user_id = "", notification_id="", notify_date="", status=""}) => {
  try {
    let match = {};
    if (user_id) match["user_id"] = user_id;
    if (notification_id) match["notification_id"] = notification_id;
    if (notify_date) match["createdAt"] = notify_date;
    if (status) match["status"] = status;

    console.log(match);

    let findnotificationWatch = await notificationWatchModel.find(match).populate({ path: 'notification_id', match: {'status': 'active'} }).sort({_id:-1})
    return formatMongoData(findnotificationWatch)
    
  } catch (error) {
    console.log("Something went wrong: Service: findnotificationWatch", error);
    throw new Error(error);
  }
};
module.exports.insertNotificationWatch = async (data) => {
  try {
    
    const newRequest = new notificationWatchModel(data);
    var result = await newRequest.save();
    return result;
    
  } catch (error) {
    console.log("Something went wrong: Service: insertAccountDeleteRequest", error);
    throw new Error(error);
  }
};
module.exports.updateNotificationWatch = async ({ findInfo, updateInfo }) => {
  try {
     
    //checkObjectId(id);
    let updateData = await notificationWatchModel.findOneAndUpdate(
      findInfo,
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

module.exports.findAllCustomer = async (search) => {
  try {
    let findCustomer = await Customer.find(search)
    return formatMongoData(findCustomer)
    
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    throw new Error(error);
  }
};