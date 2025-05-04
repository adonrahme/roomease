const GroceriesManager = (() => {
  let groceries = [];
  let roomies = [];

  async function fetchGroceries() {
    try {
      const response = await fetch("http://localhost:3000/groceries");
      if (!response.ok) throw new Error("Network response was not ok");
      groceries = await response.json();
    } catch (error) {
      console.error("Failed to fetch groceries:", error);
      groceries = [];
    }
  }

  async function fetchRoomies() {
    try {
      const response = await fetch("http://localhost:3000/roomies");
      if (!response.ok) throw new Error("Network response was not ok");
      roomies = await response.json();
    } catch (error) {
      console.error("Failed to fetch roomies:", error);
      roomies = [];
    }
  }

  async function renderGroceriesManagerContent() {
    await Promise.all([fetchGroceries(), fetchRoomies()]);

    return `
            <h2 class="content-title">Groceries Manager</h2>
            <div class="task-manager-header">
                <button class="add-task-button" onclick="GroceriesManager.toggleAddGroceryForm()">Add New Item</button>
            </div>

            <form id="add-grocery-form" class="add-task-form">
                <div style="display: flex; gap: 1rem; width: 100%;">
                    <input type="text" id="grocery-name" placeholder="Grocery Item" required style="flex: 2;">
                    <input type="number" id="grocery-quantity" placeholder="Quantity" required min="1" style="flex: 1;">
                    <select id="grocery-unit" style="flex: 1;">
                        <option value="">Unit</option>
                        <option value="pieces">pieces</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="ml">ml</option>
                        <option value="pack">pack</option>
                    </select>
                </div>
                <div class="roomie-selection">
                    <div class="selected-roomies" id="selected-roomies"></div>
                    <select id="grocery-roomie" onchange="GroceriesManager.addSelectedRoomie()">
                        <option value="">Select Roomies</option>
                        ${roomies
                          .map(
                            (roomie) => `
                            <option value="${roomie.user}">${roomie.user}</option>
                        `
                          )
                          .join("")}
                    </select>
                </div>
                <button type="button" onclick="GroceriesManager.addGrocery()">Add Item</button>
            </form>

            <table class="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Groceries</th>
                        <th>Quantity</th>
                        <th>Assigned To</th>
                    </tr>
                </thead>
                <tbody id="groceries-table-body">
                    ${groceries
                      .map(
                        (grocery) => `
                        <tr id="grocery-${grocery.id}">
                            <td><input type="checkbox" onclick="GroceriesManager.deleteGrocery('${
                              grocery.id
                            }')"></td>
                            <td>${grocery.name}</td>
                            <td>${grocery.quantity || ""} ${
                          grocery.unit || ""
                        }</td>
                            <td>${
                              Array.isArray(grocery.roomies)
                                ? grocery.roomies.join(", ")
                                : grocery.roomie
                            }</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        `;
  }

  function addSelectedRoomie() {
    const select = document.getElementById("grocery-roomie");
    const selectedRoomie = select.value;
    if (!selectedRoomie) return;

    const selectedRoomiesContainer =
      document.getElementById("selected-roomies");
    const existingRoomies = Array.from(selectedRoomiesContainer.children).map(
      (chip) => chip.getAttribute("data-roomie")
    );

    if (!existingRoomies.includes(selectedRoomie)) {
      const roomieChip = document.createElement("div");
      roomieChip.className = "roomie-chip";
      roomieChip.setAttribute("data-roomie", selectedRoomie);
      roomieChip.innerHTML = `
                ${selectedRoomie}
                <span class="remove-roomie" onclick="GroceriesManager.removeRoomie(this.parentElement)">×</span>
            `;
      selectedRoomiesContainer.appendChild(roomieChip);
    }

    select.value = "";
  }

  function removeRoomie(chipElement) {
    chipElement.remove();
  }

  function getSelectedRoomies() {
    const selectedRoomiesContainer =
      document.getElementById("selected-roomies");
    return Array.from(selectedRoomiesContainer.children).map((chip) =>
      chip.getAttribute("data-roomie")
    );
  }

  async function addGrocery() {
    const name = document.getElementById("grocery-name").value;
    const quantity = document.getElementById("grocery-quantity").value;
    const unit = document.getElementById("grocery-unit").value;
    const selectedRoomies = getSelectedRoomies();

    if (!name || !quantity || selectedRoomies.length === 0) {
      console.error("Name, quantity, and at least one roomie are required");
      return;
    }

    const newGrocery = {
      name,
      quantity: parseInt(quantity),
      unit,
      roomies: selectedRoomies,
      status: "Pending",
    };

    try {
      const response = await fetch("http://localhost:3000/groceries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGrocery),
      });

      if (!response.ok) throw new Error("Failed to add grocery");

      await fetchGroceries();
      const content = document.getElementById("content");
      content.innerHTML = await renderGroceriesManagerContent();

      clearAddGroceryForm();
    } catch (error) {
      console.error("Failed to add grocery:", error);
    }
  }

  async function deleteGrocery(groceryId) {
    try {
      const response = await fetch(
        `http://localhost:3000/groceries/${groceryId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete grocery");

      await fetchGroceries();
      const content = document.getElementById("content");
      content.innerHTML = await renderGroceriesManagerContent();
    } catch (error) {
      console.error("Failed to delete grocery:", error);
    }
  }

  function toggleAddGroceryForm() {
    const form = document.getElementById("add-grocery-form");
    if (form) {
      form.classList.toggle("show");
    }
  }

  function clearAddGroceryForm() {
    const form = document.getElementById("add-grocery-form");
    if (form) {
      form.classList.remove("show");
      document.getElementById("grocery-name").value = "";
      document.getElementById("grocery-quantity").value = "";
      document.getElementById("grocery-unit").value = "";
      document.getElementById("selected-roomies").innerHTML = "";
      document.getElementById("grocery-roomie").value = "";
    }
  }

  return {
    renderGroceriesManagerContent,
    addGrocery,
    deleteGrocery,
    toggleAddGroceryForm,
    addSelectedRoomie,
    removeRoomie,
  };
})();

window.GroceriesManager = GroceriesManager;
