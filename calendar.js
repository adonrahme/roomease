const CalendarManager = (() => {
  let events = [];
  let roomies = [];
  let currentDate = new Date();
  let selectedDate = null;

  async function fetchEvents() {
    try {
      const response = await fetch("http://localhost:3000/events");
      if (!response.ok) throw new Error("Network response was not ok");
      events = await response.json();
    } catch (error) {
      console.error("Failed to fetch events:", error);
      events = [];
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

  function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  async function renderCalendarContent() {
    await Promise.all([fetchEvents(), fetchRoomies()]);

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    let calendarHtml = `
            <h2 class="content-title">${
              monthNames[currentDate.getMonth()]
            } ${currentDate.getFullYear()}</h2>
            <div class="calendar-controls">
                <button onclick="CalendarManager.previousMonth()">&lt; Previous</button>
                <button onclick="CalendarManager.nextMonth()">Next &gt;</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-header">Sun</div>
                <div class="calendar-header">Mon</div>
                <div class="calendar-header">Tue</div>
                <div class="calendar-header">Wed</div>
                <div class="calendar-header">Thu</div>
                <div class="calendar-header">Fri</div>
                <div class="calendar-header">Sat</div>
        `;

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarHtml += '<div class="calendar-day empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dateStr = formatDate(date);
      const dayEvents = events.filter((event) => event.date === dateStr);

      calendarHtml += `
                <div class="calendar-day" onclick="CalendarManager.showAddEventForm('${dateStr}')">
                    <div class="day-number">${day}</div>
                    ${dayEvents
                      .map(
                        (event) => `
                        <div class="event-item" onclick="event.stopPropagation()">
                            ${event.title}
                            <span class="event-attendees">${
                              Array.isArray(event.roomies)
                                ? event.roomies.join(", ")
                                : event.roomie || ""
                            }</span>
                            <span class="delete-event" onclick="CalendarManager.deleteEvent('${
                              event.id
                            }')">×</span>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            `;
    }

    calendarHtml += `
            </div>
            <div id="add-event-form" class="add-event-form">
                <h3>Add Event for <span id="selected-date"></span></h3>
                <input type="text" id="event-title" placeholder="Event Title" required>
                <div class="roomie-selection">
                    <div class="selected-roomies" id="selected-roomies"></div>
                    <select id="event-roomie" onchange="CalendarManager.addSelectedRoomie()">
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
                <button onclick="CalendarManager.addEvent()">Add Event</button>
                <button onclick="CalendarManager.closeAddEventForm()">Cancel</button>
            </div>
        `;

    return calendarHtml;
  }

  function addSelectedRoomie() {
    const select = document.getElementById("event-roomie");
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
                <span class="remove-roomie" onclick="CalendarManager.removeRoomie(this.parentElement)">×</span>
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

  function showAddEventForm(date) {
    selectedDate = date;
    const form = document.getElementById("add-event-form");
    const dateSpan = document.getElementById("selected-date");
    dateSpan.textContent = date;
    form.style.display = "flex";
  }

  function closeAddEventForm() {
    const form = document.getElementById("add-event-form");
    form.style.display = "none";
    document.getElementById("event-title").value = "";
    document.getElementById("selected-roomies").innerHTML = "";
    document.getElementById("event-roomie").value = "";
  }

  async function addEvent() {
    const title = document.getElementById("event-title").value;
    const selectedRoomies = getSelectedRoomies();

    if (!title || selectedRoomies.length === 0 || !selectedDate) {
      console.error(
        "Please fill in all required fields and select at least one roomie"
      );
      return;
    }

    const newEvent = {
      title,
      roomies: selectedRoomies,
      date: selectedDate,
      status: "Pending",
    };

    try {
      const response = await fetch("http://localhost:3000/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) throw new Error("Failed to add event");

      const content = document.getElementById("content");
      content.innerHTML = await renderCalendarContent();
      closeAddEventForm();
    } catch (error) {
      console.error("Failed to add event:", error);
    }
  }

  async function deleteEvent(eventId) {
    try {
      const response = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");

      const content = document.getElementById("content");
      content.innerHTML = await renderCalendarContent();
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  }

  function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    const content = document.getElementById("content");
    renderCalendarContent().then((html) => (content.innerHTML = html));
  }

  function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    const content = document.getElementById("content");
    renderCalendarContent().then((html) => (content.innerHTML = html));
  }

  return {
    renderCalendarContent,
    showAddEventForm,
    closeAddEventForm,
    addEvent,
    deleteEvent,
    previousMonth,
    nextMonth,
    addSelectedRoomie,
    removeRoomie,
  };
})();

window.CalendarManager = CalendarManager;
