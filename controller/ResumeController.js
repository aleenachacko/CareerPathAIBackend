const Resume = require("../model/resume");

const getResumes = async (req, res, next) => {
  try {
    const userId = req.params.userId || (req.user && req.user.id);
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const resumes = await Resume.findAll({
      where: { user_id: userId }
    });

    res.status(200).json(resumes);
  } catch (err) {
    console.error("Error fetching resumes:", err);
    res.status(500).json({ message: "Failed to retrieve resumes", error: err.message });
  }
};

const createResume = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: Please log in to create a resume." });
    }
    const userId = req.user.id;
    const { title, summary, experience, education, skills, certifications } = req.body;

    // Validate required fields
    if (!title || !summary) {
      return res.status(400).json({ message: "Title and summary are required." });
    }

    const resumeData = {
      title,
      summary,
      experience: experience || [],
      education: education || [],
      skills: skills || [],
      certifications: certifications || []
    };

    // Create the resume
    const resume = await Resume.create({
      user_id: userId,
      resume_data: resumeData
    });

    res.status(201).json({ message: "Resume created successfully", resume });
  } catch (err) {
    console.error("Error creating resume:", err);
    res.status(500).json({ message: "Resume creation failed", error: err.message });
  }
};

const updateResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resumeId = req.params.id;
    const { title, summary, experience, education, skills, certifications } = req.body;

    const resumeData = {
      title,
      summary,
      experience,
      education,
      skills,
      certifications
    };

    const [updated] = await Resume.update(
      { resume_data: resumeData },
      { where: { id: resumeId, user_id: userId } }
    );

    if (updated === 0) {
      return res.status(404).json({ message: "Resume not found or not authorized" });
    }

    const resume = await Resume.findOne({ where: { id: resumeId, user_id: userId } });
    res.status(200).json({ message: "Resume updated successfully", resume });
  } catch (err) {
    console.error("Error updating resume:", err);
    res.status(500).json({ message: "Resume update failed", error: err.message });
  }
};

const deleteResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resumeId = req.params.id;

    const deleted = await Resume.destroy({
      where: { id: resumeId, user_id: userId }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: "Resume not found or not authorized" });
    }

    res.status(200).json({ message: "Resume deleted successfully" });
  } catch (err) {
    console.error("Error deleting resume:", err);
    res.status(500).json({ message: "Resume deletion failed", error: err.message });
  }
};

module.exports = {
  getResumes,
  createResume,
  updateResume,
  deleteResume
};