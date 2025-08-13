const constants = require('../constants');
const userService = require('../service/userService');
const songService = require('../service/songService');
const artistService = require("../service/artistService");
const actorService = require("../service/actorService");
const categoryService = require('../service/categoryService');
const playlistService = require('../service/playlistService');
const filmService = require('../service/filmService');
const podcastService = require('../service/podcastService');
const homeSectionLibraryService = require('../service/homeSectionLibrary');

const jwt = require("jsonwebtoken");
const fs = require("fs");

const slugify = require('slugify');

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

exports.fetchAllSong = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    let { mood, category, title, artist, actor, film } = req.query;

    let data;
    let search = {is_deleted:'n'};
    if (mood) search["mood"] = mood;
    if (category) search["categories"] = { $in : [category] };
    if (artist) search["artists"] = { $in : [artist] };
    if (actor) search["actors"] = { $in : [actor] };
    if (film) search["film"] = film;

    if (title) search["title"] = eval("{ $regex: /" + title + "/i }");

    let songData = await songService.getAllSongs(search);
    let songs = [];
    for (let i in songData) {
      if (songData[i].thumb_img) {
        songData[i].thumb_img = process.env.MEDIA_PATH + "songs/thumb_image/" + songData[i].thumb_img;
      }
      if (songData[i].media_file) {
        songData[i].media_file = process.env.MEDIA_PATH + "songs/" + songData[i].media_file;
      }
      let songArtist = songData[i].artists;
      let artist_name = [];
      for(artist of songArtist){
        let getArtist = await artistService.getArtistById({id:artist});
        artist_name.push(getArtist.title);
      }

      songs.push({
        "id":songData[i].id,
        "playCount": songData[i].playCount,
        "downloadCount": songData[i].downloadCount,
        "title": songData[i].title,
        "description": songData[i].description,
        "thumb_img": songData[i].thumb_img,
        "media_file": songData[i].media_file,
        "artist":artist_name.toString(),
        "status":songData[i].status,
        "createdAt":songData[i].createdAt,
        "duration": songData[i].duration,
        "title2": slugify(songData[i].title)
      })
    }
    
    if (songs.length) {
      response.status = 200;
      response.body = songs;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.SONG_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.insertSong = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    if (!req.files.thumb_image) throw new ErrorHandler(`Please select an Image!!!`, "406")._errorManager();
    if (!req.files.media_file) throw new ErrorHandler(`Please select media file!!!`, "406")._errorManager();

    //const { title, description,status,display_in_home,categories,artists } = req.body;

    let oldpath = req.files.thumb_image[0].path;
    let name = req.files.thumb_image[0].originalname.replace(/ /g, "_");
    let new_name = `${random}_${name}`;
    let img_path = `./uploads/songs/thumb_image/${new_name}`;
    fs.rename(oldpath, img_path, function (err) {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });

    let oldpathSong = req.files.media_file[0].path;
    let song_name = req.files.media_file[0].originalname.replace(/ /g, "_");
    let new_song_name = `${random}_${song_name}`;
    let song_path = `./uploads/songs/${new_song_name}`;
    fs.rename(oldpathSong, song_path, function (err) {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });

    let data = {
      title: req.body.title,
      description:req.body.description,
      lyricist:req.body.lyricist,
      composer:req.body.composer,
      album_movie_name:req.body.album_movie_name,
      star_cast:req.body.star_cast,
      director:req.body.director,
      track_language:req.body.track_language,
      releasing_year:req.body.releasing_year,
      thumb_img: new_name,
      media_file: new_song_name,
      categories:req.body.categories.split(","),
      artists:req.body.artists.split(","),
      actors:req.body.actors.split(","),
      mood:req.body.mood,
      film:req.body.film,
      event:req.body.event_name,
      music_label:req.body.music_label,
      status: req.body.status,
      is_deleted: "n",
      duration:req.body.duration,
      display_in_made_for_you:req.body.display_in_made_for_you,
      display_in_new:req.body.display_in_new,
      featured: req.body.featured?req.body.featured:false
    };
    let banner = await songService.createSongs(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.SONG_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertSong", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.updateSong = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    
    let data = {
      title: req.body.title,
      description:req.body.description,
      lyricist:req.body.lyricist,
      composer:req.body.composer,
      album_movie_name:req.body.album_movie_name,
      star_cast:req.body.star_cast,
      director:req.body.director,
      track_language:req.body.track_language,
      releasing_year:req.body.releasing_year,
      film:req.body.film,
      categories:req.body.categories.split(","),
      artists:req.body.artists.split(","),
      actors:req.body.actors.split(","),
      mood:req.body.mood,
      event:req.body.event_name,
      music_label:req.body.music_label,
      status: req.body.status,
      duration:req.body.duration,
      display_in_made_for_you:req.body.display_in_made_for_you,
      display_in_new:req.body.display_in_new
    };


    if(req.files.thumb_image){
      let oldpath = req.files.thumb_image[0].path;
      let name = req.files.thumb_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/songs/thumb_image/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['thumb_img'] = new_name;
    }
    if(req.files.media_file){
      let oldpathSong = req.files.media_file[0].path;
      let song_name = req.files.media_file[0].originalname.replace(/ /g, "_");
      let new_song_name = `${random}_${song_name}`;
      let song_path = `./uploads/songs/${new_song_name}`;
      fs.rename(oldpathSong, song_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['media_file'] = new_song_name;
    }

    if(req.body.featured){
      data.featured = req.body.featured;
    }
 
    let updateDetails = await songService.updateSongs({ id: req.params.id, updateInfo: data });
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
// exports.updateCategory = async (req, res) => {
//   let response = { ...constants.defaultServerResponse };
//   try {
//     let random = Math.floor(Math.random() * 10000000 + 1);
//     if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
//     const { user_id, user_role, accessPermission } = req.body;
//     if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
//     const { title, description,status } = req.body;
//     let data = {};
//     if (req.file) {
//       let oldpath = req.file.path;
//       let name = req.file.originalname.replace(/ /g, "_");
//       let new_name = `${random}_${name}`;
//       let img_path = `./uploads/media/${new_name}`;
//       fs.rename(oldpath, img_path, function (err) {
//         if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
//       });
//       data["img"] = new_name;
//     }
//     data["title"] = title;
//     data["description"] = description;
//     data["status"] = status;
//     let banner = await categoryService.updateCategory({ id: req.params.id, updateInfo: data });
//     if (banner) {
//       response.status = 200;
//       response.message = constants.genericMessage.CATEGORY_UPDATED;
//     } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
//   } catch (error) {
//     response.status = error.status ? error.status : "500";
//     console.log("Something went wrong: Controller: updateCategory", error.message);
//     response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
//   }
//   return res.status(response.status).send(response);
// };
exports.deleteSong = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
      if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
      const { user_id, user_role, accessPermission } = req.body;
      if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
      let catogory = await songService.getSongsById({id: req.params.id});
      if (catogory && req.params.id) {
        let data = {is_deleted:'y',updated_by:user_id};
        await songService.updateSongs({ id: req.params.id, updateInfo: data });
        response.message = constants.genericMessage.SONG_DELETED;
        response.status = 200;
      } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
    } catch (error) {
      response.status = error.status ? error.status : "500";
      console.log("Something went wrong: Controller: deleteCategory", error.message);
      response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
    }
    return res.status(response.status).send(response);
};

module.exports.getSongById = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
      var responseFromService = await songService.getSongsById(req.params);

      if (responseFromService.thumb_img) {
        responseFromService.thumb_img = process.env.MEDIA_PATH + "songs/thumb_image/" + responseFromService.thumb_img;
      }
      if (responseFromService.media_file) {
        responseFromService.media_file = process.env.MEDIA_PATH + "songs/" + responseFromService.media_file;
      }


      let songArtist = responseFromService.artists;
      let artist_name = [];
      for(artist of songArtist){
        let getArtist = await artistService.getArtistById({id:artist});
        artist_name.push({"name":getArtist.title,"id":artist});
      }
  
      responseFromService.artist = artist_name;
      responseFromService.wishlisted = false;
      var decoded_user_id = "";
      if (req.headers.authorization) {
        const token = req.headers.authorization.split("Bearer")[1].trim();
        const decoded = jwt.verify(token, process.env.SECRET_KEY || "my-secret-key");
        if (decoded.id) {
          decoded_user_id = decoded.id;
          const wishlist = await userService.searchWishList({ user_id: decoded.id, song_id: responseFromService.id });
          if (wishlist) {
            responseFromService.wishlisted = true;
          }
        }
      }
  
      response.status = 200;
      response.message = constants.genericMessage.SONG_FETCHED;
      response.body = responseFromService;
    } catch (error) {
      console.log("Something went wrong: Controller: getProductById", error);
      response.message = error.message;
    }
    return res.status(response.status).send(response);
};
exports.fetchAllKaraoke = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { mood, category } = req.query;

    let data;
    let search = {is_deleted:'n'};
    if (mood) search["mood"] = mood;
    if (category) search["categories"] = { $in : [category] };

    let songData = await songService.getAllKaraoke(search);
    songData = songData.map((item) => {
      let obj = item;
      obj.image = `${process.env.MEDIA_PATH + "karaoke/"}${item.image}`;
      obj.song = `${process.env.MEDIA_PATH + "karaoke/"}${item.song}`;
      return obj;
    });

    if (songData.length) {
      response.status = 200;
      response.body = songData;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.SONG_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteKaraokeList = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await songService.getKaraokeById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y',updated_by:user_id};
      await songService.updateKaraoke({ id: req.params.id, updateInfo: data });
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
exports.insertKaraoke = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    if (!req.files.thumb_image) throw new ErrorHandler(`Please select an Image!!!`, "406")._errorManager();
    if (!req.files.media_file) throw new ErrorHandler(`Please select media file!!!`, "406")._errorManager();

    //const { title, description,status,display_in_home,categories,artists } = req.body;

    let oldpath = req.files.thumb_image[0].path;
    let name = req.files.thumb_image[0].originalname.replace(/ /g, "_");
    let new_name = `${random}_${name}`;
    let img_path = `./uploads/karaoke/${new_name}`;
    fs.rename(oldpath, img_path, function (err) {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });

    let oldpathSong = req.files.media_file[0].path;
    let song_name = req.files.media_file[0].originalname.replace(/ /g, "_");
    let new_song_name = `${random}_${song_name}`;
    let song_path = `./uploads/karaoke/${new_song_name}`;
    fs.rename(oldpathSong, song_path, function (err) {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });

    let data = {
      title: req.body.title,
      description: req.body.description,
      vocal:req.body.vocal,
      lyricist:req.body.lyricist,
      composer:req.body.composer,
      song:new_song_name,
      lyricsData:req.body.lyrics,
      image:new_name,
      status: req.body.status,
      duration: req.body.duration,
      is_deleted: "n"
    };
    let banner = await songService.createKaraoke(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.SONG_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertSong", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.updateKaraoke = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    
    let data = {
      title: req.body.title,
      description: req.body.description,
      vocal:req.body.vocal,
      lyricist:req.body.lyricist,
      composer:req.body.composer,
      lyricsData:req.body.lyrics,
      status: req.body.status,
      duration: req.body.duration
    };


    if(req.files.thumb_image){
      let oldpath = req.files.thumb_image[0].path;
      let name = req.files.thumb_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/karaoke/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['image'] = new_name;
    }
    if(req.files.media_file){
      let oldpathSong = req.files.media_file[0].path;
      let song_name = req.files.media_file[0].originalname.replace(/ /g, "_");
      let new_song_name = `${random}_${song_name}`;
      let song_path = `./uploads/karaoke/${new_song_name}`;
      fs.rename(oldpathSong, song_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['song'] = new_song_name;
    }
 
    let updateDetails = await songService.updateKaraoke({ id: req.params.id, updateInfo: data });
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

exports.singleKaraokeDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await songService.getKaraokeById({ id: req.params.id });
    if (responseFromService) {
      responseFromService.image = `${process.env.MEDIA_PATH + "karaoke/"}${responseFromService.image}`,
      responseFromService.song = `${process.env.MEDIA_PATH + "karaoke/"}${responseFromService.song}`,
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
module.exports.searchSong = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {

     
      let songData = [];
       
      if(req.query.category && (req.query.category == '63d4fe2bb88ded2c94bc3007')){
        console.log(req.query.category);
        const songList = await songService.getPodcastList({skip:parseInt(req.query.skip),limit:parseInt(req.query.limit)});
        for (let i in songList) {
            if (songList[i].thumb_img) {
              songList[i].thumb_img = process.env.MEDIA_PATH + "podcast/thumb_image/" + songList[i].thumb_img;
            }
            if (songList[i].media_file) {
              songList[i].media_file = process.env.MEDIA_PATH + "podcast/" + songList[i].media_file;
            }
            let songArtist = songList[i].artists;
            let artist_name = [];
            for(artist of songArtist){
              let getArtist = await artistService.getArtistById({id:artist});
              artist_name.push(getArtist.title);
            }
    
            songData.push({
              "id":songList[i].id,
              "playCount": songList[i].playCount,
              "downloadCount": songList[i].downloadCount,
              "title": songList[i].title,
              "description": songList[i].description,
              "thumb_img": songList[i].thumb_img,
              "media_file": songList[i].media_file,
              "artist":artist_name.toString(),
              "duration": songList[i].duration
            })
        }

      }else{
        const songList = await songService.findSongs(req.query);
          for (let i in songList) {
            if(req.query.podcast || (req.query.searchType=='podcast')){
              if (songList[i].thumb_img) {
                songList[i].thumb_img = process.env.MEDIA_PATH + "podcast/thumb_image/" + songList[i].thumb_img;
              }
              if (songList[i].media_file) {
                songList[i].media_file = process.env.MEDIA_PATH + "podcast/" + songList[i].media_file;
              }
            }else{
              if (songList[i].thumb_img) {
                songList[i].thumb_img = process.env.MEDIA_PATH + "songs/thumb_image/" + songList[i].thumb_img;
              }
              if (songList[i].media_file) {
                songList[i].media_file = process.env.MEDIA_PATH + "songs/" + songList[i].media_file;
              }
            }
           
            let songArtist = songList[i].artists;
            let artist_name = [];
            for(artist of songArtist){
              let getArtist = await artistService.getArtistById({id:artist});
              artist_name.push(getArtist.title);
            }

            let songActor = songList[i].actors;
            let actor_name = [];
            if(songActor && songActor.length){
              for(actor of songActor){
                let getActor = await actorService.getActorById({id:actor});
                actor_name.push(getActor.title);
              }
            }
            
    
            songData.push({
              "id":songList[i].id,
              "playCount": songList[i].playCount,
              "downloadCount": songList[i].downloadCount,
              "title": songList[i].title,
              "description": songList[i].description,
              "thumb_img": songList[i].thumb_img,
              "media_file": songList[i].media_file,
              "artist":artist_name.toString(),
              "actor":actor_name.toString(),
              "duration": songList[i].duration,
              "title2": slugify(songList[i].title),
              "lyricist": songList[i].lyricist,
              "composer": songList[i].composer,
              "album_movie_name": songList[i].album_movie_name,
              "star_cast": songList[i].star_cast,
              "director": songList[i].director,
              "track_language": songList[i].track_language,
              "releasing_year": songList[i].releasing_year,
              "track_language": songList[i].track_language
            })
        }
      
      }

     

    response.status = 200;
    response.message = constants.genericMessage.SONG_FETCHED;
    response.body = songData;
    req.query.count = true;
    const totalRecord = await songService.findSongs(req.query);
    response.totalRecord = totalRecord;

  } catch (error) {
    console.log("Something went wrong: Controller: Search Song", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

exports.fetchAllPodcast = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    //if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { mood, category } = req.query;

    let data;
    let search = {is_deleted:'n'};
    if (mood) search["mood"] = mood;
    if (category) search["categories"] = { $in : [category] };

    let songData = await songService.getAllPodcast(search);
    let songs = [];
    for (let i in songData) {
      if (songData[i].thumb_img) {
        songData[i].thumb_img = process.env.MEDIA_PATH + "podcast/thumb_image/" + songData[i].thumb_img;
      }
      if (songData[i].media_file) {
        songData[i].media_file = process.env.MEDIA_PATH + "podcast/" + songData[i].media_file;
      }
      let songArtist = songData[i].artists;
      let artist_name = [];
      for(artist of songArtist){
        let getArtist = await artistService.getArtistById({id:artist});
        artist_name.push(getArtist.title);
      }

      songs.push({
        "id":songData[i].id,
        "playCount": songData[i].playCount,
        "downloadCount": songData[i].downloadCount,
        "title": songData[i].title,
        "description": songData[i].description,
        "thumb_img": songData[i].thumb_img,
        "media_file": songData[i].media_file,
        "artist":artist_name.toString(),
        "status":songData[i].status,
        "createdAt":songData[i].createdAt,
        "duration": songData[i].duration
      })
    }
    
    if (songs.length) {
      response.status = 200;
      response.body = songs;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.SONG_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllPodcast", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.insertPodcast = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    if (!req.files.thumb_image) throw new ErrorHandler(`Please select an Image!!!`, "406")._errorManager();
    if (!req.files.media_file) throw new ErrorHandler(`Please select media file!!!`, "406")._errorManager();

    //const { title, description,status,display_in_home,categories,artists } = req.body;

    let oldpath = req.files.thumb_image[0].path;
    let name = req.files.thumb_image[0].originalname.replace(/ /g, "_");
    let new_name = `${random}_${name}`;
    let img_path = `./uploads/podcast/thumb_image/${new_name}`;
    fs.rename(oldpath, img_path, function (err) {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });

    let oldpathSong = req.files.media_file[0].path;
    let song_name = req.files.media_file[0].originalname.replace(/ /g, "_");
    let new_song_name = `${random}_${song_name}`;
    let song_path = `./uploads/podcast/${new_song_name}`;
    fs.rename(oldpathSong, song_path, function (err) {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });

    let data = {
      title: req.body.title,
      description:req.body.description,
      podcast: req.body.podcast,
      lyricist:req.body.lyricist,
      composer:req.body.composer,
      album_movie_name:req.body.album_movie_name,
      star_cast:req.body.star_cast,
      director:req.body.director,
      track_language:req.body.track_language,
      releasing_year:req.body.releasing_year,
      thumb_img: new_name,
      media_file: new_song_name,
      categories:req.body.categories.split(","),
      //artists:req.body.artists.split(","),
      actors:req.body.actor.split(","),
      mood:req.body.mood,
      event:req.body.event_name,
      music_label:req.body.music_label,
      status: req.body.status,
      is_deleted: "n",
      duration:req.body.duration,
      featured: req.body.featured?req.body.featured:false
    };
    let banner = await songService.createPodcast(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertPodcast", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.updatePodcast = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    
    let data = {
      title: req.body.title,
      description:req.body.description,
      podcast: req.body.podcast?req.body.podcast:"",
      lyricist:req.body.lyricist,
      composer:req.body.composer,
      album_movie_name:req.body.album_movie_name,
      star_cast:req.body.star_cast,
      director:req.body.director,
      track_language:req.body.track_language,
      releasing_year:req.body.releasing_year,
      categories:req.body.categories.split(","),
      //artists:req.body.artists.split(","),
      actors:req.body.actor.split(","),
      mood:req.body.mood,
      event:req.body.event_name,
      music_label:req.body.music_label,
      status: req.body.status,
      duration:req.body.duration,
    };

    if(req.body.featured){
      data.featured = req.body.featured;
    }


    if(req.files.thumb_image){
      let oldpath = req.files.thumb_image[0].path;
      let name = req.files.thumb_image[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/podcast/thumb_image/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['thumb_img'] = new_name;
    }
    if(req.files.media_file){
      let oldpathSong = req.files.media_file[0].path;
      let song_name = req.files.media_file[0].originalname.replace(/ /g, "_");
      let new_song_name = `${random}_${song_name}`;
      let song_path = `./uploads/podcast/${new_song_name}`;
      fs.rename(oldpathSong, song_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['media_file'] = new_song_name;
    }
 
    let updateDetails = await songService.updatePodcast({ id: req.params.id, updateInfo: data });
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
exports.deletePodcast = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await songService.getPodcastById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y',updated_by:user_id};
      await songService.updatePodcast({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.SONG_DELETED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deletePodcast", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

module.exports.getPodcastById = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    var responseFromService = await songService.getPodcastById(req.params);

    if (responseFromService.thumb_img) {
      responseFromService.thumb_img = process.env.MEDIA_PATH + "podcast/thumb_image/" + responseFromService.thumb_img;
    }
    if (responseFromService.media_file) {
      responseFromService.media_file = process.env.MEDIA_PATH + "podcast/" + responseFromService.media_file;
    }


    let songArtist = responseFromService.artists;
    let artist_name = [];
    for(artist of songArtist){
      let getArtist = await artistService.getArtistById({id:artist});
      artist_name.push({"name":getArtist.title,"id":artist});
    }

    responseFromService.artist = artist_name;
    responseFromService.wishlisted = false;
    response.status = 200;
    response.message = constants.genericMessage.SONG_FETCHED;
    response.body = responseFromService;
  } catch (error) {
    console.log("Something went wrong: Controller: getProductById", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.fetchALL = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
      let responseData = [];
      if(req.query.type == 'category'){
        let search = {is_deleted:'n', status: 'active'};
        let categories = await categoryService.getAllCategory(search);
        for (let i in categories) {
          if (categories[i].img) {
            categories[i].img = process.env.MEDIA_PATH + "categories/" + categories[i].img;
          }
          if (categories[i].banner_image) {
            categories[i].banner_image = process.env.MEDIA_PATH + "categories/" + categories[i].banner_image;
          }
          delete categories[i].createdAt;
          delete categories[i].updatedAt;
          delete categories[i].status;
          delete categories[i].display_in_home;
          delete categories[i].is_deleted;
        }
        responseData = categories;
      }
      if(req.query.type == 'artist'){
        let artists;
        let search = {is_deleted:'n', status: 'active'};
        if(req.query.alphabet && req.query.alphabet!=""){
            search.title = {$regex: '^' + req.query.alphabet, $options: 'i'}
        }
        if(req.query.version){
          search.order = { $lte : 20 }
          let dataSet1 = await artistService.getAllArtist(search,0, 0, "order");
          search.order = { $gt : 20 }
          let dataSet2 = await artistService.getAllArtist(search,0 , 0, "updatedAt");
          artists = [...dataSet1, ...dataSet2];
        }else{
          artists = await artistService.getAllArtist(search);
        }
        
        
        for (let i in artists) {
          if (artists[i].img) {
              artists[i].img = process.env.MEDIA_PATH + "artists/" + artists[i].img;
          }
          if (artists[i].banner_image) {
            artists[i].banner_image = process.env.MEDIA_PATH + "artists/" + artists[i].banner_image;
          }
          delete artists[i].createdAt;
          delete artists[i].updatedAt;
          delete artists[i].status;
          delete artists[i].display_in_home;
          delete artists[i].is_deleted;
        }
        responseData = artists;
      }
      if(req.query.type == 'playlist'){
        let search = {is_deleted:'n', status: 'active'};
        let getPlaylist = await playlistService.getAllPlaylist(search);
        for (let i in getPlaylist) {
          if (getPlaylist[i].img) {
            getPlaylist[i].img = process.env.MEDIA_PATH + "playlist/" + getPlaylist[i].img;
          }
          if (getPlaylist[i].banner_image) {
            getPlaylist[i].banner_image = process.env.MEDIA_PATH + "playlist/" + getPlaylist[i].banner_image;
          }
          getPlaylist[i].songCount = getPlaylist[i].songs.length;
          delete getPlaylist[i].createdAt;
          delete getPlaylist[i].updatedAt;
          delete getPlaylist[i].status;
          delete getPlaylist[i].display_in_home;
          delete getPlaylist[i].is_deleted;
          delete getPlaylist[i].display_in_home_playlist;
          delete getPlaylist[i].songs;
          delete getPlaylist[i].category;
          delete getPlaylist[i].mood;
        }
        responseData = getPlaylist;
      }
      if(req.query.type == 'actor'){
        let actors;
        let search = {is_deleted:'n', status: 'active'};
        if(req.query.alphabet && req.query.alphabet!=""){
            search.title = {$regex: '^' + req.query.alphabet, $options: 'i'}
        }

        if(req.query.version){
          search.order = { $lte : 20 }
          let dataSet1 = await actorService.getAllActor(search,"order");
          search.order = { $gt : 20 }
          let dataSet2 = await actorService.getAllActor(search, "updatedAt");
          actors = [...dataSet1, ...dataSet2];
        }else{
          actors = await actorService.getAllActor(search);
        }

        for (let i in actors) {
          if (actors[i].img) {
              actors[i].img = process.env.MEDIA_PATH + "actor/" + actors[i].img;
          }
          if (actors[i].banner_image) {
            actors[i].banner_image = process.env.MEDIA_PATH + "actor/" + actors[i].banner_image;
          }
          delete actors[i].createdAt;
          delete actors[i].updatedAt;
          delete actors[i].status;
          delete actors[i].display_in_home;
          delete actors[i].is_deleted;
        }
        responseData = actors;
      }

      if(req.query.type == 'film'){
        let search = {is_deleted:'n', status: 'active'};
        if(req.query.alphabet && req.query.alphabet!=""){
          search.title = {$regex: '^' + req.query.alphabet, $options: 'i'}
        }
        let films = await filmService.getAllFilm(search);

        for (let i in films) {
          if (films[i].img) {
              films[i].img = process.env.MEDIA_PATH + "film/" + films[i].img;
          }
          if (films[i].banner_image) {
              films[i].banner_image = process.env.MEDIA_PATH + "film/" + films[i].banner_image;
          }
          delete films[i].createdAt;
          delete films[i].updatedAt;
          delete films[i].status;
          delete films[i].display_in_home;
          delete films[i].is_deleted;
        }
        responseData = films;
      }
      if(req.query.type == 'podcast'){
        let search = {is_deleted:'n', status: 'active'};
        if(req.query.alphabet && req.query.alphabet!=""){
          search.title = {$regex: '^' + req.query.alphabet, $options: 'i'}
        }
        
        let films = await podcastService.getAllPodcast(search);

        for (let i in films) {
          if (films[i].img) {
              films[i].img = process.env.MEDIA_PATH + "podcast/" + films[i].img;
          }
          if (films[i].banner_image) {
              films[i].banner_image = process.env.MEDIA_PATH + "podcast/" + films[i].banner_image;
          }
          delete films[i].createdAt;
          delete films[i].updatedAt;
          delete films[i].status;
          delete films[i].display_in_home;
          delete films[i].is_deleted;
        }
        responseData = films;
      }

      if(req.query.type == 'library'){
        let search = {is_deleted:'n', status: 'active',section: { $in:[req.query.id.toString()] }};
        let findLibrary = await homeSectionLibraryService.getAllHomeSectionLibrary(search);
        for (let j in findLibrary) {
          if (findLibrary[j].img) {
            findLibrary[j].img = process.env.MEDIA_PATH + "homesection/" + findLibrary[j].img;
          }
          if (findLibrary[j].banner_image) {
            findLibrary[j].banner_image = process.env.MEDIA_PATH + "homesection/" + findLibrary[j].banner_image;
          }
          findLibrary[j].songCount = findLibrary[j].songs.length;

          delete findLibrary[j].createdAt;
          delete findLibrary[j].updatedAt;
            delete findLibrary[j].status;
            delete findLibrary[j].notification_type;
            delete findLibrary[j].notification_sub_type;
            delete findLibrary[j].display_in_home_playlist;
            delete findLibrary[j].is_deleted;
            delete findLibrary[j].status;
            delete findLibrary[j].start_date;
            delete findLibrary[j].end_date;
            delete findLibrary[j].expiry_days;
            delete findLibrary[j].songs;
            delete findLibrary[j].playlistBy;
            delete findLibrary[j].artist;
            delete findLibrary[j].actor;
            delete findLibrary[j].playlist;
            delete findLibrary[j].film;
            delete findLibrary[j].song;
            delete findLibrary[j].podcast;
            delete findLibrary[j].section;
        }
        responseData = findLibrary;
      }

     


   
      if(responseData.length>0){
        response.status = 200;
        response.message = constants.genericMessage.DATA_FOUND;
        response.body = responseData;
      }else{
        response.status = 203;
        response.message = `NO DATA FOUND`;
        response.body = [];
      }
  } catch (error) {
    console.log("Something went wrong: Controller: Search Song", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

exports.updatePromotionalBanner = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    
    let data = {
      title: req.body.title,
      status: req.body.status,
    };


    if(req.files.img_light){
      let oldpath = req.files.img_light[0].path;
      let name = req.files.img_light[0].originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/banner/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img_light'] = new_name;
    }
    if(req.files.img_dark){
      let oldpathSong = req.files.img_dark[0].path;
      let song_name = req.files.img_dark[0].originalname.replace(/ /g, "_");
      let new_song_name = `${random}_${song_name}`;
      let song_path = `./uploads/banner/${new_song_name}`;
      fs.rename(oldpathSong, song_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data['img_dark'] = new_song_name;
    }
 
    let updateDetails = await songService.updatePromotionalBanner({ id: req.params.id, updateInfo: data });
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
module.exports.getAllFilm = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
      let responseData = [];
     
      let search = {is_deleted:'n'};
      let categories = await filmService.getAllFilm(search);
      for (let i in categories) {
        if (categories[i].img) {
          categories[i].img = process.env.MEDIA_PATH + "film/" + categories[i].img;
        }
        delete categories[i].createdAt;
        delete categories[i].updatedAt;
        delete categories[i].status;
        delete categories[i].display_in_home;
        delete categories[i].is_deleted;
      }
      responseData = categories;


   
      if(responseData.length>0){
        response.status = 200;
        response.message = constants.genericMessage.DATA_FOUND;
        response.body = responseData;
      }else{
        response.status = 203;
        response.message = `NO DATA FOUND`;
        response.body = [];
      }
  } catch (error) {
    console.log("Something went wrong: Controller: Search Song", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
module.exports.getRecommendation = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {

      var responseFromService = await songService.getSongsById(req.params);
      let songArtist = responseFromService.artists;
      let songData = [];
       
      const songList = await songService.findSongs({artist:songArtist, limit:20});
      for (let i in songList) {
        if(songList[i].id!=req.params){
          if (songList[i].thumb_img) {
            songList[i].thumb_img = process.env.MEDIA_PATH + "songs/thumb_image/" + songList[i].thumb_img;
          }
          if (songList[i].media_file) {
            songList[i].media_file = process.env.MEDIA_PATH + "songs/" + songList[i].media_file;
          }
        
          let songArtist = songList[i].artists;
          let artist_name = [];
          for(artist of songArtist){
            let getArtist = await artistService.getArtistById({id:artist});
            artist_name.push(getArtist.title);
          }

          let songActor = songList[i].actors;
          let actor_name = [];
          for(actor of songActor){
            let getActor = await actorService.getActorById({id:actor});
            actor_name.push(getActor.title);
          }

          songData.push({
            "id":songList[i].id,
            "playCount": songList[i].playCount,
            "downloadCount": songList[i].downloadCount,
            "title": songList[i].title,
            "description": songList[i].description,
            "thumb_img": songList[i].thumb_img,
            "media_file": songList[i].media_file,
            "artist":artist_name.toString(),
            "actor":actor_name.toString(),
            "duration": songList[i].duration?songList[i].duration:"0",
            "title2": slugify(songList[i].title),
            "lyricist": songList[i].lyricist,
            "composer": songList[i].composer,
            "album_movie_name": songList[i].album_movie_name,
            "star_cast": songList[i].star_cast,
            "director": songList[i].director,
            "track_language": songList[i].track_language,
            "releasing_year": songList[i].releasing_year,
            "track_language": songList[i].track_language
          })
        }
    }

     

    response.status = 200;
    response.message = constants.genericMessage.SONG_FETCHED;
    response.body = songData;
    req.query.count = true;
    const totalRecord = await songService.findSongs(req.query);
    response.totalRecord = totalRecord;

  } catch (error) {
    console.log("Something went wrong: Controller: Search Song", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
module.exports.pupulateSearchTerm = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {

     
      let songList = await songService.findSongs({});
      for (let i in songList) {
        let searchTerm = [];
        searchTerm.push(songList[i].title.toLowerCase());
        searchTerm.push(songList[i].album_movie_name.toLowerCase());
        searchTerm.push(songList[i].lyricist.toLowerCase());
        searchTerm.push(songList[i].composer.toLowerCase());
        searchTerm.push(songList[i].director.toLowerCase());

        let songArtist = songList[i].artists;
        for(artist of songArtist){
          let getArtist = await artistService.getArtistById({id:artist});
          searchTerm.push(getArtist.title.toLowerCase());
        }
        let songActor = songList[i].actors;
        if(songActor && songActor.length){
              for(actor of songActor){
                let getActor = await actorService.getActorById({id:actor});
                searchTerm.push(getActor.title.toLowerCase());
              }
        }
        if(songList[i].film){
          let getFilmById = await filmService.getFilmById({id:songList[i].film});
          if(getFilmById){
            searchTerm.push(getFilmById.title.toLowerCase());
          }
        }

        let searchString = searchTerm.toString();
        let data = {
          "tags":searchString
        }
        await songService.updateSongs({ id: songList[i].id, updateInfo: data });


      } 

    response.status = 200;
    response.message = constants.genericMessage.SONG_FETCHED;
    

  } catch (error) {
    console.log("Something went wrong: Controller: Search Song", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
exports.fetchAllPlaylistSong = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let search = {};
    let songData = await songService.findSongs({playlist:req.params.id,podcast:req.params.id})
    let songs = [];
    for (let i in songData) {
      if (songData[i].thumb_img) {
        songData[i].thumb_img = process.env.MEDIA_PATH + "songs/thumb_image/" + songData[i].thumb_img;
      }
      if (songData[i].media_file) {
        songData[i].media_file = process.env.MEDIA_PATH + "songs/" + songData[i].media_file;
      }
      let songArtist = songData[i].artists;
      let artist_name = [];
      for(artist of songArtist){
        let getArtist = await artistService.getArtistById({id:artist});
        artist_name.push(getArtist.title);
      }

      songs.push({
        "id":songData[i].id,
        "playCount": songData[i].playCount,
        "downloadCount": songData[i].downloadCount,
        "title": songData[i].title,
        "description": songData[i].description,
        "thumb_img": songData[i].thumb_img,
        "media_file": songData[i].media_file,
        "artist":artist_name.toString(),
        "status":songData[i].status,
        "createdAt":songData[i].createdAt,
        "duration": songData[i].duration,
        "title2": slugify(songData[i].title)
      })
    }
    
    if (songs.length) {
      response.status = 200;
      response.body = songs;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.SONG_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

