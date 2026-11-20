# FoxAPIs SDKs

Two tiny clients, generated from the public OpenAPI file (v1.5.0, 2026-11-18): `js/` (Node 18+, ES module) and `python/` (3.8+, standard library). Not published to npm or PyPI yet.

Regenerate after the API changes: `node scripts/build-distribution.cjs` in the foxapis-cf repo (it reads openapi.json, which `node scripts/build-public-openapi.cjs` refreshes from the live backend).
