import ironStore from "./index.js";

const password = "Gbm49ATjnqnkCCCdhV4uDBhbfnPqsCW0";

test("it creates a store", async () => {
  await expect(ironStore({ password })).resolves.toMatchInlineSnapshot(`
          Object {
            "clear": [Function],
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
  expect(seal.length).toBe(271); // we can't test the actual value are there's a random crypto/timestamp in it
});

test("it reads sealed data", async () => {
  // seal obtained from previous test using console.log,
  const sealed =
    "Fe26.2*1*1753454b45c36dc0f6600729a7be3c4460a227591631085f6a3c89765c08861a*K_i9AvjRlY79Vo999BMnJQ*jlfcl2VRtUNxAN2Wj-jrj3c26EppmxC4aQQzIuDLJhBWIdO8l1nGgF37l2iLqU7G**4063522d0f819c84e8ce439924a58358ef6883a0c7f7d03394a4e899161cbcb9*cEQvS7FdHFx74uyGEntKtuA6Vq2wY9PJ746qosLjams";
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

test("store.clear()", async () => {
  const store = await ironStore({ password });
  const user = { id: 2000, admin: true };
  store.set("user", user);
  expect(store.get()).toMatchInlineSnapshot(`
    Object {
      "user": Object {
        "admin": true,
        "id": 2000,
      },
    }
  `);
  store.clear();
  expect(store.get()).toMatchInlineSnapshot(`Object {}`);
});

test("it allows for multiple passwords (password rotation)", async () => {
  const firstPassword = [
    {
      id: 1,
      password: "MJsZcjVkJKDoH8f35dAJNVWMbR8Z0cBr",
    },
  ];
  const secondPassword = [
    {
      id: 2,
      password: "xgzqACsoFxwgg95DTkVi1wT0U0zfZu39",
    },
    {
      id: 1,
      password: "MJsZcjVkJKDoH8f35dAJNVWMbR8Z0cBr",
    },
  ];

  const firstStore = await ironStore({ password: firstPassword });
  firstStore.set("user", { id: 200 });
  const firstSeal = await firstStore.seal();

  const secondStore = await ironStore({
    sealed: firstSeal,
    password: secondPassword,
  });
  expect(secondStore.get("user")).toMatchInlineSnapshot(`
    Object {
      "id": 200,
    }
  `);
});

test("it allows for multiple passwords, even when first password was a regular string", async () => {
  const firstPassword = "QK317mtQky71D5MEd5BDPXNEEAPwAmnQ";
  const secondPassword = [
    {
      id: 2,
      password: "Eza3mXLurdtg91yUbAcCKbWK8nqwGhhW",
    },
    {
      id: 1,
      password: "QK317mtQky71D5MEd5BDPXNEEAPwAmnQ",
    },
  ];

  const firstStore = await ironStore({ password: firstPassword });
  firstStore.set("user", { id: 220 });
  const firstSeal = await firstStore.seal();

  const secondStore = await ironStore({
    sealed: firstSeal,
    password: secondPassword,
  });
  expect(secondStore.get("user")).toMatchInlineSnapshot(`
    Object {
      "id": 220,
    }
  `);
});

test("it always uses first password from list for seal", async () => {
  const firstPassword = [
    {
      id: 2,
      password: "kimJoUsybVCw2hKZ3RN5j5FGjo33KiDt",
    },
    {
      id: 1,
      password: "voNwDrdCnmMNLNQBPUcE9mQcgBCfjYZu",
    },
  ];
  const secondPassword = [
    {
      id: 2,
      password: "kimJoUsybVCw2hKZ3RN5j5FGjo33KiDt",
    },
  ];

  const firstStore = await ironStore({ password: firstPassword });
  firstStore.set("user", { id: 240 });
  const firstSeal = await firstStore.seal();

  const secondStore = await ironStore({
    sealed: firstSeal,
    password: secondPassword,
  });
  expect(secondStore.get("user")).toMatchInlineSnapshot(`
    Object {
      "id": 240,
    }
  `);
});

test("it reads sealed data not containing password ids", async () => {
  // seal obtained from a previous test using console.log,
  // this seal does not contains a password id since it was created before
  // password ids were automatically added by the library (<= 1.2.0)
  // but it still works and is tested. Allowing for non breaking update
  const sealed =
    "Fe26.2**4e769b9b7b921621ed5658cfc0d7d8e267dc8ee93663c2803c257b31111394e3*jRXOJHmt_BDG9nNTXcVRXQ*UHpK9GYp7SXTiEsxTzTUq_tQD_-ZUp7PguEXy-bRFuBE4fW74-9wm9UtlWO2rlwB**d504d6d197d183efec0ae6d3c2378c43048c8752d6c3c591c92289ed01142b3c*3NG2fCo8A53CXPU8rEAMnDB7X9UkwzTaHieumPBqyTw";
  const store = await ironStore({ password, sealed });
  expect(store.get("user")).toMatchInlineSnapshot(`
    Object {
      "id": 3,
    }
  `);
});

test("it throws when trying to decrypt single passwords seals from iron-store <= 1.2.0 using multi passwords", async () => {
  // This test the situation where we're trying to move from single password seals (<= 1.2.0) to
  // multi passwords. There's no good way I can think of to do this well so we'll just throw instead
  // Session libraries should re-create a session when this happens
  // This is an edge case that won't exist for new users of the library or people that never move from old
  // version single password to new version multi passwords
  const sealed =
    "Fe26.2**4e769b9b7b921621ed5658cfc0d7d8e267dc8ee93663c2803c257b31111394e3*jRXOJHmt_BDG9nNTXcVRXQ*UHpK9GYp7SXTiEsxTzTUq_tQD_-ZUp7PguEXy-bRFuBE4fW74-9wm9UtlWO2rlwB**d504d6d197d183efec0ae6d3c2378c43048c8752d6c3c591c92289ed01142b3c*3NG2fCo8A53CXPU8rEAMnDB7X9UkwzTaHieumPBqyTw";

  await expect(async function () {
    await ironStore({ password: [{ id: 1, password }], sealed });
  }).rejects.toThrowErrorMatchingInlineSnapshot(`"Cannot find password: "`);
});

test("it throws on password bad format", async () => {
  await expect(async function () {
    await ironStore({ password: 12321 });
  }).rejects.toThrowErrorMatchingInlineSnapshot(
    `"iron-store: bad \`password\` format, expected string or array of objects"`,
  );
});
