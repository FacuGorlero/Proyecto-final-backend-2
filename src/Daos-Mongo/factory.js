const { configObject } = require("../config/index.js");

let UserDao
let ProductDao
let CartDao
let ProductFile
let CartFile

console.log("Persistnece factory: ", configObject.persistence)

switch (configObject.persistence) {
    case 'MONGO':
        const UserDaoMongo = require('./mongo/user.daomongo')
        UserDao = UserDaoMongo

        const ProductDaoMongo = require('./mongo/products.daomongo')
        ProductDao = ProductDaoMongo

        const CartDaoMongo = require('./mongo/cart.daomongo')
        CartDao = CartDaoMongo

        break;

    case 'FILE':
        const ProductFileManager = require('./file/ProductManager')
        ProductFile = ProductFileManager

        const CartFileManager = require('./file/CartManager')
        CartFile = CartFileManager
        break;

    default:
        break;
}

console.log('====================================',UserDao)

module.exports = {
    UserDao,
    ProductDao,
    CartDao,
    ProductFile,
    CartFile,
}