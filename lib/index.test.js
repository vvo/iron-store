import ironStore from "./index.js";

const password = "Gbm49ATjnqnkCCCdhV4uDBhbfnPqsCW0";

test("it creates a store", async () => {
  await expect(ironStore({ password })).resolves.toMatchInlineSnapshot(`
          Object {
            "get": [Function],
            "seal": [Function],
            "set": [Function],
            "setFlash": [Function],
            "unset": [Function],
          }
        `);
});

test("set(name, value)", async () => {
  const store = await ironStore({ password });
  expect(store.set("user", { id: 1 })).toMatchInlineSnapshot(`
    Object {
      "id": 1,
    }
  `);
});

test("get(name)", async () => {
  const store = await ironStore({ password });
  store.set("user", { id: 2 });
  expect(store.get("user")).toMatchInlineSnapshot(`
    Object {
      "id": 2,
    }
  `);
});

test("unset(name, value)", async () => {
  const store = await ironStore({ password });
  store.set("state", { id: 1 });
  expect(store.get("state")).toMatchInlineSnapshot(`
Object {
  "id": 1,
}
`);
  expect(store.unset("state")).toMatchInlineSnapshot(`undefined`);
  expect(store.get("state")).toMatchInlineSnapshot(`undefined`);
});

test("get()", async () => {
  const store = await ironStore({ password });
  store.set("user", { id: 2 });
  expect(store.get()).toMatchInlineSnapshot(`
Object {
  "user": Object {
    "id": 2,
  },
}
`);
});

test("setFlash(name, value)", async () => {
  const store = await ironStore({ password });
  store.setFlash("state", "4lk21j4k2l1j4");
  expect(store.get("state")).toMatchInlineSnapshot(`"4lk21j4k2l1j4"`);
  expect(store.get("state")).toMatchInlineSnapshot(`undefined`);
});

test("it seals data", async () => {
  const store = await ironStore({ password });
  store.set("user", { id: 3 });
  const seal = await store.seal();
  expect(typeof seal).toBe("string");
  expect(seal.length).toBe(270); // we can't test the actual value are there's a random crypto/timestamp in it
});

test("it reads sealed data", async () => {
  // seal obtained from previous test using console.log
  const sealed =
    "Fe26.2**4e769b9b7b921621ed5658cfc0d7d8e267dc8ee93663c2803c257b31111394e3*jRXOJHmt_BDG9nNTXcVRXQ*UHpK9GYp7SXTiEsxTzTUq_tQD_-ZUp7PguEXy-bRFuBE4fW74-9wm9UtlWO2rlwB**d504d6d197d183efec0ae6d3c2378c43048c8752d6c3c591c92289ed01142b3c*3NG2fCo8A53CXPU8rEAMnDB7X9UkwzTaHieumPBqyTw";
  const store = await ironStore({ password, sealed });
  expect(store.get("user")).toMatchInlineSnapshot(`
Object {
  "id": 3,
}
`);
});

test("Data is cloned on set", async () => {
  const store = await ironStore({ password });
  const user = { id: 1200, admin: true };
  store.set("user", user);
  expect(store.get()).toMatchInlineSnapshot(`
Object {
  "user": Object {
    "admin": true,
    "id": 1200,
  },
}
`);
  user.id = 2200;
  expect(store.get()).toMatchInlineSnapshot(`
Object {
  "user": Object {
    "admin": true,
    "id": 1200,
  },
}
`);
});

test("Data is cloned on get", async () => {
  const store = await ironStore({ password });
  const user = { id: 1700, admin: true };
  store.set("user", user);
  const sessionUser = store.get("user");
  sessionUser.id = 3400;
  expect(store.get()).toMatchInlineSnapshot(`
Object {
  "user": Object {
    "admin": true,
    "id": 1700,
  },
}
`);
});
