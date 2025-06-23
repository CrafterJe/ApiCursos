document.addEventListener("DOMContentLoaded", function () {
  const id = localStorage.getItem("curso_busqueda_id");
  const id_cliente = localStorage.getItem("id_cliente");
  const llave_secreta = localStorage.getItem("llave_secreta");

  if (!id || !id_cliente || !llave_secreta) {
    document.getElementById("curso-info").innerHTML = "<p>Datos no disponibles. Redirigiendo...</p>";
    setTimeout(() => window.location.href = "cursos.html", 2000);
  } else {
    const authHeader = "Basic " + btoa(id_cliente + ":" + llave_secreta);
    fetch(`http://localhost/api-rest/cursos/${id}`, {
      method: "GET",
      headers: {
        "Authorization": authHeader
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log(data); // para depurar

      if (data.status === 200 && typeof data.detalle === "object") {
        const curso = data.detalle;

        const titulo = curso.titulo || "No disponible";
        const descripcion = curso.descripcion || "No disponible";
        const instructor = curso.instructor || "No disponible";
        const precio = curso.precio !== undefined ? `$${parseFloat(curso.precio).toFixed(2)}` : "No disponible";
        const imagen = curso.imagen && curso.imagen.trim() !== "" ? `<img src="${curso.imagen}" onerror="this.style.display='none'">` : "";

        document.getElementById("curso-info").innerHTML = `
          ${imagen}
          <h2>${titulo}</h2>
          <p><strong>Descripción:</strong> ${descripcion}</p>
          <p><strong>Instructor:</strong> ${instructor}</p>
          <p><strong>Precio:</strong> ${precio}</p>
        `;
      } else {
        document.getElementById("curso-info").innerHTML = "<p>❌ Curso no encontrado.</p>";
      }
    })
    .catch(error => {
      console.error("Error al obtener el curso:", error);
      document.getElementById("curso-info").innerHTML = "<p>❌ Error al cargar el curso.</p>";
    });
  }
});
