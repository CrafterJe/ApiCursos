// scripts/carrito.js

document.addEventListener("DOMContentLoaded", function () {
  const id_cliente      = localStorage.getItem("id_cliente");
  const llave_secreta   = localStorage.getItem("llave_secreta");
  const authHeader      = "Basic " + btoa(id_cliente + ":" + llave_secreta);
  const listaCarrito    = document.getElementById("carrito-lista");
  const resumenCarrito  = document.getElementById("resumen-carrito");
  const paypalContainer = document.getElementById("paypal-container");

  // Si no está autenticado, redirigir
  if (!id_cliente || !llave_secreta) {
    alert("⚠️ No estás autenticado. Redirigiendo al login.");
    window.location.href = "login.html";
    return;
  }

  // — Función para eliminar un curso —
  function eliminarDelCarrito(id) {
    console.log('🗑️ Eliminando producto con ID:', id);

    if (!confirm("¿Estás seguro de que deseas eliminar este curso del carrito?")) return;

    fetch(`http://localhost/api-rest/carrito/eliminar/${id}`, {
      method: "DELETE",
      headers: { Authorization: authHeader }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 200) {
          alert("✅ Producto eliminado del carrito");
          cargarCarrito();
          actualizarContador();
        } else {
          alert("❌ Error al eliminar el producto: " + (data.detalle || "Error desconocido"));
        }
      })
      .catch(error => {
        console.error('❌ Error de red:', error);
        alert("❌ Error de red al eliminar el producto");
      });
  }

  // Exponer la función globalmente para soportar cualquier onclick inline restante
  window.eliminarDelCarrito = eliminarDelCarrito;

  // — Event delegation para los botones “Eliminar” —
  listaCarrito.addEventListener("click", function (e) {
    const btn = e.target.closest(".boton-eliminar");
    if (!btn) return;
    e.preventDefault();
    const id = btn.getAttribute("data-id");
    if (id) {
      eliminarDelCarrito(id);
    } else {
      console.error('❌ No se encontró ID en el botón');
      alert('❌ Error: No se pudo identificar el producto');
    }
  });

  // — Cargar y renderizar el carrito —
  function cargarCarrito() {
    console.log('📦 Cargando carrito...');

    fetch(`http://localhost/api-rest/carrito/${id_cliente}`, {
      headers: { Authorization: authHeader }
    })
      .then(res => res.json())
      .then(data => {
        console.log('📋 Datos del carrito:', data);

        // Carrito vacío
        if (!data.detalle || data.detalle.length === 0) {
          listaCarrito.innerHTML = `
            <div class="carrito-vacio">
              <h3>🗃️ Tu carrito está vacío</h3>
              <p>Agrega algunos cursos para comenzar</p>
            </div>`;
          resumenCarrito.style.display    = "none";
          paypalContainer.style.display   = "none";
          return;
        }

        // Limpiar contenedor
        listaCarrito.innerHTML = "";
        let totalPrecio = 0;

        data.detalle.forEach((item, index) => {
          console.log(`🛍️ Procesando item ${index + 1}:`, item);

          const precio = parseFloat(item.precio) || 0;
          totalPrecio += precio;

          const div = document.createElement("div");
          div.className = "curso";

          // Imagen
          const img = document.createElement("img");
          img.src = item.imagen || 'img/placeholder.jpg';
          img.alt = item.titulo || 'Curso';
          img.onerror = function() {
            this.src = 'img/placeholder.jpg';
          };

          // Info del curso
          const cursoInfo = document.createElement("div");
          cursoInfo.className = "curso-info";

          const titulo = document.createElement("div");
          titulo.className = "curso-titulo";
          titulo.textContent = item.titulo || 'Sin título';

          const instructor = document.createElement("div");
          instructor.className = "curso-instructor";
          instructor.textContent = `Instructor: ${item.instructor || 'No especificado'}`;

          const precioDiv = document.createElement("div");
          precioDiv.className = "curso-precio";
          precioDiv.textContent = `$${precio.toFixed(2)}`;

          // Botón Eliminar
          const botonEliminar = document.createElement("button");
          botonEliminar.className = "boton-eliminar";
          botonEliminar.type = "button";
          botonEliminar.setAttribute('data-id', item.id);
          botonEliminar.textContent = "❌ Eliminar";
          botonEliminar.style.cursor = "pointer";
          botonEliminar.style.padding = "8px 12px";
          botonEliminar.style.border = "1px solid #dc3545";
          botonEliminar.style.backgroundColor = "#dc3545";
          botonEliminar.style.color = "white";
          botonEliminar.style.borderRadius = "4px";

          cursoInfo.appendChild(titulo);
          cursoInfo.appendChild(instructor);
          cursoInfo.appendChild(precioDiv);

          div.appendChild(img);
          div.appendChild(cursoInfo);
          div.appendChild(botonEliminar);

          listaCarrito.appendChild(div);
        });

        // Actualizar resumen y mostrar PayPal
        document.getElementById("total-productos").textContent = data.detalle.length;
        document.getElementById("total-precio").textContent   = totalPrecio.toFixed(2);
        resumenCarrito.style.display  = "block";
        paypalContainer.style.display = "block";

        console.log('✅ Carrito cargado exitosamente con', data.detalle.length, 'productos');
      })
      .catch(error => {
        console.error('❌ Error al cargar carrito:', error);
        listaCarrito.innerHTML = `
          <div class="carrito-vacio">
            <h3>❌ Error al cargar el carrito</h3>
            <p>Inténtalo de nuevo más tarde</p>
            <p><small>Error: ${error.message}</small></p>
          </div>`;
        resumenCarrito.style.display  = "none";
        paypalContainer.style.display = "none";
      });
  }

  // — Función para obtener el total —
  function obtenerTotal() {
    return parseFloat(document.getElementById("total-precio").textContent) || 0;
  }

  // — Inicializar PayPal —
  function inicializarPayPal() {
    if (typeof paypal === 'undefined') {
      console.error('❌ PayPal SDK no está disponible');
      return;
    }

    try {
      paypal.Buttons({
        createOrder: (data, actions) =>
          actions.order.create({
            purchase_units: [{ amount: { value: obtenerTotal().toFixed(2) } }]
          }),
        onApprove: (data, actions) =>
          actions.order.capture().then(details => {
            alert("✅ Pago realizado por: " + details.payer.name.given_name);
            registrarCompra(details);
          }),
        onError: err => {
          console.error('❌ Error en PayPal:', err);
          alert("❌ Error en el procesamiento del pago");
        }
      }).render("#paypal-button-container");

      console.log('💳 PayPal inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar PayPal:', error);
    }
  }

  // — Registrar compra en el backend —
  function registrarCompra(details) {
    fetch("http://localhost/api-rest/pagar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader
      },
      body: JSON.stringify({ metodo: "PayPal", paypal_data: details })
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 200) {
          alert("🎉 Compra registrada correctamente");
          localStorage.setItem("cursosPagados", JSON.stringify(data.detalle));
          window.location.href = "gracias.html";
        } else {
          alert("❌ Error al registrar la compra");
        }
      })
      .catch(() => {
        alert("❌ Error de red al registrar la compra");
      });
  }

  // — Actualizar contador en el navbar —
  function actualizarContador() {
    fetch(`http://localhost/api-rest/carrito/cantidad/${id_cliente}`, {
      headers: { Authorization: authHeader }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 200) {
          const contador = document.getElementById("contador-carrito");
          if (contador) contador.innerText = data.cantidad;
        }
      })
      .catch(error => {
        console.error("❌ Error al obtener cantidad del carrito:", error);
      });
  }

  // — Esperar a que PayPal esté disponible —
  function esperarPayPal() {
    if (typeof paypal !== 'undefined') {
      inicializarPayPal();
    } else {
      setTimeout(esperarPayPal, 200);
    }
  }

  // — Inicialización —
  console.log('🚀 Iniciando aplicación del carrito...');
  cargarCarrito();
  actualizarContador();
  esperarPayPal();
});
