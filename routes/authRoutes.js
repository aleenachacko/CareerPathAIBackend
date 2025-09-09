const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate'); 
const {
  register,
  login,
  logout,
  getCurrentUser
} = require('../controller/Authcontroller');

const { 
  getResumes, 
  createResume,
  updateResume, 
  deleteResume
} = require('../controller/ResumeController');

const {
  getSkillAnalysis,
  analyzeSkills,
  saveSkillAnalysis
} = require('../controller/SkillsController');

const {
  getRecommendations,
  getCareerProfile,
  saveProfile
} = require('../controller/careerController');

const {
  updateProfile,
  changePassword
} = require('../controller/userProfileController');

router.post('/register', register);
router.post('/login',login);
router.post('/logout',authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.get('/getResumes/:userId', authenticate, getResumes);
router.post('/createResume', authenticate, createResume);
router.put('/resume/:id', authenticate, updateResume);
router.delete('/resume/:id', authenticate, deleteResume);
router.get('/skills/:userId',authenticate, getSkillAnalysis);
router.post('/analyze',authenticate, analyzeSkills);
router.post('/skills/save', authenticate,saveSkillAnalysis);
router.get('/career/profile/:userId',authenticate, getCareerProfile);
router.post('/career/recommendations/:userId', authenticate, getRecommendations);
router.post('/career/saveProfile/:userId', authenticate, saveProfile);
router.put('/users/profile/:userId', authenticate, updateProfile);
router.put('/users/password/:userId', authenticate, changePassword);


module.exports = router;