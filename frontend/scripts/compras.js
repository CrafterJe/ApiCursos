document.addEventListener("DOMContentLoaded", function () {
      const id_cliente = localStorage.getItem("id_cliente"); 
      const llave_secreta = localStorage.getItem("llave_secreta");

      if (!id_cliente || !llave_secreta) {
        alert("⚠️ No estás autenticado.");
        window.location.href = "login.html";
        return;
      }

      const authHeader = "Basic " + btoa(id_cliente + ":" + llave_secreta);
      const listaCompras = document.getElementById("lista-compras");

      fetch(`http://localhost/api-rest/compras/cliente/${id_cliente}`, {
        method: "GET",
        headers: {
          Authorization: authHeader
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log("Respuesta del servidor:", data);

          if (data.status === 200) {
            if (data.compras && data.compras.length > 0) {
              listaCompras.innerHTML = "";

              data.compras.forEach((compra, index) => {
                const grupo = document.createElement("div");
                grupo.classList.add("grupo-compra", "fade-in");
                grupo.style.animationDelay = `${index * 0.1}s`;

                // Calcular total de la compra
                let totalCompra = 0;
                compra.cursos.forEach(curso => {
                  totalCompra += parseFloat(curso.precio) || 0;
                });

                grupo.innerHTML = `
                  <div class="compra-header">
                    <div class="compra-info">
                      <h3>🧾 Compra #${compra.idpago}</h3>
                      <div class="compra-detalles">
                        <div class="detalle-item">
                          <span class="detalle-label">Fecha</span>
                          <span class="detalle-valor">${new Date(compra.fecha).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                        <div class="detalle-item">
                          <span class="detalle-label">Método de Pago</span>
                          <span class="detalle-valor">${compra.metodo}</span>
                        </div>
                        <div class="detalle-item">
                          <span class="detalle-label">Cursos</span>
                          <span class="detalle-valor">${compra.cursos.length} curso${compra.cursos.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div class="total-compra-badge">
                      Total: $${totalCompra.toFixed(2)}
                    </div>
                  </div>
                  <div class="cursos-compra"></div>
                `;

                const contenedorCursos = grupo.querySelector(".cursos-compra");
                
                compra.cursos.forEach(curso => {
                  const precio = parseFloat(curso.precio) || 0;
                  
                  const div = document.createElement("div");
                  div.classList.add("curso");
                  div.innerHTML = `
                    <img src="${curso.imagen || 'img/placeholder.jpg'}" alt="${curso.titulo}" onerror="this.src='img/placeholder.jpg'">
                    <div class="curso-info">
                      <div class="curso-titulo">${curso.titulo}</div>
                      <div class="curso-instructor">Instructor: ${curso.instructor}</div>
                      <div class="curso-precio">$${precio.toFixed(2)}</div>
                    </div>
                  `;
                  contenedorCursos.appendChild(div);
                });

                listaCompras.appendChild(grupo);
              });
            } else {
              listaCompras.innerHTML = `
                <div class="sin-compras fade-in">
                  <h3>🗃️ No tienes compras registradas</h3>
                  <p>¡Explora nuestros cursos y realiza tu primera compra!</p>
                </div>
              `;
            }
          } else {
            listaCompras.innerHTML = `
              <div class="sin-compras fade-in">
                <h3>❌ Error al cargar compras</h3>
                <p>${data.detalle || data.mensaje || 'Error desconocido'}</p>
              </div>
            `;
          }
        })
        .catch(error => {
          console.error("Error al cargar compras:", error);
          listaCompras.innerHTML = `
            <div class="sin-compras fade-in">
              <h3>❌ Error de conexión</h3>
              <p>No se pudieron cargar tus compras. Inténtalo de nuevo más tarde.</p>
            </div>
          `;
        });
    });