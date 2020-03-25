import Iron from "@hapi/iron";
import clone from "clone";

export default async function ironStore({ sealed, password, ttl = 0 }) {
  const store =
    sealed !== undefined
      ? await Iron.unseal(sealed, password, {
          ...Iron.defaults,
          ttl,
        })
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
      return Iron.seal(store, password, { ...Iron.defaults, ttl });
    },
  };
}
