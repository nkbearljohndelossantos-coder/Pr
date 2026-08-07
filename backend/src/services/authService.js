const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const departmentRepository = require('../repositories/departmentRepository');

class AuthService {
  async login(username, password) {
    let user = await userRepository.findByUsername(username);
    let isDeptAccount = false;
    let deptObj = null;

    if (!user) {
      deptObj = await departmentRepository.findByUsername(username);
      if (deptObj && deptObj.is_active) {
        isDeptAccount = true;
      }
    }

    if (!user && !isDeptAccount) {
      throw new Error('Invalid credentials or inactive account.');
    }

    let passwordMatch = false;
    if (isDeptAccount) {
      passwordMatch = bcrypt.compareSync(password, deptObj.password_hash);
    } else {
      passwordMatch = bcrypt.compareSync(password, user.password_hash);
    }

    if (!passwordMatch) {
      throw new Error('Invalid credentials.');
    }

    const payload = isDeptAccount
      ? {
          id: deptObj.id,
          username: deptObj.username,
          role: 'department',
          department_id: deptObj.id,
          department_code: deptObj.code,
          department_name: deptObj.name,
          full_name: deptObj.name
        }
      : {
          id: user.id,
          username: user.username,
          role: user.role,
          department_id: user.department_id,
          department_code: user.department_code,
          department_name: user.department_name,
          full_name: user.full_name
        };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: payload.id }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

    if (!isDeptAccount) {
      await userRepository.updateRefreshToken(user.id, refreshToken);
    }

    return {
      user: payload,
      accessToken,
      refreshToken
    };
  }
}

module.exports = new AuthService();
