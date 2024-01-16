var mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        // required: true,
        default: false,
    },
    quantity: {
        type: Number,
        // required: true,
        default: 0,
    },
    image: {
        type: String,
        // required: true,
        default: null,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
});
productSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('product', productSchema);


