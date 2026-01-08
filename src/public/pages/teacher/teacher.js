import API from "../../api/api.js";
import { showError, showSuccess } from "../../utils/toast.js";
import { loadUser, setupLogout } from "../../components/auth.manager.js";
import { renderRooms } from "../../components/room.renderer.js";
import { renderBookings as renderBookingList } from "../../components/booking.renderer.js";
import { BookingModal } from "../../components/booking.modal.js";
import { translateError } from "../../utils/translator.utils.js";
import { showDangerConfirm } from "../../utils/confirm.js";

// --- Global State ---
let allBookings = [];
let userBookings = [];
let cachedRooms = [];
let currentTab = "upcoming";
let showCancelled = false; // Default: hide cancelled bookings

// --- Components ---
const bookingModal = new BookingModal("booking-modal", "booking-form");

// --- Initialization ---
const currentUser = loadUser();

if (currentUser) {
  setupLogout("logout-btn");
  bookingModal.setUser(currentUser);

  // Refresh list when a new booking is made
  bookingModal.onBookingSuccess = () => {
    loadBookings();
  };

  // Initialize Data
  window.addEventListener("DOMContentLoaded", () => {
    loadRooms();
    loadBookings();
    setupTabs();
  });
}

// --- Tab & Filter Logic ---
function setupTabs() {
  const tabUpcoming = document.getElementById("tab-upcoming");
  const tabHistory = document.getElementById("tab-history");
  const checkboxCancelled = document.getElementById("show-cancelled");

  if (tabUpcoming && tabHistory) {
    tabUpcoming.addEventListener("click", () =>
      switchTab("upcoming", tabUpcoming, tabHistory)
    );
    tabHistory.addEventListener("click", () =>
      switchTab("history", tabHistory, tabUpcoming)
    );
  }

  if (checkboxCancelled) {
    checkboxCancelled.addEventListener("change", (e) => {
      showCancelled = e.target.checked;
      updateBookingList();
    });
  }
}

function switchTab(tab, activeBtn, inactiveBtn) {
  currentTab = tab;
  activeBtn.classList.add("active");
  inactiveBtn.classList.remove("active");
  updateBookingList();
}

// --- Room Logic ---
async function loadRooms() {
  try {
    cachedRooms = await API.getRooms(true);

    // 1. Render Rooms (using shared component)
    const container = document.getElementById("student-room-list");
    renderRooms(cachedRooms, container, (roomId) => {
      const room = cachedRooms.find((r) => String(r.id) === String(roomId));
      if (room) bookingModal.open(room);
    });

    // 2. Update Status/Quick Info
    updateQuickInfo(cachedRooms);
  } catch (error) {
    console.error("Could not load rooms", error);
    showError(translateError(error.message) || "Kunde inte ladda rum.");
  }
}

// --- Booking Logic ---
async function loadBookings() {
  try {
    // Alla bokningar för statusfältet (Aktuell status)
    allBookings = await API.getBookings();

    // Användarens bokningar för "Mina bokningar"
    if (currentUser && currentUser.id) {
      userBookings = await API.getBookingsByUser(currentUser.id);
    }

    updateBookingList();
    updateQuickInfo(cachedRooms);
  } catch (err) {
    console.error("Failed to load bookings:", err);
    showError(translateError(err.message));
  }
}

function updateBookingList() {
  const container = document.querySelector(".booking-scroll");
  const now = new Date();

  // 1. Filter based on tab & cancellation toggle (endast användarens bokningar)
  const filteredBookings = userBookings.filter((booking) => {
    const endTime = new Date(booking.end_time);
    const isCancelled = booking.status === "cancelled";

    // Toggle logic: If unchecked, filter OUT cancelled bookings
    if (!showCancelled && isCancelled) return false;

    // Tab logic
    return currentTab === "upcoming" ? endTime >= now : endTime < now;
  });

  // 2. Sort
  filteredBookings.sort((a, b) => {
    const timeA = new Date(a.start_time).getTime();
    const timeB = new Date(b.start_time).getTime();
    return currentTab === "upcoming" ? timeA - timeB : timeB - timeA;
  });

  // 3. Render using shared component
  const onUnbookCallback = currentTab === "upcoming" ? handleUnbook : null;
  renderBookingList(filteredBookings, container, onUnbookCallback);
}

async function handleUnbook(bookingId) {
  const confirmed = await showDangerConfirm(
    "Vill du avboka bokningen?",
    "Avboka"
  );
  if (!confirmed) return;

  try {
    await API.updateBooking(bookingId, { status: "cancelled" });
    await loadBookings();
    showSuccess("Bokningen har avbokats.");
  } catch (err) {
    console.error("Failed to unbook:", err);
    showError("Avbokning misslyckades: " + translateError(err.message));
  }
}

// --- Helpers: platser, rum, aktiva bokningar ---

// Totalt antal sittplatser
function countTotalSeats(rooms) {
  return rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
}

// Lediga sittplatser JUST NU
function countAvailableSeatsNow(rooms, bookings) {
  const now = new Date();

  // Hitta rum som är upptagna just nu
  const occupiedRoomIds = new Set(
    bookings
      .filter((b) => {
        const start = new Date(b.start_time);
        const end = new Date(b.end_time);
        return b.status !== "cancelled" && start <= now && end >= now;
      })
      .map((b) => b.room_id)
  );

  // Summera kapaciteten i rum som INTE är upptagna
  return rooms
    .filter((r) => !occupiedRoomIds.has(r.id))
    .reduce((sum, r) => sum + (r.capacity || 0), 0);
}

// Lediga rum JUST NU
function countAvailableRoomsNow(rooms, bookings) {
  const now = new Date();

  const occupiedRoomIds = new Set(
    bookings
      .filter((b) => {
        const start = new Date(b.start_time);
        const end = new Date(b.end_time);
        return b.status !== "cancelled" && start <= now && end >= now;
      })
      .map((b) => b.room_id)
  );

  return rooms.filter((r) => !occupiedRoomIds.has(r.id)).length;
}

// Aktiva bokningar (alla i systemet JUST NU)
function countActiveBookings(bookings) {
  const now = new Date();

  return bookings.filter((b) => {
    const start = new Date(b.start_time);
    const end = new Date(b.end_time);
    return b.status !== "cancelled" && start <= now && end >= now;
  }).length;
}

// --- Quick Info / Status ---
function updateQuickInfo(rooms) {
  const totalRooms = rooms.length;

  // Live: lediga rum (alla rum som inte är upptagna just nu)
  const availableRooms = countAvailableRoomsNow(rooms, allBookings);

  // Live: sittplatser
  const totalSeats = countTotalSeats(rooms);
  const availableSeats = countAvailableSeatsNow(rooms, allBookings);

  // Live: aktiva bokningar (alla användare)
  const activeBookings = countActiveBookings(allBookings);

  // DOM-element
  const elAvailable = document.getElementById("available-rooms");
  const elTotal = document.getElementById("total-rooms");
  const elActive = document.getElementById("active-bookings");
  const elSeats = document.getElementById("total-seats");

  if (elAvailable) elAvailable.textContent = availableRooms;
  if (elTotal) elTotal.textContent = totalRooms;
  if (elActive) elActive.textContent = activeBookings;
  if (elSeats) elSeats.textContent = `${availableSeats}/${totalSeats}`;
}