const Section = require('../models/Section');
const SubSection = require('../models/SubSection');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

exports.createSection = async (req, res) => {

    try {

        //data fetch 
        const { sectionId, title, timeDuration, description } = req.body;
        const video = req.files.videoFile;

        //validation 
        if (!sectionId || title || timeDuration || description || video) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        //upload video to cloudinary 
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        //create subsection
        const SubSectionDetails = await SubSection.create({
            title,
            timeDuration,
            description,
            videoUrl: uploadDetails.secure_url
        })

        //insert subsection into section
        const updatedSection = await Section.findByIdAndUpdate({ _id: sectionId }, { $push: { subSection: SubSectionDetails._id } }, { new: true }).populate("subSection").exec();

        return res.status(200).json({
            success: true, message: 'Sub section created successfully', data: updatedSection
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }




}