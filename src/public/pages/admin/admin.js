import API from "../api/api.js";
import { createRoomCard } from "../components/room.renderer.js";
import { renderBookings } from "../components/booking.renderer.js";
import { renderUsers } from "../components/user.renderer.js";
import { UserModal } from "../components/user.modal.js";
import { loadUser, setupLogout } from "../components/auth.manager.js";
import { showError, showSuccess } from "../utils/toast.js";

// --- State ---
let allRooms = [];
let allBookings = [];
let currentTab = "upcoming";
let showCancelled = false;

// --- User state ---
let allUsers = [];
let userSearchQuery = "";
let userRoleFilter = "all";

// --- Components ---
const userModal = new UserModal("createUserModal", "createUserForm", loadUsers);

// --- Initialization ---
const currentUser = loadUser();

if (currentUser) {
  const roleEl = document.getElementById("user-role");
  if (roleEl) roleEl.className = `user-role ${currentUser.role}`;

  setupLogout("logout-btn");
  setupTabs();
  setupSidebar();
  setupUserFilters();

  const createUserBtn = document.getElementById("createUserBtn");
  if (createUserBtn) {
    createUserBtn.addEventListener("click", () => userModal.openForCreate());
  }

  loadRooms();
  loadBookings();
  loadUsers();
}

// --- Sidebar Navigation ---
function setupSidebar() {
  const items = document.querySelectorAll(".sidebar-item");
  const panels = document.querySelectorAll("[data-panel]");

  function showPanel(target) {
    panels.forEach(panel => {
      const id = panel.getAttribute("data-panel");
      panel.style.display = id === target ? "" : "none";
    });
  }

  items.forEach(item => {
    item.addEventListener("click", () => {
      const target = item.getAttribute("data-target");

      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      showPanel(target);
    });
  });

  showPanel("overview-panel");
}

// --- Load Users ---
async function loadUsers() {
  try {
    const users = await API.getUsers();
    allUsers = users;

    updateUserDropdown();

    const container = document.getElementById("userList");
    if (container) container.innerHTML = "";

  } catch (error) {
    console.error("Failed to load users:", error);
    const container = document.getElementById("userList");
    if (container) container.innerHTML = "<p class='error'>Kunde inte ladda användare</p>";
  }
}

// --- Update dropdown based on filters ---
function updateUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  if (!dropdown) return;

  let filtered = [...allUsers];

  if (userRoleFilter !== "all") {
    filtered = filtered.filter(u => u.role === userRoleFilter);
  }

  if (userSearchQuery.trim() !== "") {
    const q = userSearchQuery.toLowerCase();
    filtered = filtered.filter(u =>
      (u.display_name || "").toLowerCase().includes(q)
    );
  }

  dropdown.innerHTML =
    `<option value="">Välj användare...</option>` +
    filtered.map(u => `<option value="${u.id}">${u.display_name}</option>`).join("");
}

// --- User Filters ---
function setupUserFilters() {
  const searchInput = document.getElementById("userSearch");
  const roleSelect = document.getElementById("userRoleFilter");
  const dropdown = document.getElementById("userDropdown");
  const showAll = document.getElementById("showAllUsers");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      userSearchQuery = e.target.value;
      updateUserDropdown();
    });
  }

  if (roleSelect) {
    roleSelect.addEventListener("change", (e) => {
      userRoleFilter = e.target.value;
      updateUserDropdown();
    });
  }

  if (showAll) {
    showAll.addEventListener("change", (e) => {
      const container = document.getElementById("userList");
      if (!container) return;

      if (e.target.checked) {
        renderUsers(
          allUsers,
          container,
          (id) => userModal.openForEdit(id),
          (id) => deleteUser(id)
        );
      } else {
        container.innerHTML = "";
      }
    });
  }

  if (dropdown) {
    dropdown.addEventListener("change", (e) => {
      const showAll = document.getElementById("showAllUsers");
      if (showAll && showAll.checked) return;

      const id = e.target.value;
      const container = document.getElementById("userList");
      if (!container) return;

      if (!id) {
        container.innerHTML = "";
        return;
      }

      const user = allUsers.find(u => u.id == id);

      if (user) {
        renderUsers(
          [user],
          container,
          (id) => userModal.openForEdit(id),
          (id) => deleteUser(id)
        );
      }
    });
  }
}

