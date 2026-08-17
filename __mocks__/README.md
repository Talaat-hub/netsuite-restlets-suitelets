# NetSuite Module Mocks for Jest Testing

A comprehensive collection of mocked NetSuite SuiteScript 2.x modules for unit testing with Jest.

## Quick Start

Copy the required mock files to your project's `__mocks__` folder (or configure moduleNameMapper in jest.config.js).

```javascript
// In your test file
const record = require('N/record');
const search = require('N/search');

// Set up test data using helpers
record.__setRecordValue(123, 'name', 'Test Record');
search.__setMockResults([{ id: '1', name: 'Result 1' }]);

// Run your tests
// ...

// Clean up after each test
afterEach(() => {
  record.__reset();
  search.__reset();
});
```

---

## Available Mocks

### N/cache
**File:** `cache.js`

| Method | Description |
|--------|-------------|
| `getCache(options)` | Returns a mock cache instance |

| Test Helper | Description |
|-------------|-------------|
| `__setCacheValue(cacheName, key, value)` | Pre-populate cache values |
| `__getCacheValue(cacheName, key)` | Get cached value for testing |
| `__getState()` | Get entire cache state |
| `__reset()` | Clear all cache data and mocks |

---

### N/config
**File:** `config.js`

| Method | Description |
|--------|-------------|
| `load({ type })` | Loads a configuration record |

| Test Helper | Description |
|-------------|-------------|
| `__setValue(type, fieldId, value)` | Set a config value |
| `__setValues(type, values)` | Set multiple config values |
| `__getState()` | Get all config state |
| `__reset()` | Clear all config data and mocks |

---

### N/currentRecord
**File:** `currentRecord.js`

| Method | Description |
|--------|-------------|
| `get()` | Returns the current client-side record |

| Test Helper | Description |
|-------------|-------------|
| `__setValue(fieldId, value)` | Set a field value |
| `__setValues(values)` | Set multiple field values |
| `__setSublistValue(sublistId, line, fieldId, value)` | Set sublist value |
| `__setSublistValues(sublistId, lines)` | Set entire sublist data |
| `__getState()` | Get record and sublist state |
| `__reset()` | Clear all record data and mocks |

---

### N/ui/dialog
**File:** `dialog.js`

| Method | Description |
|--------|-------------|
| `alert(options)` | Shows an alert dialog |
| `confirm(options)` | Shows a confirmation dialog |
| `prompt(options)` | Shows a prompt dialog |
| `create(options)` | Creates a custom dialog |

| Test Helper | Description |
|-------------|-------------|
| `__setConfirm(value)` | Set confirm dialog response |
| `__setPrompt(value)` | Set prompt dialog response |
| `__reject(error)` | Make dialogs reject with error |
| `__getHistory()` | Get dialog invocation history |
| `__getLastDialog()` | Get last dialog shown |
| `__reset()` | Clear all dialog state and mocks |

---

### N/encode
**File:** `encode.js`

| Method | Description |
|--------|-------------|
| `convert(options)` | Convert between encodings (UTF-8, Base64, HEX) |

**Supported conversions:** UTF-8 ↔ Base64, UTF-8 ↔ HEX, Base64 URL Safe

---

### N/error
**File:** `error.js`

| Method | Description |
|--------|-------------|
| `create(options)` | Creates a SuiteScript error |

**Exports:** `SuiteScriptError`, `UserEventError` classes for `instanceof` checks

---

### N/file
**File:** `file.js`

| Method | Description |
|--------|-------------|
| `create(options)` | Creates a new file |
| `load(options)` | Loads an existing file |
| `delete(options)` | Deletes a file |
| `copy(options)` | Copies a file |

| Test Helper | Description |
|-------------|-------------|
| `__setFile(id, fileData)` | Set file data for loading |
| `__setFileContents(id, contents)` | Set file contents |
| `__getFile(id)` | Get file data |
| `__getState()` | Get all file store state |
| `__reset()` | Clear all file data and mocks |

---

### N/format
**File:** `format.js`

| Method | Description |
|--------|-------------|
| `parse(options)` | Parse formatted value to native type |
| `format(options)` | Format native value to string |

