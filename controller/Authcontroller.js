const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateRegisterInput, validateLoginInput } = require('../auth/authenticate');
const User = require('../model/user');
require('dotenv').config();
const register = async (req, res, next) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) return res.status(400).json(errors);

    const { name, email, password } = req.body;
    const userCheck = await User.findOne({
      where: { email }
    });
    if(!userCheck){
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        name,
        password: hashedPassword
      }
    });

    const payload = { id: user.id, name, email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({ message: 'Signup successful' });
  } else{
    // Use 409 Conflict for existing user
    res.status(409).send({message:'User already exists'});
  }
}catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};
    

const login = async (req, res, next) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);
    
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({
      where: { email }
    });

    if (user)
    { 

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ password: 'Incorrect password' });
    }

    // Create token
    const payload = { id: user.id, name: user.name, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token
    });
}else{res.status(401).send({message:'Invalid user for the given email or password'})}
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

const getCurrentUser = async (req, res) => {
  try {
    const id = req.params.userId || (req.user && req.user.id);
    const user = await User.findOne({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};