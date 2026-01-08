import API from "../api/api.js";
import { showError, showSuccess } from "../utils/toast.js";
import { translateError } from "../utils/translator.utils.js";

export class UserModal {
  constructor(modalId, formId, onSuccess) {
    this.modal = document.getElementById(modalId);
    this.form = document.getElementById(formId);
    this.modalContent = this.modal?.querySelector(".modal-content");
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

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.modal.open) this.close();
    });

    // Nudge on background click (prevent accidental close)
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal && this.modalContent) {
        this.nudge();
      }
    });

    // Prevent clicks inside content from closing
    this.modalContent?.addEventListener("click", (e) => e.stopPropagation());

    // Handle Submit
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  nudge() {
    if (!this.modalContent) return;
    this.modalContent.classList.remove("nudge");
    void this.modalContent.offsetWidth;
    this.modalContent.classList.add("nudge");
    setTimeout(() => this.modalContent.classList.remove("nudge"), 300);
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

      const setField = (name, value = "") => {
        const field = this.form?.elements?.namedItem(name);
        if (field) field.value = value ?? "";
      };

      setField("name", user.display_name || user.name || "");
      setField("email", user.email || "");
      setField("role", user.role || "");

      const title = this.modal.querySelector("h3");
      if (title) title.textContent = "Redigera användare";

      const passField = this.form?.elements?.namedItem("password");
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
