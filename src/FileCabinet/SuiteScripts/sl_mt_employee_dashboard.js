/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 *
 * Suitelet Dashboard for managing customrecord_emp_mahmoud
 */
define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/log', 'N/redirect', 'N/url', 'N/format'],
    (serverWidget, record, search, log, redirect, url, format) => {

    const RECORD_TYPE = 'customrecord_emp_mahmoud';

    const FIELDS = {
        name:     { id: 'name',                              label: 'Name',             type: serverWidget.FieldType.TEXT },
        dob:      { id: 'custrecord_emp_mahmoud_dob',     label: 'Date of Birth',    type: serverWidget.FieldType.DATE },
        address:  { id: 'custrecord_emp_mahmoud_address', label: 'Address',          type: serverWidget.FieldType.TEXT },
        phone:    { id: 'custrecord_emp_mahmoud_phone',   label: 'Phone',            type: serverWidget.FieldType.PHONE },
        email:    { id: 'custrecord_emp_mahmoud_email',   label: 'Email',            type: serverWidget.FieldType.EMAIL },
        jobTitle: { id: 'custrecord_emp_mahmoud_jobtitle',label: 'Job Title',        type: serverWidget.FieldType.TEXT },
        status:   { id: 'custrecord_emp_mahmoud_status',  label: 'Workflow Status',  type: serverWidget.FieldType.TEXT },
        about:    { id: 'custrecord_emp_mahmoud_about',   label: 'About',            type: serverWidget.FieldType.TEXTAREA },
    };

    /**
     * Main entry point
     */
    const onRequest = (context) => {
        try {
            if (context.request.method === 'GET') {
                return handleGet(context);
            }
            return handlePost(context);
        } catch (errOnRequest) {
            log.debug('errOnRequest', errOnRequest);
            context.response.write('<h2>Error: ' + escapeHtml(errOnRequest.message) + '</h2>');
        }
    };

    // ─── GET — Show the dashboard ───

    const handleGet = (context) => {
        try {
            const action = context.request.parameters.action;
            const recId = context.request.parameters.recId;

            if (action === 'create') {
                return showForm(context, 'Create Employee', null);
            }
            if (action === 'edit' && recId) {
                return showForm(context, 'Edit Employee', parseInt(recId, 10));
            }
            if (action === 'delete' && recId) {
                return showDeleteConfirm(context, parseInt(recId, 10));
            }
            if (action === 'view' && recId) {
                return showView(context, parseInt(recId, 10));
            }

            return showList(context);
        } catch (errHandleGet) {
            log.debug('errHandleGet', errHandleGet);
            throw errHandleGet;
        }
    };

    // ─── POST — Handle form submissions ───

    const handlePost = (context) => {
        try {
            const action = context.request.parameters.custpage_action;

            if (action === 'create') {
                const rec = record.create({ type: RECORD_TYPE, isDynamic: true });
                setFieldsFromRequest(rec, context.request);
                const id = rec.save({ enableSourcing: false, ignoreMandatoryFields: false });
                log.audit('Dashboard - Created', { id });
            }

            if (action === 'edit') {
                const recId = parseInt(context.request.parameters.custpage_rec_id, 10);
                const rec = record.load({ type: RECORD_TYPE, id: recId, isDynamic: true });
                setFieldsFromRequest(rec, context.request);
                const id = rec.save({ enableSourcing: false, ignoreMandatoryFields: false });
                log.audit('Dashboard - Updated', { id });
            }

            if (action === 'delete') {
                const recId = parseInt(context.request.parameters.custpage_rec_id, 10);
                record.delete({ type: RECORD_TYPE, id: recId });
                log.audit('Dashboard - Deleted', { id: recId });
            }

            redirect.toSuitelet({
                scriptId: 'customscript_sl_mt_emp_dash',
                deploymentId: 'customdeploy_sl_mt_emp_dash',
            });
        } catch (errHandlePost) {
            log.debug('errHandlePost', errHandlePost);
            throw errHandlePost;
        }
    };

    // ─── Views ───

    const showList = (context) => {
        try {
            const form = serverWidget.createForm({ title: 'Employee Dashboard' });

            const suiteletUrl = url.resolveScript({
                scriptId: 'customscript_sl_mt_emp_dash',
                deploymentId: 'customdeploy_sl_mt_emp_dash',
            });

            form.addButton({
                id: 'custpage_btn_create',
                label: 'New Employee',
                functionName: "window.open('" + suiteletUrl + "&action=create', '_self')",
            });

            const sublist = form.addSublist({
                id: 'custpage_emp_list',
                label: 'Employees',
                type: serverWidget.SublistType.LIST,
            });

            sublist.addField({ id: 'custpage_col_id',       label: 'ID',         type: serverWidget.FieldType.TEXT });
            sublist.addField({ id: 'custpage_col_name',      label: 'Name',       type: serverWidget.FieldType.TEXT });
            sublist.addField({ id: 'custpage_col_email',     label: 'Email',      type: serverWidget.FieldType.TEXT });
            sublist.addField({ id: 'custpage_col_phone',     label: 'Phone',      type: serverWidget.FieldType.TEXT });
            sublist.addField({ id: 'custpage_col_jobtitle',  label: 'Job Title',  type: serverWidget.FieldType.TEXT });

            const viewCol = sublist.addField({ id: 'custpage_col_view',   label: 'View',   type: serverWidget.FieldType.URL });
            viewCol.linkText = 'View';
            const editCol = sublist.addField({ id: 'custpage_col_edit',   label: 'Edit',   type: serverWidget.FieldType.URL });
            editCol.linkText = 'Edit';
            const deleteCol = sublist.addField({ id: 'custpage_col_delete', label: 'Delete', type: serverWidget.FieldType.URL });
            deleteCol.linkText = 'Delete';

            const records = loadAllRecords();

            records.forEach((row, i) => {
                const setVal = (id, val) => {
                    const str = (val !== null && val !== undefined && val !== '') ? String(val) : ' ';
                    sublist.setSublistValue({ id, line: i, value: str });
                };
                setVal('custpage_col_id',       row.id);
                setVal('custpage_col_name',     row.name);
                setVal('custpage_col_email',    row.email);
                setVal('custpage_col_phone',    row.phone);
                setVal('custpage_col_jobtitle', row.jobTitle);

                sublist.setSublistValue({ id: 'custpage_col_view',   line: i, value: suiteletUrl + '&action=view&recId=' + row.id });
                sublist.setSublistValue({ id: 'custpage_col_edit',   line: i, value: suiteletUrl + '&action=edit&recId=' + row.id });
                sublist.setSublistValue({ id: 'custpage_col_delete', line: i, value: suiteletUrl + '&action=delete&recId=' + row.id });
            });

            context.response.writePage(form);
        } catch (errShowList) {
            log.debug('errShowList', errShowList);
            throw errShowList;
        }
    };

    const showForm = (context, title, recId) => {
        try {
            const form = serverWidget.createForm({ title });
            const isEdit = recId !== null;

            const actionField = form.addField({ id: 'custpage_action', label: 'Action', type: serverWidget.FieldType.TEXT });
            actionField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            actionField.defaultValue = isEdit ? 'edit' : 'create';

            if (isEdit) {
                const idField = form.addField({ id: 'custpage_rec_id', label: 'Record ID', type: serverWidget.FieldType.TEXT });
                idField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
                idField.defaultValue = String(recId);
            }

            let rec = null;
            if (isEdit) {
                rec = record.load({ type: RECORD_TYPE, id: recId });
            }

            for (const [key, fieldDef] of Object.entries(FIELDS)) {
                const field = form.addField({
                    id: 'custpage_' + key.toLowerCase(),
                    label: fieldDef.label,
                    type: fieldDef.type,
                });
                if (fieldDef.type === serverWidget.FieldType.DATE) {
                    field.setHelpText({ help: 'Format: D/M/YYYY' });
                }
                if (isEdit && rec) {
                    const val = rec.getValue({ fieldId: fieldDef.id });
                    if (val !== null && val !== undefined && val !== '') {
                        field.defaultValue = formatFieldValue(val, fieldDef.type);
                    }
                }
            }

            form.addSubmitButton({ label: isEdit ? 'Update' : 'Save' });

            const suiteletUrl = url.resolveScript({
                scriptId: 'customscript_sl_mt_emp_dash',
                deploymentId: 'customdeploy_sl_mt_emp_dash',
            });
            form.addButton({ id: 'custpage_btn_cancel', label: 'Cancel', functionName: "window.open('" + suiteletUrl + "', '_self')" });

            context.response.writePage(form);
        } catch (errShowForm) {
            log.debug('errShowForm', errShowForm);
            throw errShowForm;
        }
    };

    const showView = (context, recId) => {
        try {
            const form = serverWidget.createForm({ title: 'View Employee' });

            const rec = record.load({ type: RECORD_TYPE, id: recId });

            for (const [key, fieldDef] of Object.entries(FIELDS)) {
                const field = form.addField({
                    id: 'custpage_' + key.toLowerCase(),
                    label: fieldDef.label,
                    type: fieldDef.type,
                });
                const val = rec.getValue({ fieldId: fieldDef.id });
                if (val !== null && val !== undefined && val !== '') {
                    field.defaultValue = formatFieldValue(val, fieldDef.type);
                }
                field.updateDisplayType({ displayType: serverWidget.FieldDisplayType.INLINE });
            }

            const suiteletUrl = url.resolveScript({
                scriptId: 'customscript_sl_mt_emp_dash',
                deploymentId: 'customdeploy_sl_mt_emp_dash',
            });
            form.addButton({ id: 'custpage_btn_back', label: 'Back to List', functionName: "window.open('" + suiteletUrl + "', '_self')" });
            form.addButton({ id: 'custpage_btn_edit', label: 'Edit', functionName: "window.open('" + suiteletUrl + "&action=edit&recId=" + recId + "', '_self')" });

            context.response.writePage(form);
        } catch (errShowView) {
            log.debug('errShowView', errShowView);
            throw errShowView;
        }
    };

    const showDeleteConfirm = (context, recId) => {
        try {
            const form = serverWidget.createForm({ title: 'Confirm Delete' });

            const rec = record.load({ type: RECORD_TYPE, id: recId });
            const name = rec.getValue({ fieldId: 'name' }) || 'this record';

            const msgField = form.addField({ id: 'custpage_msg', label: ' ', type: serverWidget.FieldType.INLINEHTML });
            msgField.defaultValue = '<h2>Are you sure you want to delete "' + escapeHtml(name) + '" (ID: ' + recId + ')?</h2>';

            const actionField = form.addField({ id: 'custpage_action', label: 'Action', type: serverWidget.FieldType.TEXT });
            actionField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            actionField.defaultValue = 'delete';

            const idField = form.addField({ id: 'custpage_rec_id', label: 'Record ID', type: serverWidget.FieldType.TEXT });
            idField.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            idField.defaultValue = String(recId);

            form.addSubmitButton({ label: 'Yes, Delete' });

            const suiteletUrl = url.resolveScript({
                scriptId: 'customscript_sl_mt_emp_dash',
                deploymentId: 'customdeploy_sl_mt_emp_dash',
            });
            form.addButton({ id: 'custpage_btn_cancel', label: 'Cancel', functionName: "window.open('" + suiteletUrl + "', '_self')" });

            context.response.writePage(form);
        } catch (errShowDeleteConfirm) {
            log.debug('errShowDeleteConfirm', errShowDeleteConfirm);
            throw errShowDeleteConfirm;
        }
    };

    // ─── Helpers ───

    const formatFieldValue = (val, fieldType) => {
        try {
            if (val instanceof Date) {
                return format.format({ value: val, type: format.Type.DATE });
            }
            return String(val);
        } catch (errFormatFieldValue) {
            log.debug('errFormatFieldValue', errFormatFieldValue);
            throw errFormatFieldValue;
        }
    };

    const loadAllRecords = () => {
        try {
            const results = [];
            const columns = [
                search.createColumn({ name: 'name' }),
                search.createColumn({ name: FIELDS.email.id }),
                search.createColumn({ name: FIELDS.phone.id }),
                search.createColumn({ name: FIELDS.jobTitle.id }),
            ];

            search.create({ type: RECORD_TYPE, columns }).run().each((result) => {
                results.push({
                    id: result.id,
                    name: result.getValue({ name: 'name' }),
                    email: result.getValue({ name: FIELDS.email.id }),
                    phone: result.getValue({ name: FIELDS.phone.id }),
                    jobTitle: result.getValue({ name: FIELDS.jobTitle.id }),
                });
                return true;
            });

            return results;
        } catch (errLoadAllRecords) {
            log.debug('errLoadAllRecords', errLoadAllRecords);
            throw errLoadAllRecords;
        }
    };

    const setFieldsFromRequest = (rec, request) => {
        try {
            for (const [key, fieldDef] of Object.entries(FIELDS)) {
                const val = request.parameters['custpage_' + key.toLowerCase()];
                if (val !== undefined && val !== null && val !== '') {
                    let parsedVal = val;
                    if (fieldDef.type === serverWidget.FieldType.DATE) {
                        parsedVal = format.parse({ value: val, type: format.Type.DATE });
                    }
                    rec.setValue({ fieldId: fieldDef.id, value: parsedVal });
                }
            }
        } catch (errSetFieldsFromRequest) {
            log.debug('errSetFieldsFromRequest', errSetFieldsFromRequest);
            throw errSetFieldsFromRequest;
        }
    };

    const escapeHtml = (str) => {
        try {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
        } catch (errEscapeHtml) {
            log.debug('errEscapeHtml', errEscapeHtml);
            throw errEscapeHtml;
        }
    };

    return { onRequest };
});
