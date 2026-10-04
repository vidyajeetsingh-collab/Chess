const Router = (() => {

  let currentRoute = "home";

  function navigate(route) {

    const target = document.querySelector(
      `[data-route="${route}"]`
    );

    if (!target) return;

    document.querySelectorAll(".screen").forEach(screen => {
      screen.classList.remove("active");
    });

    const screen = document.querySelector(
      `#screen-${route}`
    );

    if (screen) {
      screen.classList.add("active");
    }

    document.querySelectorAll(".nav-item").forEach(item => {
      item.classList.toggle(
        "active",
        item.dataset.route === route
      );
    });

    currentRoute = route;

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function getCurrentRoute() {
    return currentRoute;
  }

  return {
    navigate,
    getCurrentRoute
  };

})();