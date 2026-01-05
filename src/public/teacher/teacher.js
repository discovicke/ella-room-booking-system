import API from "../api/api.js";
import { showError, showSuccess } from "../utils/toast.js";
import { loadUser, setupLogout } from "../components/auth.manager.js";
import { renderRooms } from "../components/room.renderer.js";
import { renderBookings as renderBookingList } from "../components/booking.renderer.js";
import { BookingModal } from "../components/booking.modal.js";

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
    tabUpcoming.addEventListener("click", () => switchTab("upcoming", tabUpcoming, tabHistory));
    tabHistory.addEventListener("click", () => switchTab("history", tabHistory, tabUpcoming));
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

    // 2. Update Quick Info (YOUR PRESERVED LOGIC)
    updateQuickInfo(cachedRooms);

  } catch (error) {
    console.error("Could not load rooms", error);
    showError("Kunde inte ladda rum.");
  }
}

// --- Booking Logic ---
async function loadBookings() {
  try {
    if (currentUser && currentUser.id) {
      allBookings = await API.getBookingsByUser(currentUser.id);
    }
    updateBookingList();
  } catch (err) {
    console.error("Failed to load bookings:", err);
    showError("Kunde inte ladda bokningar.");
  }
}

function updateBookingList() {
  const container = document.querySelector(".booking-scroll");
  const now = new Date();

  // 1. Filter based on tab & cancellation toggle
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

  // 3. Render using shared component
  // As usual, we only allow unbooking if in the "Upcoming" tab
  const onUnbookCallback = (currentTab === "upcoming") ? handleUnbook : null;
  
  renderBookingList(filteredBookings, container, onUnbookCallback);
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

// --- Quick Info ---
function updateQuickInfo(rooms) {
  const totalRooms = rooms.length;

  // Just nu: alla rum är lediga (ingen bokningslogik än)
  const availableRooms = totalRooms;

  // Skriv ut värdena i snabbinfo
  const elAvailable = document.getElementById("available-rooms");
  const elTotal = document.getElementById("total-rooms");
  const elActive = document.getElementById("active-bookings");

  if (elAvailable) elAvailable.textContent = availableRooms;
  if (elTotal) elTotal.textContent = totalRooms;

  // Aktiva bokningar är 0 tills backend är klar
  if (elActive) elActive.textContent = 0;
}