# iron-store [![GitHub license](https://img.shields.io/github/license/vvo/iron-store?style=flat)](https://github.com/vvo/iron-store/blob/main/LICENSE) [![Tests](https://github.com/vvo/iron-store/workflows/CI/badge.svg)](https://github.com/vvo/iron-store/actions) [![codecov](https://codecov.io/gh/vvo/iron-store/branch/main/graph/badge.svg)](https://codecov.io/gh/vvo/iron-store) ![npm](https://img.shields.io/npm/v/iron-store)

_🧿 in-memory, signed and encrypted JavaScript store_

---

This is a low-level module that you can use to implement signed and encrypted sessions using cookies for example, like [`next-iron-session`](https://github.com/vvo/next-iron-session) does.

Signature and encryption is based on [@hapi/iron](https://hapi.dev/family/iron/).

Use https://1password.com/password-generator/ to generate strong passwords.

You can use multiple passwords (password rotation).

```bash
npm add iron-store
```

## Examples

**Creating a store with sealed data (_encrypt_)**:

```js
import ironStore from "iron-store";

const store = await ironStore({
  password: "generated_complex_password_at_least_32_characters_long",
});
store.set("user", { id: 80, admin: true });
const seal = await store.seal();
//
```

**Creating a store from previously sealed data (_decrypt_)**:

```js
import ironStore from "iron-store";

const store = await ironStore({
  password: "generated_complex_password_at_least_32_characters_long",
  sealed: "seal_obtained_from_previous_store.seal()_call",
});
const user = store.get("user");
console.log(user);
// { id:80, admin:true }
```

**Creating a store using multiple passwords (_password rotation_)**:

You can implement password rotation by providing an array of passwords and ids. The id can be a string (letters, numbers and \_) or just a number.

The first password in the array is always the one used to `seal` data. All the other passwords are used to decrypt data.

Note: The `id` is mandatory and part of the seal, so that we can know in advance which password to use when decrypting. You need to use unique ids. You cannot reuse a id for a different password.

Note: If you started to use the `string` form of password, you can always move to an `array` of password objects. The `string` form of your password is internally handled as `{ id: 1, password }`.

```js
import ironStore from "iron-store";

const store = await ironStore({
  password: [
    {
      id: 2,
      password: "generated_complex_password_at_least_32_characters_long",
    },
    {
      id: 1,
      password: "generated_complex_password_at_least_32_characters_long",
    },
  ],
});
store.set("user", { id: 80, admin: true });
const seal = await store.seal();
```

## API

### ironStore({ [sealed], password, ttl = 0 })

### store.set(name, value)

### store.get([name])

### store.setFlash(name, value)

### store.unset(name)

### store.seal()

### store.clear()
