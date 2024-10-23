const { createHash, isValidPassword } = require("../utils/hashPassword");
const { generateToken } = require("../utils/createtoken");
const { cartService, userService } = require("../repositories/services");
const { logger } = require("../utils/logger");
const { sendEmail } = require('../utils/sendmail')
const jwt = require('jsonwebtoken')
const { jwt_code } = require('../config/index')

class SessionController {
  constructor(){
      this.cartService = cartService
      this.userService = userService
  }

  register = async (req,res) =>{
      const { first_name, last_name, date, email, password, role} = req.body
      //console.log(first_name, last_name, date, email, password)
  
      if(first_name === '' || last_name === '' || email === '' || password === '') {
          return res.send('All fields must be required')
      }
      
      try {
          const existingUser = await this.userService.getUserBy({email})
  
          logger.info(existingUser)
          if (existingUser) {
              return res.send({ status: 'error', error: 'This user already exists' })
          }
  
          const cart = await this.cartService.createCart()
  
          const newUser = {
              first_name,
              last_name,
              date,
              email,
              password: createHash(password),
              cart: cart._id,
              role,
          }
          /* console.log('======================', newUser) */
  
          const result = await this.userService.createUser(newUser)

          req.session.user = {
              id: result._id,
              first_name: result.first_name,
              last_name: result.last_name,
              email: result.email,
              cart: result.cart,
              role: result.role
          }
  
          const token = generateToken({
              id: result._id,
              first_name: result.first_name,
              last_name: result.last_name,
              email: result.email,
              cart: result.cart,
              role: result.role
          })
  
          res.cookie('token', token, {
              maxAge: 60*60*1000*24,
              httpOnly: true,
          }).send({
              status: 'success',
              payload: {
                  id: result._id,
                  first_name: result.first_name,
                  last_name: result.last_name,
                  email: result.email,
                  role: result.role
              }
          })
      } catch (error) {
          logger.error('Error during user registration:', error)
          res.status(500).send({ status: 'error', error: 'Internal Server Error' })
      }
  }

  login = async (req,res) => {
      const { email, password } = req.body
  
      if(email === '' || password === '') {
          return res.send('All fields must be required')
      }
  
      try{
          const user = await this.userService.getUserBy({ email })
          console.log(user)
          if(user.email === 'adminCoder@coder.com' && password === user.password){
  
              await this.userService.updateRole(user._id, 'admin')
              req.session.user = {
                  id: user._id,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email,
                  role: 'admin'
              }
              const token = generateToken({
                  id: user._id,
                  role: user.role
              })
  
              res.cookie('token', token, {
                  maxAge: 60*60*1000*24,
                  httpOnly: true,
              }).redirect('/products')
          }
          else{
  
              if (!user) {
                  return res.send('email or password not valid')
              }
  
              if (!isValidPassword(password, { password: user.password })) {
                  return res.send('email or password not valid')
              }

              user.last_connection = new Date()
              await user.save()
  
              req.session.user = {
                  user: user._id,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email,
                  cart: user.cart,
                  role: user.role
              }
  
              const token = generateToken({
                  id: user._id,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email,
                  cart: user.cart,
                  role: user.role
              })
  
              res.cookie('token', token, {
                  maxAge: 60*60*1000*24,
                  httpOnly: true,
              }).redirect('/products')
          }
  
      } catch(error) {
          logger.error('Error during user login:', error)
          res.status(500).send({ status: 'error', error: 'Internal Server Error' })
      }
  }

  logout = async (req,res) =>{
      try{
          const user = req.session.user

          if (user) {
              const dbUser = await this.userService.getUserBy({ _id: user.user })
              if (dbUser) {
                  dbUser.last_connection = new Date()
                  await dbUser.save()
              }
          }
          req.session.destroy((err) =>{
              if(err){
                  logger.error('Error during session destruction:', err)
                  return res.status(500).send({ status: 'error', error: 'Internal Server Error' })
              }
  
              res.redirect('/login')
          })
      }catch(error) {
          logger.error('Error during logout:', error)
          res.status(500).send({ status: 'error', error: 'Internal Server Error' })
      }
  }

  current = (req, res) => {
    console.log('Current function reached'); // Debug log
    if (req.user) {
        const { first_name, last_name, role } = req.user;
        const userDTO = {
            first_name: first_name,
            last_name: last_name,
            role: role
        };
        res.json(userDTO);
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
}


  github = async (req,res)=>{}

  githubCallback = (req, res) => {
      req.session.user = req.user
      res.redirect('/products')
  }


  user = async (req, res, next) => {
      try {
          const uid = req.params.uid
          console.log("=======", uid)
          const user = await this.userService.getUserBy({_id: uid})
          console.log(user)
          res.json({payload: user})
      } catch (error){
          next(error)
      }
  }

  getAllUsers = async (req, res) => {
      try {
          const users = await this.userService.getUsers()

          const userList = users.map(user => ({
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              role: user.role
          }))

          res.json({ status: 'success', payload: userList })
      } catch (error) {
          console.error('Error fetching users:', error)
          res.status(500).json({ message: 'Internal server error' })
      }
  }

  deleteInactiveUsers = async (req, res) => {
      try {
          const now = new Date()
          const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000))
           
          const inactiveUsers = await this.userService.findInactiveUsers(twoDaysAgo)
          
          if (inactiveUsers.length === 0) {
              return res.status(200).json({ message: 'No inactive users found' })
          }
          
          for (const user of inactiveUsers) {
              await this.userService.deleteUser(user._id)
              
              const subject = 'Account deleted by inactivity'
              const html = `
                  <div>
                      <h2>Hi ${user.first_name},</h2>
                      <p>Your account has been deleted due to inactivity of two or more days. If you have any questions, please contact us!.</p>
                  </div>`
              await sendEmail(user.email, subject, html)
          }
          
          res.status(200).json({ message: `Removed ${inactiveUsers.length} inactive users` })
      } catch (error) {
          console.error('Error deleting inactive users:', error)
          res.status(500).json({ message: 'Internal server error' })
      }
  }
  verifyToken = async (req, res) => {
    const { token } = req.cookies;
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token found' });
    }
    
    jwt.verify(token, jwt_code, async (err, decodedUser) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        
        const userFound = await this.userService.getUserBy({ _id: decodedUser.id });
        if (!userFound) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }
        
        res.json({
            status: 'success',
            payload: {
                id: userFound._id,
                first_name: userFound.first_name,
                last_name: userFound.last_name,
                email: userFound.email,
                role: userFound.role
            }
        });
    });
};

deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Aquí deberías tener la lógica para eliminar el usuario según su ID
        // Por ejemplo, podrías llamar a un método del servicio de usuario para realizar la eliminación

        const deletedUser = await this.userService.deleteUser(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Aquí puedes enviar una respuesta JSON indicando que el usuario fue eliminado correctamente
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        // En caso de producirse algún error durante la eliminación, devolvemos un mensaje de error
        console.error('Error deleting user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



}

module.exports = SessionController