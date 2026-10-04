document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeApp();

  }
);


function initializeApp() {

  setupGreeting();
  setupDate();
  setupNavigation();
  setupAI();
  setupQuickActions();
  setupNotes();
  setupTheme();

  renderTasks();
  renderReminders();
  renderNotes();

  updateCounts();
}


function setupGreeting() {

  const element =
    document.getElementById("greetingText");

  if (!element) return;

  const hour =
    new Date().getHours();

  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  }

  element.textContent = greeting;
}


function setupDate() {

  const now = new Date();

  const dateElement =
    document.getElementById("todayDate");

  if (dateElement) {

    dateElement.textContent =
      now.toLocaleDateString(
        undefined,
        {
          day: "numeric",
          month: "short"
        }
      );
  }


  const day =
    document.getElementById("calendarDay");

  const month =
    document.getElementById("calendarMonth");

  const weekday =
    document.getElementById("calendarWeekday");


  if (day) {
    day.textContent =
      now.getDate();
  }

  if (month) {
    month.textContent =
      now.toLocaleDateString(
        undefined,
        { month: "long" }
      );
  }

  if (weekday) {
    weekday.textContent =
      now.toLocaleDateString(
        undefined,
        { weekday: "long" }
      );
  }
}


function setupNavigation() {

  document
    .querySelectorAll("[data-route]")
    .forEach(element => {

      element.addEventListener(
        "click",
        () => {

          Router.navigate(
            element.dataset.route
          );

        }
      );

    });
}


function setupAI() {

  const input =
    document.getElementById("aiInput");

  const send =
    document.getElementById("sendButton");

  const chatInput =
    document.getElementById("chatInput");

  const chatSend =
    document.getElementById(
      "chatSendButton"
    );


  send?.addEventListener(
    "click",
    () => {

      const text =
        input.value.trim();

      if (!text) return;

      input.value = "";

      Router.navigate("ai");

      sendMessage(text);

    }
  );


  input?.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        send.click();
      }

    }
  );


  chatSend?.addEventListener(
    "click",
    () => {

      const text =
        chatInput.value.trim();

      if (!text) return;

      chatInput.value = "";

      sendMessage(text);

    }
  );


  chatInput?.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        chatSend.click();
      }

    }
  );


  document
    .getElementById("voiceButton")
    ?.addEventListener(
      "click",
      () => {

        UI.toast(
          "Voice system will be connected in the Voice build step."
        );

      }
    );


  document
    .getElementById("attachButton")
    ?.addEventListener(
      "click",
      () => {

        UI.toast(
          "File and camera input will be connected in the Scanner build step."
        );

      }
    );
}


async function sendMessage(text) {

  UI.addMessage("user", text);

  const loading =
    UI.addLoadingMessage();

  try {

    const response =
      await LIFELOOP_AI.ask(text);

    UI.removeElement(loading);

    UI.addMessage(
      "assistant",
      response
    );


    Database.insert(
      "conversations",
      {
        role: "user",
        text
      }
    );


    Database.insert(
      "conversations",
      {
        role: "assistant",
        text: response
      }
    );

  } catch (error) {

    UI.removeElement(loading);

    UI.addMessage(
      "assistant",
      `I couldn't complete that request. ${error.message}`
    );

    console.error(
      "LIFELOOP AI:",
      error
    );
  }
}


function setupQuickActions() {

  document
    .querySelectorAll(
      ".quick-card"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const action =
            button.dataset.action;

          if (action === "task") {
            createQuickTask();
          }

          if (action === "reminder") {
            createQuickReminder();
          }

          if (action === "note") {
            Router.navigate("notes");
          }

          if (action === "plan") {

            Router.navigate("ai");

            setTimeout(() => {

              sendMessage(
                "Help me plan my day."
              );

            }, 100);

          }

        }
      );

    });
}


function createQuickTask() {

  const title =
    prompt("What task do you want to create?");

  if (!title || !title.trim()) return;

  Database.insert(
    "tasks",
    {
      title: title.trim(),
      completed: false
    }
  );

  renderTasks();
  updateCounts();

  UI.toast("Task created.");
}


function createQuickReminder() {

  const title =
    prompt("What should LIFELOOP remind you about?");

  if (!title || !title.trim()) return;

  Database.insert(
    "reminders",
    {
      title: title.trim(),
      completed: false
    }
  );

  renderReminders();
  updateCounts();

  UI.toast("Reminder created.");
}


