import API from "../api/api.js";
import { showError, showInfo, showSuccess, showToast } from "../utils/toast.js";

// --- Lagrar alla rum som hämtas från API. ---
let cachedRooms = [];

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
  showInfo("Inloggad som " + displayname, { title: "Välkommen!" });

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
  cachedRooms = rooms;

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
        <h3># ${r.room_number} - ${r.location}</h3>
        <p>${r.display_type}</p>
        <p>Antal platser: ${r.capacity}</p>
        <div class="asset-chips">${assets}</div>
        <button class="book-btn" data-room-id="${r.id}">Boka</button>
      </div>
    `;
    })
    .join("");

  // Koppla boka-knapparna 
  container.querySelectorAll(".book-btn").forEach((btn) => {
    btn.addEventListener("click", () => onclickBookRoom(btn.dataset.roomId));
  });

}

// Hämta rum vid klick
function onclickBookRoom(room_id) {
  const room = cachedRooms.find((r) => String(r.id) === String(room_id));
  if (room) openbookingModal(room);
}

// --- Modal bokningsfunktion ---
const modal = document.getElementById("booking-modal");
const closeModalButton = document.getElementById("modal-close");
const modalRoomLabel = document.getElementById("modal-room-label");
const bookingForm = document.getElementById("booking-form");
const modalContent = modal?.querySelector(".modal-content");
let selectedRoomId = null;

function openbookingModal(room) {
  selectedRoomId = room.id;
  modalRoomLabel.textContent = `Rum ${room.room_number} - ${room.location}`;

  modal.removeAttribute("hidden");
  modal.classList.add("open");

  // Startar pop-in animation
  modalContent.classList.remove("pop-in");
  void modalContent.offsetWidth;
  modalContent.classList.add("pop-in");
  setTimeout(() => modalContent.classList.remove("pop-in"), 350);
}

function closebookingModal() {
  modal.setAttribute("hidden", "");
  modal.classList.remove("open");
  bookingForm.reset();
  selectedRoomId = null;
}

// Klick utanför modalen → nudge-animation
modal?.addEventListener("click", (event) => {
  if (event.target === modal) {
    modalContent.classList.remove("nudge");
    void modalContent.offsetWidth;
    modalContent.classList.add("nudge");
    setTimeout(() => modalContent.classList.remove("nudge"), 300);
  }
});

// Stäng med X-knappen
closeModalButton?.addEventListener("click", closebookingModal);

// Stäng med Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    closebookingModal();
  }
});

// Skicka bokning
bookingForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedRoomId) return;

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.id) {
    showError("Användare inte inloggad.");
    return;
  }

  const formData = new FormData(bookingForm);
  const bookingTime = {
    room_id: selectedRoomId,
    user_id: user.id,
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    notes: formData.get("notes"),
  };

  if (!bookingTime.start_time || !bookingTime.end_time) {
    showError("Vänligen fyll i både start- och sluttid.", {
      title: "Felaktigt tidsintervall",
    });
    return;
  }

  try {
    await API.createBooking(bookingTime);
    showSuccess("Du har bokat rum # " + bookingTime.room_id, {
      title: "Bokning skapad!",
    });
    await loadBookings();
  } catch (err) {
    showError(err.message, { title: "Bokning misslyckades" });
  }

  closebookingModal();
});

// Visa bokningar + avbokning
async function loadBookings() {
  try {
    const stored = localStorage.getItem("user");
    let bookings;

    if (stored) {
      const user = JSON.parse(stored);
      bookings = await API.getBookingsByUser(user.id);
    }

    renderBookings(bookings);
  } catch (err) {
    showError("Kunde inte ladda bokningar");
  }
}

function renderBookings(bookings = []) {
  const roomContainer = document.querySelector(".booking-scroll");

  if (!bookings.length) {
    roomContainer.innerHTML = "<p>Inga bokningar hittades.</p>";
    return;
  }

  roomContainer.innerHTML = bookings
    .map((booking) => {
      const startTime = new Date(booking.start_time).toLocaleString("sv-SE");
      const endTime = new Date(booking.end_time).toLocaleString("sv-SE");

      const status = booking.status === "cancelled" ? "AVBOKAD" : "AKTIV";

      const actionButton =
        booking.status === "cancelled"
          ? ""
          : `<button class="unbook" data-booking-id="${booking.id}">Avboka</button>`;

      return `
        <article class="booking-card">
          <div class="card-header">
            <h3># ${booking.room_number} - ${booking.room_location}</h3>
            <span class="status">${status}</span>
          </div>
          <p><strong>Start:</strong> ${startTime}</p>
          <p><strong>Slut:</strong> ${endTime}</p>
          <p><strong>Anteckning:</strong> ${booking.notes || "-"}</p>
          ${actionButton}
        </article>
      `;
    })
    .join("");

  // Kopplar avbokningsknapparna
  roomContainer.querySelectorAll(".unbook").forEach((btn) => {
    btn.addEventListener("click", () => onclickUnBook(btn.dataset.bookingId));
  });
}

async function onclickUnBook(bookingId) {
  if (!confirm("Vill du avboka bokningen?")) return;

  try {
    await API.updateBooking(bookingId, { status: "cancelled" });
    await loadBookings();
  } catch (err) {
    showError("Avbokning misslyckades");
  }
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

// Logga ut
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await API.logout();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login/";
    }
  });
}


window.addEventListener("DOMContentLoaded", () => {
  loadUserFromLocalStorage();
  loadRooms();
  loadBookings();
});

