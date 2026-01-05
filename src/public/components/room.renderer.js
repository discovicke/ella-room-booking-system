/**
 * Generates the HTML for a single room card.
 * @param {Object} room - The room object from the API.
 * @param {string} actionButtonsHtml - The HTML for the buttons (e.g., Book, Edit).
 * @returns {string} The HTML string for the card.
 */
export function createRoomCard(room, actionButtonsHtml) {
  // Check if assets exist, then map them to spans
  const assetsHtml = (room.assets || [])
    .map((a) => `<span class="asset-chip">${a.asset || a}</span>`) // Handle {asset: "Name"} or just "Name"
    .join("");

  return `
    <article class="room-card">
      <div class="room-info">
        <h3># ${room.number || room.room_number} - ${room.location}</h3> 
        <p>${room.display_type || room.type}</p>
        <p>Antal platser: ${room.capacity}</p>
        
        <div class="asset-chips">
          ${assetsHtml}
        </div>
      </div>
      
      <div class="room-actions">
        ${actionButtonsHtml}
      </div>
    </article>
  `;
}

/**
 * Renders a list of rooms into a container.
 * @param {Array} rooms - Array of room objects.
 * @param {HTMLElement} container - The DOM element to render into.
 * @param {Function} onAction - Callback when the main action button is clicked.
 * @param {string} buttonText - Text for the main button (default: "Boka").
 */
export function renderRooms(rooms, container, onAction, buttonText = "Boka") {
  if (!container) return;

  if (!rooms || rooms.length === 0) {
    container.innerHTML = "<p>Inga rum hittades.</p>";
    return;
  }

  container.innerHTML = rooms
    .map((room) => {
      // We create the button HTML here so we can attach the ID
      const btnHtml = `
      <button class="book-btn" data-id="${room.id}">
        ${buttonText}
      </button>
    `;
      return createRoomCard(room, btnHtml);
    })
    .join("");

  // Attach event listeners
  container.querySelectorAll(".book-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      onAction(btn.dataset.id);
    });
  });
}
