"use strict";

var config = require('config');
const db = require('../../models/db');
const uuidv4 = require('uuid/v4');
const os = require('os');

var mailer = require('../../helpers/mailer');
var uploader = require('../../helpers/uploader');
var importer = require('../../helpers/importer');

var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var swig = require('swig');
var async = require('async');
var _ = require('underscore');
var fs = require('fs');
var request = require('request');
var gm = require('gm');
var validator = require('validator');
var URL = require('url').URL;

var express = require('express');
var router = express.Router();
var glob = require('glob');

router.get('/current', function(req, res, next) {
  if (req.user) {
    var u = _.clone(req.user.dataValues);
    delete u.password_hash;
    delete u.password_reset_token;
    delete u.confirmation_token;
    u.token = req.cookies['sdsession'];

    console.log(u);
    
    res.status(200).json(u);
  } else {
    res.status(401).json({"error":"user_not_found"});
  }
});

// create user
router.post('/', function(req, res) {
  if (!req.body["email"] || !req.body["password"]) {
    res.status(400).json({"error":"email or password missing"});
    return;
  }
  
  var email = req.body["email"].toLowerCase();
  var nickname = req.body["nickname"];
  var password = req.body["password"];
  var password_confirmation = req.body["password_confirmation"];

  if (password_confirmation != password) {
    res.status(400).json({"error":"password_confirmation"});
    return;
  }
  
  if (!validator.isEmail(email)) {
    res.status(400).json({"error":"email_invalid"});
    return;
  }
  
  var createUser = function() {
    bcrypt.genSalt(10, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
        crypto.randomBytes(16, function(ex, buf) {
          var token = buf.toString('hex');

          var u = {
            _id: uuidv4(),
            email: email,
            account_type: "email",
            nickname: nickname,
            password_hash: hash,
            prefs_language: req.i18n.locale,
            confirmation_token: token
          };

          db.User.create(u)
            .error(err => {
              res.sendStatus(400);
            })
            .then(u => {
              var homeSpace = {
                _id: uuidv4(),
                name: req.i18n.__("home"),
                space_type: "folder",
                creator_id: u._id
              };
              db.Space.create(homeSpace)
                .error(err => {
                  res.sendStatus(400);
                })
                .then(homeSpace => {
                  u.home_folder_id = homeSpace._id;
                  u.save()
                    .then(() => {
                      res.status(201).json({});
                      
                      mailer.sendMail(u.email, req.i18n.__("confirm_subject"), req.i18n.__("confirm_body"), {
                        action: {
                          link: config.endpoint + "/confirm/" + u.confirmation_token,
                          name: req.i18n.__("confirm_action")
                        }
                      });
                    })
                    .error(err => {
                      res.status(400).json(err);
                    });
                })
            });
        });
      });
    });
  };
  
  db.User.findAll({where: {email: email}})
    .then(users => {
      if (users.length == 0) {
        //var domain = email.slice(email.lastIndexOf('@')+1);
        createUser();
      } else {
        res.status(400).json({"error":"user_email_already_used"});
      }
    })
});
/*
//ADDED MISSING GOOGLE AUTH CALLBACK
router.get('/loginorsignupviagoogle', function(req, res) {
  var google = require('googleapis');
  var OAuth2 = google.auth.OAuth2;
  var plus = google.plus('v1');
  var oauth2Client = new OAuth2(
    config.google_access,
    config.google_secret,
    config.endpoint + "/login"
  );
  var loginUser = function(user, cb) {
    crypo.randomBytes(48, function(ex, buf) {
      var token = buf.toString('hex');
      var session = {
        token: token,
        created_at: new Date()
      };
      if(!user.sessions)
        user.sessions = [];
      user.sessions.push(session);
      user.save(function(err, user) {
        cb(session);
      });
    });
  };
  var code = req.query.code;
  oauth2Client.getToken(code, function(err, tokens) {
    if (err) res.status(400).json(err);
    else {
      var apiUrl = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + tokens.access_token;

      var finalizeLogin = function(session){
        var secure = process.env.NODE_ENV == "production" || process.env.NODE_ENV == "staging";
        res.cookie('sdsession', session.token, { httpOnly: true, secure: secure});
        res.cookie('sdsession', session.token, { httpOnly: true });
        res.status(201).json(session);
      };

      request.get(apiUrl, function(error, response, body) {
        if (error) res.status(400).json(error);
        else {
          const data = JSON.parse(body);
          const email = data.email;
          const name = data.name;
          db.User.findOne({email: email}, function (err, user) {
            if (user) {
              // login new google user
              if (user.account_type == "google") {
                // just login
                loginUser(user, (session) => {
                  finalizeLogin(session);
                });
              } else {
                res.status(400).json({"error":"user_email_already_used"});
              }
            } else {
              const u = new User({
                email: email,
                account_type: "google",
                nickname: name,
                avatar_thumb_uri: body.picture,
                preferences: {
                  language: req.i18n.locale
                },
                confirmed_at: new Date()
              });
              u.save(function (err) {
                if (err) res.status(400).json(err);
                else {
                  var homeSpace = new Space({
                    name: req.i18n.__("home"),
                    space_type: "folder",
                    creator: u
                  });
                  homeSpace.save(function(err, homeSpace) {
                    if (err) res.status(400).json(err);
                    else {
                      u.home_folder_id = homeSpace._id;
                      u.save(function(err){
                        if (err) res.sendStatus(400);
                        else {
                          mailer.sendMail(u.email, req.i18n.__("welcome_subject"), req.i18n.__("welcome_body"), {});
                          loginUser(u, function(session) {
                            finalizeLogin(session);
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
});
*/
router.get('/current', function(req, res, next) {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({"error":"user_not_found"});
  }
});

