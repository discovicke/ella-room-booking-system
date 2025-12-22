// Get all rooms 
import API from './api.js';

async function loadRooms() {
  const rooms = await API.getRooms();
  renderStudentRooms(rooms);
}

function renderStudentRooms(rooms) {
  const container = document.getElementById("student-room-list");
  container.innerHTML = rooms.map(r => `
    <div class="room-card">
      <h3>${r.room_number}</h3>
      <button>Boka</button>
    </div>
  `).join('');
}

window.addEventListener("DOMContentLoaded", loadRooms);
