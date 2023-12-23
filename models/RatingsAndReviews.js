const mongoose = require('mongoose');

const RatingsAndReviews = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    rating: {
        type: Number
    },
    review: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Course",
        index: true,
    },

})

module.exports = mongoose.model('RatingsAndReviews', RatingsAndReviews);