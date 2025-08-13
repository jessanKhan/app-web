const Songs = require('../database/models/songModel');
const Mood = require('../database/models/moodModel');
const HommeSection = require('../database/models/homeSectionModel');
const { formatMongoData, checkObjectId, vaidObjectId } = require('../helper/dbHelper');
const constants = require('../constants');
const Karaoke = require('../database/models/karaokeModel');
const userKaraokeModel = require('../database/models/userKaraokeModel');
const Artist = require('../database/models/artistModel');
const Podcast = require('../database/models/podcastModel');
const promotionalBanner = require('../database/models/promotionalBannerModel');
const playListModel = require('../database/models/playlistModel');
const notificationModel = require('../database/models/notificationModel');
const homeSectionLibraryModel = require('../database/models/homeSectionLibraryModel');
const adverstisementModel = require('../database/models/adverstisementModel');
const Banner = require('../database/models/mainBannerModel');
const CMS = require('../database/models/cmsModel');
const moodSongOrder = require('../database/models/moodSongOrderModel');

module.exports.createSongs = async (serviceData) => {
  try {
    let song = new Songs({ ...serviceData });
    let result = await song.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createSongs', error);
    return new Error(error);
  }
}
module.exports.findSongs = async ({term,
  count=false,mood="",made_for_you="", new_song="",category="", artist="", actor="", 
  playlist="",
  featured = "",
  film = "",
  podcast = "",
  slug = "",
  searchType = "",
  notification= "",
  trending= "",
  advertisement= "",
  library="",
  skip=0,limit=0}) => {
  try {
    let find = {is_deleted:'n'};
    let sort = {id:1}
    if(term){
      find["tags"] = { $regex: term, $options: 'i' };
      // let searchArray = [];
      // var searchVal = term.split(" ");
      // let artistArr = [];
      // if (searchVal.length) {
      //   for (let val of searchVal) {
      //     searchArray.push(eval({ title: { $regex: val.toString(), $options: 'i' } } ));
      //     searchArray.push(eval({ composer: { $regex: val.toString(), $options: 'i' } } ));
      //     searchArray.push(eval({ album_movie_name: { $regex: val.toString(), $options: 'i' } } ));
      //     searchArray.push(eval({ director: { $regex: val.toString(), $options: 'i' } } ));
      //     searchArray.push(eval({ track_language: { $regex: val.toString(), $options: 'i' } } ));
      //     searchArray.push(eval({ releasing_year: { $regex: val.toString(), $options: 'i' } } ));

      //     let artist = await Artist.findOne({ title: { $regex: "^" + val.trim(), $options: "i" } });
      //     if(artist){
      //       artistArr.push(artist.id);
      //       searchArray.push(eval({ artists: { $in: artistArr } } ));
      //     }

      //   }
      // }
      // find = { $or: searchArray };
    }

    if(slug){
      let title = slug.replace(/-/g, ' ');
      console.log(title);
      //find["title"] = { $regex: title, $options: 'i' };
      find["title"] = title;
    }

    if(mood){
      find["mood"] = mood;
    }
    if(made_for_you){
      find["display_in_made_for_you"] = "1";
    }
    if(new_song){
      find["display_in_new"] = "1";
      sort = { updatedAt:-1 }
    }
    if(category){
      find["categories"] = { $in : [category] };
    }
    if(film){
      find["film"] = film;
    }
    if(podcast){
      find["podcast"] = podcast;
    }

    if(artist){
      find["artists"] = { $in : [artist] };
    }

    if(actor){
      find["actors"] = { $in : [actor] };
    }

    if(playlist){
      let playlistSong = await playListModel.findById(playlist);
      if(playlistSong){
        find = {};
        find["_id"]  = { $in:playlistSong.songs }
      }
    }

    if(library){
      let playlistSong = await homeSectionLibraryModel.findById(library);
      if(playlistSong){
        find = {};
        find["_id"]  = { $in:playlistSong.songs }
      }
    }

    if(notification){
      let notificationSong = await notificationModel.findById(notification);
      if(notificationSong){
        find = {};
        find["_id"]  = { $in:notificationSong.songs }
      }

      if(notificationSong.playlistBy == 'podcast'){
        searchType = "podcast";
      }
    }
    if(trending){
      let notificationSong = await homeSectionLibraryModel.findById(trending);
      if(notificationSong){
        find = {};
        find["_id"]  = { $in:notificationSong.songs }
      }

      if(notificationSong.playlistBy == 'podcast'){
        searchType = "podcast";
      }
    }
    if(advertisement){
      let notificationSong = await adverstisementModel.findById(advertisement);
      if(notificationSong){
        find = {};
        find["_id"]  = { $in:notificationSong.songs }
      }

      if(notificationSong.playlistBy == 'podcast'){
        searchType = "podcast";
      }
    }
    

    if(featured){
      find["featured"] = true;
    }

    
    //console.log(JSON.stringify(find));

   


    if(podcast || searchType == "podcast"){
      if (!count) {
        let fetch_songs = await Podcast.find(find).skip(parseInt(skip)).limit(parseInt(limit)).sort(sort);
        return formatMongoData(fetch_songs);
      }else if (count) {
        return await Podcast.find(find).countDocuments();
      }
    }else{
      if (!count) {
        let fetch_songs = await Songs.find(find).skip(parseInt(skip)).limit(parseInt(limit)).sort(sort);
        return formatMongoData(fetch_songs);
      }else if (count) {
        console.log(find);

        return await Songs.find(find).countDocuments();
      }
    }

   
    
  } catch (error) {
    console.log('Something went wrong: Service: searchSongs', error);
    throw new Error(error);
  }
}
module.exports.getAllSongs = async (find) => {
  try {
    //let find = {};
    console.log(find)
    let items = await Songs.find(find);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllSongss', error);
    return new Error(error);
  }
}
module.exports.getSongsList = async ({skip=0,limit=10}) => {
  try {
    let find = { is_deleted:"n",status:"active" };

    let songs = await Songs.find(find).limit(limit).sort({_id:-1});
    return formatMongoData(songs);
  } catch (error) {
    console.log('Something went wrong: Service: getAllSongss', error);
    return new Error(error);
  }
}


