const Joi = require('@hapi/joi');

module.exports.otpGeneration = Joi.object().keys({
  mobile: Joi.string().required(),
  device_id:Joi.string().allow(null, '')
});
module.exports.socialLogin = Joi.object().keys({
  email: Joi.string().required(),
  device_id:Joi.string().allow(null, '')
});

module.exports.otpValidation = Joi.object().keys({
  mobile: Joi.string().required(),
  email: Joi.string().allow(null, ''),
  otp_code: Joi.string().required(),
  device_id:Joi.string().allow(null, '')
});

module.exports.signup = Joi.object().keys({
  email: Joi.string().allow(null, ''),
  password: Joi.string().allow(null, ''),
  mobile: Joi.string().allow(null, ''),
  name: Joi.string().required(),
  country: Joi.string().required(),
  dob :  Joi.string().required(), 
  gender : Joi.string().required(),
  profile_pic : Joi.string().allow(null, ''),
  social_image : Joi.string().allow(null, ''),
  login_source: Joi.string().allow(null, ''),
  device_id:Joi.string().allow(null, '')
});

module.exports.login = Joi.object().keys({
  email: Joi.string().required(),
  password: Joi.string().required(),
  device_id:Joi.string().allow(null, '')
});
module.exports.favourite = Joi.object().keys({
  song_id: Joi.string().required(),
  user_id: Joi.string().required(),
  user_role : Joi.string().allow(null, ''),
  email : Joi.string().allow(null, ''),
  ip : Joi.string().allow(null, '')
});
module.exports.createPlaylist = Joi.object().keys({
  title: Joi.string().required(),
  user_id: Joi.string().required(),
  file : Joi.string().allow(null, ''),
  user_role : Joi.string().allow(null, ''),
  email : Joi.string().allow(null, ''),
  ip : Joi.string().allow(null, '')
});
module.exports.addPlaylistSong = Joi.object().keys({
  playlist_id: Joi.string().required(),
  songs: Joi.array().required(),
  user_id: Joi.string().required(),
  user_role : Joi.string().allow(null, ''),
  email : Joi.string().allow(null, ''),
  ip : Joi.string().allow(null, '')
});
module.exports.insertKaraokeSchema = Joi.object().keys({
  song_id: Joi.string().required(),
  user_id: Joi.string().required(),
  file: Joi.string().allow(null, ''),
  user_role : Joi.string().allow(null, ''),
  email : Joi.string().allow(null, ''),
  ip : Joi.string().allow(null, '')
});