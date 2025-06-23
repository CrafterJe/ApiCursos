document.addEventListener("DOMContentLoaded", function () {
  const cursosPagados = JSON.parse(localStorage.getItem("cursosPagados") || "[]");
    const lista = document.getElementById("lista-cursos");

    if (cursosPagados.length === 0) {
      lista.innerHTML = "<p>No hay información de cursos comprados</p>";
    } else {
      cursosPagados.forEach(curso => {
        const div = document.createElement("div");
        div.classList.add("curso");
        div.innerHTML = `
          <img src="${curso.imagen || 'img/placeholder.jpg'}" alt="${curso.titulo}" onerror="this.src='img/placeholder.jpg'">
          <div class="curso-info">
            <div class="curso-titulo">${curso.titulo}</div>
            <div class="curso-instructor">Instructor: ${curso.instructor}</div>
            <div class="curso-precio">$${curso.precio.toFixed(2)}</div>
          </div>
        `;
        lista.appendChild(div);
      });
    }

    localStorage.removeItem("cursosPagados");
});
