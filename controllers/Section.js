const Course = require('../models/Course');
const Section = require('../models/Section');

exports.createSection = async (req, res) => {
    try {
        //data fetch
        const { sectionName, courseId } = req.body;

        //data validation 
        if (!sectionName || !courseId) {
            return res.status(404).json({
                message: 'All fields are required',
                success: false,
            })
        }
        //create section
        const newSection = await Section.create({ sectionName });

        //update course 
        const updatedCourse = await Section.findByIdAndUpdate(courseId, { $push: { courseContent: newSection._id } }, { new: true }).populate('courseContent').exec();

        return res.status(200).json({
            success: true, message: 'Section created successfully', data: updatedCourse
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateSection = async (req, res) => {

    try {
        //data fetch
        const { sectionId, sectionName } = req.body;

        //date validate
        if (!sectionName || !sectionId) {
            return res.status(404).json({
                message: 'All fields are required',
                success: false,
            })
        }

        const section = await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });
        return res.status(200).json({
            success: true, message: 'Section updated successfully', data: section
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
exports.deleteSection = async (req, res) => {

    try {

        //data fetch from params
        const { sectionId } = req.params;

        //date validate
        if (!sectionId) {
            return res.status(404).json({
                message: 'All fields are required',
                success: false,
            })
        }

        //delete section
        const section = await Section.findByIdAndDelete(sectionId);
        return res.status(200).json({
            success: true, message: 'Section deleted successfully', data: section
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}