// const ProductMongo = require('../Daos-Mongo/mongo/products.daomongo');

// // Se crea una instancia del servicio ProductClass para acceder a las operaciones relacionadas con los productos
// const productService = new ProductMongo();

// // Función para convertir las opciones de ordenamiento en un objeto entendible por MongoDB
//  const convertSort = (option, element) => {
//   // Define las opciones de ordenamiento disponibles y sus equivalentes en MongoDB
//   const sortOptions = {
//     "1": 1,     // Ascendente
//     "-1": -1,   // Descendente
//     asc: "asc", // Ascendente
//     desc: "desc" // Descendente
//   };

//   // Si no se proporciona ninguna opción de ordenamiento, devuelve un objeto vacío
//   if (!option) return {};

//   // Crea un objeto de retorno con la clave de ordenamiento y su valor correspondiente
//   const objectReturn = {};
//   objectReturn[element] = sortOptions[option];
//   return objectReturn; // Devuelve un objeto con la configuración de ordenamiento
// }

// // Función para convertir la disponibilidad en un filtro entendible por MongoDB
//  const convertAvailability = (availability) => {
//   // Si la disponibilidad es "true", devuelve un objeto que representa la condición de disponibilidad
//   if (availability == "true") return { stock: { $gt: 0 } };
// }

// // Función para verificar si una categoría dada existe en la base de datos
//  const checkCategory = async (category) => {
//   // Obtiene todas las categorías disponibles en la base de datos
//   const categories = await productService.getCategorys();
//   // Comprueba si la categoría dada está incluida en la lista de categorías
//   return categories.includes(category); // Devuelve true si la categoría existe, de lo contrario, false
// }

// module.exports = {convertSort,convertAvailability,checkCategory};