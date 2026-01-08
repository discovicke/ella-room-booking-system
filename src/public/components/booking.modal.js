import API from "../api/api.js";
import { showSuccess, showError } from "../utils/toast.js";
import { translateError } from "../utils/translator.utils.js";

export class BookingModal {
  constructor(modalId = "booking-modal", formId = "booking-form") {
    this.modal = document.getElementById(modalId);
    this.form = document.getElementById(formId);
    this.modalContent = this.modal?.querySelector(".modal-content");
    this.closeBtn = this.modal?.querySelector("#modal-close");
    this.roomLabel = document.getElementById("modal-room-label");

    this.dateInput = document.getElementById("booking-date");
    this.startHourSelect = document.getElementById("start-hour");
    this.notesTextarea = document.getElementById("notes");

    this.currentRoom = null;
    this.currentUser = null;
    this.selectedDuration = null;
    this.onBookingSuccess = null; // Callback

    this.init();
  }

  init() {
    if (!this.modal || !this.form) return;

    // Close on X
    this.closeBtn?.addEventListener("click", () => this.close());

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.modal.hidden) this.close();
    });

    // Nudge on background click (prevent accidental close)
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal && this.modalContent) {
        // Nudge animation if clicking outside
        this.nudge();
      }
    });

    // Prevent clicks inside content from closing
    this.modalContent?.addEventListener("click", (e) => e.stopPropagation());

    // Set min-date to today
    const today = new Date().toISOString().split("T")[0];
    this.dateInput?.setAttribute("min", today);

    // Validate date (can't book weekends)
    this.dateInput?.addEventListener("input", (e) => this.validateDate(e));

    // Handle time-slot buttons
    document.querySelectorAll(".time-slot").forEach((slot) => {
      slot.addEventListener("click", () => this.selectDuration(slot));
    });

    // Handle Submit
    this.form.addEventListener("submit", (e) => this.handleBooking(e));
  }

  validateDate(e) {
    const selected = new Date(e.target.value);
    const day = selected.getDay();

    if (day === 0 || day === 6) {
      showError("Du kan endast boka måndag–fredag");
      this.nudge();
      e.target.value = "";
    }
  }

  selectDuration(slot) {
    document
      .querySelectorAll(".time-slot")
      .forEach((el) => el.classList.remove("selected"));
    slot.classList.add("selected");
    this.selectedDuration = parseInt(slot.dataset.hours);
  }

  nudge() {
    if (!this.modalContent) return;
    this.modalContent.classList.remove("nudge");
    void this.modalContent.offsetWidth;
    this.modalContent.classList.add("nudge");
    setTimeout(() => this.modalContent.classList.remove("nudge"), 300);
  }

  setUser(user) {
    this.currentUser = user;
  }

  open(room) {
    this.currentRoom = room;
    if (this.roomLabel) {
      this.roomLabel.textContent = `Rum ${room.room_number || room.number} - ${
        room.location
      }`;
    }

    // Show modal backdrop
    this.modal.removeAttribute("hidden");
    this.modal.classList.add("open");

    // Pop-in animation for modal content
    if (this.modalContent) {
      this.modalContent.classList.remove("pop-in");
      void this.modalContent.offsetWidth;
      this.modalContent.classList.add("pop-in");
      setTimeout(() => this.modalContent.classList.remove("pop-in"), 350);
    }
  }

  close() {
    this.modal.setAttribute("hidden", "");
    this.modal.classList.remove("open");
    this.form.reset();

    // Remove selected state from date and time inputs
    this.dateInput?.classList.remove("selected");
    this.startHourSelect?.classList.remove("selected");

    // Remove selected state from time slots
    document
        .querySelectorAll(".time-slot")
        .forEach((el) => el.classList.remove("selected"));

    // Reset duration selection
    this.selectedDuration = null;

    this.currentRoom = null;
  }

  async handleBooking(event) {
    event.preventDefault();

    if (!this.currentRoom || !this.currentUser) {
      showError("Du måste vara inloggad för att boka.");
      return;
    }

    if (!this.selectedDuration) {
      showError("Välj en längd för bokningen");
      this.nudge();
      return;
    }

    const date = this.dateInput.value;
    const startHour = this.startHourSelect.value;
    const notes = this.notesTextarea.value;

    if (!date || !startHour) {
      showError("Vänligen fyll i datum och starttid");
      this.nudge();
      return;
    }

    // Convert to datetime format
    const startTime = `${date}T${startHour.padStart(2, "0")}:00:00`;
    const endHour = parseInt(startHour) + this.selectedDuration;
    const endTime = `${date}T${endHour.toString().padStart(2, "0")}:00:00`;

    // Validate that end time does not exceed 19:00
    if (endHour > 19) {
      showError("Bokningen kan inte sträcka sig efter 19:00");
      this.nudge();
      return;
    }

    const bookingData = {
      room_id: this.currentRoom.id,
      user_id: this.currentUser.id,
      start_time: startTime,
      end_time: endTime,
      notes: notes || null,
    };

    try {
      await API.createBooking(bookingData);
      showSuccess(
        `Du har bokat ${this.currentRoom.location}!`
      );
      this.close();

      if (this.onBookingSuccess) {
        this.onBookingSuccess();
      }
    } catch (err) {
      console.error("Booking failed:", err);
      showError(translateError(err.message));
    }
  }
}

const dateInput = document.getElementById("booking-date");
const startHourSelect = document.getElementById("start-hour");

if (dateInput) {
  dateInput.addEventListener("change", (e) => {
    if (e.target.value) {
      e.target.classList.add("selected");
    } else {
      e.target.classList.remove("selected");
    }
  });
}

if (startHourSelect) {
  startHourSelect.addEventListener("change", (e) => {
    if (e.target.value) {
      e.target.classList.add("selected");
    } else {
      e.target.classList.remove("selected");
    }
  });
}
