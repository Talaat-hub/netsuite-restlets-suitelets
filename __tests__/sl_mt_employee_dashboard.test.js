// ---- STEP 1: Mock the N/ modules ----
jest.mock('N/ui/serverWidget');
jest.mock('N/record');
jest.mock('N/search');
jest.mock('N/log');
jest.mock('N/redirect');
jest.mock('N/url');
jest.mock('N/format');

// ---- STEP 2: Import the mocked modules ----
const serverWidget = require('N/ui/serverWidget');
const record = require('N/record');
const search = require('N/search');
const log = require('N/log');
const redirect = require('N/redirect');
const nsUrl = require('N/url');
const format = require('N/format');

// ---- STEP 3: Declare entry point ----
let onRequest;

// ---- STEP 4: Load the script via global.define ----
beforeAll(() => {
    global.define = (deps, factory) => {
        const module = factory(serverWidget, record, search, log, redirect, nsUrl, format);
        onRequest = module.onRequest;
    };
    global.log = log;
    require('../src/FileCabinet/SuiteScripts/sl_mt_employee_dashboard');
});

// ---- STEP 5: Clear mocks before each test ----
beforeEach(() => {
    jest.clearAllMocks();
    nsUrl.resolveScript.mockReturnValue('/app/site/hosting/scriptlet.nl?script=1&deploy=1');
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
    },
});

const mockPostContext = (params = {}) => ({
    request: {
        method: 'POST',
        parameters: params,
    },
    response: {
        write: jest.fn(),
        writePage: jest.fn(),
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

// ─── GET — List View (Dashboard) ───

describe('GET - List view', () => {
    it('should render the dashboard with employee sublist', () => {
        mockSearchResults([
            { id: '1', name: 'Mahmoud', custrecord_emp_mahmoud_email: 'mahmoud@test.com' },
            { id: '2', name: 'Ahmed', custrecord_emp_mahmoud_email: 'ahmed@test.com' },
        ]);

        const ctx = mockGetContext({});
        onRequest(ctx);

        expect(serverWidget.createForm).toHaveBeenCalledWith({ title: 'Employee Dashboard' });
        expect(ctx.response.writePage).toHaveBeenCalled();
    });

    it('should add a New Employee button', () => {
        mockSearchResults([]);
        const ctx = mockGetContext({});
        onRequest(ctx);

        const form = serverWidget.createForm.mock.results[0].value;
        expect(form.addButton).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'custpage_btn_create', label: 'New Employee' })
        );
    });

    it('should add a sublist with columns', () => {
        mockSearchResults([]);
        const ctx = mockGetContext({});
        onRequest(ctx);

        const form = serverWidget.createForm.mock.results[0].value;
        expect(form.addSublist).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'custpage_emp_list', label: 'Employees' })
        );
    });
});

// ─── GET — Create Form ───

describe('GET - Create form', () => {
    it('should show a create form with fields', () => {
        const ctx = mockGetContext({ action: 'create' });
        onRequest(ctx);

        expect(serverWidget.createForm).toHaveBeenCalledWith({ title: 'Create Employee' });
        const form = serverWidget.createForm.mock.results[0].value;
        expect(form.addSubmitButton).toHaveBeenCalledWith({ label: 'Save' });
        expect(ctx.response.writePage).toHaveBeenCalled();
    });

    it('should add hidden action field set to create', () => {
        const ctx = mockGetContext({ action: 'create' });
        onRequest(ctx);

        const form = serverWidget.createForm.mock.results[0].value;
        expect(form.addField).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'custpage_action' })
        );
    });
});

// ─── GET — Edit Form ───

