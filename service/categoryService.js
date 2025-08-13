const Category = require('../database/models/catogoryModel');
const CMS = require('../database/models/cmsModel');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const constants = require('../constants');

module.exports.createCategory = async (serviceData) => {
  try {
    let product_type = new Category({ ...serviceData });
    let result = await product_type.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createCategory', error);
    return new Error(error);
  }
}

module.exports.getAllCategory = async (find) => {
  try {
    //let find = {};
    let items = await Category.find(find);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllCategorys', error);
    return new Error(error);
  }
}
module.exports.getCategoryList = async () => {
  try {
    let product_types = await Category.find({});
    return formatMongoData(product_types);
  } catch (error) {
    console.log('Something went wrong: Service: getAllCategorys', error);
    return new Error(error);
  }
}


module.exports.getCategoryById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await Category.findById(id);
    if (!product_type) {
      return new Error(constants.CategoryMessage.Category_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getCategoryById', error);
    return new Error(error);
  }
}

module.exports.updateCategory = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let product_type = await Category.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!product_type) {
      return new Error(constants.CategoryMessage.Category_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: updateCategory', error);
    return new Error(error);
  }
}

module.exports.searchCategory = async (searchdata) => {
  try {
    let Category = await Category.findOne(searchdata);
    if(Category){
      return formatMongoData(Category);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchCategory', error);
    throw new Error(error);
  }
}
module.exports.findCategory = async (val) => {
  try {
    let Songs = await Category.findOne({ title: { $regex: "^" + val.trim(), $options: "i" } });
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
module.exports.getCMSBySlug = async ({ slug }) => {
  try {
    let product = await CMS.findOne({slug:slug});
    if (!product) {
      throw new Error(constants.genericMessage.DATA_NOT_FOUND);
    }
    return formatMongoData(product);
  } catch (error) {
    console.log('Something went wrong: Service: getProductById', error);
    throw new Error(error);
  }
}