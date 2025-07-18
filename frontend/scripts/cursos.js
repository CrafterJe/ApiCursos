let mostrarSoloMisPublicaciones = false;

document.addEventListener("DOMContentLoaded", function () {
    function buscarCurso() {
      const id = document.getElementById("buscar-curso-id").value;
      if (id && !isNaN(id)) {
        localStorage.setItem("curso_busqueda_id", id);
        window.location.href = "curso.html";
      } else {
        alert("⚠️ Ingresa un ID válido de curso.");
      }
    }

        // Obtener credenciales del localStorage
      const id_cliente = localStorage.getItem("id_cliente");
      const llave_secreta = localStorage.getItem("llave_secreta");
      const authHeader = "Basic " + btoa(id_cliente + ":" + llave_secreta);

      const loading = document.getElementById("loading");
      const mensaje = document.getElementById("mensaje");
      const contenedor = document.getElementById("cursos-container");
      const stats = document.getElementById("stats");
      const totalCursos = document.getElementById("total-cursos");

      function mostrarMensaje(texto, tipo = 'error') {
        mensaje.textContent = texto;
        mensaje.className = tipo === 'error' ? 'error-message' : 'success-message';
        mensaje.style.display = 'block';
      }

      function ocultarMensaje() {
        mensaje.style.display = 'none';
      }

      function cerrarSesion() {
        localStorage.removeItem("id_cliente");
        localStorage.removeItem("llave_secreta");
        window.location.href = "login.html";
      }

      let paginaActual = 1;

    function cargarCursos(pagina = 1) {
      paginaActual = pagina;

      if (!id_cliente || !llave_secreta) {
        mostrarMensaje("⚠️ No se detectaron credenciales. Redirigiendo al login...");
        setTimeout(() => window.location.href = "login.html", 2000);
        return;
      }

      loading.style.display = 'block';
      ocultarMensaje();

      const authHeader = "Basic " + btoa(id_cliente + ":" + llave_secreta);
      
      const url = mostrarSoloMisPublicaciones
        ? "http://localhost/api-rest/cursos/mis"
        : `http://localhost/api-rest/cursos?pagina=${pagina}`;

      console.log("🔍 Realizando petición a:", url);
      console.log("🔍 Modo mis publicaciones:", mostrarSoloMisPublicaciones);

      fetch(url, {
        method: "GET",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        console.log("📡 Status respuesta:", response.status);
        if (!response.ok) {
          return response.text().then(text => {
            console.error("❌ Error en respuesta:", text);
            throw new Error("Respuesta no válida:\n" + text);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("📦 Datos completos recibidos:", data);
        loading.style.display = 'none';
        contenedor.innerHTML = "";

        // IMPORTANTE: Verificar que la respuesta sea exitosa
        if (data.status === 200) {
          console.log("✅ Respuesta exitosa, total registros:", data.total_registros);
        
          // Mostrar estadísticas
          totalCursos.textContent = data.total_registros;
          stats.style.display = 'block';

          // Verificar si hay cursos
          if (data.total_registros > 0 && data.detalle && data.detalle.length > 0) {
            console.log("📚 Renderizando", data.detalle.length, "cursos");

            data.detalle.forEach(curso => {
              const card = document.createElement("div");
              card.className = "curso-card";
              card.innerHTML = `
                <img 
                  src="${curso.imagen && curso.imagen.startsWith('http') ? curso.imagen : 'img/placeholder.jpg'}" 
                  class="curso-imagen" 
                  onerror="this.src='img/placeholder.jpg'" 
                >
                <h3 class="curso-titulo">${curso.titulo}</h3>
                <div class="curso-descripcion">${curso.descripcion}</div>
                <div class="curso-info">
                  <span class="curso-label">👨‍🏫 Instructor:</span>
                  <span class="curso-instructor">${curso.instructor}</span>
                </div>
                <div class="curso-precio">💰 $${parseFloat(curso.precio).toFixed(2)}</div>
              `;
            
              if (mostrarSoloMisPublicaciones) {
                const acciones = document.createElement("div");
                acciones.className = "curso-acciones";
                acciones.innerHTML = `
                  <button class="btn-editar" onclick="editarCurso(${curso.id})">✏ Editar</button>
                  <button class="btn-eliminar" onclick="eliminarCurso(${curso.id})">🗑 Eliminar</button>
                `;
                card.appendChild(acciones);
              } else {
                const botonCarrito = document.createElement("button");
                botonCarrito.textContent = "🛒 Agregar al carrito";
                botonCarrito.className = "btn-agregar-carrito";
                botonCarrito.onclick = () => agregarAlCarrito(curso);
                card.appendChild(botonCarrito);
              }
          
              contenedor.appendChild(card);
            });
        

            // Paginación solo para vista general
            if (!mostrarSoloMisPublicaciones) {
              renderPaginacion(Math.ceil(data.total_registros / 9));
            } else {
              document.getElementById("paginacion").innerHTML = "";
            }
          } else {
            // No hay cursos - mostrar mensaje apropiado
            console.log("📭 No hay cursos para mostrar");
            const mensaje = mostrarSoloMisPublicaciones 
              ? "📚 No tienes cursos registrados aún." 
              : "📚 No hay cursos disponibles.";
            mostrarMensaje(mensaje, 'success');
            document.getElementById("paginacion").innerHTML = "";
          }
        } else {
          // Error en el servidor
          console.error("❌ Error del servidor:", data);
          mostrarMensaje("❌ Error del servidor: " + (data.detalle || "Error desconocido"));
        }
      })
      .catch(error => {
        loading.style.display = 'none';
        console.error("❌ Error completo:", error);
        mostrarMensaje("❌ Error al cargar cursos: " + error.message);
      });
    }


    function renderPaginacion(totalPaginas) {
      const paginacionContainer = document.getElementById("paginacion");
      paginacionContainer.innerHTML = '';

      if (totalPaginas <= 1) return;

      for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.style.margin = "0 5px";
        btn.style.padding = "5px 10px";
        btn.style.borderRadius = "5px";
        btn.style.border = "none";
        btn.style.background = i === paginaActual ? "#007bff" : "#ddd";
        btn.style.color = i === paginaActual ? "white" : "black";
        btn.onclick = () => cargarCursos(i);
        paginacionContainer.appendChild(btn);
      }
    }
    
        function cargarPerfilCliente() {
      if (!id_cliente || !llave_secreta) return;
        
      const authHeader = "Basic " + btoa(id_cliente + ":" + llave_secreta);
        
      fetch("http://localhost/api-rest/clientes/perfil", {
        method: "GET",
        headers: {
          "Authorization": authHeader,
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data && data.nombre && data.apellido && data.correo) {
            document.getElementById("nombre-cliente").textContent = `${data.nombre} ${data.apellido}`;
            document.getElementById("correo-cliente").textContent = data.correo;
          }
        })
        .catch(error => {
          console.error("❌ Error al cargar perfil del cliente:", error);
        });
    }
      

      // Cargar cursos al iniciar la página
      cargarCursos(1)
      cargarPerfilCliente();

      function mostrarFormularioCrear() {
        document.getElementById("modalCrearCurso").style.display = "flex";
        ocultarMensaje();
      }

      function ocultarFormularioCrear() {
      const modal = document.getElementById("modalCrearCurso");
      modal.style.display = "none";
      modal.dataset.editando = ""; //limpiar id
      document.getElementById("titulo").value = "";
      document.getElementById("descripcion").value = "";
      document.getElementById("instructor").value = "";
      document.getElementById("imagen").value = "";
      document.getElementById("precio").value = "";

      const btnPublicar = modal.querySelector("button");
      btnPublicar.textContent = "Publicar";
      btnPublicar.onclick = crearCurso;
    }



      function crearCurso() {
      const titulo = document.getElementById("titulo").value;
      const descripcion = document.getElementById("descripcion").value;
      const instructor = document.getElementById("instructor").value;
      const imagen = document.getElementById("imagen").value;
      const precio = document.getElementById("precio").value;

      if (!titulo || !descripcion || !instructor || !precio) {
        mostrarMensaje("⚠️ Todos los campos excepto imagen son obligatorios.");
        return;
      }

      const authHeader = "Basic " + btoa(id_cliente + ":" + llave_secreta);

      fetch("http://localhost/api-rest/cursos", {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          instructor,
          imagen,
          precio
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === 200) {
          mostrarMensaje("✅ Curso creado con éxito", "success");
          ocultarFormularioCrear();
          // Limpiar el formulario
          document.getElementById("titulo").value = "";
          document.getElementById("descripcion").value = "";
          document.getElementById("instructor").value = "";
          document.getElementById("imagen").value = "";
          document.getElementById("precio").value = "";
          cargarCursos();
        } else {
          mostrarMensaje("❌ Error: " + data.detalle);
        }
      })
      .catch(error => {
        mostrarMensaje("❌ Error al crear el curso: " + error.message);
      });
    }


    

    document.getElementById("toggleMisPublicaciones").addEventListener("click", () => {
      mostrarSoloMisPublicaciones = !mostrarSoloMisPublicaciones;
      document.getElementById("toggleMisPublicaciones").textContent = mostrarSoloMisPublicaciones ? "👁 Ver todos" : "👤 Mis Publicaciones";
      cargarCursos(paginaActual); // recargar la misma página con filtro aplicado
    });
    function irAlCarrito() {
      window.location.href = "carrito.html";
    }
    function irAYoutube() { window.location.href = 'http://localhost/api-rest/frontend/youtube.html'; }
    function agregarAlCarrito(curso) {
      const authHeader = "Basic " + btoa(id_cliente + ":" + llave_secreta);

      fetch("http://localhost/api-rest/carrito", {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id_curso: curso.id })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 200) {
          mostrarToast("✅ Curso agregado al carrito");
          actualizarContadorCarrito();
        } else {
          mostrarToast("❌ Error: " + data.detalle, "error");
        }
      })
      .catch(err => {
        mostrarToast("❌ Error al agregar al carrito: " + err.message, "error");
      });
    }


    function actualizarContadorCarrito() {
      fetch("http://localhost/api-rest/carrito/contador", {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Contador del carrito:", data);
          if (data.status === 200) {
            document.getElementById("contador-carrito").textContent = data.total;
          } else {
            console.warn("No se pudo obtener el contador del carrito:", data.detalle);
          }
        })
        .catch((err) => {
          console.error("❌ Error al obtener contador del carrito:", err);
        });
    }



    // Llamar al cargar la página
    if (id_cliente && llave_secreta) {
        actualizarContadorCarrito();
      } else {
        console.warn("⚠️ No hay credenciales para actualizar el contador del carrito");
      }

    function mostrarToast(mensaje, tipo = 'success') {
      const toast = document.getElementById("toast");
      toast.textContent = mensaje;

      if (tipo === 'error') {
        toast.style.background = '#dc3545'; // rojo
      } else {
        toast.style.background = '#28a745'; // verde
      }

      toast.style.display = "block";

      setTimeout(() => {
        toast.style.display = "none";
      }, 3000);
    }

    function editarCurso(id) {
      const authHeader = "Basic " + btoa(id_cliente + ":" + llave_secreta);
      fetch(`http://localhost/api-rest/cursos/${id}`, {
        method: "GET",
        headers: {
          "Authorization": authHeader
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 200) {
          const curso = data.detalle;

          // Rellenar campos con los datos del curso
          document.getElementById("titulo").value = curso.titulo;
          document.getElementById("descripcion").value = curso.descripcion;
          document.getElementById("instructor").value = curso.instructor;
          document.getElementById("imagen").value = curso.imagen;
          document.getElementById("precio").value = curso.precio;

          // Guardar ID en dataset del modal
          document.getElementById("modalCrearCurso").dataset.editando = id;

          // Cambiar el texto del botón
          const btnPublicar = document.querySelector("#modalCrearCurso button[onclick='crearCurso()']");
          btnPublicar.textContent = "Guardar Cambios";
          btnPublicar.onclick = guardarEdicionCurso;

          // Mostrar modal
          mostrarFormularioCrear();

        } else {
          alert("❌ Error al obtener el curso: " + data.detalle);
        }
      })
      .catch(err => {
        alert("❌ Error al cargar los datos del curso: " + err.message);
      });
    }

    function guardarEdicionCurso() {
      const idCurso = document.getElementById("modalCrearCurso").dataset.editando;
      const titulo = document.getElementById("titulo").value;
      const descripcion = document.getElementById("descripcion").value;
      const instructor = document.getElementById("instructor").value;
      const imagen = document.getElementById("imagen").value;
      const precio = document.getElementById("precio").value;

      if (!titulo || !descripcion || !instructor || !precio) {
        mostrarMensaje("⚠️ Todos los campos excepto imagen son obligatorios.");
        return;
      }

      const authHeader = "Basic " + btoa(id_cliente + ":" + llave_secreta);

      fetch(`http://localhost/api-rest/cursos/${idCurso}`, {
        method: "PUT",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ titulo, descripcion, instructor, imagen, precio })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 200) {
          mostrarMensaje("✅ Curso editado con éxito", "success");
          ocultarFormularioCrear();
          cargarCursos(paginaActual);
        } else {
          mostrarMensaje("❌ Error: " + data.detalle);
        }
      })
      .catch(error => {
        mostrarMensaje("❌ Error al editar el curso: " + error.message);
      });
    }


    let cursoAEliminar = null;

    function eliminarCurso(id) {
      cursoAEliminar = id;
      document.getElementById("modalEliminar").style.display = "flex";
    }

    function cerrarModalEliminar() {
      cursoAEliminar = null;
      document.getElementById("modalEliminar").style.display = "none";
    }

    const btnEliminar = document.getElementById("confirmarEliminarBtn");
      if (btnEliminar) {
        btnEliminar.addEventListener("click", () => {
          if (!cursoAEliminar) return;

          const authHeader = "Basic " + btoa(id_cliente + ":" + llave_secreta);

          fetch(`http://localhost/api-rest/cursos/${cursoAEliminar}`, {
            method: "DELETE",
            headers: {
              "Authorization": authHeader
            }
          })
          .then(res => res.json())
          .then(data => {
            if (data.status === 200) {
              mostrarMensaje("✅ Curso eliminado con éxito", "success");
              cerrarModalEliminar();
              cargarCursos(paginaActual);
            } else {
              mostrarMensaje("❌ Error: " + data.detalle);
            }
          })
          .catch(err => {
            mostrarMensaje("❌ Error al eliminar: " + err.message);
          });
        });
    }

    window.buscarCurso = buscarCurso;
    window.cerrarSesion = cerrarSesion;
    window.eliminarCurso = eliminarCurso;
    window.editarCurso = editarCurso;
    window.mostrarFormularioCrear = mostrarFormularioCrear;
    window.ocultarFormularioCrear = ocultarFormularioCrear;
    window.irAlCarrito = irAlCarrito;
    window.irAYoutube = irAYoutube;

    // ===== SCRIPTS DE YOUTUBE =====
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    const videoIds = ['SvOlbYgSvzc', 'w7ejDZ8SWv8']; // Agrega más si quieres
    let currentVideoIndex = 0;
    var player;
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      height: '600',
      width: '100%',
      videoId: videoIds[currentVideoIndex],
      playerVars: { 
        'playsinline': 1,
        'controls': 0,  // Oculta los controles nativos de YouTube
        'disablekb': 1, // Desactiva controles de teclado
        'fs': 0,        // Desactiva pantalla completa
        'iv_load_policy': 3, // Oculta anotaciones
        'modestbranding': 1, // Minimiza el branding de YouTube
        'rel': 0        // No muestra videos relacionados
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }

  function onPlayerReady(event) {
    // El reproductor está listo
    console.log('Reproductor YouTube listo');
  }

  function onPlayerStateChange(event) {
    // Maneja cambios de estado si es necesario
  }

  function playVideo() {
    if (player && player.playVideo) {
      player.playVideo();
    }
  }

  function pauseVideo() {
    if (player && player.pauseVideo) {
      player.pauseVideo();
    }
  }

  function stopVideo() {
    if (player && player.stopVideo) {
      player.stopVideo();
    }
  }

  function increaseVolume() {
    if (player && player.getVolume && player.setVolume) {
      let currentVolume = player.getVolume();
      if (currentVolume < 100) {
        player.setVolume(Math.min(currentVolume + 10, 100));
      }
    }
  }

  function decreaseVolume() {
    if (player && player.getVolume && player.setVolume) {
      let currentVolume = player.getVolume();
      if (currentVolume > 0) {
        player.setVolume(Math.max(currentVolume - 10, 0));
      }
    }
  }

  // Cambiar al video siguiente
  function siguienteVideo() {
  currentVideoIndex = (currentVideoIndex + 1) % videoIds.length;
  player.loadVideoById(videoIds[currentVideoIndex]);
}

  // Cambiar al video anterior
  function anteriorVideo() {
  currentVideoIndex = (currentVideoIndex - 1 + videoIds.length) % videoIds.length;
  player.loadVideoById(videoIds[currentVideoIndex]);
}

  // Prevenir clic derecho en el iframe
  document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IFRAME') {
      e.preventDefault();
    }
  });

  // Prevenir drag and drop en el iframe
  document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IFRAME') {
      e.preventDefault();
    }
  });
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    window.playVideo = playVideo;
    window.pauseVideo = pauseVideo;
    window.stopVideo = stopVideo;
    window.increaseVolume = increaseVolume;
    window.decreaseVolume = decreaseVolume;
    window.cerrarModalEliminar = cerrarModalEliminar;
    window.siguienteVideo = siguienteVideo;
    window.anteriorVideo = anteriorVideo;
});

