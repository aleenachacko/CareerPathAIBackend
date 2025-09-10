const axios = require('axios');

const CareerProfile = require('../model/careerprofile');
const sequelize = require('../config/db'); 
 const { GoogleGenerativeAI } = require("@google/generative-ai");
// const getRecommendations = async (req, res, next) => {
//   try {
//     const { skills, interests, experience, education } = req.body;
//     const userId = req.params.userId || (req.user && req.user.id);

//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized: Missing user ID." });
//     }

//     // ✅ Save or update career profile using raw SQL
//     await sequelize.query(
//       `INSERT INTO career_profiles (user_id, skills, interests, experience, education)
//        VALUES (?, ?, ?, ?, ?)
//        ON DUPLICATE KEY UPDATE skills = ?, interests = ?, experience = ?, education = ?`,
//       {
//         replacements: [
//           userId, skills, interests, experience, education,
//           skills, interests, experience, education
//         ],
//         type: sequelize.QueryTypes.INSERT
//       }
//     );

//     // ✅ Shortened prompt for Hugging Face
//     const prompt = `Suggest 5 careers for someone skilled in ${skills}, with ${experience} years experience and a ${education} degree.`;

//     const response = await axios.post(
//       'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
//       { inputs: prompt },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
//           'Content-Type': 'application/json'
//         },
//         timeout: 15000
//       }
//     );

//     const rawText = response.data?.[0]?.summary_text || '';
//     console.log("Raw Hugging Face response:", rawText);
//     if (!rawText || rawText.trim().length === 0) {
//   return res.json({ recommendations: [], message: "No recommendations generated. Try again or use a different model." });
// }
//     const recommendations = parseRecommendations(rawText);

//     res.json({rawText, recommendations });

//   } catch (err) {
//     console.error("Error in getRecommendations:", err);
//     res.status(500).json({ message: "Failed to generate recommendations", error: err.message });
//   }
// };

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

     // ✅ Generate prompt for Gemini AI
    
    const prompt = `Suggest 5 specific career paths for someone with these skills: ${skills}, 
    interests: ${interests}, ${experience} years of professional experience, 
    and a ${education} degree. For each career, provide a brief description of why it would be a good fit.`;

    // ✅ Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ✅ Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Raw Gemini response:", text);

    // ✅ Parse structured recommendations
    const recommendations = parseGeminiResponse(text);

    // ✅ Send both structured and raw response
    res.json({
      recommendations,
      rawText: text
    });

  } catch (err) {
    console.error("Error in getRecommendations:", err);
    
    // Handle specific API errors
    if (err.message.includes('model') && err.message.includes('not found')) {
      return res.status(400).json({ 
        message: "Model configuration error. Please check the model name.", 
        error: err.message 
      });
    }
    
    res.status(500).json({ 
      message: "Failed to generate recommendations", 
      error: err.message 
    });
  }

};
// ✅ Helper function to parse Gemini response
function parseGeminiResponse(rawText) {
  const recommendations = [];
  const lines = rawText.split('\n');

  for (const line of lines) {
    const cleanLine = line.trim();
    if (/^\d+\./.test(cleanLine)) {
      const parts = cleanLine.split(/[-:]/);
      if (parts.length >= 2) {
        recommendations.push({
          title: parts[0].replace(/^\d+\.\s*/, '').trim(),
          description: parts.slice(1).join(':').trim()
        });
      }
    }
  }

  return recommendations;
}


const getCareerProfile = async (req, res, next) => {
    try {
        // Check if model is available
        if (!CareerProfile) {
            throw new Error('Database model not initialized');
        }

        const userId = req.params.userId || (req.user?.id);
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const profile = await CareerProfile.findOne({
            where: { user_id: userId }
        });

        // findOne returns null if not found, not an empty array
        if (!profile) {
            return res.json({});
        }

        res.json(profile);
    } catch (err) {
        console.error('Career profile error:', err);
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