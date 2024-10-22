// const answer = document.querySelector("#answer");

// document.addEventListener("DOMContentLoaded", () => {
//   setTimeout(() => {
//     answer.innerHTML = "";
//   }, 3000);
// });

// const form = document.querySelector("#loginForm");
// form.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   let resp = await fetch("/api/session/login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       email: document.querySelector("#loginemail").value,
//       password: document.querySelector("#loginpassword").value,
//     }),
//   })
//   resp = await resp.json()
  
//   if(resp.error) {
//     answer.innerHTML = resp.data
//     setTimeout(() => {
//       answer.innerHTML = "";
//     },3000)
//   } else {
//     //localStorage.setItem("token", resp.token)
//     Swal.fire(resp.data)
//     .then(() => {
//       window.location.href = "/products"
//     })
//   }
// });