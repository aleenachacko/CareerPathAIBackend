const pool = require('../config/db');
const axios = require('axios');
const getSkillAnalysis = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [analysis] = await pool.query('SELECT * FROM skills WHERE user_id = ?', [userId]);
        if (analysis.length === 0) {
            return res.json(null);
        }
        const result = analysis[0];
        result.current_skills = JSON.parse(result.current_skills);
        result.desired_skills = JSON.parse(result.desired_skills);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
const analyzeSkills = async (req, res, next) => {
    try {
        const { current_skills, desired_skills } = req.body;
        const userId = req.user.id;
        // Call Hugging Face API for skill gap analysis
        const prompt = `Given the following current skills: ${current_skills.join(', ')}
and desired skills: ${desired_skills.join(', ')},
analyze the skill gaps and provide recommendations for bridging these gaps.
Include learning resources and estimated timeframes.`;
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/gpt2',
            { inputs: prompt },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HUGGING_FACE_API_KEY}`
                }
            }
        );
        const analysisResult = response.data[0].generated_text;
        res.json({
            missing_skills: desired_skills.filter(skill => !current_skills.includes(skill)),
            analysis_result: analysisResult
        });
    } catch (err) {
        next(err);
    }
};
const saveSkillAnalysis = async (req, res, next) => {
    try {
        const { current_skills, desired_skills, analysis_result } = req.body;
        const userId = req.user.id;
        await pool.query(
            `INSERT INTO skills (user_id, current_skills, desired_skills, analysis_result)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
current_skills = VALUES(current_skills),
desired_skills = VALUES(desired_skills),
analysis_result = VALUES(analysis_result)`,
            [userId, JSON.stringify(current_skills), JSON.stringify(desired_skills), analysis_result]
        );
        res.json({ message: 'Skill analysis saved successfully' });
    } catch (err) {
        next(err);
    }
};
module.exports = {
    getSkillAnalysis,
    analyzeSkills,
    saveSkillAnalysis
};