const TaskManager = (() => {
  let tasks = [];
  let roomies = [];

  async function fetchTasks() {
    try {
      const response = await fetch("http://localhost:3000/tasks");
      if (!response.ok) throw new Error("Network response was not ok");
      tasks = await response.json();
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      tasks = [];
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

  async function renderTaskManagerContent() {
    await Promise.all([fetchTasks(), fetchRoomies()]);

    return `
            <h2 class="content-title">Task Manager</h2>
            <div class="task-manager-header">
                <button class="add-task-button" onclick="TaskManager.toggleAddTaskForm()">Add New Task</button>
            </div>

            <form id="add-task-form" class="add-task-form">
                <input type="text" id="task-name" placeholder="Task Name" required>
                <div class="roomie-selection">
                    <div class="selected-roomies" id="selected-roomies"></div>
                    <select id="task-roomie" onchange="TaskManager.addSelectedRoomie()">
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
                <input type="date" id="task-due-date" required>
                <div class="repeat-task-container">
                    <label class="repeat-toggle">
                        <input type="checkbox" id="task-repeat" onchange="TaskManager.toggleRepeatOptions()">
                        <span>Repeat Task</span>
                    </label>
                    <div id="repeat-options" class="repeat-options">
                        <select id="repeat-frequency">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                        <input type="number" id="repeat-times" min="1" max="52" placeholder="Number of repeats">
                    </div>
                </div>
                <button type="button" onclick="TaskManager.addTask()">Add Task</button>
            </form>

            <table class="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Task</th>
                        <th>Assigned To</th>
                        <th>Due On</th>
                        <th>Repeats</th>
                    </tr>
                </thead>
                <tbody id="task-table-body">
                    ${tasks
                      .map(
                        (task) => `
                        <tr id="task-${task.id}">
                            <td><input type="checkbox" onclick="TaskManager.deleteTask('${
                              task.id
                            }')"></td>
                            <td>${task.name}</td>
                            <td>${
                              Array.isArray(task.roomies)
                                ? task.roomies.join(", ")
                                : task.roomie
                            }</td>
                            <td>${task.dueDate}</td>
                            <td>${
                              task.repeatInfo
                                ? `${task.repeatInfo.frequency} (${task.repeatInfo.current}/${task.repeatInfo.total})`
                                : "-"
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
    const select = document.getElementById("task-roomie");
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
                <span class="remove-roomie" onclick="TaskManager.removeRoomie(this.parentElement)">×</span>
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

  async function addTask() {
    const name = document.getElementById("task-name").value;
    const selectedRoomies = getSelectedRoomies();
    const dueDate = document.getElementById("task-due-date").value;
    const isRepeating = document.getElementById("task-repeat").checked;

    if (!name || selectedRoomies.length === 0 || !dueDate) {
      console.error(
        "Please fill in all required fields and select at least one roomie"
      );
      return;
    }

    let repeatInfo = null;
    if (isRepeating) {
      const frequency = document.getElementById("repeat-frequency").value;
      const totalRepeats = parseInt(
        document.getElementById("repeat-times").value
      );
      if (!totalRepeats || totalRepeats < 1) {
        console.error("Please specify number of repeats");
        return;
      }
      repeatInfo = {
        frequency,
        total: totalRepeats,
        current: 1,
      };
    }

    const newTask = {
      name,
      roomies: selectedRoomies,
      dueDate,
      status: "Pending",
      repeatInfo,
    };

    try {
      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw new Error("Failed to add task");

      await fetchTasks();
      const content = document.getElementById("content");
      content.innerHTML = await renderTaskManagerContent();

      clearAddTaskForm();
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  }

  async function deleteTask(taskId) {
    try {
      const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");

      const task = tasks.find((t) => t.id === taskId);
      if (task && task.repeatInfo) {
        if (task.repeatInfo.current < task.repeatInfo.total) {
          const nextDueDate = calculateNextDueDate(
            task.dueDate,
            task.repeatInfo.frequency
          );
          const nextTask = {
            ...task,
            dueDate: nextDueDate,
            repeatInfo: {
              ...task.repeatInfo,
              current: task.repeatInfo.current + 1,
            },
          };
          delete nextTask.id;

          await fetch("http://localhost:3000/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nextTask),
          });
        }
      }

      await fetchTasks();
      const content = document.getElementById("content");
      content.innerHTML = await renderTaskManagerContent();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }

  function calculateNextDueDate(currentDate, frequency) {
    const date = new Date(currentDate);
    switch (frequency) {
      case "daily":
        date.setDate(date.getDate() + 1);
        break;
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
    }
    return date.toISOString().split("T")[0];
  }

  function toggleAddTaskForm() {
    const form = document.getElementById("add-task-form");
    if (form) {
      form.classList.toggle("show");
    }
  }

  function toggleRepeatOptions() {
    const repeatOptions = document.getElementById("repeat-options");
    const isChecked = document.getElementById("task-repeat").checked;
    repeatOptions.style.display = isChecked ? "flex" : "none";
  }

  function clearAddTaskForm() {
    const form = document.getElementById("add-task-form");
    if (form) {
      form.classList.remove("show");
      document.getElementById("task-name").value = "";
      document.getElementById("selected-roomies").innerHTML = "";
      document.getElementById("task-roomie").value = "";
      document.getElementById("task-due-date").value = "";
      document.getElementById("task-repeat").checked = false;
      document.getElementById("repeat-options").style.display = "none";
      document.getElementById("repeat-frequency").value = "daily";
      document.getElementById("repeat-times").value = "";
    }
  }

  return {
    renderTaskManagerContent,
    addTask,
    deleteTask,
    toggleAddTaskForm,
    toggleRepeatOptions,
    addSelectedRoomie,
    removeRoomie,
  };
})();

window.TaskManager = TaskManager;