**Supported Types:** DATE, DATETIME, INTEGER, FLOAT, CURRENCY, PERCENT, CHECKBOX, etc.

---

### N/http
**File:** `http.js`

| Method | Description |
|--------|-------------|
| `get/post/put/delete(options)` | HTTP methods |
| `request(options)` | Generic HTTP request |

| Test Helper | Description |
|-------------|-------------|
| `__setMockResponse(response)` | Set response (code, body, headers) |
| `__throwError(error)` | Make requests throw error |
| `__reset()` | Clear all HTTP state and mocks |

---

### N/https
**File:** `https.js`

| Method | Description |
|--------|-------------|
| `get/post/put/delete(options)` | HTTPS methods |
| `requestSuitelet/requestRestlet(options)` | Script requests |
| `createSecureString(options)` | Create secure string |
| `createSecureKey(options)` | Create secure key |
| `createHmac(options)` | Create HMAC |

| Test Helper | Description |
|-------------|-------------|
| `__setMockResponse(response)` | Set response (code, body, headers) |
| `__throwError(error)` | Make requests throw error |
| `__reset()` | Clear all HTTPS state and mocks |

---

### N/log
**File:** `log.js`

| Method | Description |
|--------|-------------|
| `debug/audit/error/emergency(options)` | Log methods |

| Test Helper | Description |
|-------------|-------------|
| `__getHistory()` | Get all log entries |
| `__getLastLog()` | Get most recent log |
| `__findLogs(filter)` | Find logs by level/title/details |
| `__reset()` | Clear all log history and mocks |

---

### N/ui/message
**File:** `message.js`

| Method | Description |
|--------|-------------|
| `create(options)` | Creates a UI message |

| Test Helper | Description |
|-------------|-------------|
| `__getHistory()` | Get message show/hide history |
| `__getLastMessage()` | Get last message action |
| `__reset()` | Clear all message state and mocks |

---

### N/query
**File:** `query.js`

| Method | Description |
|--------|-------------|
| `runSuiteQL(options)` | Run SuiteQL query |
| `runSuiteQLPaged(options)` | Run paged SuiteQL query |
| `create(options)` | Create query object |

| Test Helper | Description |
|-------------|-------------|
| `__setMockResults(results)` | Set query results array |
| `__setMockPagedCount(count)` | Set paged result count |
| `__getState()` | Get query state |
| `__reset()` | Clear all query state and mocks |

---

### N/record
**File:** `record.js`

| Method | Description |
|--------|-------------|
| `create(options)` | Create new record |
| `load(options)` | Load existing record |
| `copy(options)` | Copy a record |
| `transform(options)` | Transform record type |
| `delete(options)` | Delete a record |
| `submitFields(options)` | Submit field values |

| Test Helper | Description |
|-------------|-------------|
| `__setRecord(id, recordData)` | Set entire record data |
| `__setRecordValue(id, fieldId, value)` | Set single field value |
| `__setRecordSublist(id, sublistId, lines)` | Set sublist data |
| `__getRecord(id)` | Get record from store |
| `__getState()` | Get entire record store |
| `__reset()` | Clear all record data and mocks |

---

### N/redirect
**File:** `redirect.js`

| Method | Description |
|--------|-------------|
| `toRecord(options)` | Redirect to record |
| `toSuitelet(options)` | Redirect to Suitelet |
| `toTaskLink(options)` | Redirect to task link |
| `toRecordTransform(options)` | Redirect to transform |
| `toSavedSearch(options)` | Redirect to saved search |

| Test Helper | Description |
|-------------|-------------|
| `__getHistory()` | Get redirect history |
| `__getLastRedirect()` | Get last redirect |
| `__reset()` | Clear all redirect state and mocks |

---

### N/render
**File:** `render.js`

| Method | Description |
|--------|-------------|
| `create()` | Create template renderer |
| `xmlToPdf(options)` | Convert XML to PDF |
| `mergeEmail(options)` | Merge email template |
| `transaction(options)` | Render transaction |
| `statement(options)` | Render statement |

| Test Helper | Description |
|-------------|-------------|
| `__getHistory()` | Get render history |
| `__getLastRender()` | Get last render operation |
| `__reset()` | Clear all render state and mocks |

