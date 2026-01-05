import { formatDateTime } from "../utils/formatters.utils.js";

/**
 * Generates the HTML for a single booking card.
 * @param {Object} booking - The booking object.
 * @param {boolean} showAction - Whether to show the action button (e.g. Unbook).
 * @returns {string} HTML string.
 */
export function createBookingCard(booking, showAction = false) {
  const startTime = formatDateTime(booking.start_time);
  const endTime = formatDateTime(booking.end_time);
  const rawStatus = (booking.status || "väntar").toLowerCase();
  const now = new Date();
  const isPast = new Date(booking.end_time) < now;

  let statusText = "AKTIV";
  let statusClass = "active";
  let style = "";

  // Determine Status & Style
  if (rawStatus === "cancelled") {
    statusText = "AVBOKAD";
    statusClass = "cancelled";
    style = "opacity: 0.7;";
  } else if (isPast) {
    statusText = "AVSLUTAD";
    statusClass = "done";
    style = "opacity: 0.8; filter: grayscale(100%);";
  }

  // Determine Button HTML
  // Only showing the Unbook button if requested AND the booking is active
  const actionButtonHtml =
    showAction && rawStatus !== "cancelled" && !isPast
      ? `<button class="unbook-btn" data-id="${booking.id}">Avboka</button>`
      : "";

  return `
    <article class="booking-card" style="${style}">
      <div class="card-header">
        <h3># ${booking.room_number || "Okänt"} - ${
    booking.room_location || ""
  }</h3>
        <span class="status ${statusClass}">${statusText}</span>
      </div>
      <p><strong>Start:</strong> ${startTime}</p>
      <p><strong>Slut:</strong> ${endTime}</p>
      <p class="note"><strong>Anteckning:</strong><em> ${
        booking.notes || "-"
      }</em></p>
      ${actionButtonHtml}
    </article>
  `;
}

/**
 * Renders a list of bookings into a container.
 * @param {Array} bookings - Array of booking objects.
 * @param {HTMLElement} container - DOM element to render into.
 * @param {Function|null} onUnbook - Callback for unbooking. If null, button is hidden.
 */
export function renderBookings(bookings, container, onUnbook = null) {
  if (!container) return;

  if (!bookings || bookings.length === 0) {
    container.innerHTML = "<p>Inga bokningar hittades.</p>";
    return;
  }

  container.innerHTML = bookings
    .map((booking) => {
      // We pass true for showAction only if an onUnbook callback is provided
      return createBookingCard(booking, !!onUnbook);
    })
    .join("");

  // Attach Event Listeners
  if (onUnbook) {
    container.querySelectorAll(".unbook-btn").forEach((btn) => {
      btn.addEventListener("click", () => onUnbook(btn.dataset.id));
    });
  }
}
