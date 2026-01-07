import API from "../api/api.js";
import { showError, showSuccess } from "../utils/toast.js";
import { loadUser, setupLogout } from "../components/auth.manager.js";
import { renderRooms } from "../components/room.renderer.js";
import { renderBookings } from "../components/booking.renderer.js";
import { BookingModal } from "../components/booking.modal.js";
import { translateError } from "../utils/translator.utils.js";

// --- Global State ---
let allBookings = [];
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

  loadRooms();
  loadBookings();

  bookingModal.onBookingSuccess = () => loadBookings();
}

// --- Tab & Toggle Logic ---
const tabUpcoming = document.getElementById("tab-upcoming");
const tabHistory = document.getElementById("tab-history");
const checkboxCancelled = document.getElementById("show-cancelled");

if (tabUpcoming && tabHistory) {
  tabUpcoming.addEventListener("click", () => switchTab("upcoming"));
  tabHistory.addEventListener("click", () => switchTab("history"));
}

if (checkboxCancelled) {
  checkboxCancelled.addEventListener("change", (e) => {
    showCancelled = e.target.checked;
    updateBookingList();
  });
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
  updateBookingList();
}

// --- Room Logic ---
async function loadRooms() {
  try {
    cachedRooms = await API.getRooms(true);
    const container = document.getElementById("student-room-list");

    renderRooms(cachedRooms, container, (roomId) => {
      const room = cachedRooms.find((r) => String(r.id) === String(roomId));
      if (room) bookingModal.open(room);
    });
  } catch (error) {
    console.error("Could not load rooms", error);
  }
}

// --- Booking Logic ---
async function loadBookings() {
  try {
    if (currentUser && currentUser.id) {
      allBookings = await API.getBookingsByUser(currentUser.id);
    } else {
      allBookings = await API.getBookings();
    }
    updateBookingList();
  } catch (err) {
    console.error("Failed to load bookings:", err);
    showError(translateError(err.message));
  }
}

function updateBookingList() {
  const container = document.querySelector(".booking-scroll");
  const now = new Date();

  // 1. Filter
  const filteredBookings = allBookings.filter((booking) => {
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

  // 3. Render using the shared Component
  // Only pass the unbook callback if we are in the "upcoming" tab
  const onUnbookCallback = currentTab === "upcoming" ? handleUnbook : null;

  renderBookings(filteredBookings, container, onUnbookCallback);
}

async function handleUnbook(bookingId) {
  if (!confirm("Vill du avboka bokningen?")) return;

  try {
    await API.updateBooking(bookingId, { status: "cancelled" });
    await loadBookings();
    showSuccess("Bokningen har avbokats.");
  } catch (err) {
    console.error("Failed to unbook:", err);
    showError("Avbokning misslyckades.");
  }
}