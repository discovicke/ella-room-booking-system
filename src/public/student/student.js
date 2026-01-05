import API from "../api/api.js";
import { showError, showSuccess } from "../utils/toast.js";
import { loadUser, setupLogout } from "../components/auth.manager.js";
import { formatDateTime } from "../utils/formatters.utils.js";
import { renderRooms } from "../components/room.renderer.js";
import { BookingModal } from "../components/booking.modal.js";

// --- Global State ---
let allBookings = [];
let cachedRooms = [];
let currentTab = "upcoming";

// --- Components ---
// Initialize the modal once
const bookingModal = new BookingModal("booking-modal", "booking-form");

// --- Initialization Logic ---
const currentUser = loadUser();

if (currentUser) {
  setupLogout("logout-btn");
  bookingModal.setUser(currentUser); // Tell modal who is booking

  // Load data
  loadRooms();
  loadBookings();

  // When modal finishes a booking, reload the list
  bookingModal.onBookingSuccess = () => loadBookings();
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

  if (tab === "upcoming") {
    tabUpcoming.classList.add("active");
    tabHistory.classList.remove("active");
  } else {
    tabUpcoming.classList.remove("active");
    tabHistory.classList.add("active");
  }

  renderBookings();
}

// --- Room Logic (Refactored) ---
async function loadRooms() {
  try {
    cachedRooms = await API.getRooms(true);

    const container = document.getElementById("student-room-list");

    // We use the shared renderer now!
    renderRooms(cachedRooms, container, (roomId) => {
      // This callback runs when user clicks "Boka"
      const room = cachedRooms.find((r) => String(r.id) === String(roomId));
      if (room) {
        bookingModal.open(room);
      }
    });
  } catch (error) {
    console.error("Could not load rooms", error);
  }
}

// --- Booking List Logic (Kept mostly as is, just a little bit cleaner) ---
async function loadBookings() {
  try {
    if (currentUser && currentUser.id) {
      allBookings = await API.getBookingsByUser(currentUser.id);
    } else {
      allBookings = await API.getBookings(); // Fallback
    }
    renderBookings();
  } catch (err) {
    console.error("Failed to load bookings:", err);
    showError(err.message, { title: "Failed to load bookings:" });
  }
}

function renderBookings() {
  const roomContainer = document.querySelector(".booking-scroll");
  if (!roomContainer) return;

  const now = new Date();

  // 1. Filter
  const filteredBookings = allBookings.filter((booking) => {
    const endTime = new Date(booking.end_time);
    return currentTab === "upcoming" ? endTime >= now : endTime < now;
  });

  // 2. Sort
  filteredBookings.sort((a, b) => {
    const timeA = new Date(a.start_time).getTime();
    const timeB = new Date(b.start_time).getTime();
    return currentTab === "upcoming" ? timeA - timeB : timeB - timeA;
  });

  // 3. Empty State
  if (!filteredBookings.length) {
    roomContainer.innerHTML = `<p>Inga ${
      currentTab === "upcoming" ? "kommande" : "tidigare"
    } bokningar hittades.</p>`;
    return;
  }

  // 4. Render
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
        statusSwe = "AVSLUTAD";
        statusClass = "done";
        style = "opacity: 0.8; filter: grayscale(100%);";
      }

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

  // Attach event listeners for Unbook
  roomContainer.querySelectorAll(".unbook").forEach((btn) => {
    btn.addEventListener("click", () => onclickUnBook(btn.dataset.bookingId));
  });
}

async function onclickUnBook(bookingId) {
  if (!bookingId) return;
  if (!confirm("Vill du avboka bokningen?")) return;

  try {
    await API.updateBooking(bookingId, { status: "cancelled" });
    await loadBookings();
    showSuccess("Bokningen har avbokats.");
  } catch (err) {
    console.error("Failed to unbook:", err);
    showError("Försök igen.", { title: "Avbokning misslyckades" });
  }
}
