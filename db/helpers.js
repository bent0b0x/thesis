var db = require('./db.js');
var models = require('./models.js');
var Promise = require('bluebird');

module.exports.findOrCreate = function (Model, attributes) {

  return new Promise (function (resolve, reject) {
    Model.forge(attributes).fetch()
    .then(function (model) {
      if (!model) {
        model = new Model(attributes);
      }
      model.save()
      .then(function () {
        resolve(model);
      })
      .catch(function (error) {
        reject(error);
      });
    })
    .catch(function (error) {
      reject(error);
    });
  });
};

module.exports.getFriends = function (ids_obj) {
  var ids_array = [];
  for (var id in ids_obj) {
    ids_array.push(id);
  }
  var friends = [];
  var friendCount = 0;
  return new Promise(function (res, rej) {
    return ids_array.forEach(function (id) {
      return db.knex
      .select()
      .from('users')
      .where('facebook_id', id)
      .then(function (user) {
        if (user.length) {
          friends.push(user[0]);
          if (++friendCount === ids_array.length) {
            res(friends);
          }
        } else {
          new models.User({'facebook_id': id}).save()
          .then(function (user) {
            friends.push(user);
            if (++friendCount === ids_array.length) {
              res(friends);
              res();
            }
          })
          .catch(function (error) {
            console.log(error);
          })
        }
      })
    });
  });
};

module.exports.inviteFriends = function (game, friends) {
  return new Promise(function (res, rej) {
    var inviteCount = 0;
    friends.forEach(function (friend) {
      module.exports.findOrCreate(models.UserGame, {game_id: game.id, user_id: friend.id})
      .then(function (userGame) {
        if (++inviteCount === friends.length) {
          res(game);
        }
      })
      .catch(function (error) {
        rej(error);
      });
    });
  });
};