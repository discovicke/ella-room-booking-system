import API from "../api/api.js";

console.log('🚀 admin.js körs.. .');
console.log('📦 localStorage vid start:', localStorage.getItem('user'));



function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
console.log(localStorage.getItem('user'));

// --- Hämta inloggad användare ---


function loadUserFromLocalStorage() {
  const user = localStorage.getItem("user");

  if (! user) {
    window.location.href = "/login/";
    return;
  }

  const userobject = JSON.parse(user);
  const displayname = userobject.display_name;

  const usernameEl = document.getElementById("username");
  if (usernameEl) {
    usernameEl.textContent = displayname;
  }

  console.log('✅ Inloggad som:', displayname);

  const roleEl = document.getElementById("user-role");
  if (roleEl) {
    roleEl.textContent = capitalize(userobject.role);
    roleEl.className = `user-role ${userobject. role}`;
  }
}

async function loadUsers() {
  console.log('📡 Hämtar användare...');
  
  try {
    const users = await API.getUsers();
    console.log('✅ Användare hämtade:', users);
    displayUsers(users);
  } catch (error) {
    console.error('❌ Fel vid hämtning:', error);
    const userList = document.getElementById('userList');
    if (userList) {
      userList.innerHTML = '<p class="error">Kunde inte ladda användare</p>';
    }
  }
}
function displayUsers(users) {
  const userList = document.getElementById('userList');
  
  if (!userList) {
    console.error('❌ #userList finns inte');
    return;
  }

  if (! users || users.length === 0) {
    userList.innerHTML = '<p class="no-data">Inga användare hittades. </p>';
    return;
  }

  userList.innerHTML = users.map(user => `
    <div class="user-card" data-user-id="${user. id}">
      <div class="user-info">
        <h4>Namn: ${user.display_name || user.name}</h4>
        <p>📧  ${user.email}</p>
        <span class="role-badge role-${user.role}">${capitalize(user.role)}</span>
      </div>
      <div class="user-actions">
        <button class="btn-edit" data-user-id="${user.id}">✏️ Redigera</button>
        <button class="btn-delete" data-user-id="${user.id}">🗑️ Ta bort</button>
      </div>
    </div>
  `).join('');

  console.log('✅ Användare visade');
}

// delete user //
async function deleteUser(userId) {
  if (! confirm('⚠️ Är du säker? ')) {
    return;
  }

  try {
    await API. deleteUser(userId);
    alert('✅ Användare borttagen! ');
    loadUsers();
  } catch (error) {
    console.error('❌ Fel:', error);
    alert(`Kunde inte ta bort:  ${error.message}`);
  }
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
        <button class ="danger" id="mark-as-occupied">Markera som upptaget</button>
        <button id="edit-room">Redigera</button>
        <button class="danger" id="delete-room">Ta bort</button>
      </div>
    </div>
    `;
    })
    .join("");
}




// edit user //

async function editUser(userId) {
  try {
    const user = await API.getUserById(userId);
    //fill form fields
    
    document.getElementById('userName').value = user.display_name || user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;

    // password field handling
    const passwordField = document.getElementById('userPassword');
    passwordField.required = false;
    passwordField. value = '';
    passwordField.placeholder = 'Lämna tomt för att behålla';

    // show modal
    const modal = document.getElementById('createUserModal');
    modal.querySelector('h3').textContent = 'Redigera användare';
    modal.showModal();

    // change form submit handler
    const form = document.getElementById('createUserForm');
    const newForm = form.cloneNode(true);
    form.parentNode. replaceChild(newForm, form);
    
    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(newForm);
      const updatedData = {
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role')
      };

      // add paassword if changed 
       const password = formData.get('password');
      if (password && password.length > 0) {
        updatedData.password = password;
      }
      
      try {
        await API.updateUser(userId, updatedData);
        alert('✅ Uppdaterad!');
        newForm.reset();
        modal.close();
        modal.querySelector('h3').textContent = 'Skapa ny användare';
        passwordField.required = true;
        passwordField. placeholder = 'Minst 6 tecken';
        loadUsers();
        setupCreateUserForm();
      } catch (error) {
        console.error('❌ Fel:', error);
        alert(`Kunde inte uppdatera: ${error.message}`);
      }
    });

      }  catch (error) {
    console.error('❌ Fel:', error);
    alert('Kunde inte hämta användardata');
  }
}


function setupCreateUserForm() {
  const createUserBtn = document.getElementById('createUserBtn');
  const createUserModal = document.getElementById('createUserModal');
  const createUserForm = document.getElementById('createUserForm');
  const cancelBtn = document.getElementById('cancelCreateUser'); 
  
  if (! createUserBtn || !createUserModal || !createUserForm || !cancelBtn) {
    console.warn('⚠️ Saknade element');
    return;
  }
// open modal
createUserBtn.addEventListener('click', () => {
    createUserForm.reset();
    createUserModal.querySelector('h3').textContent = 'Skapa ny användare';
    document.getElementById('userPassword').required = true;
    createUserModal.showModal();
  });

// close modal
 cancelBtn.addEventListener('click', () => {
    createUserForm.reset();
    createUserModal.close();
  });

//send form
createUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(createUserForm);
  const userData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role')
  };

  // validate data
  if (! userData.name || !userData.email || !userData.password || !userData.role) {
      alert('⚠️ Fyll i alla fält! ');
      return;
    }
  if (userData.password.length < 6) {
    alert('⚠️ Lösenordet måste vara minst 6 tecken långt! ');
    return;
  }
  try {
    const newUser = await API.createUser(userData);

const userName = newUser?. display_name || newUser?.Display_name || newUser?.name || userData.name;

alert(`✅ Användare skapad: ${userName}`);
      createUserForm.reset();
      createUserModal.close();
      loadUsers();
    } catch (error) {
      console.error('❌ Fel:', error);
      alert(`Kunde inte skapa: ${error.message}`);
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById('logout-btn');
  
  if (!logoutBtn) {
    console.warn('⚠️ Logout-knapp saknas');
    return;
  }

  logoutBtn.addEventListener('click', async () => {
    try {
      await API.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      window.location.href = '/login/';
    }
  });
}

function setupEventListeners() {
  const userList = document.getElementById('userList');

  if (!userList) {
    console.error('❌ #userList finns inte');
    return;
  }

  userList. addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('btn-delete')) {
      const userId = target.getAttribute('data-user-id');
      deleteUser(userId);
    }

    if (target.classList. contains('btn-edit')) {
      const userId = target.getAttribute('data-user-id');
      editUser(userId);
    }
  });

  console.log('✅ Event listeners tillagda');
}


document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Admin. js initierad');
  loadRooms();
  loadUserFromLocalStorage();
  loadUsers();
  setupLogout();
  setupEventListeners();
  setupCreateUserForm();
});





