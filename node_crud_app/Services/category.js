var SchemaCategory = require('../models/categories');
var SchemaProduct = require('../models/products');

module.exports ={
    getAll: function() {
        return SchemaCategory.find({ isDelete: false })
                            .select('name order')
                            .sort('order')
                            .exec();
    },
    getProductsByCategory(categoryId) {
        return SchemaProduct.find({ categoryId: categoryId, isDelete: false })
                     .sort('order')
                     .exec();
    },
    
    getProductsByCategory(categoryId) {
        return SchemaProduct.find({ categoryId: categoryId, isDelete: false })
                     .sort('order')
                     .exec();
    },
    getOne:function(id){
        return SchemaCategory.findById(id);
    },
    getByName: function(name) {
        return SchemaCategory.findOne({ name: name }).exec();
    },
    createCategory:function(cate){
        return new SchemaCategory(cate).save();
    },
    
}