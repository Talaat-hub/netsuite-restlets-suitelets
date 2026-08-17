// ---- STEP 1: Mock the N/ modules ----
jest.mock('N/record');
jest.mock('N/search');
jest.mock('N/log');
jest.mock('N/error');
jest.mock('N/https');
jest.mock('N/url');

// ---- STEP 2: Import the mocked modules ----
const record = require('N/record');
const search = require('N/search');
const log = require('N/log');
const error = require('N/error');
const https = require('N/https');
const nsUrl = require('N/url');

// ---- STEP 3: Declare entry point variables ----
let get, post, put, doDelete;

// ---- STEP 4: Load the script via global.define ----
beforeAll(() => {
    global.define = (deps, factory) => {
        const module = factory(record, search, log, error, https, nsUrl);
        get = module.get;
        post = module.post;
        put = module.put;
        doDelete = module.delete;
    };
    global.log = log;
    require('../src/FileCabinet/SuiteScripts/rl_employee');
});

// ---- STEP 5: Clear mocks before each test ----
beforeEach(() => {
    jest.clearAllMocks();
});

// ---- Helper: mock runPaged for list tests ----
const mockPagedSearch = (rows) => {
    const mockPage = {
        data: rows.map(row => ({
            id: row.id,
            getValue: jest.fn(({ name }) => row[name] || ''),
        })),
    };
    const mockPagedData = {
        pageRanges: [{ index: 0 }],
        fetch: jest.fn(() => mockPage),
    };
    const mockSearch = {
        runPaged: jest.fn(() => mockPagedData),
    };
    search.create.mockReturnValue(mockSearch);
    return mockSearch;
};

// ─── GET ───

describe('GET - getById', () => {
    it('should load a record by id and return mapped fields', () => {
        const mockRec = record.create({ type: 'customrecord_emp_mahmoud', id: 42 });
        mockRec.getValue.mockImplementation(({ fieldId }) => {
            const data = {
                name: 'Mahmoud',
                custrecord_emp_mahmoud_email: 'mahmoud@test.com',
                custrecord_emp_mahmoud_jobtitle: 'Consultant',
            };
            return data[fieldId] || '';
        });
        record.load.mockReturnValue(mockRec);

        const result = get({ id: '42' });

        expect(record.load).toHaveBeenCalledWith({
            type: 'customrecord_emp_mahmoud',
            id: 42,
        });
        expect(result.id).toBe(42);
        expect(result.name).toBe('Mahmoud');
        expect(result.email).toBe('mahmoud@test.com');
        expect(result.jobTitle).toBe('Consultant');
    });

    it('should return error object when record.load fails', () => {
        record.load.mockImplementation(() => { throw new Error('Record not found'); });

        const result = get({ id: '999' });

        expect(result.error).toBeDefined();
        expect(result.error.message).toContain('Record not found');
    });
});

describe('GET - list with pagination', () => {
    it('should return paginated results', () => {
        mockPagedSearch([
            { id: '1', name: 'Mahmoud' },
            { id: '2', name: 'Ahmed' },
            { id: '3', name: 'Ali' },
        ]);

        const result = get({ limit: '2', offset: '0' });

        expect(result.limit).toBe(2);
        expect(result.offset).toBe(0);
        expect(result.count).toBe(2);
        expect(result.results).toHaveLength(2);
    });

    it('should skip records based on offset', () => {
        mockPagedSearch([
            { id: '1', name: 'Mahmoud' },
            { id: '2', name: 'Ahmed' },
            { id: '3', name: 'Ali' },
        ]);

        const result = get({ limit: '10', offset: '1' });

        expect(result.offset).toBe(1);
        expect(result.count).toBe(2);
        expect(result.results[0].id).toBe('2');
    });

    it('should default limit to 50 and offset to 0', () => {
        mockPagedSearch([]);

        const result = get({});

        expect(result.limit).toBe(50);
        expect(result.offset).toBe(0);
    });

    it('should pass filters when query params are provided', () => {
        mockPagedSearch([]);

        get({ name: 'Mahmoud' });

        expect(search.createFilter).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'name' })
        );
    });
});

// ─── POST ───

describe('POST - create record', () => {
    it('should create a new record with provided fields', () => {
        const mockRec = record.create({ type: 'customrecord_emp_mahmoud' });
        mockRec.save.mockReturnValue(101);
        record.create.mockReturnValue(mockRec);

        const result = post({
            name: 'Mahmoud',
            email: 'mahmoud@test.com',
            jobTitle: 'Consultant',
            phone: '+201234567890',
        });

        expect(record.create).toHaveBeenCalledWith({
            type: 'customrecord_emp_mahmoud',
            isDynamic: true,
        });
        expect(mockRec.setValue).toHaveBeenCalledWith({
            fieldId: 'name', value: 'Mahmoud',
        });
        expect(mockRec.save).toHaveBeenCalled();
        expect(result).toEqual({ id: 101 });
    });

    it('should return error when name is missing', () => {
        const result = post({ email: 'test@test.com' });

        expect(result.error).toBeDefined();
        expect(result.error.code).toBe('VALIDATION_ERROR');
        expect(result.error.message).toContain('name is required');
    });

    it('should return error for invalid email format', () => {
        const result = post({ name: 'Mahmoud', email: 'not-an-email' });

        expect(result.error).toBeDefined();
        expect(result.error.message).toContain('Invalid email format');
    });
});

// ─── PUT ───

describe('PUT - update record', () => {
    it('should load and update an existing record', () => {
        const mockRec = record.create({ type: 'customrecord_emp_mahmoud', id: 42 });
        mockRec.save.mockReturnValue(42);
        record.load.mockReturnValue(mockRec);

        const result = put({
            id: 42,
            name: 'Mahmoud Updated',
            jobTitle: 'Senior Consultant',
        });

        expect(record.load).toHaveBeenCalledWith({
            type: 'customrecord_emp_mahmoud',
            id: 42,
            isDynamic: true,
        });
        expect(mockRec.setValue).toHaveBeenCalledWith({
            fieldId: 'name', value: 'Mahmoud Updated',
        });
        expect(mockRec.save).toHaveBeenCalled();
        expect(result).toEqual({ id: 42 });
    });

    it('should return error when id is missing', () => {
        const result = put({ name: 'No ID' });

        expect(result.error).toBeDefined();
        expect(result.error.code).toBe('MISSING_ID');
    });

    it('should return error for invalid email on update', () => {
        const result = put({ id: 1, email: 'bad-email' });

        expect(result.error).toBeDefined();
        expect(result.error.message).toContain('Invalid email format');
    });
});

// ─── DELETE ───

describe('DELETE - delete record', () => {
    it('should delete a record by id', () => {
        record.delete.mockReturnValue(55);

        const result = doDelete({ id: 55 });

        expect(record.delete).toHaveBeenCalledWith({
            type: 'customrecord_emp_mahmoud',
            id: 55,
        });
        expect(result).toEqual({ id: 55 });
    });

    it('should return error when id is missing', () => {
        const result = doDelete({});

        expect(result.error).toBeDefined();
        expect(result.error.code).toBe('MISSING_ID');
    });

    it('should return error when record.delete fails', () => {
        record.delete.mockImplementation(() => { throw new Error('Record does not exist'); });

        const result = doDelete({ id: 999 });

        expect(result.error).toBeDefined();
        expect(result.error.message).toContain('Record does not exist');
    });
});
