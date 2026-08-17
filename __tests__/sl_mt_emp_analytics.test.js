// ---- STEP 1: Mock the N/ modules ----
jest.mock('N/ui/serverWidget');
jest.mock('N/search');
jest.mock('N/record');
jest.mock('N/runtime');
jest.mock('N/log');
jest.mock('N/url');

// ---- STEP 2: Import the mocked modules ----
const serverWidget = require('N/ui/serverWidget');
const search = require('N/search');
const record = require('N/record');
const runtime = require('N/runtime');
const log = require('N/log');
const nsUrl = require('N/url');

// ---- STEP 3: Declare entry point ----
let onRequest;

// ---- STEP 4: Load the script via global.define ----
beforeAll(() => {
    global.define = (deps, factory) => {
        const module = factory(serverWidget, search, record, runtime, log, nsUrl);
        onRequest = module.onRequest;
    };
    global.log = log;
    require('../src/FileCabinet/SuiteScripts/EMP_Analytics/suitelet/sl_mt_emp_analytics');
});

// ---- STEP 5: Clear mocks before each test ----
beforeEach(() => {
    jest.clearAllMocks();
    nsUrl.resolveScript.mockReturnValue('/app/site/hosting/scriptlet.nl?script=1&deploy=1');
    runtime.getCurrentUser.mockReturnValue({ id: 1, name: 'Test User' });
    runtime.getCurrentScript.mockReturnValue({ id: 'customscript_test', deploymentId: 'customdeploy_test' });
});

// ---- Helpers ----

const mockGetContext = (params = {}) => ({
    request: {
        method: 'GET',
        parameters: params,
    },
    response: {
        write: jest.fn(),
        writePage: jest.fn(),
        setHeader: jest.fn(),
    },
});

const mockSearchResults = (rows) => {
    search.create.mockReturnValue({
        run: jest.fn(() => ({
            each: jest.fn((callback) => {
                rows.forEach(row => {
                    callback({
                        id: row.id,
                        getValue: jest.fn(({ name }) => row[name] || ''),
                    });
                });
            }),
        })),
    });
};

// ─── GET — Render Dashboard ───

describe('GET - Render Dashboard', () => {
    it('should render the dashboard with inline HTML', () => {
        const ctx = mockGetContext({});
        onRequest(ctx);

        expect(serverWidget.createForm).toHaveBeenCalledWith({ title: ' ' });
        expect(ctx.response.writePage).toHaveBeenCalled();
    });

    it('should add an INLINEHTML field for dashboard content', () => {
        const ctx = mockGetContext({});
        onRequest(ctx);

        const form = serverWidget.createForm.mock.results[0].value;
        expect(form.addField).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'custpage_dashboard_html',
                type: serverWidget.FieldType.INLINEHTML,
            })
        );
    });
});

// ─── AJAX — getData ───

describe('AJAX - getData', () => {
    it('should return employees and KPIs as JSON', () => {
        mockSearchResults([
            { id: '1', name: 'Mahmoud', custrecord_emp_mahmoud_email: 'mahmoud@test.com', custrecord_emp_mahmoud_jobtitle: 'Developer' },
            { id: '2', name: 'Ahmed', custrecord_emp_mahmoud_email: 'ahmed@test.com', custrecord_emp_mahmoud_jobtitle: 'Designer' },
        ]);

        const ctx = mockGetContext({ action: 'getData' });
        onRequest(ctx);

        expect(ctx.response.setHeader).toHaveBeenCalledWith({ name: 'Content-Type', value: 'application/json' });
        expect(ctx.response.write).toHaveBeenCalled();

        const result = JSON.parse(ctx.response.write.mock.calls[0][0]);
        expect(result.success).toBe(true);
        expect(result.employees).toHaveLength(2);
        expect(result.kpis.total).toBe(2);
    });

    it('should compute correct KPIs', () => {
        mockSearchResults([
            { id: '1', name: 'Mahmoud', custrecord_emp_mahmoud_email: 'mahmoud@test.com', custrecord_emp_mahmoud_jobtitle: 'Developer' },
            { id: '2', name: 'Ahmed', custrecord_emp_mahmoud_email: '', custrecord_emp_mahmoud_jobtitle: 'Developer' },
            { id: '3', name: 'Sara', custrecord_emp_mahmoud_email: 'sara@test.com', custrecord_emp_mahmoud_jobtitle: 'Manager' },
        ]);

        const ctx = mockGetContext({ action: 'getData' });
        onRequest(ctx);

        const result = JSON.parse(ctx.response.write.mock.calls[0][0]);
        expect(result.kpis.total).toBe(3);
        expect(result.kpis.jobTitles).toEqual({ Developer: 2, Manager: 1 });
        expect(result.kpis.completeness).toBe('66.7');
    });

    it('should handle empty employee list', () => {
        mockSearchResults([]);

        const ctx = mockGetContext({ action: 'getData' });
        onRequest(ctx);

        const result = JSON.parse(ctx.response.write.mock.calls[0][0]);
        expect(result.success).toBe(true);
        expect(result.employees).toHaveLength(0);
        expect(result.kpis.total).toBe(0);
        expect(result.kpis.completeness).toBe('0.0');
    });

    it('should handle search errors gracefully', () => {
        search.create.mockImplementation(() => { throw new Error('Search failed'); });

        const ctx = mockGetContext({ action: 'getData' });
        onRequest(ctx);

        const result = JSON.parse(ctx.response.write.mock.calls[0][0]);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Search failed');
    });
});

