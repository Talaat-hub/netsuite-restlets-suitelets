// ---- STEP 1: Mock the N/ modules ----
jest.mock('N/search');
jest.mock('N/record');
jest.mock('N/log');
jest.mock('N/runtime');

// ---- STEP 2: Import the mocked modules ----
const search = require('N/search');
const record = require('N/record');
const log = require('N/log');
const runtime = require('N/runtime');

// ---- STEP 3: Declare entry point variable ----
let execute;

// ---- STEP 4: Load the script via global.define ----
beforeAll(() => {
    global.define = (deps, factory) => {
        const module = factory(search, record, log, runtime);
        execute = module.execute;
    };
    global.log = log;
    require('../src/FileCabinet/SuiteScripts/ss_employee_dedup');
});

// ---- STEP 5: Clear mocks before each test ----
beforeEach(() => {
    jest.clearAllMocks();
    // Default: plenty of governance
    runtime.getCurrentScript.mockReturnValue({
        getRemainingUsage: jest.fn(() => 10000),
    });
});

// ---- Helper: mock paged search results ----
const mockPagedSearch = (rows) => {
    const mockPage = {
        data: rows.map(row => ({
            getValue: jest.fn((col) => {
                if (col === 'internalid') return row.id;
                if (col === 'custrecord_emp_mahmoud_email') return row.email;
                if (col === 'custrecord_emp_mahmoud_phone') return row.phone;
                return '';
            }),
        })),
    };
    const mockPagedData = {
        pageRanges: [{ index: 0 }],
        fetch: jest.fn(() => mockPage),
    };
    search.create.mockReturnValue({
        runPaged: jest.fn(() => mockPagedData),
    });
};

// ─── TESTS ───

describe('Scheduled Script - Employee Dedup', () => {

    describe('No duplicates', () => {
        it('should log "No duplicates found" when all records are unique', () => {
            mockPagedSearch([
                { id: '1', email: 'a@example.com', phone: '+201000000001' },
                { id: '2', email: 'b@example.com', phone: '+201000000002' },
                { id: '3', email: 'c@example.com', phone: '+201000000003' },
            ]);

            execute({});

            expect(record.delete).not.toHaveBeenCalled();
            expect(log.audit).toHaveBeenCalledWith('DEDUP_COMPLETE', 'No duplicates found. Nothing to delete.');
        });
    });

    describe('With duplicates', () => {
        it('should delete duplicate records keeping the lowest ID', () => {
            mockPagedSearch([
                { id: '1', email: 'a@example.com', phone: '+201000000001' },
                { id: '5', email: 'a@example.com', phone: '+201000000001' },
                { id: '9', email: 'a@example.com', phone: '+201000000001' },
                { id: '2', email: 'b@example.com', phone: '+201000000002' },
            ]);

            execute({});

            // Should delete IDs 5 and 9 (duplicates of 1), keep 1
            expect(record.delete).toHaveBeenCalledTimes(2);
            expect(record.delete).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', id: '5' });
            expect(record.delete).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', id: '9' });
        });

        it('should handle multiple duplicate groups', () => {
            mockPagedSearch([
                { id: '1', email: 'a@example.com', phone: '+201000000001' },
                { id: '2', email: 'a@example.com', phone: '+201000000001' },
                { id: '3', email: 'b@example.com', phone: '+201000000002' },
                { id: '4', email: 'b@example.com', phone: '+201000000002' },
            ]);

            execute({});

            expect(record.delete).toHaveBeenCalledTimes(2);
            expect(record.delete).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', id: '2' });
            expect(record.delete).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', id: '4' });
        });

        it('should match duplicates case-insensitively on email', () => {
            mockPagedSearch([
                { id: '1', email: 'Ahmed@example.com', phone: '+201000000001' },
                { id: '2', email: 'ahmed@example.com', phone: '+201000000001' },
            ]);

            execute({});

            expect(record.delete).toHaveBeenCalledTimes(1);
            expect(record.delete).toHaveBeenCalledWith({ type: 'customrecord_emp_mahmoud', id: '2' });
        });
    });

    describe('Duplicate criteria', () => {
        it('should NOT treat same email but different phone as duplicates', () => {
            mockPagedSearch([
                { id: '1', email: 'a@example.com', phone: '+201000000001' },
                { id: '2', email: 'a@example.com', phone: '+201000000099' },
            ]);

            execute({});

            expect(record.delete).not.toHaveBeenCalled();
        });

        it('should NOT treat same phone but different email as duplicates', () => {
            mockPagedSearch([
                { id: '1', email: 'a@example.com', phone: '+201000000001' },
                { id: '2', email: 'z@example.com', phone: '+201000000001' },
            ]);

            execute({});

            expect(record.delete).not.toHaveBeenCalled();
        });
    });

    describe('Governance', () => {
        it('should stop early when governance is low', () => {
            let callCount = 0;
            runtime.getCurrentScript.mockReturnValue({
                getRemainingUsage: jest.fn(() => {
                    callCount++;
                    // First call: enough, second call: too low
                    return callCount <= 1 ? 10000 : 30;
                }),
            });

            mockPagedSearch([
                { id: '1', email: 'a@example.com', phone: '+201000000001' },
                { id: '2', email: 'a@example.com', phone: '+201000000001' },
                { id: '3', email: 'a@example.com', phone: '+201000000001' },
            ]);

            execute({});

            // Only deletes 1 before governance runs out
            expect(record.delete).toHaveBeenCalledTimes(1);
            expect(log.audit).toHaveBeenCalledWith('GOVERNANCE_LIMIT', expect.stringContaining('Stopping early'));
        });
    });

    describe('Error handling', () => {
        it('should continue when a single delete fails', () => {
            mockPagedSearch([
                { id: '1', email: 'a@example.com', phone: '+201000000001' },
                { id: '2', email: 'a@example.com', phone: '+201000000001' },
                { id: '3', email: 'a@example.com', phone: '+201000000001' },
            ]);

            record.delete
                .mockImplementationOnce(() => { throw new Error('Permission denied'); })
                .mockImplementationOnce(() => true);

            execute({});

            expect(record.delete).toHaveBeenCalledTimes(2);
            expect(log.error).toHaveBeenCalledWith('errDeleteSingle', expect.stringContaining('Permission denied'));
        });

        it('should log audit on empty record set', () => {
            mockPagedSearch([]);

            execute({});

            expect(record.delete).not.toHaveBeenCalled();
            expect(log.audit).toHaveBeenCalledWith('DEDUP_LOADED', 'Total records found: 0');
        });
    });
});
