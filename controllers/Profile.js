const Profile = require('../models/Profile');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

exports.updateProfile = async (req, res) => {
    try {
        //fetch data
        const { dateOfBirth = '', about = '', contactNumber, gender } = req.body;
        const id = req.user.id;
        if (!contactNumber || !gender || !id) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        profileDetails.about = about;
        profileDetails.dateOfBirth = dateOfBirth;
        await profileDetails.save();
        return res.status(200).json({
            success: true, message: 'Profile updated successfully', updatedUserDetails: profileDetails
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.deleteAccount = async (req, res) => {
    try {

        const id = req.user.id;
        const userDetails = await User.findById(id);
        if (!userDetails) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }

        //delete profile
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
        //Need to unenroll user from all enrolled courses

        //delete user
        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true, message: 'User deleted successfully',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



exports.getAllUserDetails = async (req, res) => {
    try {

        const id = req.user.id;

        //Get  profile details
        const userDetails = await User.findById(id).populate('additionalDetails').exec();
        return res.status(200).json({
            success: true, message: 'User details fetched successfully', data: userDetails
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture
        const userId = req.user.id;
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id
        const userDetails = await User.findOne({
            _id: userId,
        })
            .populate("courses")
            .exec()
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};