describe('GET - Edit form', () => {
    it('should load the record and pre-fill the form', () => {
        const mockRec = record.create({ type: 'customrecord_emp_mahmoud' });
        mockRec.getValue.mockReturnValue('Mahmoud');
        record.load.mockReturnValue(mockRec);

        const ctx = mockGetContext({ action: 'edit', recId: '42' });
        onRequest(ctx);

        expect(serverWidget.createForm).toHaveBeenCalledWith({ title: 'Edit Employee' });
        expect(record.load).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', id: 42 });
        const form = serverWidget.createForm.mock.results[0].value;
        expect(form.addSubmitButton).toHaveBeenCalledWith({ label: 'Update' });
    });
});

// ─── GET — View ───

describe('GET - View record', () => {
    it('should load and display record fields as inline', () => {
        const mockRec = record.create({ type: 'customrecord_emp_mahmoud' });
        mockRec.getValue.mockReturnValue('Mahmoud');
        record.load.mockReturnValue(mockRec);

        const ctx = mockGetContext({ action: 'view', recId: '10' });
        onRequest(ctx);

        expect(serverWidget.createForm).toHaveBeenCalledWith({ title: 'View Employee' });
        expect(record.load).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', id: 10 });
        expect(ctx.response.writePage).toHaveBeenCalled();
    });
});

// ─── GET — Delete Confirm ───

describe('GET - Delete confirmation', () => {
    it('should show a confirm delete page', () => {
        const mockRec = record.create({ type: 'customrecord_emp_mahmoud' });
        mockRec.getValue.mockReturnValue('Mahmoud');
        record.load.mockReturnValue(mockRec);

        const ctx = mockGetContext({ action: 'delete', recId: '5' });
        onRequest(ctx);

        expect(serverWidget.createForm).toHaveBeenCalledWith({ title: 'Confirm Delete' });
        expect(ctx.response.writePage).toHaveBeenCalled();
    });
});

// ─── POST — Create ───

describe('POST - Create record', () => {
    it('should create a new record and redirect', () => {
        const mockRec = record.create({ type: 'customrecord_emp_mahmoud' });
        mockRec.save.mockReturnValue(101);
        record.create.mockReturnValue(mockRec);

        const ctx = mockPostContext({
            custpage_action: 'create',
            custpage_name: 'New Employee',
            custpage_email: 'new@test.com',
        });
        onRequest(ctx);

        expect(record.create).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', isDynamic: true });
        expect(mockRec.setValue).toHaveBeenCalledWith({ fieldId: 'name', value: 'New Employee' });
        expect(mockRec.save).toHaveBeenCalled();
        expect(redirect.toSuitelet).toHaveBeenCalled();
    });
});

// ─── POST — Edit ───

describe('POST - Update record', () => {
    it('should load, update, save and redirect', () => {
        const mockRec = record.create({ type: 'customrecord_emp_mahmoud', id: 42 });
        mockRec.save.mockReturnValue(42);
        record.load.mockReturnValue(mockRec);

        const ctx = mockPostContext({
            custpage_action: 'edit',
            custpage_rec_id: '42',
            custpage_name: 'Updated Name',
        });
        onRequest(ctx);

        expect(record.load).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', id: 42, isDynamic: true });
        expect(mockRec.setValue).toHaveBeenCalledWith({ fieldId: 'name', value: 'Updated Name' });
        expect(mockRec.save).toHaveBeenCalled();
        expect(redirect.toSuitelet).toHaveBeenCalled();
    });
});

// ─── POST — Delete ───

describe('POST - Delete record', () => {
    it('should delete the record and redirect', () => {
        const ctx = mockPostContext({
            custpage_action: 'delete',
            custpage_rec_id: '55',
        });
        onRequest(ctx);

        expect(record.delete).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', id: 55 });
        expect(redirect.toSuitelet).toHaveBeenCalled();
    });
});

// ─── Error handling ───

describe('Error handling', () => {
    it('should write error message when an exception occurs', () => {
        record.load.mockImplementation(() => { throw new Error('Record not found'); });

        const ctx = mockGetContext({ action: 'view', recId: '999' });
        onRequest(ctx);

        expect(ctx.response.write).toHaveBeenCalledWith(
            expect.stringContaining('Record not found')
        );
    });
});
