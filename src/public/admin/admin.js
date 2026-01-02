import API from "../api/api.js";
const creatUserBtn = document.getElementById("createUserBtn");
const createUserModal = document.getElementById("createUserModal");
const createUserForm = document.getElementById("createUserForm");
const cancelCreateUser = document.getElementById("cancelCreateUser");

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


// --- Get rooms ---
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

      <div class="room-actions">
        <button>Markera som upptaget</button>
        <button>Redigera</button>
        <button class="danger">Ta bort</button>
      </div>
    </div>
    `;
      })
      .join("");
}

// --- Event listeners create user modal  ---
creatUserBtn.addEventListener("click", () => {
  createUserModal.showModal(); // show the modal
});
cancelCreateUser.addEventListener("click", () => {
  createUserForm.reset(); // reset the form
  createUserModal.close(); // close the modal
});
createUserForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // prevent default form submission

  const formData = new FormData(createUserForm);
  const userData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };
   if (!userData.name || !userData.email || !userData.password || !userData.role) {
    alert('⚠️ Alla fält måste fyllas i! ');
    return;
  }
    if (userData.password.length < 6) {
    alert('⚠️ Lösenordet måste vara minst 6 tecken långt!');
    return;
  }
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    // checks response status
     if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Något gick fel');
    }
    const newUser = await response.json();
    alert(`✅ Användare skapad: ${newUser.name} (${newUser.role})`);
    createUserForm.reset(); // reset the form
    createUserModal.close(); // close the modal
    // Optionally, refresh the user list here
    
  } catch (error) {
     console.error('Error creating user:', error);
    alert(`❌ Kunde inte skapa användare: ${error.message}`);
  }
});





window.addEventListener("DOMContentLoaded", () => {
  loadUserFromLocalStorage();
  loadRooms(); 
});