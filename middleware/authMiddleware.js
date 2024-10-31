const express = require(`express`);
const md5 = require(`md5`);
const jwt = require(`jsonwebtoken`);
const userModel = require(`../models/index`).user;
require('dotenv').config();

const authorize = (request, response, next) => {
  let headers = request.headers.authorization;
  let tokenKey = headers && headers.split(' ')[1];

  if (tokenKey == null) {
    return response.json({
      success: false,
      message: `Unauthorized User`,
    });
  }

  let secret = process.env.JWT_SECRET;
  jwt.verify(tokenKey, secret, (error, user) => {
    if (error) {
      return response.json({
        success: false,
        message: `Invalid token`,
      });
    }

    request.user = user;
    next();
  });
};

const authenticate = async (request, response) => {
  let dataLogin = {
    username: request.body.username,
    password: md5(request.body.password),
  };

  let dataUser = await userModel.findOne({
    where: dataLogin,
  });

  if (dataUser) {
    let payload = {
      id_user: dataUser.id_user,
      username: dataUser.username,
      nama_user: dataUser.nama_user,
      role: dataUser.role,
    };

    let secret = process.env.JWT_SECRET;
    let token = jwt.sign(payload, secret);
    return response.json({
      success: true,
      logged: true,
      message: `Authentication Successed`,
      token: token,
      data: dataUser,
    });
  }

  return response.json({
    success: false,
    logged: false,
    message: `Authentication Failed. Invalid username or password`,
  });
};

module.exports = { authenticate, authorize };
