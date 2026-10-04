const Memory = (() => {

  function getMemories() {
    return Database.get("memories");
  }


  function addMemory(text, category = "general") {

    if (!text || !text.trim()) {
      return null;
    }

    return Database.insert("memories", {
      text: text.trim(),
      category
    });
  }


  function removeMemory(id) {

    return Database.remove(
      "memories",
      id
    );
  }


  function getRelevantContext(query) {

    const memories = getMemories();

    if (!query || !memories.length) {
      return [];
    }

    const words =
      query
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2);

    return memories
      .map(memory => {

        const text =
          memory.text.toLowerCase();

        let score = 0;

        words.forEach(word => {

          if (text.includes(word)) {
            score++;
          }

        });

        return {
          ...memory,
          score
        };

      })
      .filter(memory => memory.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }


  function buildContext(query) {

    const relevant =
      getRelevantContext(query);

    if (!relevant.length) {
      return "";
    }

    return relevant
      .map(memory =>
        `- ${memory.text}`
      )
      .join("\n");
  }


  return {
    getMemories,
    addMemory,
    removeMemory,
    getRelevantContext,
    buildContext
  };

})();