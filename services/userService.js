const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, email } = req.body;
        // Check if email is already taken by another user
        const [existingUser] = await pool.query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, userId]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ email: 'Email already in use by another account' });
        }
        await pool.query(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, userId]
        );
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        next(err);
    }
};
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        // Get current password hash
        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, users[0].password);
        if (!isMatch) {
            return res.status(400).json({ currentPassword: 'Current password is incorrect' });
        }
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        // Update password
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        next(err);
    }
};
module.exports = {
    updateProfile,
    changePassword
};
