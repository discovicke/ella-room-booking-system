import API from "../api/api.js";
import { createRoomCard } from "../components/room.renderer.js";
import { renderBookings } from "../components/booking.renderer.js";
import { renderUsers } from "../components/user.renderer.js";
import { UserModal } from "../components/user.modal.js";
import { RoomModal } from "../../components/room.modal.js";
import { loadUser, setupLogout } from "../components/auth.manager.js";
import { showError, showSuccess } from "../utils/toast.js";
import { BookingModal } from "../components/booking.modal.js";


import { showDangerConfirm } from "../utils/confirm.js";

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
const roomModal = new RoomModal("createRoomModal", "createRoomForm", loadRooms);
const bookingModal = new BookingModal("booking-modal", "booking-form");

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
// Ta bort den gamla setupSidebar() funktionen och ersätt med:
function setupSidebar() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');

  // Mappa sidebar data-panel till faktiska section element
  const panelMap = {
    'dashboard': document.querySelector('[data-panel="overview-panel"]'),
    'rooms': document.querySelector('[data-panel="rooms-panel"]'),
    'bookings': document.querySelector('[data-panel="bookings-panel"]'),
    'users': document.querySelector('[data-panel="users-panel"]')
  };

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const panelId = item.dataset.panel;

      // Ta bort active från alla sidebar-items
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Göm alla paneler
      Object.values(panelMap).forEach(panel => {
        if (panel) panel.style.display = 'none';
      });

      // Visa vald panel
      const targetPanel = panelMap[panelId];
      if (targetPanel) {
        targetPanel.style.display = 'block';
      }
    });
  });
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

  const container = document.getElementById("userList");
  const selectedId = dropdown.value;

  // Om sökfältet är tomt och ingen användare är vald → töm listan och avbryt
  if (userSearchQuery.trim() === "" && !selectedId && userRoleFilter === "all") {
    if (container) container.innerHTML = "";
    return;
  }

  // Uppdatera dropdown
  dropdown.innerHTML =
    `<option value="">Välj användare...</option>` +
    filtered.map(u => `<option value="${u.id}">${u.display_name}</option>`).join("");

  // ⭐ Om dropdown har ett valt ID → visa bara den användaren
  if (selectedId) {
    const user = allUsers.find(u => u.id == selectedId);
    if (user) {
      renderUsers(
        [user],
        container,
        (id) => userModal.openForEdit(id),
        (id) => deleteUser(id)
      );
      return;
    }
  }

  // Om rollfilter är aktivt → visa alla filtrerade användare
  if (userRoleFilter !== "all") {
    renderUsers(
      filtered,
      container,
      (id) => userModal.openForEdit(id),
      (id) => deleteUser(id)
    );
    return;
  }

  // Annars → visa alla filtrerade användare (t.ex. vid sökning)
  renderUsers(
    filtered,
    container,
    (id) => userModal.openForEdit(id),
    (id) => deleteUser(id)
  );
}


// Sökfunktion
function getFilteredUsers() {
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

  return filtered;
}

function updateUserUI() {
  const filtered = getFilteredUsers();

  // Uppdatera dropdown
  const dropdown = document.getElementById("userDropdown");
  if (dropdown) {
    dropdown.innerHTML =
      `<option value="">Välj användare...</option>` +
      filtered.map(u => `<option value="${u.id}">${u.display_name}</option>`).join("");
  }

  // Uppdatera listan om "Visa alla" är aktivt
  const showAll = document.getElementById("showAllUsers");
  const container = document.getElementById("userList");

  if (container) {

    // Om dropdown har ett valt ID, visa bara den användaren
    const dropdown = document.getElementById("userDropdown");
    const selectedId = dropdown ? dropdown.value : "";

    if (selectedId) {
      const user = allUsers.find(u => u.id == selectedId);
      if (user) {
        renderUsers(
          [user],
          container,
          (id) => userModal.openForEdit(id),
          (id) => deleteUser(id)
        );
        return;
      }
    }

    // Om "Visa alla" är ikryssat → visa filtrerade användare
    if (showAll && showAll.checked) {
      renderUsers(
        filtered,
        container,
        (id) => userModal.openForEdit(id),
        (id) => deleteUser(id)
      );
    } else {
      // Om inget valt och showAll inte är aktivt → töm listan
      container.innerHTML = "";
    }
  }

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
        // Visa ALLA användare (ofilterat)
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
  const confirmed = await showDangerConfirm(
    "Är du säker på att du vill ta bort denna användare?",
    "Ta bort användare"
  );
  if (!confirmed) return;

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
      <button class="btn-action btn-book-room" data-id="${room.id}" style="background:var(--color-success); color:white;">Boka</button>
      <button class="btn-action btn-edit-room" data-id="${room.id}" style="background:var(--color-warning);">Redigera</button>
      <button class="btn-action btn-delete-room" data-id="${room.id}" style="background:var(--color-danger); color:white;">Ta bort</button>
    `;
    return createRoomCard(room, actionButtons);
  }).join("");

  container.onclick = async (e) => {
    const roomId = e.target.dataset.id;

    if (e.target.classList.contains("btn-delete-room")) {
      await handleDeleteRoom(roomId);
    }
    if (e.target.classList.contains("btn-edit-room")) {
      roomModal.openForEdit(roomId);
    }

    if (e.target.classList.contains("btn-book-room")) {
  const room = allRooms.find(r => r.id == roomId);

  // Admin bokar åt sig själv (du kan ändra detta senare)
  bookingModal.setUser(currentUser);

  bookingModal.open(room);
}


  };
}

async function handleDeleteRoom(roomId) {
  const confirmed = await showDangerConfirm(
    "Är du säker på att du vill ta bort detta rum?",
    "Ta bort rum"
  );
  if (!confirmed) return;

  try {
    await API.deleteRoom(roomId);
    showSuccess("Rum borttaget");
    loadRooms();
  } catch (error) {
    showError(`Kunde inte ta bort:  ${error.message}`);
  }
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

//  --- Room Modal Controls ---
const addRoomBtn = document.getElementById("add-room-btn");
if (addRoomBtn) {
  addRoomBtn.addEventListener("click", () => roomModal.openForCreate());
}
