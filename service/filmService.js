const Film = require('../database/models/filmModel');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const constants = require('../constants');

module.exports.createFilm = async (serviceData) => {
  try {
    let product_type = new Film({ ...serviceData });
    let result = await product_type.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createFilm', error);
    return new Error(error);
  }
}

module.exports.getAllFilm = async (find) => {
  try {
    //let find = {};
    let items = await Film.find(find);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllFilms', error);
    return new Error(error);
  }
}
module.exports.getFilmList = async () => {
  try {
    let product_types = await Film.find({});
    return formatMongoData(product_types);
  } catch (error) {
    console.log('Something went wrong: Service: getAllFilms', error);
    return new Error(error);
  }
}


module.exports.getFilmById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await Film.findById(id);
    if (!product_type) {
      return new Error(constants.FilmMessage.Film_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getFilmById', error);
    return new Error(error);
  }
}

module.exports.updateFilm = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let product_type = await Film.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!product_type) {
      return new Error(constants.FilmMessage.Film_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: updateFilm', error);
    return new Error(error);
  }
}

module.exports.searchFilm = async (searchdata) => {
  try {
    let Film = await Film.findOne(searchdata);
    if(Film){
      return formatMongoData(Film);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchFilm', error);
    throw new Error(error);
  }
}
module.exports.findFilm = async (val) => {
  try {
    let Songs = await Film.findOne({ title: { $regex: "^" + val.trim(), $options: "i" } });
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