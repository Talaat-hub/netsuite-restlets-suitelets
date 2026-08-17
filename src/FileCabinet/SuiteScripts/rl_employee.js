/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 *
 * Restlet for CRUD operations on customrecord_emp_mahmoud
 */
define(['N/record', 'N/search', 'N/log', 'N/error', 'N/https', 'N/url'], (record, search, log, error, https, url) => {

    const RECORD_TYPE = 'customrecord_emp_mahmoud';

    const FIELD_MAP = {
        name:           'name',
        dob:            'custrecord_emp_mahmoud_dob',
        address:        'custrecord_emp_mahmoud_address',
        phone:          'custrecord_emp_mahmoud_phone',
        email:          'custrecord_emp_mahmoud_email',
        date:           'custrecord_emp_mahmoud_date',
        employee:       'custrecord_emp_mahmoud_employee',
        status:         'custrecord_emp_mahmoud_status',
        about:          'custrecord_emp_mahmoud_about',
        terminationDate:'custrecord_termination_date',
        llm:            'custrecord_emp_mahmoud_llm',
        jobTitle:       'custrecord_emp_mahmoud_jobtitle',
    };

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ─── 1. Error Handling — wraps each entry point ───

    const handleError = (e, method) => {
        try {
            log.error(method + ' error', e.message || e);
            return {
                error: {
                    code: e.name || 'UNEXPECTED_ERROR',
                    message: e.message || 'An unexpected error occurred',
                }
            };
        } catch (errHandleError) {
            log.debug('errHandleError', errHandleError);
        }
    };

    // ─── 2. Input Validation ───

    const validate = (data, requiredFields) => {
        try {
            const errors = [];

            for (const field of requiredFields) {
                if (data[field] === undefined || data[field] === null || data[field] === '') {
                    errors.push(field + ' is required');
                }
            }

            if (data.email && !EMAIL_REGEX.test(data.email)) {
                errors.push('Invalid email format');
            }

            if (errors.length > 0) {
                throw createError('VALIDATION_ERROR', errors.join('; '));
            }
        } catch (errValidate) {
            log.debug('errValidate', errValidate);
            throw errValidate;
        }
    };

    /**
     * GET — Retrieve one record by id, or list records with optional filters and pagination
     * @param {Object} requestParams - { id } or { limit, offset, name, email, ... }
     * @returns {Object|Object[]}
     */
    const get = (requestParams) => {
        try {
            if (requestParams.id) {
                return getById(parseInt(requestParams.id, 10));
            }
            const filters = [];
            for (const [key, fieldId] of Object.entries(FIELD_MAP)) {
                if (requestParams[key]) {
                    filters.push(search.createFilter({ name: fieldId, operator: search.Operator.CONTAINS, values: [requestParams[key]] }));
                }
            }
            const limit = parseInt(requestParams.limit, 10) || 50;
            const offset = parseInt(requestParams.offset, 10) || 0;
            return list(limit, offset, filters);
        } catch (errGet) {
            log.debug('errGet', errGet);
            return handleError(errGet, 'GET');
        }
    };

    /**
     * POST — Create a new record
     * @param {Object} requestBody - field values keyed by friendly names
     * @returns {Object} { id }
     */
    const post = (requestBody) => {
        try {
            validate(requestBody, ['name']);
            const rec = record.create({ type: RECORD_TYPE, isDynamic: true });
            setFields(rec, requestBody);
            const id = rec.save({ enableSourcing: false, ignoreMandatoryFields: false });
            log.audit('Created record', { id });
            return { id };
        } catch (errPost) {
            log.debug('errPost', errPost);
            return handleError(errPost, 'POST');
        }
    };

    /**
     * PUT — Update an existing record
     * @param {Object} requestBody - must include { id, ...fieldsToUpdate }
     * @returns {Object} { id }
     */
    const put = (requestBody) => {
        try {
            if (!requestBody.id) {
                throw createError('MISSING_ID', 'PUT request must include an id');
            }
            validate(requestBody, []);
            const recId = parseInt(requestBody.id, 10);
            const rec = record.load({ type: RECORD_TYPE, id: recId, isDynamic: true });
            setFields(rec, requestBody);
            const id = rec.save({ enableSourcing: false, ignoreMandatoryFields: false });
            log.audit('Updated record', { id });
            return { id };
        } catch (errPut) {
            log.debug('errPut', errPut);
            return handleError(errPut, 'PUT');
        }
    };

    /**
     * DELETE — Delete a record by id
     * @param {Object} requestBody - { id }
     * @returns {Object} { id }
     */
    const doDelete = (requestBody) => {
        try {
            if (!requestBody.id) {
                throw createError('MISSING_ID', 'DELETE request must include an id');
            }
            const recId = parseInt(requestBody.id, 10);
            record.delete({ type: RECORD_TYPE, id: recId });
            log.audit('Deleted record', { id: recId });
            return { id: recId };
        } catch (errDoDelete) {
            log.debug('errDoDelete', errDoDelete);
            return handleError(errDoDelete, 'DELETE');
        }
    };

    // ─── Helpers ───

    const getById = (id) => {
        try {
            const rec = record.load({ type: RECORD_TYPE, id });
            const result = { id };
            for (const [key, fieldId] of Object.entries(FIELD_MAP)) {
                result[key] = rec.getValue({ fieldId });
            }
            return result;
        } catch (errGetById) {
            log.debug('errGetById', errGetById);
            throw errGetById;
        }
    };

    // ─── 3. Pagination — limit + offset ───

    const list = (limit, offset, filters) => {
        try {
            const results = [];
            const columns = Object.values(FIELD_MAP).map(fieldId =>
                search.createColumn({ name: fieldId })
            );

            const s = search.create({
                type: RECORD_TYPE,
                filters: filters || [],
                columns,
            });

            const pagedData = s.runPaged({ pageSize: 1000 });
            let count = 0;
            let skipped = 0;

            pagedData.pageRanges.forEach((pageRange) => {
                if (count >= limit) return;
                const page = pagedData.fetch({ index: pageRange.index });
                page.data.forEach((result) => {
                    if (skipped < offset) {
                        skipped++;
                        return;
                    }
                    if (count >= limit) return;
                    const row = { id: result.id };
                    for (const [key, fieldId] of Object.entries(FIELD_MAP)) {
                        row[key] = result.getValue({ name: fieldId });
                    }
                    results.push(row);
                    count++;
                });
            });

            return {
                offset,
                limit,
                count: results.length,
                results,
            };
        } catch (errList) {
            log.debug('errList', errList);
            throw errList;
        }
    };

    const setFields = (rec, data) => {
        try {
            for (const [key, fieldId] of Object.entries(FIELD_MAP)) {
                if (data[key] !== undefined && key !== 'id') {
                    rec.setValue({ fieldId, value: data[key] });
                }
            }
        } catch (errSetFields) {
            log.debug('errSetFields', errSetFields);
            throw errSetFields;
        }
    };

    const createError = (code, message) => {
        try {
            return error.create({ name: code, message, notifyOff: true });
        } catch (errCreateError) {
            log.debug('errCreateError', errCreateError);
            throw errCreateError;
        }
    };

    // ─── 4. Call this restlet from another SuiteScript ───
    // Example usage from a Scheduled Script or Map/Reduce:
    //
    //   const restletUrl = url.resolveScript({
    //       scriptId: 'customscript_rl_mt_employee',
    //       deploymentId: 'customdeploy_rl_mt_employee',
    //   });
    //
    //   // GET all records
    //   const getResponse = https.get({ url: restletUrl });
    //   const records = JSON.parse(getResponse.body);
    //
    //   // POST a new record
    //   const postResponse = https.post({
    //       url: restletUrl,
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ name: 'Created by script', jobTitle: 'Automation' }),
    //   });
    //   const newId = JSON.parse(postResponse.body).id;

    return { get, post, put, delete: doDelete };
});
