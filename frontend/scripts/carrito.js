document.addEventListener("DOMContentLoaded", function () {
  const id_cliente = localStorage.getItem("id_cliente");
    const llave_secreta = localStorage.getItem("llave_secreta");

    if (!id_cliente || !llave_secreta) {
      alert("⚠️ No estás autenticado. Redirigiendo al login.");
      window.location.href = "login.html";
    }

    const authHeader = "Basic " + btoa(id_cliente + ":" + llave_secreta);
    const listaCarrito = document.getElementById("carrito-lista");
    const resumenCarrito = document.getElementById("resumen-carrito");

    function cargarCarrito() {
  fetch(`http://localhost/api-rest/carrito/${id_cliente}`, {
    method: "GET",
    headers: {
      Authorization: authHeader,
    },
  })
    .then(response => response.json())
    .then(data => {
      console.log("Respuesta del servidor:", data); 

      // Verificar si hay productos en el carrito
      if (!data.detalle || data.detalle.length === 0) {
        listaCarrito.innerHTML = '<div class="carrito-vacio"><h3>🗃️ Tu carrito está vacío</h3><p>Agrega algunos cursos para comenzar</p></div>';
        resumenCarrito.style.display = "none";
        const paypalContainer = document.getElementById("paypal-container");
        if (paypalContainer) paypalContainer.style.display = "none";

        return;
      }

      // Limpiar contenido
      listaCarrito.innerHTML = "";
      let totalPrecio = 0;

      // Mostrar cada producto
      data.detalle.forEach(item => {
        const precio = parseFloat(item.precio) || 0;
        totalPrecio += precio;

        const div = document.createElement("div");
        div.classList.add("curso");
        div.innerHTML = `
          <img src="${item.imagen || 'img/placeholder.jpg'}" alt="${item.titulo}" onerror="this.src='img/placeholder.jpg'">
          <div class="curso-info">
            <div class="curso-titulo">${item.titulo}</div>
            <div class="curso-instructor">Instructor: ${item.instructor}</div>
            <div class="curso-precio">$${precio.toFixed(2)}</div>
          </div>
          <button class="boton-eliminar" onclick="eliminarDelCarrito(${item.id})">❌ Eliminar</button>
        `;
        listaCarrito.appendChild(div);
      });

      // Mostrar resumen y botón de PayPal
      document.getElementById("total-productos").textContent = data.detalle.length;
      document.getElementById("total-precio").textContent = totalPrecio.toFixed(2);
      resumenCarrito.style.display = "block";
      const paypalContainer = document.getElementById("paypal-container");
      if (paypalContainer) paypalContainer.style.display = "block";
    })
    .catch(error => {
      console.error("❌ Error al cargar el carrito:", error);
      listaCarrito.innerHTML = '<div class="carrito-vacio"><h3>❌ Error al cargar el carrito</h3><p>Inténtalo de nuevo más tarde</p></div>';
      resumenCarrito.style.display = "none";
      const paypalContainer = document.getElementById("paypal-container");
      if (paypalContainer) paypalContainer.style.display = "none";
    });
}


    function eliminarDelCarrito(id) {
      if (!confirm("¿Estás seguro de que deseas eliminar este curso del carrito?")) {
        return;
      }

      fetch(`http://localhost/api-rest/carrito/eliminar/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 200) {
            alert("✅ Producto eliminado del carrito");
            cargarCarrito(); // Recargar el carrito
          } else {
            alert("❌ Error al eliminar el producto: " + (data.detalle || "Error desconocido"));
          }
        })
        .catch(error => {
          console.error("Error:", error);
          alert("❌ Error al eliminar el producto");
        });
    }

    function obtenerTotalDesdeResumen() {
  const totalTexto = document.getElementById("total-precio").textContent;
  return parseFloat(totalTexto) || 0;
}

  paypal.Buttons({
    createOrder: function(data, actions) {
      const total = obtenerTotalDesdeResumen();
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: total.toFixed(2)
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(function(details) {
        alert('✅ Pago realizado por: ' + details.payer.name.given_name);
        registrarCompraEnBackend(details);
      });
    }
  }).render('#paypal-button-container');


  function registrarCompraEnBackend(details) {
    fetch("http://localhost/api-rest/pagar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa(id_cliente + ":" + llave_secreta)
      },
      body: JSON.stringify({
        metodo: "PayPal",
        paypal_data: details
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 200) {
        alert("🎉 Compra registrada correctamente");
      
        // Guardar los cursos en localStorage
        localStorage.setItem("cursosPagados", JSON.stringify(data.detalle));
      
        // Redirigir a página de agradecimiento
        window.location.href = "gracias.html";
      } else {
        alert("❌ Error al registrar la compra");
      }
    });
  }

  cargarCarrito();
  obtenerCantidadCarrito();

  function obtenerCantidadCarrito() {
    const id_cliente = localStorage.getItem("id_cliente"); 
    const llave_secreta = localStorage.getItem("llave_secreta"); 
    if (!id_cliente || !llave_secreta) return;

    fetch(`http://localhost/api-rest/carrito/cantidad/${id_cliente}`, {
      headers: {
        Authorization: 'Basic ' + btoa(`${id_cliente}:${llave_secreta}`)
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 200) {
        const contador = document.getElementById("contador-carrito");
        if (contador) contador.innerText = data.cantidad;
      }
    })
    .catch(err => {
      console.error("Error al obtener cantidad del carrito:", err);
    });
  }

});
