async function fetchHomeData() {
  try {
    const response = await fetch("/db.json");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();

    // Overdue task checker
    const isOverdue = (dueDate) => {
      return new Date(dueDate) < new Date().setHours(0, 0, 0, 0);
    };

    // Task sorter
    const sortedTasks = [...data.tasks].sort((a, b) => {
      const aOverdue = isOverdue(a.dueDate);
      const bOverdue = isOverdue(b.dueDate);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    const tasksOverview =
      sortedTasks.length > 0
        ? `<table class="table">
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Assigned To</th>
                        <th>Due On</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTasks
                      .map(
                        (task) => `
                        <tr ${
                          isOverdue(task.dueDate) ? 'style="color: red;"' : ""
                        }>
                            <td>${task.name}</td>
                            <td>${
                              Array.isArray(task.roomies)
                                ? task.roomies.join(", ")
                                : task.roomie || "Unassigned"
                            }</td>
                            <td>${task.dueDate}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
               </table>`
        : "No tasks available";

    const groceriesList =
      data.groceries.length > 0
        ? `<table class="table">
                <thead>
                    <tr>
                        <th>Groceries</th>
                        <th>Quantity</th>
                        <th>Assigned To</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.groceries
                      .map(
                        (item) => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity || ""} ${item.unit || ""}</td>
                            <td>${
                              Array.isArray(item.roomies)
                                ? item.roomies.join(", ")
                                : item.roomie || "Unassigned"
                            }</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
               </table>`
        : "No groceries available";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingEvents =
      data.events.length > 0
        ? `<table class="table">
        <thead>
            <tr>
                <th>Event</th>
                <th>Assigned To</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            ${data.events
              .filter((event) => {
                const eventDate = new Date(event.date);
                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= todayDate;
              })
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(
                (event) => `
                <tr>
                    <td>${event.title}</td>
                    <td>${
                      Array.isArray(event.roomies)
                        ? event.roomies.join(", ")
                        : event.roomie || "Unassigned"
                    }</td>
                    <td>${event.date}</td>
                </tr>
            `
              )
              .join("")}
        </tbody>
       </table>`
        : "No upcoming events";

    return { tasksOverview, groceriesList, upcomingEvents };
  } catch (error) {
    console.error("Failed to fetch home data:", error);
    return {
      tasksOverview: "Error loading tasks",
      groceriesList: "Error loading groceries",
      upcomingEvents: "Error loading events",
    };
  }
}

async function renderHomeContent() {
  const homeData = await fetchHomeData();

  return `
        <h2 class="content-title">Home</h2>
        <div class="home-layout">
            <div class="top-section">
                <div class="card">
                    <h3 class="card-title clickable" onclick="setActiveSection('task manager')">
                        <div class="title-with-icon">
                            ${menuIcons["task manager"]}
                            <span>Tasks Overview</span>
                        </div>
                    </h3>
                    <div class="card-content overflow-auto">${homeData.tasksOverview}</div>
                </div>
                <div class="card">
                    <h3 class="card-title clickable" onclick="setActiveSection('groceries list')">
                        <div class="title-with-icon">
                            ${menuIcons["groceries list"]}
                            <span>Groceries List</span>
                        </div>
                    </h3>
                    <div class="card-content overflow-auto">${homeData.groceriesList}</div>
                </div>
            </div>
            <div class="bottom-section">
                <div class="events-section">
                    <h3 class="events-title clickable" onclick="setActiveSection('calendar')">
                        <div class="title-with-icon">
                            ${menuIcons["calendar"]}
                            <span>Upcoming Events</span>
                        </div>
                    </h3>
                    <div class="events-content overflow-auto">${homeData.upcomingEvents}</div>
                </div>
            </div>
        </div>
    `;
}
