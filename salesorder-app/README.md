# NetSuite Sales Order — Express + Vanilla JS

A self-contained Node/Express app that creates and lists **NetSuite Sales Orders** through a SuiteScript 2.1 RESTlet, authenticated via **Token-Based Authentication (TBA / OAuth 1.0a HMAC-SHA256)**.

```
salesorder-app/
├── server.js                 ← entry point
├── package.json
├── .env.example              ← copy to .env and fill in
├── config/
│   ├── env.js                ← env loader + validator
│   └── netsuiteClient.js     ← TBA OAuth1 signing + axios wrapper
├── controllers/
│   └── ordersController.js
├── middleware/
│   ├── validateOrder.js
│   └── errorHandler.js
├── routes/
│   └── orders.js
└── public/                   ← frontend (served by express.static)
    ├── index.html
    ├── styles.css
    └── app.js
```

The matching SuiteScript RESTlet lives in the parent SDF project:
- Source: [src/FileCabinet/SuiteScripts/rl_mt_salesorder.js](../src/FileCabinet/SuiteScripts/rl_mt_salesorder.js)
- Object: [src/Objects/customscript_rl_mt_salesorder.xml](../src/Objects/customscript_rl_mt_salesorder.xml)

## 1 · Deploy the RESTlet

From the SDF project root:

```powershell
suitecloud project:deploy
```

After deployment, open **Customisation → Scripting → Script Deployments** and copy the script id and deployment id (already pinned in the XML to `customscript_rl_mt_salesorder` / `customdeploy_rl_mt_salesorder`).

## 2 · Create a TBA token

In NetSuite:

1. **Setup → Company → Enable Features → SuiteCloud** — enable *Token-Based Authentication*.
2. **Setup → Integration → Manage Integrations → New** — disable everything except *Token-Based Authentication*. Save and copy `Consumer Key` / `Consumer Secret`.
3. **Setup → Users/Roles → Access Tokens → New** — pick the integration, the user, and a role with permission on Sales Orders + the RESTlet. Copy `Token Id` / `Token Secret`.

## 3 · Configure & run

```powershell
cd salesorder-app
copy .env.example .env       # then edit .env with your real credentials
npm install
npm start                    # or:  npm run dev   (uses Node --watch)
```

Open `http://localhost:3000`.

## 4 · API

| Method | Path                 | Body / Query                                    | Description |
|--------|----------------------|-------------------------------------------------|-------------|
| GET    | `/api/health`        | —                                               | Liveness |
| GET    | `/api/orders`        | `?limit=25&offset=0`                            | Recent Sales Orders |
| GET    | `/api/orders/:id`    | —                                               | Single SO with line items |
| POST   | `/api/orders`        | `{ entity, items:[{item,quantity,rate?}], memo? }` | Create SO |

`entity` and `item` are NetSuite **internal ids** (numbers).

### Example payload

```json
{
  "entity": 87,
  "memo": "Web order #1024",
  "items": [
    { "item": 232, "quantity": 2, "rate": 49.99 },
    { "item": 245, "quantity": 1 }
  ]
}
```

## 5 · How TBA signing works (`config/netsuiteClient.js`)

OAuth 1.0a with HMAC-SHA256 — every request is signed:

1. Collect all params (query string + `oauth_*`) and percent-encode (RFC 3986).
2. Sort by key, join as `k=v&k=v`.
3. Build base string: `METHOD & encodedURL & encodedParams`.
4. Build signing key: `consumerSecret & tokenSecret` (each URL-encoded).
5. `signature = base64(HMAC_SHA256(baseString, signingKey))`.
6. Send `Authorization: OAuth realm="<ACCOUNT_ID>", oauth_consumer_key=…, oauth_token=…, oauth_signature_method="HMAC-SHA256", oauth_timestamp=…, oauth_nonce=…, oauth_version="1.0", oauth_signature="…"`.

Notes:
- The realm uses the account id in **original casing** (e.g. `TSTDRV1234567`).
- The host derives from the account id, lowercased with underscores → hyphens: `tstdrv1234567.restlets.api.netsuite.com`.
- The JSON request body is **not** included in the OAuth base string.

## 6 · Troubleshooting

| Error | Likely cause |
|---|---|
| `401 USER_ERROR INVALID_LOGIN` | Wrong consumer/token, wrong realm casing, or system clock skew. |
| `403 INSUFFICIENT_PERMISSION` | Role on the access token can't create Sales Orders or run the RESTlet. |
| `404 SCRIPT_NOT_DEPLOYED` | `NS_RESTLET_SCRIPT_ID` / `NS_RESTLET_DEPLOY_ID` mismatch or status not RELEASED. |
| `INVALID_KEY_OR_REF` (entity/item) | The internal id supplied does not exist in this account. |
