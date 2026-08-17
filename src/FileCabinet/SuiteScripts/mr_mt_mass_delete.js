/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 *
 * Mass Delete — deletes employee records from customrecord_emp_mahmoud.
 * Supports two modes via Script Parameter:
 *   - "ALL"   → deletes every record
 *   - Filter  → deletes records matching a specific job title or city
 *
 * Map/Reduce handles governance automatically by splitting work across
 * getInputData → map → summarize stages.
 */
define(['N/search', 'N/record', 'N/runtime', 'N/log'], (search, record, runtime, log) => {

    const RECORD_TYPE = 'customrecord_emp_mahmoud';

    const FIELD_MAP = {
        jobTitle: 'custrecord_emp_mahmoud_jobtitle',
        address:  'custrecord_emp_mahmoud_address',
        email:    'custrecord_emp_mahmoud_email',
    };

    /* ──────────────────────────────────────────
     *  STAGE 1 — getInputData
     *  Returns a search of records to delete.
     * ────────────────────────────────────────── */

    const getInputData = () => {
        try {
            const script = runtime.getCurrentScript();
            const mode      = (script.getParameter({ name: 'custscript_mass_del_mode' }) || 'ALL').toUpperCase().trim();
            const filterVal = (script.getParameter({ name: 'custscript_mass_del_filter' }) || '').trim();

            log.audit('MASS_DELETE_START', 'Mode: ' + mode + ', Filter: ' + (filterVal || '(none)'));

            const filters = [];

            if (mode === 'JOBTITLE' && filterVal) {
                filters.push(search.createFilter({
                    name: FIELD_MAP.jobTitle,
                    operator: search.Operator.IS,
                    values: filterVal,
                }));
            } else if (mode === 'CITY' && filterVal) {
                filters.push(search.createFilter({
                    name: FIELD_MAP.address,
                    operator: search.Operator.IS,
                    values: filterVal,
                }));
            } else if (mode === 'EMAIL' && filterVal) {
                filters.push(search.createFilter({
                    name: FIELD_MAP.email,
                    operator: search.Operator.IS,
                    values: filterVal,
                }));
            }
            // mode === 'ALL' → no filters, matches everything

            return search.create({
                type: RECORD_TYPE,
                filters: filters,
                columns: ['internalid'],
            });
        } catch (errGetInputData) {
            log.error('errGetInputData', errGetInputData);
            throw errGetInputData;
        }
    };

    /* ──────────────────────────────────────────
     *  STAGE 2 — map
     *  Receives one search result at a time, deletes the record.
     * ────────────────────────────────────────── */

    const map = (context) => {
        try {
            const searchResult = JSON.parse(context.value);
            const recId = searchResult.id;

            record.delete({ type: RECORD_TYPE, id: recId });

            context.write({
                key: recId,
                value: 'deleted',
            });
        } catch (errMap) {
            log.error('errMap', 'Failed to delete ID ' + context.key + ': ' + errMap.message);
        }
    };

    /* ──────────────────────────────────────────
     *  STAGE 3 — summarize
     *  Reports results after all map executions complete.
     * ────────────────────────────────────────── */

    const summarize = (summary) => {
        try {
            let deleted = 0;
            let errors = 0;

            summary.output.iterator().each((key, value) => {
                deleted++;
                return true;
            });

            if (summary.mapSummary) {
                summary.mapSummary.errors.iterator().each((key, error) => {
                    log.error('MAP_ERROR', 'Key: ' + key + ', Error: ' + error);
                    errors++;
                    return true;
                });
            }

            const duration = summary.seconds;

            log.audit('MASS_DELETE_COMPLETE', {
                deleted: deleted,
                errors: errors,
                durationSeconds: duration,
                concurrency: summary.concurrency,
            });
        } catch (errSummarize) {
            log.error('errSummarize', errSummarize);
        }
    };

    return { getInputData, map, summarize };
});
