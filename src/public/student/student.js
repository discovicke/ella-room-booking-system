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

  container.querySelectorAll(".book-btn").forEach((bookButton) => {
    bookButton.addEventListener("click", () => onclickBookRoom(bookButton.dataset.roomId));
  });
}
function onclickBookRoom(bookButton){

  alert(`Bokar rum: ${bookButton}`);

}
function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function renderBookings(bookings = []) {
  const roomContainer = document.querySelector(".booking-scroll");
  if (!roomContainer) return;
  if (!bookings.length) {
    roomContainer.innerHTML = "<p>Inga bokningar hittades.</p>";
    return;
  }
  roomContainer.innerHTML = bookings
  .map((booking) => {
    const startTime = formatDateTime(booking.start_time);
    const endTime = formatDateTime(booking.end_time);
    const status = (booking.status || "väntar").toUpperCase();
    const statusSwe = status === "CANCELLED" ? "AVBOKAD" : "AKTIV BOKNING";
    const statusClass = status === "CANCELLED"
        ? "cancelled"
        : "active";
    return `
    <article class="booking-card">
      <div class="card-header">
        <h3># ${booking.room_number} - ${booking.room_location}</h3>
        <span class="status ${statusClass}">${statusSwe}</span>
      </div>
    <p><strong>Start:</strong> ${startTime}</p>
    <p><strong>Slut:</strong> ${endTime}</p>
    <p class="note"><strong>Anteckning:</strong><em> ${booking.notes || "-"}</em></p>
    <Button class="unbook" data-booking-id="${booking.id}">Avboka</Button>
    </article>
    `;
  })
  .join("");
  roomContainer.querySelectorAll(".unbook").forEach((btn) => {
    btn.addEventListener("click", () => onclickUnBook(btn.dataset.bookingId));
  });
  console.log("Rendered bookings");
}
function onclickUnBook(bookingId){
  alert(`Avboka bokning ${bookingId}`);

}

async function loadBookings() {
  try {
    const stored = localStorage.getItem("user");
    let bookings;

    if (stored) {
      const user = JSON.parse(stored);
      const userId = user && user.id ? user.id : null;
      bookings = userId
          ? await API.getBookingsByUser(userId)
          : await API.getBookings();
    } else {
      bookings = await API.getBookings();
    }

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
