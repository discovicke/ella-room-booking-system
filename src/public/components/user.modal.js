import API from "../api/api.js";
import { showError, showSuccess } from "../utils/toast.js";
import { translateError } from "../utils/translator.utils.js";

export class UserModal {
  constructor(modalId, formId, onSuccess) {
    this.modal = document.getElementById(modalId);
    this.form = document.getElementById(formId);
    this.onSuccess = onSuccess; // Callback to reload list after success
    this.editingUserId = null;

    this.init();
  }

  init() {
    if (!this.modal || !this.form) return;

    // Handle Cancel
    const cancelBtn = this.modal.querySelector(".btn-secondary"); // Assuming class
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.close());
    }

    // Handle Submit
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  openForCreate() {
    this.editingUserId = null;
    this.form.reset();

    // Update UI for Create Mode
    this.modal.querySelector("h3").textContent = "Skapa ny användare";
    const passField = document.getElementById("userPassword");
    if (passField) {
      passField.required = true;
      passField.placeholder = "Minst 6 tecken";
    }

    this.modal.showModal();
  }

  async openForEdit(userId) {
    try {
      const user = await API.getUserById(userId);
      this.editingUserId = userId;

      // Populate Form
      document.getElementById("userName").value =
        user.display_name || user.name;
      document.getElementById("userEmail").value = user.email;
      document.getElementById("userRole").value = user.role;

      // Update UI for Edit Mode
      this.modal.querySelector("h3").textContent = "Redigera användare";
      const passField = document.getElementById("userPassword");
      if (passField) {
        passField.required = false;
        passField.value = "";
        passField.placeholder = "Lämna tomt för att behålla";
      }

      this.modal.showModal();
    } catch (error) {
      console.error(error);
      showError("Kunde inte hämta användardata");
    }
  }

  close() {
    this.modal.close();
    this.form.reset();
    this.editingUserId = null;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.form);

    const userData = {
      display_name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
    };

    const password = formData.get("password");

    try {
      if (this.editingUserId) {
        // Update
        if (password && password.trim().length > 0) {
          userData.password = password;
        }
        await API.updateUser(this.editingUserId, userData);
        showSuccess("Användare uppdaterad");
      } else {
        // Create
        if (!password || password.length < 6) {
          showError("Lösenordet måste vara minst 6 tecken");
          return;
        }
        userData.password = password;
        await API.createUser(userData);
        showSuccess(`Användare skapad: ${userData.display_name}`);
      }

      this.close();
      if (this.onSuccess) this.onSuccess(); // Reload list
    } catch (error) {
      console.error(error);
      showError(`Operation misslyckades: ${translateError(error.message)}`);
    }
  }
}
