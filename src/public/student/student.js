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
        <h3># ${r.room_number} - ${r.location}</h3>
        <p>${r.display_type}</p>
        <p>Antal platser: ${r.capacity}</p>
        <div class="asset-chips">${assets}</div>
        <button class="book-btn" data-room-id="${r.id}">Boka</button>
      </div>
    `;
    })
    .join("");

  container.querySelectorAll(".book-btn").forEach((btn) => {
    btn.addEventListener("click", () => onclickBookRoom(btn.dataset.roomId));
  });
}
function onclickBookRoom(btn) {

  // alert(`Bokar rum: ${btn}`);

}
// oklart !"!!"
function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function renderBookings(bookings = []) {
  const list = document.querySelector(".booking-scroll");
  if (!list) return;
  if (!bookings.length) {
    list.innerHTML = "<p>Inga bokningar hittades.</p>";
    return;
  }
  list.innerHTML = bookings
  .map((booking) => {
    const roomLabel = booking.room_number
    ? `Rum ${booking.room_id}`
    : `Rum #${booking.room_id}`;
    const startTime = formatDateTime(booking.start_time);
    const endTime = formatDateTime(booking.end_time);
    const status = (booking.status || "väntar").toUpperCase();
    return `
    <article class="booking-card">
    <h3>${roomLabel}</h3>
    <p><strong>Start:</strong> ${startTime}</p>
    <p><strong>Slut:</strong> ${endTime}</p>
    <p><strong>Note:</strong><em> ${booking.notes || "-"}</em></p>
    <span class ="status ${status.toLowerCase()}">${status}</span>
    <Button class="unbook" id="r${booking.id}">Avboka</Button>
    </article>
    `;
  })
  .join("");
  console.log("Rendered bookings");
}

async function loadBookings() {
  try {
    const bookings = await API.getBookings();
    renderBookings(bookings);
    console.log("Användarens bokningar:", bookings);

  } catch (err) {
    console.error("Failed to load bookings:", err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadUserFromLocalStorage();
  loadRooms(); // eller loadTeacherData(), loadAdminData()
  loadBookings();

});
