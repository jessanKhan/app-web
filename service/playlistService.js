const Playlist = require('../database/models/playlistModel');
const contentOrder = require('../database/models/contentOrderModel');
const moodSong = require('../database/models/moodSongOrderModel');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const constants = require('../constants');

module.exports.createPlaylist = async (serviceData) => {
  try {
    let product_type = new Playlist({ ...serviceData });
    let result = await product_type.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createPlaylist', error);
    return new Error(error);
  }
}

module.exports.getAllPlaylist = async (find, sort = "") => {
  try {
    //let find = {};
    let sort_by = { _id:1 };
    if(sort!=""){
      sort_by = {order:1}
    } 
    let items = await Playlist.find(find).sort(sort_by);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllPlaylists', error);
    return new Error(error);
  }
}
module.exports.getPlaylistList = async () => {
  try {
    let product_types = await Playlist.find({});
    return formatMongoData(product_types);
  } catch (error) {
    console.log('Something went wrong: Service: getAllPlaylists', error);
    return new Error(error);
  }
}


module.exports.getPlaylistById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await Playlist.findById(id);
    if (!product_type) {
      return new Error(constants.PlaylistMessage.PLAYLIST_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getPlaylistById', error);
    return new Error(error);
  }
}

module.exports.updatePlaylist = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let product_type = await Playlist.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true }
    )
    if (!product_type) {
      return new Error(constants.PlaylistMessage.PLAYLIST_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: updatePlaylist', error);
    return new Error(error);
  }
}

module.exports.searchPlaylist = async (searchdata) => {
  try {
    let Playlist = await Playlist.findOne(searchdata);
    if(Playlist){
      return formatMongoData(Playlist);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchPlaylist', error);
    throw new Error(error);
  }
}
exports.deletePlaylist = async ({ id }) => {
  try {
    await Playlist.deleteOne({ _id: id });
    return true;
  } catch (error) {
    console.log('Something went wrong: Service: deleteImages', error.stack);
    throw new Error(error.stack);
  }
};
module.exports.findPlayByTitle = async (val) => {
  try {
    let Song = await Playlist.findOne({ title: val });
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

module.exports.getContentOrder = async (find) => {
  try {
    //let find = {};
    let items = await contentOrder.find(find).sort({position:1});
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: contentOrder', error);
    return new Error(error);
  }
}
module.exports.deleteorder = async ({content_type}) => {
  try {
    await contentOrder.deleteMany({content_type:content_type });

  } catch (error) {
    console.log('Something went wrong: Service: deleteorder', error);
    return new Error(error);
  }
}
module.exports.insertContentOrder = async (serviceData) => {
  try {
    let content_Order = new contentOrder({ ...serviceData });
    let result = await content_Order.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: insertContentOrder', error);
    return new Error(error);
  }
}
module.exports.resetOrderPlaylist = async () => {
  try {
    await Playlist.updateMany({}, { order : 99999 }, { new: true, useFindAndModify: false });
  } catch (error) {
    console.log('Something went wrong: Service: deleteorder', error);
    return new Error(error);
  }
}
module.exports.getMoodSongOrder = async (find) => {
  try {
    //let find = {};
    let items = await moodSong.find(find).sort({position:1});
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: moodSong', error);
    return new Error(error);
  }
}
module.exports.deleteMoodorder = async ({mood_id}) => {
  try {
    await moodSong.deleteMany({mood_id:mood_id });

  } catch (error) {
    console.log('Something went wrong: Service: deleteorder', error);
    return new Error(error);
  }
}
module.exports.insertMoodOrder = async (serviceData) => {
  try {
    let content_Order = new moodSong({ ...serviceData });
    let result = await content_Order.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: insertMoodOrder', error);
    return new Error(error);
  }
}