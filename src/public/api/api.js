// api.js – frontend API layer

const API = {
  async getRooms() {
    const response = await fetch('/api/rooms');
    if (!response.ok) {
      throw new Error('Kunde inte hämta rum');
    }
    return response.json();
  }
};

export default API;
