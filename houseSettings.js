const renderHouseSettingsContent = async () => {
  try {
    const response = await fetch("http://localhost:3000/roomies");
    if (!response.ok) throw new Error("Failed to fetch house data");
    const roomies = await response.json();

    return `
            <h2 class="content-title">House Settings</h2>
            <div class="house-settings-container">
                <div class="card">
                    <h3 class="card-title">
                        <div class="title-with-icon">
                            <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>House Members</span>
                        </div>
                    </h3>
                    <div class="members-management">
                        <div class="current-members">
                            ${roomies
                              .map(
                                (roomie) => `
                                <div class="member-card">
                                    <div class="member-info">
                                        <div class="member-name">${roomie.user}</div>
                                        <div class="member-email">${roomie.email}</div>
                                    </div>
                                    <button class="delete-button" onclick="HouseSettings.removeRoomie('${roomie.id}', '${roomie.user}')">
                                        <svg class="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            `
                              )
                              .join("")}
                        </div>
                        <div class="add-member-section">
                            <h4 class="section-title">Add New Member</h4>
                            <div class="add-member-form">
                                <div class="input-group">
                                    <label for="new-roomie-name">Name</label>
                                    <input 
                                        type="text" 
                                        id="new-roomie-name" 
                                        class="form-input" 
                                        placeholder="Enter name"
                                        required
                                    >
                                </div>
                                <div class="input-group">
                                    <label for="new-roomie-email">Email</label>
                                    <input 
                                        type="email" 
                                        id="new-roomie-email" 
                                        class="form-input" 
                                        placeholder="Enter email address"
                                        required
                                    >
                                </div>
                                <button class="add-button" onclick="HouseSettings.addRoomie()">
                                    Add Member
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  } catch (error) {
    console.error("Failed to render house settings:", error);
    return '<h2 class="content-title">Error loading house settings</h2>';
  }
};

const HouseSettings = {
  async addRoomie() {
    const nameInput = document.getElementById("new-roomie-name");
    const emailInput = document.getElementById("new-roomie-email");
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !email) {
      alert("Please provide both name and email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/roomies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Date.now().toString(),
          user: name,
          email: email,
        }),
      });

      if (!response.ok) throw new Error("Failed to add roomie");

      nameInput.value = "";
      emailInput.value = "";

      const content = document.getElementById("content");
      content.innerHTML = await renderHouseSettingsContent();
    } catch (error) {
      console.error("Failed to add roomie:", error);
      alert("Failed to add member. Please try again.");
    }
  },

  async removeRoomie(id, username) {
    if (!confirm(`Are you sure you want to remove ${username}?`)) return;

    try {
      const response = await fetch(`http://localhost:3000/roomies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove roomie");

      const content = document.getElementById("content");
      content.innerHTML = await renderHouseSettingsContent();
    } catch (error) {
      console.error("Failed to remove roomie:", error);
      alert("Failed to remove member. Please try again.");
    }
  },
};

window.renderHouseSettingsContent = renderHouseSettingsContent;
window.HouseSettings = HouseSettings;
