// Frontend API layer

/**
 * Helper to make authenticated API calls.
 * Browser automatically sends the 'auth_token' cookie.
 */
async function apiFetch(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      // ONLY redirect if we are NOT currently trying to log in
      if (!url.includes("/api/auth/login")) {
        window.location.href = "/login/";
        throw new Error("Session expired. Please login again.");
      }
      // If we ARE logging in, 401 means "Wrong password"
      throw new Error("Fel email eller lösenord.");
    }

    if (response.status === 403) throw new Error("Access denied.");

    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return response.status === 204
      ? null
      : response.json();
}

const API = {
  async login(email, password) {
    return await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return await apiFetch("/api/auth/logout", { method: "DELETE" });
  },

  async getRooms(includeAssets = false) {
    const url = includeAssets
        ? "/api/rooms?includeAssets=true"
        : "/api/rooms";
    return await apiFetch(url);
  },

  async getBookingsByUser(userId) {
    return await apiFetch(`/api/bookings/user/${userId}`);
  }

  // TODO: Implement getRoom(id) - GET /api/rooms/:id
  // TODO: Implement createRoom(roomData) - POST /api/rooms
  // TODO: Implement updateRoom(id, roomData) - PUT /api/rooms/:id
  // TODO: Implement deleteRoom(id) - DELETE /api/rooms/:id

  // TODO: Implement getBookings() - GET /api/bookings
  // TODO: Implement createBooking(bookingData) - POST /api/bookings
  // TODO: Implement updateBooking(id, bookingData) - PUT /api/bookings/:id
  // TODO: Implement deleteBooking(id) - DELETE /api/bookings/:id

  // TODO: Implement getUsers() - GET /api/users
  // TODO: Implement getUser(id) - GET /api/users/:id
  // TODO: Implement createUser(userData) - POST /api/users
};

export default API;