router.put('/:id', function(req, res, next) {
  // TODO explicit whitelisting
  var user = req.user;
  if (user._id == req.params.id) {
    var newAttr = req.body;
    newAttr.updated_at = new Date();
    delete newAttr['_id'];

    db.User.update(newAttr, {where: {"_id": user._id}}).then(function(updatedUser) {
      res.status(200).json(newAttr);
    });
  } else {
    res.sendStatus(403);
  }
});

router.post('/:id/password', function(req, res, next) {
  var user = req.user;
  var old_password = req.body.old_password;
  var pass = req.body.new_password;

  if (pass.length >= 6) {
    if (user._id == req.params.id) {
      if (bcrypt.compareSync(old_password, user.password_hash)) {
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(pass, salt, function(err, hash) {
            user.password_hash = hash;
            user.save().then(function() {
              res.sendStatus(204);
            });
          });
        });
      } else {
        res.status(403).json({"error": "old password wrong"});
      }
    } else {
      res.status(403).json({"error": "wrong user"});
    }
  } else {
    res.status(400).json({"error": "password_to_short"});
  }
});

router.delete('/:id',  (req, res, next) => {
  const user = req.user;
  if(user._id == req.params.id) {
    if (user.account_type == 'email') {
      if (bcrypt.compareSync(req.query.password, user.password_hash)) {
        user.remove((err) => {
          if(err)res.status(400).json(err);
          else res.sendStatus(204);
        });
      } else {
        res.bad_request("password_incorrect");
      }
    } else {
      user.remove((err) => {
        if (err) res.status(400).json(err);
        else res.sendStatus(204);
      });
    }
  }
  else res.status(403).json({error: ""});
});

router.put('/:user_id/confirm', (req, res) => {
  const token = req.body.token;
  const user = req.user;

  if (user.confirmation_token === token) {
    user.confirmation_token = null;
    user.confirmed_at = new Date();
    user.save(function(err, updatedUser) {
      if(err) {
        res.sendStatus(400);
      } else {
        res.status(200).json(updatedUser);
      }
    });
  } else {
    res.sendStatus(400);
  }
});

router.post('/:user_id/avatar', (req, res, next) => {
  const user = req.user;
  const filename = "u"+req.user._id+"_"+(new Date().getTime())+".jpeg"

  const localFilePath = os.tmpdir()+"/"+filename;
  const localResizedFilePath = os.tmpdir()+"/resized_"+filename;
  const writeStream = fs.createWriteStream(localFilePath);
  const stream = req.pipe(writeStream);

  req.on('end', function() {
    gm(localFilePath).resize(200, 200).autoOrient().write(localResizedFilePath, (err) => {
      if (err) res.status(400).json(err);
      else {
        uploader.uploadFile(filename, "image/jpeg", localResizedFilePath, (err, url) => {
          if (err) res.status(400).json(err);
          else {
            user.avatar_thumb_uri = url;
            user.save().then(() => {
              fs.unlinkSync(localResizedFilePath, (err) => {
                if (err) {
                  console.error(err);
                  res.status(400).json(err);
                } else {
                  res.status(200).json(user);
                }
              });
            });
          }
        });
      }
    });
  });
});

router.post('/feedback', function(req, res, next) {
  var text = req.body.text;
  // FIXME
  mailer.sendMail("support@example.org", "Support Request by " + req.user.email, text, {reply_to: req.user.email});
  res.sendStatus(201);
});

router.post('/password_reset_requests', (req, res, next) => {
  const email = req.query.email;
  db.User.findOne({where: {"email": email}}).then((user) => {
    if (user) {
      crypto.randomBytes(16, (ex, buf) => {
        user.password_reset_token = buf.toString('hex');
        user.save().then(updatedUser => {
          mailer.sendMail(email, req.i18n.__("password_reset_subject"), req.i18n.__("password_reset_body"), {action: {
            link: config.endpoint + "/password-confirm/" + user.password_reset_token,
            name: req.i18n.__("password_reset_action")
          }});
          res.status(201).json({});
        });
      });
    } else {
      res.status(404).json({"error": "error_unknown_email"});
    }
  });
});

router.post('/password_reset_requests/:confirm_token/confirm', function(req, res, next) {
  var password = req.body.password;

  db.User
    .findOne({where: {"password_reset_token": req.params.confirm_token}})
    .then((user) => {
      if (user) {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, function(err, hash) {

            user.password_hash = hash;
            user.password_token = null;
            user.save(function(err, updatedUser){
              if (err) {
                res.sendStatus(400);
              } else {
                res.sendStatus(201);
              }
            });
          });
        });
      } else {
        res.sendStatus(404);
      }
    });
});

router.post('/:user_id/confirm', function(req, res, next) {
  mailer.sendMail(req.user.email, req.i18n.__("confirm_subject"), req.i18n.__("confirm_body"), { action:{
    link: config.endpoint + "/confirm/" + req.user.confirmation_token,
    name: req.i18n.__("confirm_action")
  }});
  res.sendStatus(201);
});

router.get('/:user_id/importables', function(req, res, next) {
  glob('*.zip', function(err, files) {
    res.status(200).json(files);
  });
});

router.get('/:user_id/import', function(req, res, next) {
  if (req.query.zip) {
    res.send("importing");
    importer.importZIP(req.user, req.query.zip);
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
