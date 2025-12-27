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


async function loadRooms() {
  // Hämta alla rum från API
  const rooms = await API.getRooms(true);

  // Rendera rummen i mittenkolumnen
  renderStudentRooms(rooms);

  // Uppdatera snabbinfo
  updateQuickInfo(rooms);
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
        <button class="book-btn" data-room-id="${r.id}">Boka</button>
      </div>
    `;
      })
      .join("");
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

window.addEventListener("DOMContentLoaded", () => {
  loadUserFromLocalStorage();
  loadRooms(); 
});