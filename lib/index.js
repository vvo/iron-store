import Iron from "@hapi/iron";
import clone from "clone";

export default async function ironStore({ sealed, password, ttl = 0 }) {
  if (typeof password !== "string" && !Array.isArray(password)) {
    throw new Error(
      "iron-store: bad `password` format, expected string or array of objects",
    );
  }

  const store =
    sealed !== undefined
      ? await Iron.unseal(
          sealed,
          normalizePasswordForUnseal(sealed, password),
          {
            ...Iron.defaults,
            ttl,
          },
        )
      : { persistent: {}, flash: {} };

  return {
    set(name, value) {
      return (store.persistent[name] = clone(value));
    },
    setFlash(name, value) {
      return (store.flash[name] = clone(value));
    },
    unset(name) {
      delete store.persistent[name];
      delete store.flash[name];
    },
    get(name) {
      if (name === undefined) {
        const flash = store.flash;
        store.flash = {};
        return clone({
          ...flash,
          ...store.persistent,
        });
      }

      if (store.flash[name] !== undefined) {
        const value = store.flash[name];
        delete store.flash[name];
        return value; // no need to clone, as we already removed the reference from the flash store
      } else {
        return clone(store.persistent[name]);
      }
    },
    clear() {
      store.persistent = {};
      store.flash = {};
    },
    seal() {
      const passwordForSeal = Array.isArray(password)
        ? {
            id: password[0].id,
            secret: password[0].password,
          }
        : {
            id: 1,
            secret: password,
          };
      return Iron.seal(store, passwordForSeal, { ...Iron.defaults, ttl });
    },
  };
}

function normalizePasswordForUnseal(sealed, password) {
  if (typeof password === "string") {
    // sealed data comes from a previous version of iron-store (<= 1.2.0)
    if (sealed.startsWith(`${Iron.macPrefix}**`)) {
      return password;
    }

    return { 1: password };
  }

  return password.reduce((acc, currentPassword) => {
    return {
      [currentPassword.id]: currentPassword.password,
      ...acc,
    };
  }, {});
}
