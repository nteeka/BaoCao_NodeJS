const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        // required: true,
        default: false,
    },
})
roleSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Role',roleSchema);