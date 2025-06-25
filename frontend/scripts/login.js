// Redirección automática si ya está logueado
if (localStorage.getItem("id_cliente") && localStorage.getItem("llave_secreta")) {
  window.location.href = "cursos.html";
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id_cliente = document.getElementById("id_cliente").value;
    const llave_secreta = document.getElementById("llave_secreta").value;
    const alerta = document.getElementById("alerta");

    if (!id_cliente || !llave_secreta) {
      alerta.innerHTML = `<div class="alert alert-error">Campos obligatorios</div>`;
      return;
    }

    try {
      const response = await fetch("http://localhost/api-rest/clientes/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id_cliente, llave_secreta })
      });

      const data = await response.json();

      if (response.ok && data.status === 200) {
        // Guardar en localStorage
        localStorage.setItem("id_cliente", id_cliente); 
        localStorage.setItem("llave_secreta", llave_secreta);
        localStorage.setItem("cliente_id", data.id); 

        alerta.innerHTML = `<div class="alert alert-success">Sesión iniciada correctamente</div>`;
        setTimeout(() => {
          window.location.href = "cursos.html";
        }, 1500);
      } else {
        alerta.innerHTML = `<div class="alert alert-error">${data.detalle || "Error al iniciar sesión"}</div>`;
      }
    } catch (error) {
      alerta.innerHTML = `<div class="alert alert-error">Error de conexión al servidor</div>`;
    }
  });
});