---

### N/runtime
**File:** `runtime.js`

| Method | Description |
|--------|-------------|
| `getCurrentScript()` | Get current script context |
| `getCurrentUser()` | Get current user context |
| `getCurrentSession()` | Get session object |
| `isFeatureInEffect(options)` | Check feature status |

| Test Helper | Description |
|-------------|-------------|
| `__setExecutionContext(context)` | Set execution context |
| `__setUser(userData)` | Set user data |
| `__setScriptParameter(name, value)` | Set script parameter |
| `__setScriptParameters(params)` | Set multiple parameters |
| `__setRemainingUsage(usage)` | Set governance remaining |
| `__setSession(name, value)` | Set session value |
| `__setFeature(feature, enabled)` | Set feature status |
| `__getState()` | Get runtime state |
| `__reset()` | Clear all runtime state and mocks |

---

### N/search
**File:** `search.js`

| Method | Description |
|--------|-------------|
| `create(options)` | Create search |
| `load(options)` | Load saved search |
| `lookupFields(options)` | Lookup field values |
| `createFilter(options)` | Create search filter |
| `createColumn(options)` | Create search column |

| Test Helper | Description |
|-------------|-------------|
| `__setMockResults(results)` | Set search results |
| `__addMockResult(result)` | Add single result |
| `__setLookupFields(type, id, fields)` | Set lookup data |
| `__saveSearch(id, searchData)` | Save search to store |
| `__getState()` | Get all search state |
| `__reset()` | Clear all search state and mocks |

---

### N/ui/serverWidget
**File:** `serverWidget.js`

| Method | Description |
|--------|-------------|
| `createForm(options)` | Create a form |
| `createList(options)` | Create a list |
| `createAssistant(options)` | Create an assistant |

**Form methods:** `addField`, `addSublist`, `addTab`, `addFieldGroup`, `addButton`, `addSubmitButton`

**Field methods:** `updateDisplayType`, `addSelectOption`, `setDefaultValue`, `setHelpText`

---

### N/task
**File:** `task.js`

| Method | Description |
|--------|-------------|
| `create(options)` | Create task (MR, Scheduled, etc.) |
| `checkStatus(options)` | Check task status |

| Test Helper | Description |
|-------------|-------------|
| `__setTaskStatus(taskId, status)` | Set task status |
| `__getTask(taskId)` | Get task data |
| `__getState()` | Get all task state |
| `__reset()` | Clear all task state and mocks |

---

### N/url
**File:** `url.js`

| Method | Description |
|--------|-------------|
| `resolveScript(options)` | Resolve Suitelet/Restlet URL |
| `resolveRecord(options)` | Resolve record URL |
| `resolveTaskLink(options)` | Resolve task link URL |
| `resolveDomain(options)` | Resolve domain |
| `format(options)` | Format URL with params |

| Test Helper | Description |
|-------------|-------------|
| `__setDomain(domain)` | Set base domain |
| `__reset()` | Clear all URL state and mocks |

---

## Best Practices

### 1. Reset mocks after each test
```javascript
afterEach(() => {
  record.__reset();
  search.__reset();
  runtime.__reset();
  // ... reset all used mocks
});
```

### 2. Set up test data in beforeEach
```javascript
beforeEach(() => {
  runtime.__setScriptParameter('custscript_param', 'test_value');
  record.__setRecord(123, {
    type: 'customer',
    fields: { companyname: 'Test Co' }
  });
});
```

### 3. Verify mock calls
```javascript
expect(record.load).toHaveBeenCalledWith({
  type: 'customer',
  id: 123
});
expect(search.create).toHaveBeenCalledTimes(1);
```

### 4. Use test helpers for complex scenarios
```javascript
// Set up search results
search.__setMockResults([
  { id: '1', companyname: 'Customer A' },
  { id: '2', companyname: 'Customer B' }
]);

// Verify log output
log.__findLogs({ level: 'ERROR' }).forEach(entry => {
  console.log(entry.title, entry.details);
});
```

---

## TypeScript Version

Coming soon! TypeScript versions with full type definitions.

---

## License

MIT - Use freely in your NetSuite projects.