const mongoose = require('mongoose');
require("dotenv").config();

exports.connectToDb = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
        .then(() => console.log('Connected to database'))
        .catch((err) => {
            console.log('Failed to connect to database')
            console.error(err);
            process.exit(1)
        });
}