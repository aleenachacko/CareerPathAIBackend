const bcrypt = require('bcryptjs');
const User = require('../model/user'); // Your Sequelize User model

// ✅ Update Profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.params.userId || (req.user && req.user.id);
    const { name, email } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    res.json({ successMessage: 'Profile updated successfully', user });
  } catch (err) {
    next(err);
  }
};

// 🔐 Change Password
const changePassword = async (req, res, next) => {
  try {
    const userId = req.params.userId || (req.user && req.user.id);
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ errorMessage: 'Passwords do not match' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ errorMessage: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ errorMessage: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ successMessage: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  updateProfile,
  changePassword
};