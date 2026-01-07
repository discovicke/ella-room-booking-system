import API from "../api/api.js";
import { showInfo } from "../utils/toast.js";
import { capitalize } from "../utils/formatters.utils.js";

/**
 * Loads the user from local storage, updates the UI,
 * and handles redirection if not logged in.
 * @returns {Object|null} The user object or null if not logged in.
 */
export function loadUser() {
  const userStr = localStorage.getItem("user");

  if (!userStr) {
    // Not logged in -> redirect
    window.location.href = "/login/";
    return null;
  }

  const user = JSON.parse(userStr);
  const displayName = user.display_name || user.name;

  // Update Username in DOM
  const usernameEl = document.getElementById("username");
  if (usernameEl) {
    usernameEl.textContent = displayName;
  }

  // Update Role in DOM
  const roleEl = document.getElementById("user-role");
  if (roleEl) {
    roleEl.textContent = capitalize(user.role);
    if(user.role === 'teacher'){
      roleEl.textContent = capitalize('utbildare')
    }
    if(user.role === 'student'){
      roleEl.textContent = capitalize('elev')
    }
    if(user.role === 'admin'){
      roleEl.textContent = capitalize('admin')
    }
    if (user.role === 'admin' && window.matchMedia('(min-width: 900px)').matches) {
      roleEl.textContent = capitalize('administratör')
    }
    // Reset classes and add user-role + specific role class
    roleEl.className = `user-role ${user.role}`;
  }

  console.log(`Inloggad som: ${displayName}`);
  showInfo("Inloggad som " + displayName, { title: "Välkommen!" });

  return user;
}

/**
 * Attaches the logout logic to the button.
 * @param {string} buttonId - The ID of the logout button (default: "logout-btn")
 */
export function setupLogout(buttonId = "logout-btn") {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.addEventListener("click", async () => {
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
