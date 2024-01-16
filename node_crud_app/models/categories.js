const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        // required: true,
        default: false,
    },
    order: {
        type: Number,
        // required: true,
        default: 0,
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
})
categorySchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Category',categorySchema);