const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        // required: true,
        default: null,
    },
    image: {
        type: String,
        // required: true,
        default: null,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
    password:{
        type: String,
        required: true,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        default: '65a4cf135e104a28440d3255',
    },
})
userSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('User',userSchema);