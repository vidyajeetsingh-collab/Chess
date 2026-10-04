const UI = (() => {

  let toastTimer = null;

  function toast(message) {

    const element = document.getElementById("toast");

    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      element.classList.remove("show");
    }, 2200);
  }


  function addMessage(role, text) {

    const container =
      document.getElementById("chatMessages");

    if (!container) return null;

    const wrapper = document.createElement("div");

    wrapper.className =
      `message ${role === "user" ? "user" : "assistant"}`;

    if (role === "assistant") {

      const avatar = document.createElement("div");

      avatar.className = "ai-avatar";
      avatar.textContent = "L";

      wrapper.appendChild(avatar);
    }

    const bubble = document.createElement("div");

    bubble.className = "message-bubble";
    bubble.textContent = text;

    wrapper.appendChild(bubble);

    container.appendChild(wrapper);

    container.scrollTop = container.scrollHeight;

    return bubble;
  }


  function addLoadingMessage() {

    const container =
      document.getElementById("chatMessages");

    const wrapper = document.createElement("div");

    wrapper.className = "message assistant";

    const avatar = document.createElement("div");

    avatar.className = "ai-avatar";
    avatar.textContent = "L";

    const bubble = document.createElement("div");

    bubble.className = "message-bubble";

    bubble.innerHTML = `
      <span class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
    `;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);

    container.appendChild(wrapper);

    container.scrollTop = container.scrollHeight;

    return wrapper;
  }


  function removeElement(element) {
    if (element && element.remove) {
      element.remove();
    }
  }


  function updateTodayCounts(tasks, reminders) {

    const taskCount =
      document.getElementById("taskCount");

    const reminderCount =
      document.getElementById("reminderCount");

    if (taskCount) {
      taskCount.textContent =
        `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
    }

    if (reminderCount) {
      reminderCount.textContent =
        `${reminders.length} ${
          reminders.length === 1
            ? "reminder"
            : "reminders"
        }`;
    }
  }


  return {
    toast,
    addMessage,
    addLoadingMessage,
    removeElement,
    updateTodayCounts
  };

})();