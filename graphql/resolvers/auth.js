const { hashSync, compareSync } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const User = require('../../models/user');

module.exports = {
  createUser: async (a) => {
    const { email, password } = a.userInput;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }
    const user = new User({
      email,
      password: hashSync(password, 10)
    });
    const res = await user.save();
    res.password = null;
    return res;
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User does not exist!');
    }
    const isEqual = compareSync(password, user.password);
    if (!isEqual) {
      throw new Error('Password is incorrect!');
    }
    const token = sign(
      { userId: user.id, email: user.email },
      'somesupersecretkey',
      { expiresIn: '1h' }
    );
    return { userId: user.id, token, tokenExpiration: 1 };
  }
};
