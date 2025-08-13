const Joi = require('@hapi/joi');

module.exports.insertSongSchema = Joi.object().keys({
  title: Joi.string().required(),
  lyricist: Joi.string().required(),
  composer: Joi.string().required(),
  album_movie_name: Joi.string().allow(null, ''),
  star_cast: Joi.string().allow(null, ''),
  director: Joi.string().allow(null, ''),
  track_language: Joi.string().required(),
  releasing_year: Joi.string().required(),
  categories: Joi.string().required(),
  artists: Joi.string().required(),
  mood: Joi.string().required(),
  event_name: Joi.string().allow(null, ''),
  music_label: Joi.string().allow(null, ''),
  description: Joi.string().allow(null, ''),
  status: Joi.string().required(),
  duration: Joi.string().required(),
  actors:Joi.string().allow(null, ''),
  film:Joi.string().allow(null, '')
});