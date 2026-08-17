/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 *
 * Finds and deletes duplicate employee records based on email + phone.
 * Keeps the oldest record (lowest internal ID) and deletes the rest.
 */
define(['N/search', 'N/record', 'N/log', 'N/runtime'], (search, record, log, runtime) => {

    const RECORD_TYPE = 'customrecord_emp_mahmoud';

    const FIELD_MAP = {
        email: 'custrecord_emp_mahmoud_email',
        phone: 'custrecord_emp_mahmoud_phone',
    };

    /**
     * Loads all employee records with email and phone fields.
     * @returns {Array<Object>} Array of { id, email, phone }
     */
    const loadAllEmployees = () => {
        try {
            const employees = [];

            const empSearch = search.create({
                type: RECORD_TYPE,
                filters: [],
                columns: [
                    search.createColumn({ name: 'internalid', sort: search.Sort.ASC }),
                    search.createColumn({ name: FIELD_MAP.email }),
                    search.createColumn({ name: FIELD_MAP.phone }),
                ]
            });

            const pagedData = empSearch.runPaged({ pageSize: 1000 });

            pagedData.pageRanges.forEach(pageRange => {
                pagedData.fetch({ index: pageRange.index }).data.forEach(result => {
                    employees.push({
                        id: result.getValue('internalid'),
                        email: (result.getValue(FIELD_MAP.email) || '').toLowerCase().trim(),
                        phone: (result.getValue(FIELD_MAP.phone) || '').trim(),
                    });
                });
            });

            return employees;
        } catch (errLoadAllEmployees) {
            log.error('errLoadAllEmployees', errLoadAllEmployees);
            throw errLoadAllEmployees;
        }
    };

    /**
     * Groups employees by email+phone key and returns IDs to delete.
     * Keeps the record with the lowest internal ID (oldest).
     * @param {Array<Object>} employees
     * @returns {{ duplicateIds: number[], totalGroups: number, totalDuplicates: number }}
     */
    const findDuplicates = (employees) => {
        try {
            const groups = {};

            employees.forEach(emp => {
                const key = emp.email + '|' + emp.phone;
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(emp.id);
            });

            const duplicateIds = [];
            let totalGroups = 0;

            Object.keys(groups).forEach(key => {
                const ids = groups[key];
                if (ids.length > 1) {
                    totalGroups++;
                    // Keep first (lowest ID), delete the rest
                    for (let i = 1; i < ids.length; i++) {
                        duplicateIds.push(ids[i]);
                    }
                }
            });

            return {
                duplicateIds: duplicateIds,
                totalGroups: totalGroups,
                totalDuplicates: duplicateIds.length,
            };
        } catch (errFindDuplicates) {
            log.error('errFindDuplicates', errFindDuplicates);
            throw errFindDuplicates;
        }
    };

    /**
     * Deletes records by ID, checking governance before each delete.
     * @param {number[]} ids
     * @returns {{ deleted: number, failed: number, stopped: boolean }}
     */
    const deleteDuplicates = (ids) => {
        try {
            let deleted = 0;
            let failed = 0;
            let stopped = false;

            for (let i = 0; i < ids.length; i++) {
                // Check remaining governance units (delete costs ~20 units)
                const remaining = runtime.getCurrentScript().getRemainingUsage();
                if (remaining < 50) {
                    log.audit('GOVERNANCE_LIMIT', 'Stopping early — remaining usage: ' + remaining + '. Deleted ' + deleted + '/' + ids.length);
                    stopped = true;
                    break;
                }

                try {
                    record.delete({ type: RECORD_TYPE, id: ids[i] });
                    deleted++;
                } catch (errDeleteSingle) {
                    log.error('errDeleteSingle', 'Failed to delete ID ' + ids[i] + ': ' + errDeleteSingle.message);
                    failed++;
                }
            }

            return { deleted: deleted, failed: failed, stopped: stopped };
        } catch (errDeleteDuplicates) {
            log.error('errDeleteDuplicates', errDeleteDuplicates);
            throw errDeleteDuplicates;
        }
    };

    /**
     * Scheduled Script entry point.
     * @param {Object} context
     */
    const execute = (context) => {
        try {
            log.audit('DEDUP_START', 'Employee deduplication started');

            const employees = loadAllEmployees();
            log.audit('DEDUP_LOADED', 'Total records found: ' + employees.length);

            const { duplicateIds, totalGroups, totalDuplicates } = findDuplicates(employees);
            log.audit('DEDUP_ANALYSIS', 'Duplicate groups: ' + totalGroups + ', Records to delete: ' + totalDuplicates);

            if (duplicateIds.length === 0) {
                log.audit('DEDUP_COMPLETE', 'No duplicates found. Nothing to delete.');
                return;
            }

            const result = deleteDuplicates(duplicateIds);
            log.audit('DEDUP_COMPLETE', 'Deleted: ' + result.deleted + ', Failed: ' + result.failed + ', Stopped early: ' + result.stopped);
        } catch (errExecute) {
            log.error('errExecute', errExecute);
        }
    };

    return { execute: execute };
});
