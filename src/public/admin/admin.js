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


// --- Get rooms ---
async function loadRooms() {
  const rooms = await API.getRooms(true);
  renderStudentRooms(rooms);
}

function renderStudentRooms(rooms) {
  const container = document.getElementById("student-room-list");
  container.innerHTML = rooms
      .map((r) => {
        const assets = (r.assets || [])
            .map((a) => `<span class="asset-chip">${a.asset}</span>`)
            .join("");
        return `
    <div class="room-card">
      <h3>Nr ${r.room_number} - ${r.location}</h3>
      <p>Typ: ${r.display_type}</p>
      <p>Antal platser: ${r.capacity}</p>
      <div class="asset-chips">${assets}</div>

      <div class="room-actions">
        <button>Markera som upptaget</button>
        <button>Redigera</button>
        <button class="danger">Ta bort</button>
      </div>
    </div>
    `;
      })
      .join("");
}

window.addEventListener("DOMContentLoaded", () => {
  loadUserFromLocalStorage();
  loadRooms(); 
});