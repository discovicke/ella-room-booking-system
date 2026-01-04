import API from "../api/api.js";
import { showError, showInfo, showSuccess, showToast } from "../utils/toast.js";

// --- Global State ---
let allBookings = [];
let cachedRooms = [];
let currentTab = "upcoming"; // 'upcoming' or 'history'

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

// --- Tab Switching Logic ---
const tabUpcoming = document.getElementById("tab-upcoming");
const tabHistory = document.getElementById("tab-history");

if (tabUpcoming && tabHistory) {
  tabUpcoming.addEventListener("click", () => switchTab("upcoming"));
  tabHistory.addEventListener("click", () => switchTab("history"));
}

function switchTab(tab) {
  currentTab = tab;

  // Update UI classes for tabs
  if (tab === "upcoming") {
    tabUpcoming.classList.add("active");
    tabHistory.classList.remove("active");
  } else {
    tabUpcoming.classList.remove("active");
    tabHistory.classList.add("active");
  }

  // Re-render the list based on the new tab
  renderBookings();
}

// --- Hämta rum ---
async function loadRooms() {
  cachedRooms = await API.getRooms(true);
  renderStudentRooms(cachedRooms);
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
    bookButton.addEventListener("click", () =>
      onclickBookRoom(bookButton.dataset.roomId)
    );
  });
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
  if (!modal) return;
  modal.removeAttribute("hidden");
  modal.classList.add("open");

  if (modalContent) {
    modalContent.classList.remove("pop-in");
    void modalContent.offsetWidth;
    modalContent.classList.add("pop-in");
    setTimeout(() => modalContent.classList.remove("pop-in"), 350);
  }
}

function closebookingModal() {
  if (!modal) return;
  modal.setAttribute("hidden", "");
  modal.classList.remove("open");
  bookingForm?.reset();
  selectedRoomId = null;
}

modal?.addEventListener("click", (event) => {
  if (event.target !== modal) return;
  if (!modalContent) return;

  // restart nudge animation to draw attention
  modalContent.classList.remove("nudge");
  void modalContent.offsetWidth;
  modalContent.classList.add("nudge");
  setTimeout(() => modalContent.classList.remove("nudge"), 300);
});

closeModalButton?.addEventListener("click", closebookingModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (modal && !modal.hidden) closebookingModal();
  }
});

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
    showError("Vänligen fyll i både start- och sluttid för bokningen.", {
      title: "Felaktigt tidsintervall",
    });
    return;
  }

  try {
    await API.createBooking(bookingTime);
    showSuccess("Du har bokat rum # " + bookingTime.room_id, {
      title: "Bokningen har skapats!",
    });
    await loadBookings();
  } catch (err) {
    console.error("Booking failed:", err);
    showError(err.message, { title: "Bokning misslyckades" });
  }
  closebookingModal();
});

function onclickBookRoom(room_id) {
  const room = cachedRooms.find((r) => String(r.id) === String(room_id));
  if (room) {
    openbookingModal(room);
  }
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("sv-SE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// --- Render Bookings (Filtered & Sorted) ---
function renderBookings() {
  const roomContainer = document.querySelector(".booking-scroll");
  if (!roomContainer) return;

  const now = new Date();

  // 1. Filter bookings based on current Tab
  const filteredBookings = allBookings.filter((booking) => {
    const endTime = new Date(booking.end_time);

    if (currentTab === "upcoming") {
      // Show bookings that end in the future (Active or Cancelled in future)
      return endTime >= now;
    } else {
      // Show bookings that ended in the past (History)
      return endTime < now;
    }
  });

  // 2. Sort bookings
  filteredBookings.sort((a, b) => {
    const timeA = new Date(a.start_time).getTime();
    const timeB = new Date(b.start_time).getTime();

    // Upcoming: Soonest first (Ascending)
    // History: Latest/Newest first (Descending)
    return currentTab === "upcoming" ? timeA - timeB : timeB - timeA;
  });

  // 3. Handle Empty State
  if (!filteredBookings.length) {
    roomContainer.innerHTML = `<p>Inga ${
      currentTab === "upcoming" ? "kommande" : "tidigare"
    } bokningar hittades.</p>`;
    return;
  }

  // 4. Render Cards
  roomContainer.innerHTML = filteredBookings
    .map((booking) => {
      const startTime = formatDateTime(booking.start_time);
      const endTime = formatDateTime(booking.end_time);
      const rawStatus = (booking.status || "väntar").toLowerCase();

      let statusSwe = "AKTIV";
      let statusClass = "active";
      let style = "";

      if (rawStatus === "cancelled") {
        statusSwe = "AVBOKAD";
        statusClass = "cancelled";
        style = "opacity: 0.7;";
      } else if (currentTab === "history") {
        // In history, if not cancelled, it implies completed/passed
        statusSwe = "AVSLUTAD";
        statusClass = "done";
        style = "opacity: 0.8; filter: grayscale(100%);";
      }

      // Show Action Button ONLY if in Upcoming tab AND not already cancelled
      const showUnbookBtn =
        currentTab === "upcoming" && rawStatus !== "cancelled";
      const actionButton = showUnbookBtn
        ? `<button class="unbook" data-booking-id="${booking.id}">Avboka</button>`
        : "";

      return `
    <article class="booking-card" style="${style}">
      <div class="card-header">
        <h3># ${booking.room_number} - ${booking.room_location}</h3>
        <span class="status ${statusClass}">${statusSwe}</span>
      </div>
      <p><strong>Start:</strong> ${startTime}</p>
      <p><strong>Slut:</strong> ${endTime}</p>
      <p class="note"><strong>Anteckning:</strong><em> ${
        booking.notes || "-"
      }</em></p>
      ${actionButton}
    </article>
    `;
    })
    .join("");

  // Attach Event Listeners to generated buttons
  roomContainer.querySelectorAll(".unbook").forEach((btn) => {
    btn.addEventListener("click", () => onclickUnBook(btn.dataset.bookingId));
  });

  console.log(
    `Rendered ${filteredBookings.length} bookings for tab: ${currentTab}`
  );
}

// --- The Update/Cancel Logic ---
async function onclickUnBook(bookingId) {
  if (!bookingId) return;

  const confirmed = window.confirm("Vill du avboka bokningen?");
  if (!confirmed) return;

  try {
    // We send ONLY the status.
    // The backend will merge this with existing data.
    await API.updateBooking(bookingId, { status: "cancelled" });

    // Reload to update state
    await loadBookings();

    showSuccess("Bokningen har avbokats.");
  } catch (err) {
    console.error("Failed to unbook:", err);
    showError("Försök igen.", { title: "Avbokning misslyckades" });
  }
}

async function loadBookings() {
  try {
    const stored = localStorage.getItem("user");

    // Fetch bookings and store in global variable 'allBookings'
    if (stored) {
      const user = JSON.parse(stored);
      const userId = user && user.id ? user.id : null;
      allBookings = userId
        ? await API.getBookingsByUser(userId)
        : await API.getBookings();
    } else {
      allBookings = await API.getBookings();
    }

    // Render based on current tab state
    renderBookings();
    console.log("Hämtade bokningar:", allBookings);
  } catch (err) {
    console.error("Failed to load bookings:", err);
    showError(err.message, { title: "Failed to load bookings:" });
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (modal && !modal.hidden) {
      closebookingModal();
    }
  }
});

window.addEventListener("DOMContentLoaded", () => {
  loadUserFromLocalStorage();
  loadRooms();
  loadBookings();
});
