import API from "../../api/api.js";
import { ROLES } from "../../../constants/roles.js";
import {
  showToast,
  showSuccess,
  showError,
  showInfo,
} from "../../utils/toast.js";
import { translateError } from "../../utils/translator.utils.js";

const loginForm = document.getElementById("loginForm");

if (!loginForm) {
  console.error("loginForm not found in DOM");
} else {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const emailInput = document.getElementById("username");
    const passwordInputLocal = document.getElementById("password");
    const submitButton = this.querySelector('button[type="submit"]');
    const inputs = [emailInput, passwordInputLocal];

    const triggerErrorOnGroup = (group) => {
      if (!group) return;
      group.classList.remove("error");
      void group.offsetWidth;
      group.classList.add("error");
    };

    let hasError = false;
    inputs.forEach((input) => {
      const group = input && input.parentElement;
      if (!input || !input.value.trim()) {
        hasError = true;
        triggerErrorOnGroup(group);
      } else {
        group && group.classList.remove("error");
      }
    });

    if (hasError) {
      showError("Ange både email och lösenord", {
        title: "Felaktiga inloggningsuppgifter",
      });
      return;
    }

    submitButton.disabled = true;
    const originalText = submitButton.innerText;
    submitButton.textContent = "Loggar in...";
    submitButton.style.opacity = "0.8";

    try {
      const data = await API.login(
        emailInput.value.trim(),
        passwordInputLocal.value
      );
      // Successful login
      localStorage.removeItem("token");
      localStorage.setItem("user", JSON.stringify(data.user));
      setTimeout(() => {
        redirectToDashboard(data.user.role);
      }, 400);
    } catch (error) {
      // Mark both inputs as error and animate
      inputs.forEach((input) => {
        const group = input && input.parentElement;
        triggerErrorOnGroup(group);
      });

      showError(translateError(error.message), {
        title: "Inloggning misslyckades",
      });
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      submitButton.style.opacity = "";
    }
  });
}

function redirectToDashboard(role) {
  const routes = {
    [ROLES.ADMIN]: "/admin/",
    [ROLES.TEACHER]: "/teacher/",
    [ROLES.STUDENT]: "/student/",
  };
  window.location.href = routes[role] || "/";
}
