const Skill = require("../model/skill");
const axios = require("axios");

const getSkillAnalysis = async (req, res, next) => {
  try {
    const userId = req.params.userId || (req.user && req.user.id);
    const skills = await Skill.findAll({
      where: { user_id: userId }
    });
    if (!skills.length) {
      return res.json(null);
    }
    const result = skills[0];
    result.current_skills = JSON.parse(result.current_skills);
    result.desired_skills = JSON.parse(result.desired_skills);
    res.json(result);
  } catch (err) {
    console.error("Error fetching skill analysis:", err);
    res.status(500).json({ message: "Failed to retrieve skill analysis", error: err.message });
  }
};

const analyzeSkills = async (req, res, next) => {
  try {
    const { current_skills, desired_skills } = req.body;
    const userId = req.user.id;
    const prompt = `Given the following current skills: ${current_skills.join(', ')}\nand desired skills: ${desired_skills.join(', ')},\nanalyze the skill gaps and provide recommendations for bridging these gaps.\nInclude learning resources and estimated timeframes.`;
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
    console.error("Error analyzing skills:", err);
    res.status(500).json({ message: "Skill analysis failed", error: err.message });
  }
};

const saveSkillAnalysis = async (req, res, next) => {
  try {
    const { current_skills, desired_skills, analysis_result } = req.body;
    const userId = req.user.id;
    const [skill, created] = await Skill.findOrCreate({
      where: { user_id: userId },
      defaults: {
        current_skills: JSON.stringify(current_skills),
        desired_skills: JSON.stringify(desired_skills),
        analysis_result
      }
    });
    if (!created) {
      await Skill.update(
        {
          current_skills: JSON.stringify(current_skills),
          desired_skills: JSON.stringify(desired_skills),
          analysis_result
        },
        { where: { user_id: userId } }
      );
    }
    res.json({ message: "Skill analysis saved successfully" });
  } catch (err) {
    console.error("Error saving skill analysis:", err);
    res.status(500).json({ message: "Skill analysis save failed", error: err.message });
  }
};

module.exports = {
  getSkillAnalysis,
  analyzeSkills,
  saveSkillAnalysis
};
