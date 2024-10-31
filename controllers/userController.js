const userModel = require('../models/index').user;
const joi = require('joi');
const { Op } = require('sequelize');
const md5 = require('md5');

const validateUser = (input, isUpdate = false) => {
  let rules = joi.object().keys({
    nama_user: joi.string().required().min(3).max(50),
    role: joi.string().required().valid('kasir', 'admin', 'manajer'),
    username: joi.string().required().min(3).max(20),
    password: isUpdate
      ? joi.string().allow('').optional() // Password is optional and can be empty for update
      : joi.string().required().min(3).max(20), // Password is required for creation
  });

  let { error } = rules.validate(input);
  if (error) {
    let message = error.details.map((item) => item.message).join(',');
    return {
      status: false,
      message,
    };
  }
  return {
    status: true,
  };
};

exports.getUser = async (request, response) => {
  try {
    let result = await userModel.findAll();
    return response.json({
      status: true,
      data: result,
    });
  } catch (error) {
    console.error(`resuError fetching users: ${error.message}`);
    return response.status(500).json({
      status: false,
      message: 'Error fetching users, please try again later.',
    });
  }
};

exports.findUser = async (request, response) => {
  try {
    let keyword = request.body.keyword;
    let result = await userModel.findAll({
      where: {
        [Op.or]: {
          nama_user: { [Op.substring]: keyword },
          role: { [Op.substring]: keyword },
          username: { [Op.substring]: keyword },
        },
      },
    });
    return response.json({
      status: true,
      data: result,
    });
  } catch (error) {
    console.error(`Error finding user: ${error.message}`);
    return response.status(500).json({
      status: false,
      message: 'Error finding user, please try again later.',
    });
  }
};

exports.addUser = async (request, response) => {
  try {
    let resultValidation = validateUser(request.body);
    if (resultValidation.status === false) {
      return response.status(400).json({
        status: false,
        message: resultValidation.message,
      });
    }
    request.body.password = md5(request.body.password);
    await userModel.create(request.body);
    return response.status(201).json({
      status: true,
      message: 'User data has been successfully added.',
    });
  } catch (error) {
    console.error(`Error adding user: ${error.message}`);
    return response.status(500).json({
      status: false,
      message: 'Error adding user, please try again later.',
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Validate user input, passing true to indicate an update operation
    let validate = validateUser(req.body, true);
    if (!validate.status) {
      return res.status(400).json({
        status: false,
        message: validate.message,
      });
    }

    // Retrieve the existing user data from the database
    const user = await userModel.findOne({
      where: { id_user: req.params.id_user },
    });

    // If user not found
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'User not found, unable to update.',
      });
    }

    // Hash new password if provided, otherwise keep the old password
    if (req.body.password) {
      req.body.password = md5(req.body.password);
    } else {
      req.body.password = user.password; // Use existing password if not provided
    }

    // Update user data in the database
    let result = await userModel.update(req.body, {
      where: { id_user: req.params.id_user },
    });

    if (result[0] === 0) {
      return res.status(404).json({
        status: false,
        message: 'User not found, unable to update.',
      });
    }

    // Respond with success message
    res.status(200).json({
      status: true,
      message: 'User updated successfully.',
    });
  } catch (error) {
    console.error(`Error updating user: ${error.message}`);
    return res.status(500).json({
      status: false,
      message: 'Error updating user, please try again later.',
    });
  }
};

exports.deleteUser = async (request, response) => {
  try {
    let id_user = request.params.id_user;
    let deletedCount = await userModel.destroy({ where: { id_user: id_user } });
    if (deletedCount === 0) {
      return response.status(404).json({
        status: false,
        message: 'User not found, unable to delete.',
      });
    }
    return response.json({
      status: true,
      message: 'User data has been successfully deleted.',
    });
  } catch (error) {
    console.error(`Error deleting user: ${error.message}`);
    return response.status(500).json({
      status: false,
      message: 'Error deleting user, please try again later.',
    });
  }
};

exports.roleUser = async (request, response) => {
  try {
    const param = { role: request.params.role };
    const users = await userModel.findAll({ where: param });
    if (users.length > 0) {
      return response.json({
        status: 'success',
        data: users,
      });
    } else {
      return response.status(404).json({
        status: 'error',
        message: 'No users found with the specified role.',
      });
    }
  } catch (error) {
    console.error(`Error fetching users by role: ${error.message}`);
    return response.status(500).json({
      status: 'error',
      message: 'Error fetching users, please try again later.',
    });
  }
};
