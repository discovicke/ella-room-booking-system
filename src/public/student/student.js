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
  roleEl.textContent = capitalize(userobject.role);
  roleEl.className = `user-role ${userobject.role}`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await API.logout(); // calls /api/auth/logout with credentials included
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login/";
    }
  });
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
    <button class="book-btn" data-room-id="${r.id}">Boka</button>
  </div>
  `
    )
    .join("");
   container.querySelectorAll(".book-btn").forEach((btn) => {
    btn.addEventListener("click", () => onclickBookRoom(btn.dataset.roomId));
  });

}

function onclickBookRoom(btn) {
  
  alert(`Bokar rum: ${btn}`);

}

window.addEventListener("DOMContentLoaded", () => {
  loadUserFromLocalStorage();
  loadRooms(); // eller loadTeacherData(), loadAdminData()
});
