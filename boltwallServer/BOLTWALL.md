# HOW TO IMPLEMENT BOLTWALL

To run the BOLTWALL server create a .env file and add the following variables below

## BOLTWALL ENV VARIABLES

PORT=
LND_TLS_CERT=[BASE64 or HEX encoded cert here]
LND_MACAROON=[BASE64 or HEX encoded cert here]
LND_SOCKET=[address of node here, e.g. localhost:10006]

## RUN THE SERVER

```
npm install
npm run dev

```

Once the server is running, you can test the API:

## BOLTWALL ENDPOINTS

- GET {HOST}/node to get connection information about your lightning node (no payment required).

- GET {HOST}/protected?amount=[amount] will return a 402 error for payment required. An LSAT challenge will be available in the returned www-authenticate header. Decode LSAT to get full invoice information. Amount in query string will be used in invoice generation unless below minAmount configured in boltwall. If no amount is set, then minAmount will be used.

_LSAT EXAMPLE_

```
LSAT macaroon="AgEJbG9jYWxob3N0AoQBMDAwMGVmZjBlZGZmN2U1ZDdmMjE2YjUzYzgzM2IxNmVlNjU3NzU1NzhlYzUyMzJlNTM4YjFlNGVlNDY5NDRlNTRmMzJhNWE1MWUxNDgyZmY2MjNkZWFjZjg2N2JiMGIyYjkxZjg2ZmI3Mzc3YTBjYzhlNTQ4MDliNTM4NTk0OWM0NmFiAAAGIAmYSH_ADVXhOgvhpGgi0ZI094BFWek63zCmLEl5d80D", invoice="lntb5u1pjvrykmpp5alcwmlm7t4ljz66neqemzmhx2a640rk9yvh98zc7fmjxj389fueqdqqcqzzsxq92fjuqsp5zp0epvlqjjy2wgsawgh5hqu0jzu240alt6fyqjdsw77693yj6jts9qyyssq7mwl43wwss05dhq9ds3rgwlchuj6zfsxrlefxe3qjv8fsm63jgmqdqykcpud0fmpzelm3n0exskzdpsu5ww35r30mu7wynp0pjlmuhsp0p20yz"
```

- GET {HOST}/protected with appropriate LSAT in Authorization header (including preimage) will return the response from the protected route

_AUTHORIZATION EXAMPLE_

```

LSAT {macaroon}:{preimage}

LSAT AgEba25vd2xlZGdlLWdyYXBoLnNwaGlueC5jaGF0AoQBMDAwMGMzN2QzNjI0NTM3YmVkY2UxZThmYTdmM2Y5ZmVkNDYyMTU2MWJiMmJmODY2YWMzYjMzZmM1NDVjNmY3NjE3NzFhZWU5YmZlYzljOTRhMDI2MDU5ZWZlMzk2MTllNDVkY2Q1YWQ5OWI1Y2JjZDA4MzdlNDUzMjM5OGNiMmQyNjFiAAAGIIB-8uA1VZ5gb1rNaRjjFPfBqlF16JnnQd1fK-VuwebL:cb8779ec0e386c62acc88c409f0730707e643e306678b15018676177c7d336f9

```

- POST {HOST}/invoice with the following JSON body to get a new invoice (there is no relation to any lsat and so cannot be used for authentication): { "amount": 30 }

- GET {HOST}/invoice?id=[payment hash] returns information for invoice with given payment hash including payment status and payreq.
