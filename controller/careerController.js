const axios = require('axios');
const { sequelize,CareerProfile }  = require("../model/careerprofile");

const getRecommendations = async (req, res, next) => {
  try {
    const { skills, interests, experience, education } = req.body;
    const userId = req.params.userId || (req.user && req.user.id);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID." });
    }

    // ✅ Save or update career profile using raw SQL
    await sequelize.query(
      `INSERT INTO career_profiles (user_id, skills, interests, experience, education)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE skills = ?, interests = ?, experience = ?, education = ?`,
      {
        replacements: [
          userId, skills, interests, experience, education,
          skills, interests, experience, education
        ],
        type: sequelize.QueryTypes.INSERT
      }
    );

    // ✅ Shortened prompt for Hugging Face
    const prompt = `Suggest 5 careers for someone skilled in ${skills}, with ${experience} years experience and a ${education} degree.`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const rawText = response.data?.[0]?.summary_text || '';
    console.log("Raw Hugging Face response:", rawText);
    if (!rawText || rawText.trim().length === 0) {
  return res.json({ recommendations: [], message: "No recommendations generated. Try again or use a different model." });
}
    const recommendations = parseRecommendations(rawText);

    res.json({rawText, recommendations });

  } catch (err) {
    console.error("Error in getRecommendations:", err);
    res.status(500).json({ message: "Failed to generate recommendations", error: err.message });
  }
};

// 🧾 Simple parser for Hugging Face output
const parseRecommendations = (text) => {
  const recommendations = [];

  // Try to extract numbered items first
  const numberedMatches = text.match(/\d+\.\s*[^\n]+/g);
  if (numberedMatches?.length) {
    numberedMatches.slice(0, 5).forEach((line) => {
      recommendations.push({
        title: line.replace(/^\d+\.\s*/, '').trim(),
        description: '',
        skills: '',
        growth: ''
      });
    });
    return recommendations;
  }

  // Fallback: extract career-like phrases from freeform text
  const careerRegex = /\b(?:career|job|role|position)\b.*?\b(?:in|as)\b\s+([A-Za-z\s]+)/gi;
  const matches = [...text.matchAll(careerRegex)];

  matches.slice(0, 5).forEach((match) => {
    recommendations.push({
      title: match[1].trim(),
      description: '',
      skills: '',
      growth: ''
    });
  });

  return recommendations;
};


const getCareerProfile = async (req, res, next) => {
    try {
       const userId = req.params.userId || (req.user && req.user.id);
        // Find one by user_id
       const profile = await CareerProfile.findAll({
      where: { user_id: userId }
    });

        if (profile.length === 0) {
            return res.json({});
        }

        res.json(profile[0]);
    } catch (err) {
        next(err);
    }
};

// Save or update profile

const saveProfile = async (req, res) => {
  const { skills, interests, experience, education } = req.body;
  const user_id = req.params.userId || (req.user && req.user.id);

  if (!user_id) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing user ID." });
  }

  try {
    const existingProfile = await CareerProfile.findOne({ where: { user_id } });

    if (existingProfile) {
      await existingProfile.update({ skills, interests, experience, education });
      return res.status(200).json({ success: true, message: "Profile updated", data: existingProfile });
    } else {
      const newProfile = await CareerProfile.create({ user_id, skills, interests, experience, education });
      return res.status(201).json({ success: true, message: "Profile created", data: newProfile });
    }

  } catch (error) {
    console.error("Error saving profile:", error);
    return res.status(500).json({ success: false, message: "Error saving profile", error: error.message });
  }
};



module.exports = {
    getRecommendations,
    getCareerProfile,
    saveProfile
};