// ─── AJAX — getEmployee ───

describe('AJAX - getEmployee', () => {
    it('should return single employee details', () => {
        const mockRec = {
            getValue: jest.fn((opts) => {
                const map = { name: 'Mahmoud', custrecord_emp_mahmoud_email: 'mahmoud@test.com' };
                return map[opts.fieldId] || '';
            }),
            getText: jest.fn((opts) => {
                const map = { name: 'Mahmoud', custrecord_emp_mahmoud_email: 'mahmoud@test.com' };
                return map[opts.fieldId] || '';
            }),
        };
        record.load.mockReturnValue(mockRec);

        const ctx = mockGetContext({ action: 'getEmployee', empId: '1' });
        onRequest(ctx);

        const result = JSON.parse(ctx.response.write.mock.calls[0][0]);
        expect(result.success).toBe(true);
        expect(result.employee.name).toBe('Mahmoud');
        expect(record.load).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', id: 1 });
    });

    it('should return error when empId is missing', () => {
        const ctx = mockGetContext({ action: 'getEmployee' });
        onRequest(ctx);

        const result = JSON.parse(ctx.response.write.mock.calls[0][0]);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Missing empId');
    });

    it('should handle record load failure', () => {
        record.load.mockImplementation(() => { throw new Error('Record not found'); });

        const ctx = mockGetContext({ action: 'getEmployee', empId: '999' });
        onRequest(ctx);

        const result = JSON.parse(ctx.response.write.mock.calls[0][0]);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Record not found');
    });
});

// ─── AJAX — deleteEmployee ───

describe('AJAX - deleteEmployee', () => {
    it('should delete an employee and return success', () => {
        record.delete.mockReturnValue(1);

        const ctx = mockGetContext({ action: 'deleteEmployee', empId: '1' });
        onRequest(ctx);

        const result = JSON.parse(ctx.response.write.mock.calls[0][0]);
        expect(result.success).toBe(true);
        expect(result.id).toBe(1);
        expect(record.delete).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', id: 1 });
    });

    it('should return error when empId is missing', () => {
        const ctx = mockGetContext({ action: 'deleteEmployee' });
        onRequest(ctx);

        const result = JSON.parse(ctx.response.write.mock.calls[0][0]);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Missing empId');
    });

    it('should handle record delete failure', () => {
        record.delete.mockImplementation(() => { throw new Error('Record not found'); });

        const ctx = mockGetContext({ action: 'deleteEmployee', empId: '999' });
        onRequest(ctx);

        const result = JSON.parse(ctx.response.write.mock.calls[0][0]);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Record not found');
    });
});

// ─── Error Handling ───

describe('Error handling', () => {
    it('should catch and display errors in onRequest', () => {
        serverWidget.createForm.mockImplementation(() => { throw new Error('Form creation failed'); });

        const ctx = mockGetContext({});
        onRequest(ctx);

        expect(ctx.response.write).toHaveBeenCalledWith(expect.stringContaining('Form creation failed'));
    });
});
