const canalId = "UC_x5XG1OV2P6uZZ5FSM9Ttw"; // Google Developers


fetch(`/api-rest/youtube/canal/${canalId}`)
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log('Datos recibidos:', data); 
    
    if (data.status === 200 && data.detalle && data.detalle.items && data.detalle.items.length > 0) {
      const canal = data.detalle.items[0];

      const html = `
        <h2>${canal.snippet.title}</h2>
        <img src="${canal.snippet.thumbnails.high.url}" alt="Miniatura">
        <p>${canal.snippet.description}</p>
        <div class="stat">Suscriptores: ${parseInt(canal.statistics.subscriberCount).toLocaleString()}</div>
        <div class="stat">Videos: ${parseInt(canal.statistics.videoCount).toLocaleString()}</div>
        <div class="stat">Vistas: ${parseInt(canal.statistics.viewCount).toLocaleString()}</div>
      `;

      document.getElementById("canal").innerHTML = html;
    } else {
      document.getElementById("canal").innerHTML = "❌ No se encontraron datos del canal.";
    }
  })
  .catch(err => {
    document.getElementById("canal").innerHTML = "❌ Error al cargar los datos.";
    console.error('Error completo:', err);
  });