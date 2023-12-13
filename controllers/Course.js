const Course = require('../models/Course');
const Category = require('../models/Category');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

exports.createCourse = async (req, res) => {
    try {

        //fetch data from body
        const { courseName, courseDescription, whatYouWillLearn, price, tag, category } = req.body;

        //get thumbnail from files
        const thumbnail = req.files.thumbnail;

        //validate 
        if (courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail || category) {
            return res.status(400).json({
                success: false,
                message: "All files are required"
            })
        }

        //check for instructor using user id 
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);

        console.log('Instructor details ', instructorDetails);

        if (!instructorDetails) {
            return res.status(400).json({
                success: false,
                message: "Instructor details not found"
            })
        }

        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(400).json({
                success: false,
                message: "Category details not found"
            })
        }

        //upload image to  cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        //create new course entry in db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tag,
            category: categoryDetails._id, //we can also pass category, which is present in req.body
            thumbnail: thumbnailImage.secure_url
        })

        //add the new course to the instructor's courses

        await User.findByIdAndUpdate({ _id: instructorDetails._id }, { $push: { courses: newCourse._id } }, { new: true })

        //add the new course to the given category also 

        await Category.findByIdAndUpdate({ _id: categoryDetails._id }, {
            $push: {
                courses
                    : newCourse._id
            }
        }, { new: true });

        return res.status(200).json({
            success: true,
            message: "Course added successfully",
            data: newCourse
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


//get all courses handler function
exports.getAllCourses = async (req, res) => {
    try {

        const allCourses = await Course.find({}, {
            courseName: true,
            courseDescription: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            studentEnrolled: true
        }).populate('instructor').exec()


        return res.status(200).json({
            success: true,
            message: "All courses fetched successfully",
            data: allCourses
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}