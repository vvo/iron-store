import ironStore from "./index.js";

const password = "Gbm49ATjnqnkCCCdhV4uDBhbfnPqsCW0";

test("it creates a store", async () => {
  await expect(ironStore({ password })).resolves.toMatchInlineSnapshot(`
          Object {
            "get": [Function],
            "seal": [Function],
            "set": [Function],
            "setFlash": [Function],
          }
        `);
});

test("set", async () => {
  const store = await ironStore({ password });
  expect(store.set("user", { id: 1 })).toMatchInlineSnapshot(`
Object {
  "id": 1,
}
`);
});
