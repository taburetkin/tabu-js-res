# Changelog

## 1.1.0

`OK`, `ERR`, and `RES` take an optional `convertToRes` function on the call. After `isRes` accepts a result of the requested kind, that function keeps the object or replaces it. The same reference runs `mutate`. A new object runs `init`. A flip does not call the function. `defineRes` does not store it.

## 1.0.0

First release.
