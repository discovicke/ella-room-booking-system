// Get all rooms
import API from "../api/api.js";

// --- Hämta inloggad användare ---
function loadUserFromLocalStorage() {
  const user = localStorage.getItem("user");


  if (!user) {
    // Ingen user sparad → skicka till login
    window.location.href = "/login/";
    return;
  }

  const userobject = JSON.parse(user);
  const displayname = userobject.display_name; 

  document.getElementById("username").textContent = displayname;

  console.log(displayname);
  

  const roleEl = document.getElementById("user-role");
  roleEl.textContent = capitalize(user.role);
  roleEl.className = `user-role ${user.role}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// --- Hämta rum ---
async function loadRooms() {
  const rooms = await API.getRooms();
  renderStudentRooms(rooms);
}

function renderStudentRooms(rooms) {
  const container = document.getElementById("student-room-list");
  container.innerHTML = rooms
    .map(
      (r) => `
    <div class="room-card">
      <h3>Nr ${r.room_number} - ${r.location}</h3>
    <p>Typ: ${r.type}</p>
    <p>Antal platser: ${r.capacity}</p>
    <button>Boka</button>
  </div>
  `
    )
    .join("");
}

window.addEventListener("DOMContentLoaded", () => {
  loadUserFromLocalStorage();
  loadRooms(); // eller loadTeacherData(), loadAdminData()
});


