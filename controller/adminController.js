const constants = require('../constants');
const adminService = require('../service/adminService');
const artistService = require('../service/artistService');
const actorService = require('../service/actorService');
const categoryService = require('../service/categoryService');
const filmService = require('../service/filmService');
const podcastService = require('../service/podcastService');
const songService = require('../service/songService');
const playlistService = require('../service/playlistService');
const notificationService = require('../service/notificationService');
const homeSectionLibraryService = require('../service/homeSectionLibrary');
const userService = require('../service/userService');
const jwt = require("jsonwebtoken");
const fs = require("fs");
const moment = require("moment");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csvtojson = require("csvtojson");

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

module.exports.login = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    let _ip = ip.split(":");
    let IP = _ip[_ip.length - 1];
    req.body.IP = IP;

    const responseFromService = await adminService.login(req.body);
    if (responseFromService.status) {
      const token = jwt.sign(
        {
          id: responseFromService.data.id,
          user_type: responseFromService.data.user_type,
          email: responseFromService.data.email,
          name: responseFromService.data.name
        },
        process.env.SECRET_KEY || "dhaka-secret-key",
        {
          expiresIn: "30d",
        }
      );

      response.status = 200;
      response.message = constants.userMessage.LOGIN_SUCCESS;
      response.body = {
        name: responseFromService.data.name,
        role: responseFromService.data.user_type,
        token: token,
        id: responseFromService.data.id,
      };
      return res.status(response.status).send(response);
    } else {
      response.status = 400;
      response.message = responseFromService.message;
      return res.status(response.status).send(response);
    }
  } catch (error) {
    console.log('Something went wrong: Controller: login', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}
exports.fetchAllcategories = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let categoryData = await categoryService.getAllCategory(search);
    data = categoryData.map((item) => {
      let obj = {
        img: `${process.env.MEDIA_PATH + "categories/"}${item.img}`,
        id: item.id,
        description:item.description,
        title:item.title,
        status:item.status,
        created:item.createdAt
      };
      return obj;
    });
    if (categoryData.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.CATEGORY_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.insertCategory = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    //if (!req.file) throw new ErrorHandler(`Please select an Image!!!`, "406")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    // let oldpath = req.file.path;
    // let name = req.file.originalname.replace(/ /g, "_");
    // let new_name = `${random}_${name}`;
    // let img_path = `./uploads/categories/${new_name}`;
    // fs.rename(oldpath, img_path, function (err) {
    //   if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    // });

    let data = {
      title: title,
      description: description,
      status: status,
      is_deleted: "n",
      display_in_home:display_in_home
    };


    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/categories/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/categories/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }
   
    let banner = await categoryService.createCategory(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.CATEGORY_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.updateCategory = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    let data = {};
    data["title"] = title;
    data["description"] = description;
    data["status"] = status;
    data["display_in_home"] = display_in_home;

    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/categories/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/categories/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }


    let banner = await categoryService.updateCategory({ id: req.params.id, updateInfo: data });
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.CATEGORY_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteCategory = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await categoryService.getCategoryById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y'};
      await categoryService.updateCategory({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.CATEGORY_DELETED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.singleCategoryDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await categoryService.getCategoryById({ id: req.params.id });
    if (responseFromService) {
      responseFromService.img = `${process.env.MEDIA_PATH + "categories/"}${responseFromService.img}`;
      responseFromService.banner_image = `${process.env.MEDIA_PATH + "categories/"}${responseFromService.banner_image}`;
      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleOrderDetailsForAdmin", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.fetchAllmood = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let artistData = await songService.getAllMood(search);
    data = artistData.map((item) => {
      let obj = {
        id: item.id,
        title:item.title,
        status:item.status,
        display_in_home:item.display_in_home
      };
      return obj;
    });
    if (artistData.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `NO DATA FOUND`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.singleMoodDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await songService.getMoodById({ id: req.params.id });
    if (responseFromService) {
      responseFromService.img = `${process.env.MEDIA_PATH + "mood/"}${responseFromService.img}`,
      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleOrderDetailsForAdmin", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.insertMood = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission, title, status, display_in_home } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let new_name = "";
    if(req.file){
      let oldpath = req.file.path;
      let name = req.file.originalname.replace(/ /g, "_");
      new_name = `${random}_${name}`;
      let img_path = `./uploads/mood/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
    }
    

    let data = {
      title: title,
      status: status,
      is_deleted: "n",
      img:new_name,
      display_in_home:display_in_home
    };
    let banner = await songService.createMood(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.updateMood = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { title, status,display_in_home } = req.body;
    let new_name = "";
    if(req.file){
      let oldpath = req.file.path;
      let name = req.file.originalname.replace(/ /g, "_");
      new_name = `${random}_${name}`;
      let img_path = `./uploads/mood/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
    }

    let data = {};
    data["title"] = title;
    data["status"] = status;
    data["display_in_home"] = display_in_home;
    data["img"] = new_name;
    let banner = await songService.updateMood({ id: req.params.id, updateInfo: data });
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateMood", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteMood = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await songService.getMoodById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y'};
      await songService.updateMood({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.DATA_UPDATED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteMood", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.fetchAllplaylist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let categoryData = await playlistService.getAllPlaylist(search);
    data = categoryData.map((item) => {
      let obj = {
        img: `${process.env.MEDIA_PATH + "playlist/"}${item.img}`,
        id: item.id,
        title:item.title,
        status:item.status,
        created:item.createdAt,
        display_in_home_playlist:item.display_in_home_playlist,
      };
      return obj;
    });
    if (categoryData.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.CATEGORY_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.insertPlaylist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    let data = {
      title: req.body.title,
      mood: req.body.mood,
      category: req.body.category,
      songs: req.body.songs.split(","),
      status: req.body.status,
      is_deleted: "n",
      featured: req.body.featured?req.body.featured:false,
      display_in_home_playlist:req.body.display_in_home_playlist,
      playlistBy: req.body.playlistBy,
      artist: req.body.artist,
      actor: req.body.actor
    };

    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/playlist/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/playlist/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }


    let banner = await playlistService.createPlaylist(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertPlaylist", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deletePlaylist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await playlistService.getPlaylistById({id: req.params.id});
    if (catogory && req.params.id) {
     
      await playlistService.deletePlaylist({ id: req.params.id });
      response.message = constants.genericMessage.DATA_UPDATED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deletePlaylist", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
module.exports.getPlaylistById = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    var responseFromService = await playlistService.getPlaylistById(req.params);

    if (responseFromService.img) {
      responseFromService.img = process.env.MEDIA_PATH + "playlist/" + responseFromService.img;
    }
    if (responseFromService.banner_image) {
      responseFromService.banner_image = process.env.MEDIA_PATH + "playlist/" + responseFromService.banner_image;
    }

    response.status = 200;
    response.message = constants.genericMessage.SONG_FETCHED;
    response.body = responseFromService;
  } catch (error) {
    console.log("Something went wrong: Controller: getPlaylistById", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
exports.updatePlaylist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    
    let data = {
      title: req.body.title,
      mood: req.body.mood,
      category: req.body.category,
      songs: req.body.songs.split(","),
      status: req.body.status,
      display_in_home_playlist:req.body.display_in_home_playlist,
      artist: req.body.artist,
      actor: req.body.actor,
      playlistBy: req.body.playlistBy
    };

    if(req.body.featured){
      data.featured = req.body.featured;
    }


    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/playlist/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/playlist/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }
 
    let updateDetails = await playlistService.updatePlaylist({ id: req.params.id, updateInfo: data });
    if (updateDetails) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertSong", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
module.exports.exportPlaylist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
      let random = Math.floor(Math.random() * 10000000 + 1);
      let createFolder = process.env.PHYSICAL_MEDIA_PATH + "report/";
      if (!fs.existsSync(createFolder)) fs.mkdirSync(createFolder);
      let datetime = new Date();
      let fileName = `${random}_` + datetime.toISOString().slice(0, 10) + ".csv";
      let search = {is_deleted:'n'};
      let findPlaylist = await playlistService.getAllPlaylist(search);

      const csvWriter = createCsvWriter({
          path: createFolder + fileName,
          header: [
              { id: "title", title: "Title" },
              { id: "order", title: "Order" }
          ],
      });
      let records = [];

      
      for (let item of findPlaylist) {
          let single_record = {
            title: item.title,
            order: item.order ? item.order : 0
          };
          records.push(single_record);
      }
      csvWriter.writeRecords(records);

      response.status = 200;
      response.message = `Data exported successfully.`;
      response.body = {
          downloadLink: process.env.MEDIA_PATH + "report/" + fileName,
      };
  } catch (error) {
      console.log(
          `Something went wrong: exportUser: exportUser`,
          error
      );
  }
  return res.status(response.status).send(response);
};
exports.importPlaylist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    

    if (!req.file) throw new ErrorHandler(`File not found!!!`, "406")._errorManager();
    let extention = req.file.originalname.split(".");
    if (extention[extention.length - 1].toLowerCase() != "csv")
      throw new ErrorHandler(`File not supported!!!`, "406")._errorManager();
    let filePath = "";
    let oldpath = req.file.path;
    let cur_date = new Date();
    let file_date = moment(cur_date).format("DD-MM-YYYY");
    let random_number = Math.floor(Math.random() * 10000000000 + 1);
    filePath = `./uploads/songs/${random_number}_${file_date}_${req.file.originalname}`;
    fs.rename(oldpath, filePath, (err) => {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });
    let num = 0;


    await csvtojson({ output: "csv" })
      .fromFile(filePath)
      .then(async (csvRows) => {
        console.log(csvRows.length);
        for (let i = 0; i < csvRows.length; i++) {
          num++;
          let csvItem = csvRows[i];
         
          let findSong = await playlistService.findPlayByTitle(csvItem[0]);
          if(findSong){
            //console.log(findSong);

            let updateData = {
              order: csvItem[1]
            };
            await playlistService.updatePlaylist({id:findSong.id,updateInfo : updateData});
          }
        }
        console.log(`Total processed data ${num}`);
      });
    response.status = 200;
    response.message = `${num} playlist data updated.`;
    response.body = {}

  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCMS", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};





exports.fetchAllUserKaraoke = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let categoryData = await songService.getAllUserKaraoke(search);
    let userKaraokeData = [];
    for(let i in categoryData){
      if(categoryData[i].song_id){
        categoryData[i].karaoke_file = `${process.env.MEDIA_PATH + "user_karaoke/"}${categoryData[i].karaoke_file}`;
        categoryData[i].output_file = `${process.env.MEDIA_PATH + "user_karaoke/"}${categoryData[i].output_file}`;
        categoryData[i].song_id.song = `${process.env.MEDIA_PATH + "karaoke/"}${categoryData[i].song_id.song}`;
        userKaraokeData.push(categoryData[i]);
      }
    }

    // categoryData = categoryData.map((item) => {
    //   let obj = item;
    //   obj.karaoke_file = `${process.env.MEDIA_PATH + "user_karaoke/"}${item.karaoke_file}`;
    //   obj.output_file = `${process.env.MEDIA_PATH + "user_karaoke/"}${item.output_file}`;
    //   obj.song_id.song = `${process.env.MEDIA_PATH + "karaoke/"}${item.song_id.song}`
    //   return obj;
    // });
    if (userKaraokeData.length) {
      response.status = 200;
      response.body = userKaraokeData;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.CATEGORY_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteKaraoke = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await songService.getKaraoke({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y'};
      await songService.updateUserKaraoke({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.DATA_DELETED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};


////Artist////
exports.fetchAllartist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let artistData = await artistService.getArtistList(search);
    data = artistData.map((item) => {
      let obj = {
        img: `${process.env.MEDIA_PATH + "artists/"}${item.img}`,
        id: item.id,
        title:item.title,
        status:item.status
      };
      return obj;
    });
    if (artistData.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `NO DATA FOUND`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.insertArtist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    //if (!req.file) throw new ErrorHandler(`Please select an Image!!!`, "406")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    // let oldpath = req.file.path;
    // let name = req.file.originalname.replace(/ /g, "_");
    // let new_name = `${random}_${name}`;
    // let img_path = `./uploads/artists/${new_name}`;
    // fs.rename(oldpath, img_path, function (err) {
    //   if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    // });
    let data = {
      title: title,
      status: status,
      is_deleted: "n",
      display_in_home:display_in_home,
      featured: req.body.featured?req.body.featured:false
    };
    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/artists/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/artists/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }

    let banner = await artistService.createArtist(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.updateArtist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    let data = {};
    // if (req.file) {
    //   let oldpath = req.file.path;
    //   let name = req.file.originalname.replace(/ /g, "_");
    //   let new_name = `${random}_${name}`;
    //   let img_path = `./uploads/artists/${new_name}`;
    //   fs.rename(oldpath, img_path, function (err) {
    //     if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    //   });
    //   data["img"] = new_name;
    // }
    data["title"] = title;
    data["status"] = status;
    data["display_in_home"] = display_in_home;

    if(req.body.featured){
      data.featured = req.body.featured;
    }

    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/artists/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/artists/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }


    let banner = await artistService.updateArtist({ id: req.params.id, updateInfo: data });
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteArtist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await artistService.getArtistById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y'};
      await artistService.updateArtist({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.DATA_UPDATED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.singleArtistDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await artistService.getArtistById({ id: req.params.id });
    if (responseFromService) {
      responseFromService.img = `${process.env.MEDIA_PATH + "artists/"}${responseFromService.img}`;
      responseFromService.banner_image = `${process.env.MEDIA_PATH + "artists/"}${responseFromService.banner_image}`;
      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleOrderDetailsForAdmin", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};



////Actor////
exports.fetchAllactor = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let artistData = await actorService.getAllActor(search);
    data = artistData.map((item) => {
      let obj = {
        img: `${process.env.MEDIA_PATH + "actor/"}${item.img}`,
        id: item.id,
        title:item.title,
        status:item.status
      };
      return obj;
    });
    if (artistData.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `NO DATA FOUND`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllactor", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.insertActor = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    //if (!req.file) throw new ErrorHandler(`Please select an Image!!!`, "406")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    // let oldpath = req.file.path;
    // let name = req.file.originalname.replace(/ /g, "_");
    // let new_name = `${random}_${name}`;
    // let img_path = `./uploads/actor/${new_name}`;
    // fs.rename(oldpath, img_path, function (err) {
    //   if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    // });
    let data = {
      title: title,
      status: status,
      is_deleted: "n",
      display_in_home:display_in_home,
      featured: req.body.featured?req.body.featured:false
    };

    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/actor/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/actor/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }

    let banner = await actorService.createActor(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertActor", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.updateActor = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    let data = {};
    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/actor/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/actor/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }
    data["title"] = title;
    data["status"] = status;
    data["display_in_home"] = display_in_home;

    if(req.body.featured){
      data.featured = req.body.featured;
    }

    let banner = await actorService.updateActor({ id: req.params.id, updateInfo: data });
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteActor = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await actorService.getActorById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y'};
      await actorService.updateActor({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.DATA_UPDATED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.singleActorDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await actorService.getActorById({ id: req.params.id });
    if (responseFromService) {
      responseFromService.img = `${process.env.MEDIA_PATH + "actor/"}${responseFromService.img}`;
      if(responseFromService.banner_image){
        responseFromService.banner_image = `${process.env.MEDIA_PATH + "actor/"}${responseFromService.banner_image}`;
      }
      
      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleOrderDetailsForAdmin", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};




module.exports.exportUser = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
        let random = Math.floor(Math.random() * 10000000 + 1);
        let createFolder = process.env.PHYSICAL_MEDIA_PATH + "report/";
        if (!fs.existsSync(createFolder)) fs.mkdirSync(createFolder);
        let datetime = new Date();
        let fileName = `${random}_` + datetime.toISOString().slice(0, 10) + ".csv";
        const { order_id } = req.query

        const csvWriter = createCsvWriter({
            path: createFolder + fileName,
            header: [
                { id: "name", title: "Name" },
                { id: "mobile", title: "Mobile" },
                { id: "email", title: "Email" },
                { id: "dob", title: "DOB" },
                { id: "gender", title: "Gender" },
                { id: "country", title: "Country" },
                { id: "subscription_status", title: "Subscription Status" },
                { id: "is_active", title: "Status" },
                { id: "createdAt", title: "Created At" }
            ],
        });
        let records = [];

        let findCustomer = await adminService.getCustomerList({ download: true });

        for (let item of findCustomer) {
            let single_record = {
              name: item.name,
              mobile: item.mobile ? item.mobile : "",
              email: item.email ? item.email : "",
              dob: item.dob ? item.dob : "",
              gender: item.gender ? item.gender : "",
              country: item.country ? item.country : "",
              subscription_status: item.subscription_status ? item.subscription_status : "",
              is_active: item.is_active ? item.is_active : "",
              createdAt: item.createdAt ? moment(item.createdAt).format("DD-MM-YYYY") : "",
            };
            records.push(single_record);
        }
        csvWriter.writeRecords(records);

        response.status = 200;
        response.message = `Data exported successfully.`;
        response.body = {
            downloadLink: process.env.MEDIA_PATH + "report/" + fileName,
        };
    } catch (error) {
        console.log(
            `Something went wrong: exportUser: exportUser`,
            error
        );
    }
    return res.status(response.status).send(response);
};

exports.singlePromotionalBanner = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await songService.getPromotionalBannerById({ id: req.params.id });
    if (responseFromService) {
      responseFromService.img_light = `${process.env.MEDIA_PATH + "banner/"}${responseFromService.img_light}`,
      responseFromService.img_dark = `${process.env.MEDIA_PATH + "banner/"}${responseFromService.img_dark}`,
      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleOrderDetailsForAdmin", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.singleBanner = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await songService.getBannerById({ id: req.params.id });
    if (responseFromService) {
      responseFromService.img = `${process.env.MEDIA_PATH + "banner/"}${responseFromService.img}`,
      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleOrderDetailsForAdmin", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.updateMainBanner = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    let data = {};
    if (req.file) {
      let oldpath = req.file.path;
      let name = req.file.originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/banner/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data["img"] = new_name;
    }
    data["title"] = title;
    data["status"] = status;
    let banner = await songService.updateMainBanner({ id: req.params.id, updateInfo: data });
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.fetchAllCMS = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let cmsData = await songService.getAllCMS();
    if (cmsData.length) {
      response.status = 200;
      response.body = cmsData;
    }else {
      response.status = 202;
      response.message = `NO DATA FOUND`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllCMS", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.singleCMSDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await songService.getCMSById({ id: req.params.id });
    if (responseFromService) {
      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleCMSDetails", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.updateCMS = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { title, content } = req.body;
    let data = {};
    data["title"] = title;
    data["content"] = content;
    let banner = await songService.updateCMS({ id: req.params.id, updateInfo: data });
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCMS", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.import_song = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    

    if (!req.file) throw new ErrorHandler(`File not found!!!`, "406")._errorManager();
    let extention = req.file.originalname.split(".");
    if (extention[extention.length - 1].toLowerCase() != "csv")
      throw new ErrorHandler(`File not supported!!!`, "406")._errorManager();
    let filePath = "";
    let oldpath = req.file.path;
    let cur_date = new Date();
    let file_date = moment(cur_date).format("DD-MM-YYYY");
    let random_number = Math.floor(Math.random() * 10000000000 + 1);
    filePath = `./uploads/songs/${random_number}_${file_date}_${req.file.originalname}`;
    fs.rename(oldpath, filePath, (err) => {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });
    let num = 0;


    await csvtojson({ output: "csv" })
      .fromFile(filePath)
      .then(async (csvRows) => {
        console.log(csvRows.length);
        for (let i = 0; i < csvRows.length; i++) {
          num++;
          let csvItem = csvRows[i];
          let categories = [];
          let actors = [];
          let artist = [];
          
          console.log(csvItem);

          let film_id = "";
          if(csvItem[20]!=""){
            let findFilm = await filmService.findFilm(csvItem[20]);
            if(findFilm){
              film_id = findFilm.id.toString();
              await filmService.updateFilm({id:film_id, updateInfo: { is_deleted: 'n' }});
            }else{
              let data = {
                title: csvItem[20].trim(),
                description: csvItem[20].trim(),
                status: 'active',
                is_deleted: "n",
                display_in_home:false
              };
              film_id = await filmService.createFilm(data).id.toString();
            }
          }

          
          let mood_id = "";
          if(csvItem[11]!=""){
            let findMood = await songService.findMood(csvItem[11]);
            if(findMood){
              mood_id = findMood.id.toString();
              await songService.updateMood({id:mood_id, updateInfo: { is_deleted: 'n' }});
            }else{
              let data = {
                title: csvItem[11].trim(),
                status: 'active',
                is_deleted: "n",
                display_in_home:false
              };
              mood_id = await songService.createMood(data).id.toString();
            }
          }
         

          
          if(csvItem[15]!=""){
            let category = csvItem[15].split(",");
            for(let item of category){
              let findCategory = await categoryService.findCategory(item);
              if(findCategory){
                categories.push(findCategory.id.toString());
                await categoryService.updateCategory({id:findCategory.id, updateInfo: { is_deleted: 'n' }});
              }else{
                let data = {
                  img: "",
                  title: item,
                  description: "",
                  status: "active",
                  is_deleted: "n",
                  display_in_home:false
                };
                let dataCat = await categoryService.createCategory(data);
                categories.push(dataCat.id.toString());
              }
            }
          }
          

          if(csvItem[16]!=""){
            let artists = csvItem[16].split(",");
            for(let item of artists){
              let findArtist = await artistService.findArtist(item.trim());
              if(findArtist){
                artist.push(findArtist.id.toString());
                await artistService.updateArtist({id:findArtist.id, updateInfo: { is_deleted: 'n' }});
              }else{
                let data = {
                  img: "",
                  title: item.trim(),
                  status: "active",
                  is_deleted: "n",
                  display_in_home:false
                };
                let dataArtist = await artistService.createArtist(data);
                artist.push(dataArtist.id.toString());
              }
            }
          }
          
          if(csvItem[17]!=""){
            let actor = csvItem[17].split(",");
            for(let item of actor){
              let findActor = await actorService.findActor(item.trim());
              if(findActor){
                actors.push(findActor.id.toString());
                await actorService.updateActor({id:findActor.id, updateInfo: { is_deleted: 'n' }});
              }else{
                let data = {
                  img: "",
                  title: item.trim(),
                  status: "active",
                  is_deleted: "n",
                  display_in_home:false
                };
                let dataActor = await actorService.createActor(data);
                actors.push(dataActor.id.toString());
              }
            }
          }


          let findSong = await songService.findSongByTitle(csvItem[0]);
          if(findSong){
            let updateData = {
              description: csvItem[1].trim(),
              lyricist: csvItem[2].trim(),
              composer: csvItem[3].trim(),
              album_movie_name: csvItem[4].trim(),
              star_cast: csvItem[5].trim(),
              director: csvItem[6].trim(),
              track_language: csvItem[7].trim(),
              releasing_year: csvItem[8].trim(),
              thumb_img: csvItem[9].trim(),
              media_file: csvItem[10].trim(),
              mood: mood_id,
              event: csvItem[12].trim(),
              music_label: csvItem[13].trim(),
              duration: csvItem[14].trim(),
              categories: categories,
              artists: artist,
              actors: actors,
              film:film_id
            };
            await songService.updateSongs({id:findSong.id,updateInfo : updateData});
          }else{
            let main = {
              title: csvItem[0].trim(),
              description: csvItem[1].trim(),
              lyricist: csvItem[2].trim(),
              composer: csvItem[3].trim(),
              album_movie_name: csvItem[4].trim(),
              star_cast: csvItem[5].trim(),
              director: csvItem[6].trim(),
              track_language: csvItem[7].trim(),
              releasing_year: csvItem[8].trim(),
              thumb_img: csvItem[9].trim(),
              media_file: csvItem[10].trim(),
              mood: mood_id,
              event: csvItem[12].trim(),
              music_label: csvItem[13].trim(),
              duration: csvItem[14].trim(),
              categories: categories,
              artists: artist,
              actors: actors,
              is_deleted: 'n',
              status: 'active',
              playCount: 0,
              downloadCount: 0,
              viewCount: 0,
              display_in_made_for_you:csvItem[18],
              display_in_new:csvItem[19],
              film:film_id
            };
            console.log(`processed data ${num}`);
            await songService.createSongs(main);
          }
        }
        console.log(`Total processed data ${num}`);
      });
    response.status = 201;
    response.message = `${num} songs inserted.`;
    response.body = {}




  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCMS", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.getAllDeleteRequest = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    let search = {};

    let requestData = await userService.findAccountDeleteRequest(search);

    if (requestData.length) {
      response.status = 200;
      response.body = requestData;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.DATA_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: getAllDeleteRequest", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.updateAccountRequest = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    const { status  } = req.body;
    if(status == "0"){
      let findRequest = await userService.findAccountDeleteRequest({id:req.params.id});
      if(findRequest.length){
          //Update In Customer table
          let customerData = {
            is_active: false,
            is_deleted:"Y",
            subscription_status:"inactive",
            communication_flg:false,
            subscription_package:"",
            subscription_expiry_date: new Date()
          }
          await adminService.updateCustomer({id:findRequest[0].user_id, updateInfo: customerData});


          let data = {
            status_updated_by: user_id,
            status: false
          }
          await userService.updateAccountDeleteRequest({ id: req.params.id, updateInfo: data });
          response.status = 200;
          response.message = constants.genericMessage.DATA_UPDATED;
      }else{
        response.status = 202;
        response.message = constants.genericMessage.DATA_NOT_FOUND;
      }
    }


  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateAccountRequest", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.fetchAllfilm = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let categoryData = await filmService.getAllFilm(search);
    data = categoryData.map((item) => {
      let obj = {
        img: `${process.env.MEDIA_PATH + "film/"}${item.img}`,
        id: item.id,
        description:item.description,
        title:item.title,
        status:item.status,
        created:item.createdAt
      };
      return obj;
    });
    if (categoryData.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.DATA_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.insertFilm = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    //if (!req.file) throw new ErrorHandler(`Please select an Image!!!`, "406")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    // let oldpath = req.file.path;
    // let name = req.file.originalname.replace(/ /g, "_");
    // let new_name = `${random}_${name}`;
    // let img_path = `./uploads/film/${new_name}`;
    // fs.rename(oldpath, img_path, function (err) {
    //   if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    // });

    let data = {
      title: title,
      description: description,
      status: status,
      is_deleted: "n",
      display_in_home:display_in_home,
      featured: req.body.featured?req.body.featured:false
    };


    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/film/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/film/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }
   
    let banner = await filmService.createFilm(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_FOUND;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.updateFilm = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    let data = {};
    data["title"] = title;
    data["description"] = description;
    data["status"] = status;
    data["display_in_home"] = display_in_home;

    if(req.body.featured){
      data.featured = req.body.featured;
    }

    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/film/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/film/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }


    let banner = await filmService.updateFilm({ id: req.params.id, updateInfo: data });
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_FOUND;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteFilm = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await filmService.getFilmById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y'};
      await filmService.updateFilm({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.CATEGORY_DELETED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.singleFilmDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await filmService.getFilmById({ id: req.params.id });
    if (responseFromService) {
      responseFromService.img = `${process.env.MEDIA_PATH + "film/"}${responseFromService.img}`;
      responseFromService.banner_image = `${process.env.MEDIA_PATH + "film/"}${responseFromService.banner_image}`;
      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleOrderDetailsForAdmin", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.fetchAllpodcastMain = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let categoryData = await podcastService.getAllPodcast(search);
    data = categoryData.map((item) => {
      let obj = {
        img: `${process.env.MEDIA_PATH + "podcast/"}${item.img}`,
        id: item.id,
        description:item.description,
        title:item.title,
        status:item.status,
        created:item.createdAt
      };
      return obj;
    });
    if (categoryData.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.DATA_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.insertPodcastMain = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    //if (!req.file) throw new ErrorHandler(`Please select an Image!!!`, "406")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    // let oldpath = req.file.path;
    // let name = req.file.originalname.replace(/ /g, "_");
    // let new_name = `${random}_${name}`;
    // let img_path = `./uploads/podcast/${new_name}`;
    // fs.rename(oldpath, img_path, function (err) {
    //   if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    // });

    let data = {
      title: title,
      description: description,
      status: status,
      is_deleted: "n",
      display_in_home:display_in_home,
      featured: req.body.featured?req.body.featured:false
    };


    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/podcast/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/podcast/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }
   
    let banner = await podcastService.createPodcast(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_FOUND;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.updatePodcastMain = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    let data = {};
    data["title"] = title;
    data["description"] = description;
    data["status"] = status;
    data["display_in_home"] = display_in_home;

    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/podcast/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.body.featured){
      data.featured = req.body.featured;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/podcast/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }


    let banner = await podcastService.updatePodcast({ id: req.params.id, updateInfo: data });
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_FOUND;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deletePodcastMain = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await podcastService.getPodcastById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y'};
      await podcastService.updatePodcast({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.CATEGORY_DELETED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.singlePodcastDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await podcastService.getPodcastById({ id: req.params.id });
    if (responseFromService) {
      responseFromService.img = `${process.env.MEDIA_PATH + "podcast/"}${responseFromService.img}`;
      responseFromService.banner_image = `${process.env.MEDIA_PATH + "podcast/"}${responseFromService.banner_image}`;
      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleOrderDetailsForAdmin", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.contentOrder = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    let { content_type, mood_id } = req.query;

    let data = [];
    let contentData;
    let search = {content_type:content_type };

    if(content_type == 'mood_song'){
      search = {mood_id:mood_id };
      contentData = await playlistService.getMoodSongOrder(search);
      if (contentData.length) {
        let lastPosition = 1;
        for(let item of contentData){
          lastPosition = item.position;
          data.push({
            position : item.position,
            value : item.song_id
          })
        }
        if(lastPosition<10){
          lastPosition++;
          for(let i=lastPosition;i<=10;i++){
            data.push({
              position : i,
              value : ""
            })
          }
        }
  
      }else {
        for(let i=1;i<=10;i++){
          data.push({
            position : i,
            value : ""
          })
        }
      }
    }else{
      contentData = await playlistService.getContentOrder(search);
      if (contentData.length) {
        let lastPosition = 1;
        for(let item of contentData){
          lastPosition = item.position;
          data.push({
            position : item.position,
            value : item.content_id
          })
        }
        if(lastPosition<20){
          lastPosition++;
          for(let i=lastPosition;i<=20;i++){
            data.push({
              position : i,
              value : ""
            })
          }
        }
  
      }else {
        for(let i=1;i<=20;i++){
          data.push({
            position : i,
            value : ""
          })
        }
      }
    }
    
  
    
    response.status = 200;
    response.body = data;
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.setOrder = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission, orderData, contentType, mood_id } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    if(orderData.length>0){
      if(contentType == "mood_song"){
        await playlistService.deleteMoodorder({mood_id:mood_id});
        for(let item of orderData){
          let data = {
            position: item.position,
            song_id: item.value,
            mood_id: mood_id
          };
          await playlistService.insertMoodOrder(data);
        }

      }else{
        await playlistService.deleteorder({content_type:contentType});
        for(let item of orderData){
          let data = {
            position: item.position,
            content_id: item.value,
            content_type: contentType
          };
          await playlistService.insertContentOrder(data);
        }

        switch (contentType) {
          case "playlist":
                await playlistService.resetOrderPlaylist();
                for(let item of orderData){
                  await playlistService.updatePlaylist({ id: item.value, updateInfo: { order: item.position } });
                }
                break;
          case "actor":
                await actorService.resetOrderActor();
                for(let item of orderData){
                  await actorService.updateActor({ id: item.value, updateInfo: { order: item.position } });
                }
                break;
          case "artist":
                await artistService.resetOrderActor();
                for(let item of orderData){
                  await artistService.updateArtist({ id: item.value, updateInfo: { order: item.position } });
                }
                break;
          case "podcast":
                  await podcastService.resetOrderPodcast();
                  for(let item of orderData){
                    await podcastService.updatePodcast({ id: item.value, updateInfo: { order: item.position } });
                  }
                  break;
          case "mood":
                  await songService.resetOrderMood();
                  for(let item of orderData){
                    await songService.updateMood({ id: item.value, updateInfo: { order: item.position } });
                  }
                  break;
        }
      }
      



    }
    response.status = 200;
    response.message = "Order Saved."
    //response.body = data;
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};






exports.fetchAllNotification = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let categoryData = await notificationService.getAllNotification(search);
    categoryData && categoryData.map((item) => {
        if (item.img) {
            item.img = `${process.env.MEDIA_PATH + "notification/"}${item.img}`
        }
    })
    if (categoryData.length) {
      response.status = 200;
      response.body = categoryData;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.CATEGORY_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.insertNotification = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    let data = {
      title: req.body.title,
      notification_type: req.body.notification_type,
      notification_sub_type: req.body.notification_sub_type,
      songs: req.body.songs?req.body.songs.split(","):[],
      status: req.body.status,
      is_deleted: "n",
      artist: req.body.artist,
      actor: req.body.actor,
      playlist: req.body.playlist,
      film: req.body.film,
      song: req.body.song,
      podcast: req.body.podcast,
      playlistBy: req.body.playlistBy,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      expiry_days: req.body.expiry_days
    };

    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/notification/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/notification/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }


    let banner = await notificationService.createNotification(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertPlaylist", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteNotification = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await notificationService.getNotificationById({id: req.params.id});
    if (catogory && req.params.id) {
     
      await notificationService.deleteNotification({ id: req.params.id });
      response.message = constants.genericMessage.DATA_UPDATED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deletePlaylist", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
module.exports.getNotificationById = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    var responseFromService = await notificationService.getNotificationById(req.params);

    if (responseFromService.img) {
      responseFromService.img = process.env.MEDIA_PATH + "notification/" + responseFromService.img;
    }
    if (responseFromService.banner_image) {
      responseFromService.banner_image = process.env.MEDIA_PATH + "notification/" + responseFromService.banner_image;
    }

    response.status = 200;
    response.message = constants.genericMessage.SONG_FETCHED;
    response.body = responseFromService;
  } catch (error) {
    console.log("Something went wrong: Controller: getPlaylistById", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
exports.updateNotification = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    
    let data = {
      title: req.body.title,
      notification_type: req.body.notification_type,
      notification_sub_type: req.body.notification_sub_type,
      songs: req.body.songs?req.body.songs.split(","):[],
      status: req.body.status,
      is_deleted: "n",
      artist: req.body.artist,
      actor: req.body.actor,
      playlist: req.body.playlist,
      film: req.body.film,
      song: req.body.song,
      podcast: req.body.podcast,
      playlistBy: req.body.playlistBy,
      start_date: req.body.start_date?req.body.start_date:"",
      end_date: req.body.end_date?req.body.end_date:"",
      expiry_days: req.body.expiry_days?req.body.expiry_days:""
    };

    


    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/notification/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/notification/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }
    
    console.log(data);

    let updateDetails = await notificationService.updateNotification({ id: req.params.id, updateInfo: data });
    if (updateDetails) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertSong", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};


exports.fetchAllHomeSection = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let artistData = await songService.getAllHomeSection(search);

    data = artistData.map((item) => {
      let obj = {
        id: item.id,
        title:item.title,
        status:item.status,
        createdAt: item.createdAt,
        banner_image: item.banner_image?`${process.env.MEDIA_PATH + "home_section_banner/"}${item.banner_image}`:"",
      };
      return obj;
    });

    // data = artistData.map((item) => {
    //   let obj = {
    //     id: item.id,
    //     title:item.title,
    //     status:item.status
    //   };
    //   return obj;
    // });
    if (data.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `NO DATA FOUND`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.singleHomeSectionDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await songService.getHomeSectionById({ id: req.params.id });
    if (responseFromService) {
      if(responseFromService.banner_image){
        responseFromService.banner_image = `${process.env.MEDIA_PATH + "home_section_banner/"}${responseFromService.banner_image}`;
      }

      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleOrderDetailsForAdmin", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.insertHomeSection = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    console.log(req.body);

    const { user_id, user_role, accessPermission, title, status } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let data = {
      title: title,
      status: status,
      is_deleted: "n"
    };
    
    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/home_section_banner/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }


    
    let banner = await songService.createHomeSection(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.updateHomeSection = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { title, status } = req.body;

    let data = {};
    data["title"] = title;
    data["status"] = status;
    
    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/home_section_banner/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }
    
    let banner = await songService.updateHomeSection({ id: req.params.id, updateInfo: data });
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateMood", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteHomeSection = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await songService.getHomeSectionById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y'};
      await songService.updateHomeSection({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.DATA_UPDATED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteMood", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.fetchAllHomeLibrary = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {};
    let categoryData = await homeSectionLibraryService.getAllHomeSectionLibrary(search);

    categoryData && categoryData.map((item) => {
        if (item.img) {
            item.img = `${process.env.MEDIA_PATH + "homesection/"}${item.img}`
        }
    });
    for(let i in categoryData){
      if(categoryData[i].section){
        let section = [];
        for(let section_item of categoryData[i].section){
          let sectionDetails = await songService.getHomeSectionById({ id:section_item });
          section.push(sectionDetails.title)
        }
        categoryData[i].section = section;
      }
    }
    

    if (categoryData.length) {
      response.status = 200;
      response.body = categoryData;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.CATEGORY_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.insertHomeLibrary = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    let data = {
      title: req.body.title,
      section: req.body.section?req.body.section.split(","):[],
      songs: req.body.songs?req.body.songs.split(","):[],
      status: req.body.status,
      is_deleted: "n",
      artist: req.body.artist,
      actor: req.body.actor,
      playlist: req.body.playlist,
      film: req.body.film,
      song: req.body.song,
      podcast: req.body.podcast,
      playlistBy: req.body.playlistBy
    };

    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/homesection/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/homesection/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }


    let banner = await homeSectionLibraryService.createHomeSectionLibrary(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertPlaylist", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteHomeLibrary = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await homeSectionLibraryService.getHomeSectionLibraryById({id: req.params.id});
    if (catogory && req.params.id) {
     
      await homeSectionLibraryService.deleteHomeSectionLibrary({ id: req.params.id });
      response.message = constants.genericMessage.DATA_UPDATED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deletePlaylist", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
module.exports.getHomeLibraryById = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    var responseFromService = await homeSectionLibraryService.getHomeSectionLibraryById(req.params);

    if (responseFromService.img) {
      responseFromService.img = process.env.MEDIA_PATH + "homesection/" + responseFromService.img;
    }
    if (responseFromService.banner_image) {
      responseFromService.banner_image = process.env.MEDIA_PATH + "homesection/" + responseFromService.banner_image;
    }

    response.status = 200;
    response.message = constants.genericMessage.SONG_FETCHED;
    response.body = responseFromService;
  } catch (error) {
    console.log("Something went wrong: Controller: getPlaylistById", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
exports.updateHomeLibrary = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    
    let data = {
      title: req.body.title,
      section: req.body.section?req.body.section.split(","):[],
      songs: req.body.songs?req.body.songs.split(","):[],
      status: req.body.status,
      is_deleted: "n",
      artist: req.body.artist,
      actor: req.body.actor,
      playlist: req.body.playlist,
      film: req.body.film,
      song: req.body.song,
      podcast: req.body.podcast,
      playlistBy: req.body.playlistBy,
      start_date: req.body.start_date?req.body.start_date:"",
      end_date: req.body.end_date?req.body.end_date:"",
      expiry_days: req.body.expiry_days?req.body.expiry_days:""
    };

    


    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/homesection/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/homesection/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }
    
    console.log(data);

    let updateDetails = await homeSectionLibraryService.updateHomeSectionLibrary({ id: req.params.id, updateInfo: data });
    if (updateDetails) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertSong", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};



exports.fetchAllAdverstisement = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {};
    let categoryData = await homeSectionLibraryService.getAllAdvertisement(search);

    categoryData && categoryData.map((item) => {
        if (item.img) {
            item.img = `${process.env.MEDIA_PATH + "advertisement/"}${item.img}`
        }
    });
    for(let i in categoryData){
      if(categoryData[i].position){
        if(categoryData[i].position!='category'){
          let sectionDetails = await songService.getHomeSectionById({ id:categoryData[i].position });
           categoryData[i].position = sectionDetails.title;
        }
       
      }
    }

    if (categoryData.length) {
      response.status = 200;
      response.body = categoryData;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.CATEGORY_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.insertAdverstisement = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    let data = {
      title: req.body.title,
      position: req.body.position?req.body.position:"",
      songs: req.body.songs?req.body.songs.split(","):[],
      status: req.body.status,
      is_deleted: "n",
      artist: req.body.artist,
      actor: req.body.actor,
      playlist: req.body.playlist,
      film: req.body.film,
      song: req.body.song,
      podcast: req.body.podcast,
      playlistBy: req.body.playlistBy
    };

    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/advertisement/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/advertisement/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }


    let banner = await homeSectionLibraryService.createAdvertisement(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertPlaylist", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteAdverstisement = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await homeSectionLibraryService.getAdvertisementById({id: req.params.id});
    if (catogory && req.params.id) {
     
      await homeSectionLibraryService.deleteAdvertisement({ id: req.params.id });
      response.message = constants.genericMessage.DATA_UPDATED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deletePlaylist", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
module.exports.getAdverstisementById = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    var responseFromService = await homeSectionLibraryService.getAdvertisementById(req.params);

    if (responseFromService.img) {
      responseFromService.img = process.env.MEDIA_PATH + "advertisement/" + responseFromService.img;
    }
    if (responseFromService.banner_image) {
      responseFromService.banner_image = process.env.MEDIA_PATH + "advertisement/" + responseFromService.banner_image;
    }

    response.status = 200;
    response.message = constants.genericMessage.SONG_FETCHED;
    response.body = responseFromService;
  } catch (error) {
    console.log("Something went wrong: Controller: getPlaylistById", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
exports.updateAdverstisement = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    
    let data = {
      title: req.body.title,
      position: req.body.position?req.body.position:"",
      songs: req.body.songs?req.body.songs.split(","):[],
      status: req.body.status,
      is_deleted: "n",
      artist: req.body.artist,
      actor: req.body.actor,
      playlist: req.body.playlist,
      film: req.body.film,
      song: req.body.song,
      podcast: req.body.podcast,
      playlistBy: req.body.playlistBy,
      start_date: req.body.start_date?req.body.start_date:"",
      end_date: req.body.end_date?req.body.end_date:"",
      expiry_days: req.body.expiry_days?req.body.expiry_days:""
    };

    


    if(req.files.file){
      let oldpath = req.files.file[0].path;
      let name = req.files.file[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/advertisement/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img'] = new_name;
    }

    if(req.files.banner_image){
      let oldpath = req.files.banner_image[0].path;
      let name = req.files.banner_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/advertisement/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['banner_image'] = new_name;
    }
    
    console.log(data);

    let updateDetails = await homeSectionLibraryService.updateAdvertisement({ id: req.params.id, updateInfo: data });
    if (updateDetails) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertSong", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};