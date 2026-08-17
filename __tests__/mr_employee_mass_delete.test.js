// ---- STEP 1: Mock the N/ modules ----
jest.mock('N/search');
jest.mock('N/record');
jest.mock('N/runtime');
jest.mock('N/log');

// ---- STEP 2: Import the mocked modules ----
const search = require('N/search');
const record = require('N/record');
const runtime = require('N/runtime');
const log = require('N/log');

// ---- STEP 3: Declare entry point variables ----
let getInputData, map, summarize;

// ---- STEP 4: Load the script via global.define ----
beforeAll(() => {
    global.define = (deps, factory) => {
        const module = factory(search, record, runtime, log);
        getInputData = module.getInputData;
        map = module.map;
        summarize = module.summarize;
    };
    global.log = log;
    require('../src/FileCabinet/SuiteScripts/mr_mt_mass_delete');
});

// ---- STEP 5: Clear mocks before each test ----
beforeEach(() => {
    jest.clearAllMocks();
});

// ---- Helpers ----

/** Mock runtime script parameters */
const mockParams = (mode, filter) => {
    runtime.getCurrentScript.mockReturnValue({
        getParameter: jest.fn(({ name }) => {
            if (name === 'custscript_mass_del_mode') return mode;
            if (name === 'custscript_mass_del_filter') return filter;
            return null;
        }),
    });
};

/** Create a mock map context */
const mockMapContext = (id) => ({
    key: String(id),
    value: JSON.stringify({ id: String(id), recordType: 'customrecord_emp_mahmoud', values: {} }),
    write: jest.fn(),
});

/** Create a mock summary object */
const mockSummary = (outputKeys, mapErrors = []) => ({
    seconds: 12.5,
    concurrency: 1,
    output: {
        iterator: jest.fn(() => ({
            each: jest.fn((callback) => {
                outputKeys.forEach(k => callback(k, 'deleted'));
            }),
        })),
    },
    mapSummary: {
        errors: {
            iterator: jest.fn(() => ({
                each: jest.fn((callback) => {
                    mapErrors.forEach(e => callback(e.key, e.error));
                }),
            })),
        },
    },
});

// ─── TESTS ───

describe('Map/Reduce - Employee Mass Delete', () => {

    // ─── getInputData ───

    describe('getInputData', () => {
        it('should return a search with no filters when mode is ALL', () => {
            mockParams('ALL', '');

            const result = getInputData();

            expect(search.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'customrecord_emp_mahmoud',
                    filters: [],
                    columns: ['internalid'],
                })
            );
        });

        it('should filter by job title when mode is JOBTITLE', () => {
            mockParams('JOBTITLE', 'Developer');

            search.createFilter.mockReturnValue({ name: 'custrecord_emp_mahmoud_jobtitle', operator: 'is', values: 'Developer' });

            getInputData();

            expect(search.createFilter).toHaveBeenCalledWith({
                name: 'custrecord_emp_mahmoud_jobtitle',
                operator: search.Operator.IS,
                values: 'Developer',
            });
            expect(search.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    filters: expect.arrayContaining([
                        expect.objectContaining({ name: 'custrecord_emp_mahmoud_jobtitle' }),
                    ]),
                })
            );
        });

        it('should filter by city when mode is CITY', () => {
            mockParams('CITY', 'Cairo');

            search.createFilter.mockReturnValue({ name: 'custrecord_emp_mahmoud_address', operator: 'is', values: 'Cairo' });

            getInputData();

            expect(search.createFilter).toHaveBeenCalledWith({
                name: 'custrecord_emp_mahmoud_address',
                operator: search.Operator.IS,
                values: 'Cairo',
            });
        });

        it('should filter by email when mode is EMAIL', () => {
            mockParams('EMAIL', 'ahmed@example.com');

            search.createFilter.mockReturnValue({ name: 'custrecord_emp_mahmoud_email', operator: 'is', values: 'ahmed@example.com' });

            getInputData();

            expect(search.createFilter).toHaveBeenCalledWith({
                name: 'custrecord_emp_mahmoud_email',
                operator: search.Operator.IS,
                values: 'ahmed@example.com',
            });
        });

        it('should default to ALL mode when parameter is empty', () => {
            mockParams('', '');

            getInputData();

            expect(search.create).toHaveBeenCalledWith(
                expect.objectContaining({ filters: [] })
            );
        });

        it('should be case-insensitive for mode parameter', () => {
            mockParams('jobtitle', 'Designer');

            search.createFilter.mockReturnValue({ name: 'custrecord_emp_mahmoud_jobtitle', operator: 'is', values: 'Designer' });

            getInputData();

            expect(search.createFilter).toHaveBeenCalled();
        });
    });

    // ─── map ───

    describe('map', () => {
        it('should delete the record and write the result', () => {
            const ctx = mockMapContext(42);

            map(ctx);

            expect(record.delete).toHaveBeenCalledWith({
                type: 'customrecord_emp_mahmoud',
                id: '42',
            });
            expect(ctx.write).toHaveBeenCalledWith({
                key: '42',
                value: 'deleted',
            });
        });

        it('should log error but not throw when delete fails', () => {
            record.delete.mockImplementation(() => {
                throw new Error('Record locked');
            });

            const ctx = mockMapContext(99);

            // Should not throw
            expect(() => map(ctx)).not.toThrow();

            expect(log.error).toHaveBeenCalledWith(
                'errMap',
                expect.stringContaining('Record locked')
            );
        });
    });

    // ─── summarize ───

    describe('summarize', () => {
        it('should log completion with deleted count and duration', () => {
            const summary = mockSummary(['1', '2', '3']);

            summarize(summary);

            expect(log.audit).toHaveBeenCalledWith('MASS_DELETE_COMPLETE', {
                deleted: 3,
                errors: 0,
                durationSeconds: 12.5,
                concurrency: 1,
            });
        });

        it('should count and log errors from map stage', () => {
            const summary = mockSummary(['1'], [
                { key: '2', error: 'Permission denied' },
                { key: '3', error: 'Record not found' },
            ]);

            summarize(summary);

            expect(log.audit).toHaveBeenCalledWith('MASS_DELETE_COMPLETE', {
                deleted: 1,
                errors: 2,
                durationSeconds: 12.5,
                concurrency: 1,
            });
            expect(log.error).toHaveBeenCalledTimes(2);
        });

        it('should handle zero records gracefully', () => {
            const summary = mockSummary([]);

            summarize(summary);

            expect(log.audit).toHaveBeenCalledWith('MASS_DELETE_COMPLETE', expect.objectContaining({
                deleted: 0,
                errors: 0,
            }));
        });
    });
});
