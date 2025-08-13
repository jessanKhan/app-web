const Actor = require('../database/models/actorModel');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const constants = require('../constants');

module.exports.createActor = async (serviceData) => {
  try {
    let product_type = new Actor({ ...serviceData });
    let result = await product_type.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createActor', error);
    return new Error(error);
  }
}

module.exports.getAllActor = async (find, sort = "") => {
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

    let items = await Actor.find(find).sort(sort_by);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllActors', error);
    return new Error(error);
  }
}
module.exports.getActorList = async () => {
  try {
    let product_types = await Actor.find({});
    return formatMongoData(product_types);
  } catch (error) {
    console.log('Something went wrong: Service: getAllActors', error);
    return new Error(error);
  }
}


module.exports.getActorById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await Actor.findById(id);
    if (!product_type) {
      return new Error(constants.ActorMessage.Actor_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getActorById', error);
    return new Error(error);
  }
}

module.exports.updateActor = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let product_type = await Actor.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true }
    )
    if (!product_type) {
      return new Error(constants.ActorMessage.Actor_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: updateActor', error);
    return new Error(error);
  }
}

module.exports.searchActor = async (searchdata) => {
  try {
    let Actor = await Actor.findOne(searchdata);
    if(Actor){
      return formatMongoData(Actor);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchActor', error);
    throw new Error(error);
  }
}

module.exports.findActor = async (val) => {
  try {
    let Songs = await Actor.findOne({ title: { $regex: "^" + val.trim(), $options: "i" } });
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
module.exports.resetOrderActor = async () => {
  try {
    await Actor.updateMany({}, { order : 99999 }, { new: true, useFindAndModify: false });
  } catch (error) {
    console.log('Something went wrong: Service: deleteorder', error);
    return new Error(error);
  }
}