function renderTasks() {

  const container =
    document.getElementById("taskList");

  if (!container) return;

  const tasks =
    Database.get("tasks");

  container.innerHTML = "";

  if (!tasks.length) {

    container.innerHTML = `
      <div class="empty-state">
        <span>✓</span>
        <strong>No tasks yet</strong>
        <p>Your tasks will appear here.</p>
      </div>
    `;

    return;
  }


  tasks.forEach(task => {

    const card =
      document.createElement("div");

    card.className = "item-card";

    card.innerHTML = `
      <strong>${escapeHTML(task.title)}</strong>
      <p>${task.completed ? "Completed" : "Not completed"}</p>
    `;

    container.appendChild(card);

  });
}


function renderReminders() {

  const container =
    document.getElementById("reminderList");

  if (!container) return;

  const reminders =
    Database.get("reminders");

  container.innerHTML = "";

  if (!reminders.length) {

    container.innerHTML = `
      <div class="empty-state">
        <span>◷</span>
        <strong>No reminders yet</strong>
        <p>Your reminders will appear here.</p>
      </div>
    `;

    return;
  }


  reminders.forEach(reminder => {

    const card =
      document.createElement("div");

    card.className = "item-card";

    card.innerHTML = `
      <strong>${escapeHTML(reminder.title)}</strong>
      <p>Reminder</p>
    `;

    container.appendChild(card);

  });
}


function setupNotes() {

  const saveButton =
    document.getElementById(
      "saveNoteButton"
    );

  saveButton?.addEventListener(
    "click",
    () => {

      const title =
        document.getElementById(
          "noteTitle"
        ).value.trim();

      const body =
        document.getElementById(
          "noteBody"
        ).value.trim();


      if (!title && !body) {

        UI.toast(
          "Write something first."
        );

        return;
      }


      Database.insert(
        "notes",
        {
          title: title || "Untitled note",
          body
        }
      );


      document.getElementById(
        "noteTitle"
      ).value = "";

      document.getElementById(
        "noteBody"
      ).value = "";


      renderNotes();

      UI.toast("Note saved.");
    }
  );
}


function renderNotes() {

  const container =
    document.getElementById("noteList");

  if (!container) return;

  const notes =
    Database.get("notes");

  container.innerHTML = "";

  notes
    .slice()
    .reverse()
    .forEach(note => {

      const card =
        document.createElement("div");

      card.className = "item-card";

      card.innerHTML = `
        <strong>${escapeHTML(note.title)}</strong>
        <p>${escapeHTML(note.body)}</p>
      `;

      container.appendChild(card);

    });
}


function updateCounts() {

  UI.updateTodayCounts(
    Database.get("tasks"),
    Database.get("reminders")
  );
}


function setupTheme() {

  const button =
    document.getElementById(
      "themeButton"
    );

  button?.addEventListener(
    "click",
    () => {

      const current =
        Database.getSettings().theme;

      const next =
        current === "dark"
          ? "light"
          : "dark";

      Database.updateSettings({
        theme: next
      });

      applyTheme(next);
    }
  );


  applyTheme(
    Database.getSettings().theme
  );
}


function applyTheme(theme) {

  if (theme === "light") {

    document.documentElement.style.setProperty(
      "--bg",
      "#f4f6fa"
    );

    document.documentElement.style.setProperty(
      "--surface",
      "#ffffff"
    );

    document.documentElement.style.setProperty(
      "--surface-2",
      "#eef1f6"
    );

    document.documentElement.style.setProperty(
      "--surface-3",
      "#e4e8ef"
    );

    document.documentElement.style.setProperty(
      "--text",
      "#11151d"
    );

    document.documentElement.style.setProperty(
      "--muted",
      "#697386"
    );

  } else {

    document.documentElement.style.setProperty(
      "--bg",
      "#090b10"
    );

    document.documentElement.style.setProperty(
      "--surface",
      "#11151d"
    );

    document.documentElement.style.setProperty(
      "--surface-2",
      "#171c25"
    );

    document.documentElement.style.setProperty(
      "--surface-3",
      "#202632"
    );

    document.documentElement.style.setProperty(
      "--text",
      "#f5f7fb"
    );

    document.documentElement.style.setProperty(
      "--muted",
      "#8d96a6"
    );
  }
}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}