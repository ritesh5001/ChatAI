const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        firstName: {
            type: String,
            require: true,
        },
        lastName: {
            type: String,
            require: true,
        }
    },
    password: {
        type: String,
        required: true,
    }

},
    {
        timestamps: true
    }
)



const userModel = mongoose.model("user", userSchema);

module.exports = userModel;