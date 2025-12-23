import API from '../api/api.js';

async function loadRooms() {
  // Hämta alla rum från API
  const rooms = await API.getRooms();

  // Rendera rummen i mittenkolumnen
  renderStudentRooms(rooms);

  // Uppdatera snabbinfo 
  updateQuickInfo(rooms);
}

function renderStudentRooms(rooms) {
  const container = document.getElementById("student-room-list");

  container.innerHTML = rooms.map(r => `
    <div class="room-card">
      <h3>Nr ${r.room_number} - ${r.location}</h3>
      <p>Typ: ${r.type}</p>
      <p>Antal platser: ${r.capacity}</p>
      <button>Boka</button>
    </div>
  `).join('');
}

function updateQuickInfo(rooms) {
  const totalRooms = rooms.length;

  // Just nu: alla rum är lediga (ingen bokningslogik än)
  const availableRooms = totalRooms;

  // Skriv ut värdena i snabbinfo
  document.getElementById("available-rooms").textContent = availableRooms;
  document.getElementById("total-rooms").textContent = totalRooms;

  // Aktiva bokningar är 0 tills backend är klar
  document.getElementById("active-bookings").textContent = 0;
}

window.addEventListener("DOMContentLoaded", loadRooms);