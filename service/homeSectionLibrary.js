const HomeSectionLibrary = require('../database/models/homeSectionLibraryModel');
const Advertisement = require('../database/models/adverstisementModel');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const constants = require('../constants');

module.exports.createHomeSectionLibrary = async (serviceData) => {
  try {
    let product_type = new HomeSectionLibrary({ ...serviceData });
    let result = await product_type.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createHomeSectionLibrary', error);
    return new Error(error);
  }
}
module.exports.getAllHomeSectionLibrary = async (find, sort = "", skip = 0, limit = 0) => {
  try {
    //let find = {};
    let sort_by = { _id:1 };
    if(sort!=""){
      sort_by = {order:1}
    } 
    let items = await HomeSectionLibrary.find(find).skip(parseInt(skip)).limit(parseInt(limit)).sort(sort_by);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllHomeSectionLibrarys', error);
    return new Error(error);
  }
}
module.exports.getHomeSectionLibraryList = async () => {
  try {
    let product_types = await HomeSectionLibrary.find({});
    return formatMongoData(product_types);
  } catch (error) {
    console.log('Something went wrong: Service: getAllHomeSectionLibrarys', error);
    return new Error(error);
  }
}
module.exports.getHomeSectionLibraryById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await HomeSectionLibrary.findById(id);
    if (!product_type) {
      return new Error(constants.HomeSectionLibraryMessage.HomeSectionLibrary_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getHomeSectionLibraryById', error);
    return new Error(error);
  }
}
module.exports.updateHomeSectionLibrary = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let product_type = await HomeSectionLibrary.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true }
    )
    if (!product_type) {
      return new Error(constants.HomeSectionLibraryMessage.HomeSectionLibrary_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: updateHomeSectionLibrary', error);
    return new Error(error);
  }
}
module.exports.searchHomeSectionLibrary = async (searchdata) => {
  try {
    let HomeSectionLibrary = await HomeSectionLibrary.findOne(searchdata);
    if(HomeSectionLibrary){
      return formatMongoData(HomeSectionLibrary);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchHomeSectionLibrary', error);
    throw new Error(error);
  }
}
exports.deleteHomeSectionLibrary = async ({ id }) => {
  try {
    await HomeSectionLibrary.deleteOne({ _id: id });
    return true;
  } catch (error) {
    console.log('Something went wrong: Service: deleteImages', error.stack);
    throw new Error(error.stack);
  }
};



module.exports.createAdvertisement = async (serviceData) => {
  try {
    let product_type = new Advertisement({ ...serviceData });
    let result = await product_type.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createAdvertisement', error);
    return new Error(error);
  }
}
module.exports.getAllAdvertisement = async (find, sort = "") => {
  try {
    //let find = {};
    let sort_by = { _id:1 };
    if(sort!=""){
      sort_by = {order:1}
    } 
    let items = await Advertisement.find(find).sort(sort_by);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllAdvertisements', error);
    return new Error(error);
  }
}
module.exports.getAdvertisementList = async () => {
  try {
    let product_types = await Advertisement.find({});
    return formatMongoData(product_types);
  } catch (error) {
    console.log('Something went wrong: Service: getAllAdvertisements', error);
    return new Error(error);
  }
}
module.exports.getAdvertisementById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await Advertisement.findById(id);
    if (!product_type) {
      return new Error(constants.AdvertisementMessage.Advertisement_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getAdvertisementById', error);
    return new Error(error);
  }
}
module.exports.updateAdvertisement = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let product_type = await Advertisement.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true }
    )
    if (!product_type) {
      return new Error(constants.AdvertisementMessage.Advertisement_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: updateAdvertisement', error);
    return new Error(error);
  }
}
module.exports.searchAdvertisement = async (searchdata) => {
  try {
    let Advertisement = await Advertisement.findOne(searchdata);
    if(Advertisement){
      return formatMongoData(Advertisement);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchAdvertisement', error);
    throw new Error(error);
  }
}
exports.deleteAdvertisement = async ({ id }) => {
  try {
    await Advertisement.deleteOne({ _id: id });
    return true;
  } catch (error) {
    console.log('Something went wrong: Service: deleteImages', error.stack);
    throw new Error(error.stack);
  }
};
