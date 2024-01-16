var SchemaProduct = require('../models/products')

module.exports ={
    getall: function(query) {
        return SchemaProduct.find({ isDelete: false })
                            .select('name price order categoryId')
                            .sort('order')
                            .exec();
    },
    getOne:function(id){
        return SchemaProduct.findById(id);
    },
    getByName: function(name) {
        return SchemaProduct.findOne({ name: name }).exec();
    },
    createProduct:function(product){
        return new SchemaProduct(product).save();
    }
}