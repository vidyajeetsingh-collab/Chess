const Database = (() => {

  const STORAGE_KEY = "lifeloop_local_data";

  const defaultData = {
    tasks: [],
    reminders: [],
    notes: [],
    conversations: [],
    memories: [],
    settings: {
      theme: "dark"
    }
  };


  function load() {

    try {

      const saved =
        localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return structuredClone(defaultData);
      }

      const parsed = JSON.parse(saved);

      return {
        ...structuredClone(defaultData),
        ...parsed
      };

    } catch (error) {

      console.error(
        "LIFELOOP database load error:",
        error
      );

      return structuredClone(defaultData);
    }
  }


  function save(data) {

    try {

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );

      return true;

    } catch (error) {

      console.error(
        "LIFELOOP database save error:",
        error
      );

      return false;
    }
  }


  function get(collection) {

    const data = load();

    return data[collection] || [];
  }


  function insert(collection, item) {

    const data = load();

    if (!Array.isArray(data[collection])) {
      data[collection] = [];
    }

    const record = {
      id:
        crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,

      createdAt:
        new Date().toISOString(),

      ...item
    };

    data[collection].push(record);

    save(data);

    return record;
  }


  function remove(collection, id) {

    const data = load();

    if (!Array.isArray(data[collection])) {
      return false;
    }

    data[collection] =
      data[collection].filter(
        item => item.id !== id
      );

    return save(data);
  }


  function clear(collection) {

    const data = load();

    data[collection] = [];

    return save(data);
  }


  function getSettings() {

    return load().settings;
  }


  function updateSettings(changes) {

    const data = load();

    data.settings = {
      ...data.settings,
      ...changes
    };

    save(data);

    return data.settings;
  }


  return {
    load,
    save,
    get,
    insert,
    remove,
    clear,
    getSettings,
    updateSettings
  };

})();