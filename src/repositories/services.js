const { ProductDao, UserDao, CartDao } = require('../Daos-Mongo/factory')
const ProductRepository = require('./product.repository')
const UserRepository = require('./user.repository')
const CartRepository = require('./cart.repository')


const productService = new ProductRepository(new ProductDao())
const userService = new UserRepository(new UserDao())
const cartService = new CartRepository(new CartDao())

module.exports = {
    productService,
    userService,
    cartService,
}