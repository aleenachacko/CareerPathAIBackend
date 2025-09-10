const Skill = require("../model/skill");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

// Controller function
const analyzeSkills = async (req, res) => {
  try {
    const { current_skills, desired_skills } = req.body;
    const userId = req.user?.id || null;

    // ✅ Basic validation
    if (!current_skills?.length || !desired_skills?.length) {
      return res.status(400).json({ message: "Both current and desired skills are required." });
    }

    // ✅ Build prompt
    const prompt = `Given the following current skills: ${current_skills.join(', ')}, 
and desired skills: ${desired_skills.join(', ')}, 
analyze the skill gaps and provide recommendations for bridging these gaps. 
Include learning resources and estimated timeframes.`;

    // ✅ Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("AI Skills Advisor Says:\n", text);

    // ✅ Optional: Parse response into structured sections
    const analysis = parseSkillAnalysis(text);

    // ✅ Return both raw and structured output
    res.json({
      userId,
      rawText: text,
      analysis
    });

  } catch (err) {
    console.error("Error analyzing skills:", err);
    res.status(500).json({ message: "Skill analysis failed", error: err.message });
  }
};

// ✅ Helper: Parse Gemini response into structured sections
function parseSkillAnalysis(text) {
  const sections = text.split(/\n\n+/);
  const result = {
    summary: sections[0] || '',
    recommendations: [],
    resources: []
  };

  for (const section of sections) {
    const lower = section.toLowerCase();
    if (lower.includes('recommendation') || lower.includes('bridge')) {
      result.recommendations.push(section.trim());
    } else if (lower.includes('resource') || lower.includes('learn') || lower.includes('course')) {
      result.resources.push(section.trim());
    }
  }

  return result;
}


const saveSkillAnalysis = async (req, res, next) => {
  try {
    const { current_skills, desired_skills, analysis_result } = req.body;
    const userId = req.params.userId || (req.user && req.user.id);
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