module.exports.getSongsById = async ({id}) => {
  try {
    //checkObjectId(id);
    let song = await Songs.findById(id);
    if (!song) {
      return new Error(constants.genericMessage.SONG_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: getSongsById', error);
    return new Error(error);
  }
}

module.exports.updateSongs = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let song = await Songs.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!song) {
      return new Error(constants.SongsMessage.Songs_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: updateSongs', error);
    return new Error(error);
  }
}

module.exports.searchSongs = async (searchdata) => {
  try {
    let Songs = await Songs.findOne(searchdata);
    if(Songs){
      return formatMongoData(Songs);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchSongs', error);
    throw new Error(error);
  }
}
module.exports.findMood = async (val) => {
  try {
    let Songs = await Mood.findOne({ title: { $regex: "^" + val.trim(), $options: "i" } });
    if(Songs){
      return formatMongoData(Songs);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchSongs', error);
    throw new Error(error);
  }
}
module.exports.getAllMood = async (find, sort="") => {
  try {
    //let find = {};
    let sort_by = { _id:1 };
    if(sort!=""){
      sort_by = {order:1}
    } 

    let items = await Mood.find(find).sort(sort_by);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllArtists', error);
    return new Error(error);
  }
}
module.exports.getMoodById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await Mood.findById(id);
    if (!product_type) {
      return new Error(constants.genericMessage.RESOURCE_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getCategoryById', error);
    return new Error(error);
  }
}
module.exports.createMood = async (serviceData) => {
  try {    
    let data = new Mood({ ...serviceData });
    let result = await data.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createMood', error);
    return new Error(error);
  }
}
module.exports.updateMood = async ({ id, updateInfo }) => {
  try {

    checkObjectId(id);
    let findData = await Mood.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!findData) {
      return new Error(constants.genericMessage.RESOURCE_NOT_FOUND);
    }
    return formatMongoData(findData);
  } catch (error) {
    console.log('Something went wrong: Service: updateCategory', error);
    return new Error(error);
  }
}
module.exports.getKaraokeList = async ({skip=0,limit=10}) => {
  try {
    let find = { is_deleted:"n",status:"active" };

    let karaoke = await Karaoke.find(find).skip(parseInt(skip)).limit(parseInt(limit)).sort({_id:-1});
    return formatMongoData(karaoke);
  } catch (error) {
    console.log('Something went wrong: Service: getAllkaraoke', error);
    return new Error(error);
  }
}
module.exports.getKaraoke = async ({id}) => {
  try {
    if(vaidObjectId(id)){
      let data = await Karaoke.findById(id);
      return formatMongoData(data);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: getCategoryById', error);
    return new Error(error);
  }
}
module.exports.getAllUserKaraoke = async (find) => {
  try {
    //let find = {};
    console.log(find)
    let items = await userKaraokeModel.find(find).populate({path: "user_id"}).populate({ path: "song_id", select: ["title", "vocal", "lyricist", "composer", "song"] });
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: userKaraokeModel', error);
    return new Error(error);
  }
}
module.exports.userKaraokeDetails = async ({id}) => {
  try {
    if(vaidObjectId(id)){
      let data = await userKaraokeModel.findById(id);
      return formatMongoData(data);
    }
  } catch (error) {
    console.log('Something went wrong: Service: userKaraokeModel', error);
    return new Error(error);
  }
}
module.exports.updateUserKaraoke = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let product_type = await userKaraokeModel.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!product_type) {
      return new Error("No Data Found");
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: updateUserKaraoke', error);
    return new Error(error);
  }
}
module.exports.getAllKaraoke = async (find) => {
  try {
    //let find = {};
    console.log(find)
    let items = await Karaoke.find(find);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllKaraoke', error);
    return new Error(error);
  }
}
module.exports.getKaraokeById = async ({id}) => {
  try {
    //checkObjectId(id);
    let song = await Karaoke.findById(id);
    if (!song) {
      return new Error(constants.genericMessage.SONG_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: getKaraokeById', error);
    return new Error(error);
  }
}
module.exports.createKaraoke = async (serviceData) => {
  try {
    let song = new Karaoke({ ...serviceData });
    let result = await song.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createSongs', error);
    return new Error(error);
  }
}
module.exports.updateKaraoke = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let song = await Karaoke.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!song) {
      return new Error(constants.genericMessage.DATA_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: updateKaraoke', error);
    return new Error(error);
  }
}
module.exports.deleteUserKaraoke = async (id) => {
  try {
    checkObjectId(id);
    let findData = await userKaraokeModel.deleteOne({_id:id});
    if (!findData) {
      throw new Error(constants.genericMessage.DATA_NOT_FOUND);
    }
    //return formatMongoData(blog);
  } catch (error) {
    console.log('Something went wrong: Service: delete', error);
    throw new Error(error);
  }
}

module.exports.getPodcastList = async ({skip=0,limit=10}) => {
  try {
    let find = { is_deleted:"n",status:"active" };

    let podcast = await Podcast.find(find).limit(limit).sort({_id:-1});
    return formatMongoData(podcast);
  } catch (error) {
    console.log('Something went wrong: Service: getAllPodcast', error);
    return new Error(error);
  }
}
module.exports.getAllPodcast = async (find) => {
  try {
    //let find = {};
    console.log(find)
    let items = await Podcast.find(find);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllPodcast', error);
    return new Error(error);
  }
}
module.exports.createPodcast = async (serviceData) => {
  try {
    let song = new Podcast({ ...serviceData });
    let result = await song.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createPodcast', error);
    return new Error(error);
  }
}
module.exports.updatePodcast = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let song = await Podcast.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!song) {
      return new Error(constants.SongsMessage.Songs_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: updatePodcast', error);
    return new Error(error);
  }
}
module.exports.getPodcastById = async ({id}) => {
  try {
    //checkObjectId(id);
    let song = await Podcast.findById(id);
    if (!song) {
      return new Error(constants.genericMessage.SONG_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: getPodcastById', error);
    return new Error(error);
  }
}

module.exports.getPromotionalBanner = async ({status}) => {
  try {
    //checkObjectId(id);
    let find = {};
    if(status){
      find['status'] = status
    }
    let song = await promotionalBanner.find(find);
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: getPromotionalBanner', error);
    return new Error(error);
  }
}
module.exports.getMainBanner = async ({status}) => {
  try {
    //checkObjectId(id);
    let find = {};
    if(status){
      find['status'] = status
    }
    let song = await Banner.find(find);
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: getPromotionalBanner', error);
    return new Error(error);
  }
}

module.exports.getPromotionalBannerById = async ({id}) => {
  try {
    //checkObjectId(id);
    let song = await promotionalBanner.findById(id);
    if (!song) {
      return new Error(constants.genericMessage.DATA_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: getPromotionalBannerById', error);
    return new Error(error);
  }
}
module.exports.updatePromotionalBanner = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let song = await promotionalBanner.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!song) {
      return new Error(constants.genericMessage.DATA_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: updatePromotionalBanner', error);
    return new Error(error);
  }
}
module.exports.getBannerById = async ({id}) => {
  try {
    //checkObjectId(id);
    let song = await Banner.findById(id);
    if (!song) {
      return new Error(constants.genericMessage.DATA_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: getPromotionalBannerById', error);
    return new Error(error);
  }
}
module.exports.updateMainBanner = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let song = await Banner.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!song) {
      return new Error(constants.genericMessage.DATA_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: updatePromotionalBanner', error);
    return new Error(error);
  }
}
module.exports.getAllCMS = async (find) => {
  try {
    //let find = {};
    let items = await CMS.find(find);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllCMS', error);
    return new Error(error);
  }
}
module.exports.getCMSById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await CMS.findById(id);
    if (!product_type) {
      return new Error(constants.genericMessage.RESOURCE_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getCMSById', error);
    return new Error(error);
  }
}
module.exports.updateCMS = async ({ id, updateInfo }) => {
  try {

    checkObjectId(id);
    let findData = await CMS.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!findData) {
      return new Error(constants.genericMessage.RESOURCE_NOT_FOUND);
    }
    return formatMongoData(findData);
  } catch (error) {
    console.log('Something went wrong: Service: updateCategory', error);
    return new Error(error);
  }
}
module.exports.findSongByTitle = async (val) => {
  try {
    let Song = await Songs.findOne({ title: val });
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
module.exports.resetOrderMood = async () => {
  try {
    await Mood.updateMany({}, { order : 99999 }, { new: true, useFindAndModify: false });
  } catch (error) {
    console.log('Something went wrong: Service: deleteorder', error);
    return new Error(error);
  }
}

module.exports.getAllHomeSection = async (find, sort="") => {
  try {
    //let find = {};
    let sort_by = { _id:1 };
    if(sort!=""){
      sort_by = {order:1}
    } 

    let items = await HommeSection.find(find).sort(sort_by);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllArtists', error);
    return new Error(error);
  }
}
module.exports.getHomeSectionById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await HommeSection.findById(id);
    if (!product_type) {
      return new Error(constants.genericMessage.RESOURCE_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getCategoryById', error);
    return new Error(error);
  }
}
module.exports.createHomeSection = async (serviceData) => {
  try {  
    let data = new HommeSection({ ...serviceData });
    let result = await data.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createMood', error);
    return new Error(error);
  }
}
module.exports.updateHomeSection = async ({ id, updateInfo }) => {
  try {

    checkObjectId(id);
    let findData = await HommeSection.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!findData) {
      return new Error(constants.genericMessage.RESOURCE_NOT_FOUND);
    }
    return formatMongoData(findData);
  } catch (error) {
    console.log('Something went wrong: Service: updateCategory', error);
    return new Error(error);
  }
}

module.exports.findMoodSongs = async ({mood_id, skip=0,limit=0, count=false}) => {
  try {
    let find = {};

    if(mood_id){
      find["mood_id"] = mood_id;
    }
    
    if (!count) {
      let fetch_songs = await moodSongOrder.find(find).skip(parseInt(skip)).limit(parseInt(limit)).sort({position:1}).populate({ path: "song_id" });
      return formatMongoData(fetch_songs);
    }else if (count) {
      console.log(find);

      return await moodSongOrder.find(find).countDocuments();
    }
   
    
  } catch (error) {
    console.log('Something went wrong: Service: searchSongs', error);
    throw new Error(error);
  }
}