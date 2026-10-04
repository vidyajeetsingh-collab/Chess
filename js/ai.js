const LIFELOOP_AI = (() => {

  const endpoint =
    "/.netlify/functions/ai";


  async function ask(message, options = {}) {

    if (!message || !message.trim()) {
      throw new Error("Please enter a message.");
    }

    const context =
      Memory.buildContext(message);

    const payload = {

      message: message.trim(),

      context,

      conversation:
        options.conversation || [],

      mode:
        options.mode || "assistant"
    };


    const response =
      await fetch(endpoint, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      });


    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "The AI server returned an invalid response."
      );
    }


    if (!response.ok) {

      throw new Error(
        data.error ||
        "LIFELOOP AI could not respond."
      );
    }


    if (!data.text) {

      throw new Error(
        "The AI returned an empty response."
      );
    }


    return data.text;
  }


  return {
    ask
  };

})();