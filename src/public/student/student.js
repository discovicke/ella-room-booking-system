// Get all rooms 
import API from '../api/api.js';


async function loadRooms() {
  const rooms = await API.getRooms();
  renderStudentRooms(rooms);
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

window.addEventListener("DOMContentLoaded", loadRooms);
