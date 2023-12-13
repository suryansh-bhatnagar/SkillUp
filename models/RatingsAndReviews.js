const mongoose = require('mongoose');

const RatingsAndReviews = new mongoose.Schema({

    user: {
        tpye: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    rating: {
        type: Number
    },
    review: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model('RatingsAndReviews', RatingsAndReviews);