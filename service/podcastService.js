const Podcast = require('../database/models/podcastMainModel');
const PodcastList = require('../database/models/podcastModel');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const constants = require('../constants');

module.exports.searchAllPodcast = async ({podcast = "", count=false, skip=0,limit=0})=> {
  try {
    let find = {is_deleted:'n'};

    if(podcast){
      find["podcast"] = podcast;
    }

    if (!count) {
      let fetch_songs = await PodcastList.find(find).skip(parseInt(skip)).limit(parseInt(limit));
      return formatMongoData(fetch_songs);
    }else if (count) {
      return await PodcastList.find(find).countDocuments();
    }

  } catch (error) {
    console.log('Something went wrong: Service: createPodcast', error);
    return new Error(error);
  }
}

module.exports.createPodcast = async (serviceData) => {
  try {
    let product_type = new Podcast({ ...serviceData });
    let result = await product_type.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createPodcast', error);
    return new Error(error);
  }
}

module.exports.getAllPodcast = async (find, sort="") => {
  try {
    //let find = {};

    let sort_by = { id:1 };
    if(sort!=""){
      if(sort == "order"){
        sort_by = {order:1}
      }
      if(sort == "updatedAt"){
        sort_by = {updatedAt:-1}
      }
    } 

    let items = await Podcast.find(find).sort(sort_by);;
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllPodcasts', error);
    return new Error(error);
  }
}
module.exports.getPodcastList = async () => {
  try {
    let product_types = await Podcast.find({});
    return formatMongoData(product_types);
  } catch (error) {
    console.log('Something went wrong: Service: getAllPodcasts', error);
    return new Error(error);
  }
}


module.exports.getPodcastById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await Podcast.findById(id);
    if (!product_type) {
      return new Error(constants.PodcastMessage.Podcast_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getPodcastById', error);
    return new Error(error);
  }
}

module.exports.updatePodcast = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let product_type = await Podcast.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!product_type) {
      return new Error(constants.PodcastMessage.Podcast_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: updatePodcast', error);
    return new Error(error);
  }
}

module.exports.searchPodcast = async (searchdata) => {
  try {
    let Podcast = await Podcast.findOne(searchdata);
    if(Podcast){
      return formatMongoData(Podcast);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchPodcast', error);
    throw new Error(error);
  }
}
module.exports.findPodcast = async (val) => {
  try {
    let Songs = await Podcast.findOne({ title: { $regex: "^" + val.trim(), $options: "i" } });
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
module.exports.resetOrderPodcast = async () => {
  try {
    await Podcast.updateMany({}, { order : 99999 }, { new: true, useFindAndModify: false });
  } catch (error) {
    console.log('Something went wrong: Service: deleteorder', error);
    return new Error(error);
  }
}