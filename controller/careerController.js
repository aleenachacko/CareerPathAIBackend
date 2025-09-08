const axios = require('axios');
const CareerProfile = require("../model/careerprofile");

const getRecommendations = async (req, res, next) => {
    try {
        const { skills, interests, experience, education } = req.body;
        const userId = req.user.id;

        // Save the user's career profile
        await CareerProfile.query(
            'INSERT INTO career_profiles (user_id, skills, interests, experience, education) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE skills = ?, interests = ?, experience = ?, education = ?',
            [userId, skills, interests, experience, education, skills, interests, experience, education]
        );
        // Call Hugging Face API for recommendations
        const prompt = `Given the following profile:
      Skills: ${skills}
      Interests: ${interests}
      Experience: ${experience}
      Education: ${education}
      
      Provide 5 career recommendations with a brief description of each, the required skills, and potential growth opportunities.`;

        const response = await axios.post(
            'https://api-inference.huggingface.co/models/gpt2',
            { inputs: prompt },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
                }
            }
        );
        // Process the response
        const recommendations = parseRecommendations(response.data[0].generated_text);

        res.json({ recommendations });
    } catch (err) {
        next(err);
    }
};

const parseRecommendations = (text) => {
    // This is a simplified parser - you'd want to implement more robust parsing
    const recommendations = [];
    const lines = text.split('\n').filter(line => line.trim());
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^\d+\./)) {
            recommendations.push({
                title: lines[i].replace(/^\d+\.\s*/, '').trim(),
                description: lines[i + 1] ? lines[i + 1].trim() : '',
                skills: lines[i + 2] ? lines[i + 2].replace('Skills:', '').trim() : '',
                growth: lines[i + 3] ? lines[i + 3].replace('Growth:', '').trim() : ''
            });
            i += 3;
        }
    }

    return recommendations.slice(0, 5);
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


module.exports = {
    getRecommendations,
    getCareerProfile
};