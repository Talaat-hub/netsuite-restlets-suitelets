# NetSuite RESTlets & Suitelets

A NetSuite SuiteScript 2.1 project demonstrating a full RESTlet/Suitelet CRUD platform for a custom **Employee** record, two background-processing scripts, a **Sales Order** integration RESTlet, and a standalone Node/Express front end that consumes it over OAuth 1.0a Token-Based Authentication (TBA). Backed by a complete Jest unit-testing harness with hand-written mocks for every NetSuite `N/*` module used.

Built as a self-study project to practice SuiteScript RESTlet/Suitelet development, SuiteCloud (SDF) project structure, and test-driven development against the NetSuite API surface.

## What's in here

| Script | Type | Purpose |
|---|---|---|
| `rl_employee.js` | RESTlet | CRUD API for `customrecord_emp_mahmoud` — validation, field mapping, structured error handling |
| `sl_mt_employee_dashboard.js` | Suitelet | Server-rendered CRUD dashboard (list / create / edit / delete) for the Employee record |
| `EMP_Analytics/suitelet/sl_mt_emp_analytics.js` | Suitelet | KPI-card analytics dashboard with AG Grid + ECharts for employee data visualization |
| `mr_mt_mass_delete.js` | Map/Reduce | Bulk-delete Employee records in batches |
| `ss_employee_dedup.js` | Scheduled Script | Detects and merges duplicate Employee records by email/phone |
| `rl_mt_salesorder.js` | RESTlet | Create/list Sales Orders — the endpoint consumed by `salesorder-app/` |

### `salesorder-app/`

A self-contained Node/Express + vanilla JS application that talks to the Sales Order RESTlet above, with hand-rolled OAuth 1.0a (HMAC-SHA256) request signing for NetSuite Token-Based Authentication — see [`salesorder-app/README.md`](salesorder-app/README.md) for the full signing walkthrough, API reference, and setup steps.

## Testing

Every script has a matching Jest suite in `__tests__/`, run against a local mock layer (`__mocks__/`) that stands in for `N/record`, `N/search`, `N/query`, `N/ui/serverWidget`, `N/runtime`, `N/log`, and the rest of the NetSuite SuiteScript API — no live NetSuite account is required to run the tests.

```bash
npm install
npm test              # runs the full suite with coverage
```

CI runs the same suite on every push via [`.github/workflows/test.yml`](.github/workflows/test.yml).

## Project structure

```
src/
├── manifest.xml                          # SDF project manifest
├── deploy.xml                            # SDF deployment config
├── Objects/                              # Script/deployment record definitions (XML)
└── FileCabinet/SuiteScripts/
    ├── rl_employee.js
    ├── sl_mt_employee_dashboard.js
    ├── mr_mt_mass_delete.js
    ├── ss_employee_dedup.js
    ├── rl_mt_salesorder.js
    └── EMP_Analytics/suitelet/sl_mt_emp_analytics.js
salesorder-app/                            # Express + vanilla JS front end (see its own README)
__mocks__/                                  # Jest mocks for NetSuite N/* modules
__tests__/                                  # Jest test suites (one per script)
```

## Deploying to a NetSuite account

This is an SDF (SuiteCloud Development Framework) `ACCOUNTCUSTOMIZATION` project. With the [SuiteCloud CLI](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_157017623577.html) authenticated against your own account:

```bash
suitecloud project:deploy
```

This project references a custom record (`customrecord_emp_mahmoud`) that must already exist in the target account — the record definition itself isn't included here since custom records aren't exported as SDF objects the same way scripts are.

## Tech stack

SuiteScript 2.1 · N/record, N/search, N/query, N/ui/serverWidget, N/log, N/error, N/https, N/url · Jest 29 · Node/Express · OAuth 1.0a (TBA)

## Author

[Mahmoud Talaat](https://www.linkedin.com/in/mahmoudtalaat21/) — NetSuite / SuiteScript developer.

## License

MIT — see [LICENSE](LICENSE).