// --- Delete User ---
async function deleteUser(userId) {
  if (!confirm("⚠️ Är du säker på att du vill ta bort denna användare?")) return;

  try {
    await API.deleteUser(userId);
    showSuccess("Användare borttagen");
    loadUsers();
  } catch (error) {
    showError(`Kunde inte ta bort: ${error.message}`);
  }
}

// --- Rooms ---
async function loadRooms() {
  try {
    allRooms = await API.getRooms(true);
    renderAdminRooms(allRooms);
    updateDashboardStats();
  } catch (error) {
    console.error("Failed to load rooms", error);
    showError("Kunde inte ladda rum");
  }
}

function renderAdminRooms(rooms) {
  const container = document.getElementById("student-room-list");
  if (!container) return;

  container.innerHTML = rooms.map(room => {
    const actionButtons = `
      <button class="btn-action btn-edit-room" data-id="${room.id}" style="background:var(--color-warning);">Redigera</button>
      <button class="btn-action btn-delete-room" data-id="${room.id}" style="background:var(--color-danger); color:white;">Ta bort</button>
    `;
    return createRoomCard(room, actionButtons);
  }).join("");

  container.onclick = (e) => {
    if (e.target.classList.contains("btn-delete-room")) showError("Ta bort rum: Ej implementerat");
    if (e.target.classList.contains("btn-edit-room")) showError("Redigera rum: Ej implementerat");
  };
}

// --- Bookings ---
async function loadBookings() {
  try {
    allBookings = await API.getBookings();
    updateBookingList();
    updateDashboardStats();
  } catch (error) {
    console.error("Failed to load bookings", error);
  }
}

function updateBookingList() {
  const container = document.getElementById("admin-booking-list");
  const now = new Date();

  const filtered = allBookings
    .filter(b => {
      const end = new Date(b.end_time);
      const cancelled = b.status === "cancelled";
      if (!showCancelled && cancelled) return false;
      return currentTab === "upcoming" ? end >= now : end < now;
    })
    .sort((a, b) => {
      const tA = new Date(a.start_time).getTime();
      const tB = new Date(b.start_time).getTime();
      return currentTab === "upcoming" ? tA - tB : tB - tA;
    });

  renderBookings(filtered, container, handleAdminUnbook);
}

async function handleAdminUnbook(bookingId) {
  if (!confirm("Vill du verkligen avboka denna tid?")) return;

  try {
    await API.updateBooking(bookingId, { status: "cancelled" });
    showSuccess("Bokningen avbokad");
    loadBookings();
  } catch (err) {
    showError("Kunde inte avboka: " + err.message);
  }
}

// --- Tabs ---
function setupTabs() {
  const tUp = document.getElementById("tab-upcoming");
  const tHist = document.getElementById("tab-history");
  const chk = document.getElementById("show-cancelled");

  if (tUp && tHist) {
    tUp.onclick = () => {
      currentTab = "upcoming";
      tUp.classList.add("active");
      tHist.classList.remove("active");
      updateBookingList();
    };

    tHist.onclick = () => {
      currentTab = "history";
      tHist.classList.add("active");
      tUp.classList.remove("active");
      updateBookingList();
    };
  }

  if (chk) {
    chk.onchange = (e) => {
      showCancelled = e.target.checked;
      updateBookingList();
    };
  }
}

// --- Dashboard Stats ---
function updateDashboardStats() {
  const now = new Date();

  const activeCount = allBookings.filter(b =>
    b.status !== "cancelled" && new Date(b.end_time) >= now
  ).length;

  const busyRooms = new Set(
    allBookings
      .filter(b => {
        const s = new Date(b.start_time);
        const e = new Date(b.end_time);
        return b.status !== "cancelled" && s <= now && e >= now;
      })
      .map(b => b.room_id)
  );

  setText("summary-total-rooms", allRooms.length);
  setText("summary-available-rooms", allRooms.length - busyRooms.size);
  setText("summary-active-bookings", activeCount);
  setText("summary-total-bookings", allBookings.length);
}

function setText(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

// --- Room Modal Controls ---
const addRoomBtn = document.getElementById("add-room-btn");
const roomModal = document.getElementById("createRoomModal");

if (addRoomBtn && roomModal) {
  addRoomBtn.addEventListener("click", () => {
    roomModal.showModal();
  });
}

document.querySelectorAll("[data-close-modal='createRoomModal']").forEach(btn => {
  btn.addEventListener("click", () => {
    roomModal.close();
  });
});