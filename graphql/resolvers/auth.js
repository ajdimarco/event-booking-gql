const { hashSync } = require('bcryptjs');
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
  }
};