const pool = require('../config/db');
const getResumes = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [resumes] = await pool.query('SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
        res.json(resumes);
    } catch (err) {
        next(err);
    }
};
const createResume = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { title, summary, experience, education, skills, certifications } = req.body;
        const resumeData = {
            title,
            summary,
            experience: JSON.stringify(experience || []),
            education: JSON.stringify(education || []),
            skills: JSON.stringify(skills || []),
            certifications: JSON.stringify(certifications || [])
        };
        const [result] = await pool.query(
            'INSERT INTO resumes (user_id, resume_data) VALUES (?, ?)',
            [userId, JSON.stringify(resumeData)]
        );
        res.status(201).json({ id: result.insertId, ...resumeData });
    } catch (err) {
        next(err);
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
            experience: JSON.stringify(experience || []),
            education: JSON.stringify(education || []),
            skills: JSON.stringify(skills || []),
            certifications: JSON.stringify(certifications || [])
        };
        const [result] = await pool.query(
            'UPDATE resumes SET resume_data = ? WHERE id = ? AND user_id = ?',
            [JSON.stringify(resumeData), resumeId, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.json({ id: resumeId, ...resumeData });
    } catch (err) {
        next(err);
    }
};
const deleteResume = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const resumeId = req.params.id;
        const [result] = await pool.query(
            'DELETE FROM resumes WHERE id = ? AND user_id = ?',
            [resumeId, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        res.json({ message: 'Resume deleted successfully' });
    } catch (err) {
        next(err);
    }
};
module.exports = {
    getResumes,
    createResume,
    updateResume,
    deleteResume
};
