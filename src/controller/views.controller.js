// const productDaoMongo = require('../Daos-Mongo/mongo/products.daomongo');
// const userDaoMongo = require('../Daos-Mongo/mongo/user.daomongo')
const {productService,userService,cartService,} = require("../repositories/services");
const { logger } = require("../utils/logger");
const { createHash, isValidPassword } = require("../utils/hashPassword");
const {sendPasswordResetEmail,verifyResetToken} = require("../utils/resetPassword");

class ViewsController {
  constructor(){
      this.productViewService = productService
      this.userViewService = userService
      this.cartViewService = cartService
  }

  home = async (req, res) => {
    try {
        const { limit, pageNumber, sort, query } = req.query;
        const parsedLimit = limit ? parseInt(limit, 10) : 10;
        const parsedPageNumber = pageNumber ? parseInt(pageNumber, 10) : 1; // Asegúrate de convertir a número

        const userId = req.session && req.session.user ? req.session.user.user : null;
        const user = await this.userViewService.getUserBy({ _id: userId });

        const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, page } = await this.productViewService.getProducts({
            limit: parsedLimit,
            page: parsedPageNumber, // Usa parsedPageNumber aquí
            sort,
            query
        });

        res.render('home', {
            title: 'Home',
            user,
            docs,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
            page
        });
    } catch (err) {
        logger.error(err);
        res.status(500).send({ message: 'Server error' });
    }
};


  realTimeProducts = async (req, res) => {
      try{
          const { limit, pageNumber, sort, query } = req.query
          const parsedLimit = limit ? parseInt(limit, 10) : 10
          const userId = req.session && req.session.user ? req.session.user.user : null
          const user = await this.userViewService.getUserBy({ _id: userId })
          const { docs, hasPrevPage, hasNextPage, prevPage, nextPage, page } = await this.productViewService.getProducts({ limit: parsedLimit, pageNumber, sort, query })
          //console.log(docs)
          res.render('realTimeProducts', {
              title: 'Real Time',
              user,
              docs,
              hasPrevPage,
              hasNextPage,
              prevPage,
              nextPage,
              page
          })
      }catch(err){
          logger.error(err)
          res.status(500).send({message:'Server error'})
      }
  }

  chat = async (req,res) => {
      const userId = req.session && req.session.user ? req.session.user.user : null
      const user = await this.userViewService.getUserBy({ _id: userId })
      try{
          res.render('chat', {
          title: "Chat",
          user,
          })
      }catch(err){
          logger.error(err)
          res.status(500).send({message:'Server error'})
      }
  }

  products = async (req, res) => {
    try {
        let { limit = 10, page, sort, category, availability = true } = req.query;

        availability = availability === "true" || availability === true; // Normalizar availability

        const filters = {
            limit: parseInt(limit, 10),
            page: parseInt(page, 10) || 1,
            query: {}
        };

        if (category) {
            filters.category = category;
        }
        if (availability) {
            filters.availability = availability;
        }
        if (sort) {
            filters.sort = sort;
        }

        logger.info(`Filters: ${JSON.stringify(filters)}`); // Agregar logging para verificar los filtros

        // Llamamos al servicio de productos con los filtros
        let resp = await this.productViewService.getProducts(filters);

        // Verificar que la página solicitada esté dentro de los límites
        if (filters.page > resp.totalPages) {
            filters.page = resp.totalPages;
            resp = await this.productViewService.getProducts(filters);
        } else if (filters.page < 1) {
            filters.page = 1;
            resp = await this.productViewService.getProducts(filters);
        }

        let productError = false;
        if (resp.docs.length === 0) {
            productError = true;
        }

        // Filtrar la URL eliminando ciertos parámetros
        let workingUrl = req.url.split('?')[1];
        let arrayString = workingUrl ? workingUrl.split('&') : [];

        function filterUrl(array, filter) {
            array = array.filter(elm => elm.split('=')[0] !== filter && elm.split('=')[0] !== 'page');
            return array.length === 0 ? '/products?' : `/products?${array.join('&')}&`;
        }

        const url = filterUrl(arrayString, 'category');

        // Renderizar la vista con los productos y datos de paginación
        res.render('productsView', {
            title: 'Products View',
            user: req.session.user,
            productError,
            docs: resp.docs,
            page: resp.page,
            totalPages: resp.totalPages,
            hasPrevPage: resp.hasPrevPage,
            hasNextPage: resp.hasNextPage,
            prevPage: resp.prevPage,
            nextPage: resp.nextPage,
            limit: filters.limit, // Pasar el límite a la vista
            ascend: `${filterUrl(arrayString, 'sort')}sort=asc`,
            descend: `${filterUrl(arrayString, 'sort')}sort=desc`,
            availability: `${filterUrl(arrayString, 'availability')}availability=false`,
            unavailability: `${filterUrl(arrayString, 'availability')}availability=true`,
            url
        });
    } catch (err) {
        logger.error("Error in products view controller:", err); // Log completo del error
        res.status(500).send({ message: 'Server error' });
    }
};


  productsDetails = async (req,res) =>{
      try{
          //agregar para manderle el usuario
          const pid = req.params.pid
          //console.log(pid)
          const filteredProduct = await this.productViewService.getProductById(pid)
          //console.log(filteredProduct)
          if(filteredProduct){
              res.render('details', {
                  title: 'Product Detail',
                  filteredProduct
              })
          }
          else{
              res.status(404).send("Product not exist")
          }
      }catch(error){
          logger.error(error)
          res.status(500).send('Server error')
      }
  }

  login = async (req,res) =>{
      res.render('login')
  }

  register = async (req,res) =>{
      res.render('register')
  }

  

  shoppingCart = async(req, res) => {
      try {
          //agregar para mandarle el usuario, para que el boton siempre este bien seteado
          const userId = req.session && req.session.user ? req.session.user.user : null
          if (!userId) {
              return res.status(400).send('User not logged in')
          }

          const user = await this.userViewService.getUserBy({ _id: userId })
          const cartId = user.cart
          if (!cartId) {
              return res.status(400).send('User does not have a cart')
          }

          const cart = await this.cartViewService.getCartById(cartId)
          //console.log('Cart:', cart)

          const productDetailsPromises = cart.map(async item => {
              const productId = item.product.toString()
              const productDetailArray = await this.productViewService.getProductById(productId)
              const productDetail = productDetailArray[0]
              return { productDetail, quantity: item.quantity }
          })
          
          // Esperar a que todas las promesas se resuelvan
          const productsWithQuantities = await Promise.all(productDetailsPromises)
          
          //console.log('Products with quantities:', productsWithQuantities)
          res.render('shoppingCart', { 
              title: 'Shopping Cart',
              cartId,
              productsWithQuantities
          })
      }
      catch(err){
          logger.error(err)
          res.status(500).send('Server error')
      }
  }

  resetPasswordView = async(req, res) => {
      res.render('resetPassword')
  }

  sendResetEmail = async (req, res) => {
      const userId = req.session && req.session.user ? req.session.user.user : null
      const user = await this.userViewService.getUserBy({ _id: userId })
      logger.info(user._id)
      logger.info(user.email)
      try {
          // Enviar el correo electrónico de restablecimiento de contraseña
          await sendPasswordResetEmail(user._id, user.email)
          res.status(200).json({ message: 'Email sent successfully' })
      } catch (error) {
          //console.error('Error sending email:', error)
          res.status(500).json({ error: 'Error sending email' })
      }
  }

  resetPassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const token = req.query.token;
    
    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const decodedToken = verifyResetToken(token);
        if (!decodedToken) {
            return res.status(400).json({ error: 'Token is not valid or expired' });
        }

        // Crear un objeto de filtro con el ID de usuario decodificado
        const filter = { _id: decodedToken.userId };

        // Obtener el usuario usando el objeto de filtro
        const user = await this.userViewService.getUserBy(filter);
        
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }
        if (isValidPassword(newPassword, { password: user.password })) {
            return res.status(400).json({ error: 'You can not use the same password' })
        }

        await this.userViewService.updateUserPassword(decodedToken.userId, createHash(newPassword))

        res.status(200).json({ message: 'Password updated successfully' })
        // Continuar con el proceso de cambio de contraseña...
    } catch (error) {
        logger.error('Error updating password:', error);
        res.status(500).json({ error: 'Error updating password' });
    }
}

  resetPasswordViewToken = async(req, res) => {
      const { token } = req.query

      if (!token) {
          return res.status(400).json({ error: 'Token is required' })
      }
      
      res.render('resetPasswordToken',{ token })
  }

  adminView = async (req, res) => {
      try {
          const users = await this.userViewService.getUsers()
          //console.log(users)
          res.render('adminView', { 
              title: 'Users',
              users 
          })
      } catch (error) {
          console.error('Error fetching users:', error)
          res.status(500).json({ message: 'Internal server error' })
      }
  }

}

module.exports = ViewsController