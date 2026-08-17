/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 *
 * Employee Analytics Dashboard Suitelet
 * Modern inline-HTML dashboard with KPI cards, AG Grid, and ECharts
 * for real-time employee data visualization.
 */
define([
    'N/ui/serverWidget',
    'N/search',
    'N/record',
    'N/runtime',
    'N/log',
    'N/url'
], (serverWidget, search, record, runtime, log, url) => {

    /* ──────────────────────────────────────────
     *  CONSTANTS
     * ────────────────────────────────────────── */

    const RECORD_TYPE = 'customrecord_emp_mahmoud';

    const FIELD_MAP = {
        name:       'name',
        dob:        'custrecord_emp_mahmoud_dob',
        address:    'custrecord_emp_mahmoud_address',
        phone:      'custrecord_emp_mahmoud_phone',
        email:      'custrecord_emp_mahmoud_email',
        jobTitle:   'custrecord_emp_mahmoud_jobtitle',
        status:     'custrecord_emp_mahmoud_status',
        about:      'custrecord_emp_mahmoud_about',
    };

    const DASH_SCRIPT = 'customscript_sl_mt_emp_analytics';
    const DASH_DEPLOY = 'customdeploy_sl_mt_emp_analytics';

    const EMP_DASH_SCRIPT = 'customscript_sl_mt_emp_dash';
    const EMP_DASH_DEPLOY = 'customdeploy_sl_mt_emp_dash';

    /* ──────────────────────────────────────────
     *  ENTRY POINT
     * ────────────────────────────────────────── */

    const onRequest = (context) => {
        try {
            const action = context.request.parameters.action;

            if (action === 'getData') {
                return respondWithData(context);
            }
            if (action === 'getEmployee') {
                return respondWithEmployee(context, context.request.parameters.empId);
            }
            if (action === 'deleteEmployee') {
                return deleteEmployee(context, context.request.parameters.empId);
            }

            return renderDashboard(context);
        } catch (errOnRequest) {
            log.debug('errOnRequest', errOnRequest);
            context.response.write('<h2>Error: ' + errOnRequest.message + '</h2>');
        }
    };

    /* ──────────────────────────────────────────
     *  RENDER DASHBOARD
     * ────────────────────────────────────────── */

    const renderDashboard = (context) => {
        try {
            const form = serverWidget.createForm({ title: ' ' });

            const htmlField = form.addField({
                id: 'custpage_dashboard_html',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Dashboard'
            });

            htmlField.defaultValue = getDashboardHTML(context);
            context.response.writePage(form);
        } catch (errRenderDashboard) {
            log.debug('errRenderDashboard', errRenderDashboard);
            throw errRenderDashboard;
        }
    };

    /* ──────────────────────────────────────────
     *  AJAX — All Employees + KPIs
     * ────────────────────────────────────────── */

    const respondWithData = (context) => {
        try {
            const employees = loadAllEmployees();
            const kpis = computeKPIs(employees);
            respondJSON(context, { success: true, employees, kpis });
        } catch (errRespondWithData) {
            log.debug('errRespondWithData', errRespondWithData);
            respondJSON(context, { success: false, error: errRespondWithData.message });
        }
    };

    /* ──────────────────────────────────────────
     *  AJAX — Single Employee Detail
     * ────────────────────────────────────────── */

    const respondWithEmployee = (context, empId) => {
        try {
            if (!empId) throw new Error('Missing empId');

            const rec = record.load({ type: RECORD_TYPE, id: parseInt(empId, 10) });
            const data = { id: empId };

            for (const [key, fieldId] of Object.entries(FIELD_MAP)) {
                data[key] = rec.getValue({ fieldId }) || '';
                data[key + '_text'] = rec.getText({ fieldId }) || data[key];
            }

            respondJSON(context, { success: true, employee: data });
        } catch (errRespondWithEmployee) {
            log.debug('errRespondWithEmployee', errRespondWithEmployee);
            respondJSON(context, { success: false, error: errRespondWithEmployee.message });
        }
    };

    /* ──────────────────────────────────────────
     *  AJAX — Delete Employee
     * ────────────────────────────────────────── */

    const deleteEmployee = (context, empId) => {
        try {
            if (!empId) throw new Error('Missing empId');

            const recId = parseInt(empId, 10);
            record.delete({ type: RECORD_TYPE, id: recId });
            log.audit('Dashboard - Deleted', { id: recId });

            respondJSON(context, { success: true, id: recId });
        } catch (errDeleteEmployee) {
            log.debug('errDeleteEmployee', errDeleteEmployee);
            respondJSON(context, { success: false, error: errDeleteEmployee.message });
        }
    };

    /* ──────────────────────────────────────────
     *  DATA LOADERS
     * ────────────────────────────────────────── */

    const loadAllEmployees = () => {
        try {
            const results = [];
            const columns = [
                search.createColumn({ name: 'name', sort: search.Sort.ASC }),
                search.createColumn({ name: FIELD_MAP.email }),
                search.createColumn({ name: FIELD_MAP.phone }),
                search.createColumn({ name: FIELD_MAP.jobTitle }),
                search.createColumn({ name: FIELD_MAP.status }),
                search.createColumn({ name: FIELD_MAP.address }),
            ];

            search.create({ type: RECORD_TYPE, columns }).run().each((result) => {
                results.push({
                    id: result.id,
                    name: result.getValue({ name: 'name' }) || '',
                    email: result.getValue({ name: FIELD_MAP.email }) || '',
                    phone: result.getValue({ name: FIELD_MAP.phone }) || '',
                    jobTitle: result.getValue({ name: FIELD_MAP.jobTitle }) || '',
                    status: result.getValue({ name: FIELD_MAP.status }) || '',
                    address: result.getValue({ name: FIELD_MAP.address }) || '',
                });
                return true;
            });

            return results;
        } catch (errLoadAllEmployees) {
            log.debug('errLoadAllEmployees', errLoadAllEmployees);
            throw errLoadAllEmployees;
        }
    };

    const computeKPIs = (employees) => {
        try {
            const total = employees.length;

            const jobTitles = {};
            employees.forEach(e => {
                const jt = e.jobTitle || 'Unspecified';
                jobTitles[jt] = (jobTitles[jt] || 0) + 1;
            });

            const withEmail = employees.filter(e => e.email && e.email.length > 0).length;
            const completeness = total > 0 ? ((withEmail / total) * 100).toFixed(1) : '0.0';

            return { total, jobTitles, completeness };
        } catch (errComputeKPIs) {
            log.debug('errComputeKPIs', errComputeKPIs);
            throw errComputeKPIs;
        }
    };

    /* ──────────────────────────────────────────
     *  HELPERS
     * ────────────────────────────────────────── */

    const respondJSON = (context, data) => {
        try {
            context.response.setHeader({ name: 'Content-Type', value: 'application/json' });
            context.response.write(JSON.stringify(data));
        } catch (errRespondJSON) {
            log.debug('errRespondJSON', errRespondJSON);
            throw errRespondJSON;
        }
    };

    /* ──────────────────────────────────────────
     *  INLINE HTML
     * ────────────────────────────────────────── */

    const getDashboardHTML = (context) => {
        try {
            const dashUrl = url.resolveScript({ scriptId: DASH_SCRIPT, deploymentId: DASH_DEPLOY });

            let empDashUrl = '';
            try {
                empDashUrl = url.resolveScript({ scriptId: EMP_DASH_SCRIPT, deploymentId: EMP_DASH_DEPLOY });
            } catch (e) {
                empDashUrl = '#';
            }

            const userName = runtime.getCurrentUser().name || 'User';
            const userInitial = userName.charAt(0).toUpperCase();

            return /* html */ `
<!-- ECharts CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js"><\/script>

<style>
  #main_form { background: transparent !important; margin: 0 !important; padding: 0 !important; }
  .uir-page-title-secondline, .uir-page-title { display: none !important; }
  body { background: #F9FAFB !important; }

  :root {
    --primary:#1F4E79;--primary-light:#2E75B6;--primary-lighter:#D6E4F0;--primary-bg:#EBF2F8;
    --success:#10B981;--success-bg:#ECFDF5;--warning:#F59E0B;--warning-bg:#FFFBEB;
    --danger:#EF4444;--danger-bg:#FEF2F2;
    --g50:#F9FAFB;--g100:#F3F4F6;--g200:#E5E7EB;--g300:#D1D5DB;--g400:#9CA3AF;
    --g500:#6B7280;--g600:#4B5563;--g700:#374151;--g800:#1F2937;--g900:#111827;--white:#FFF;
    --shadow:0 1px 3px rgba(0,0,0,.1),0 1px 2px rgba(0,0,0,.06);
    --shadow-md:0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.06);
    --radius:8px;--radius-lg:12px;
  }
  .da *{box-sizing:border-box;margin:0;padding:0}
  .da{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:var(--g800);max-width:1320px;margin:0 auto;padding:24px 16px}

  /* Top bar */
  .da-top{background:linear-gradient(135deg,var(--primary),var(--primary-light));color:#fff;display:flex;align-items:center;height:52px;padding:0 28px;border-radius:var(--radius-lg) var(--radius-lg) 0 0}
  .da-top .logo{font-weight:700;font-size:16px;display:flex;align-items:center;gap:8px}
  .da-top .nav{display:flex;gap:4px;margin-left:36px}
  .da-top .nl{padding:7px 16px;border-radius:6px;font-size:13px;font-weight:500;color:rgba(255,255,255,.7);text-decoration:none;cursor:pointer;transition:.2s}
  .da-top .nl:hover{color:#fff;background:rgba(255,255,255,.1)}
  .da-top .nl.act{color:#fff;background:rgba(255,255,255,.15)}
  .da-top .usr{margin-left:auto;display:flex;align-items:center;gap:8px;font-size:13px}
  .da-top .av{width:30px;height:30px;background:rgba(255,255,255,.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px}

  /* Page Header */
  .da-ph{background:#fff;padding:20px 28px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--g100)}
  .da-ph h1{font-size:20px;font-weight:700;color:var(--g900)}
  .da-ph .sub{font-size:13px;color:var(--g500);margin-top:2px}

  /* KPI */
  .da-kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:20px 28px;background:#fff;border-bottom:1px solid var(--g100)}
  .da-kc{padding:18px 20px;border-radius:var(--radius-lg);border:1px solid var(--g200);display:flex;align-items:flex-start;gap:12px;transition:.2s;background:var(--white)}
  .da-kc:hover{box-shadow:var(--shadow-md);transform:translateY(-1px)}
  .da-ki{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .da-ki.bl{background:var(--primary-bg)}.da-ki.gr{background:var(--success-bg)}.da-ki.yl{background:var(--warning-bg)}.da-ki.rd{background:var(--danger-bg)}
  .da-kv{font-size:24px;font-weight:700;color:var(--g900);line-height:1}
  .da-kl{font-size:12px;color:var(--g500);margin-top:3px}

  /* Charts */
  .da-charts{display:grid;grid-template-columns:1fr 1fr;gap:0;background:#fff;border-bottom:1px solid var(--g100)}
  .da-chart-box{padding:20px 28px;border-right:1px solid var(--g100)}
  .da-chart-box:last-child{border-right:none}
  .da-chart-title{font-size:14px;font-weight:600;color:var(--g800);margin-bottom:12px}

  /* Grid Section */
  .da-grid-sec{background:#fff;border-radius:0 0 var(--radius-lg) var(--radius-lg);overflow:hidden}
  .da-grid-head{padding:16px 28px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--g100)}
  .da-grid-head h2{font-size:15px;font-weight:600;color:var(--g800)}
  .da-fbar{display:flex;gap:8px;align-items:center}
  .da-fbar input,.da-fbar select{padding:7px 12px;border:1px solid var(--g300);border-radius:7px;font-size:13px;color:var(--g700);background:#fff;transition:.2s}
  .da-fbar input:focus,.da-fbar select:focus{outline:none;border-color:var(--primary-light);box-shadow:0 0 0 3px rgba(46,117,182,.1)}
  .da-fbar input{width:220px}

  /* Table */
  .da-tbl{width:100%;border-collapse:collapse}
  .da-tbl thead th{background:var(--g50);color:var(--g700);font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;padding:10px 14px;text-align:left;border-bottom:2px solid var(--g200);cursor:pointer;user-select:none;white-space:nowrap;position:relative}
  .da-tbl thead th:hover{background:var(--g100)}
  .da-tbl thead th .sort-icon{display:inline-block;margin-left:4px;color:var(--g400);font-size:10px}
  .da-tbl thead th.asc .sort-icon::after{content:'\\25B2'}
  .da-tbl thead th.desc .sort-icon::after{content:'\\25BC'}
  .da-tbl thead th:not(.asc):not(.desc) .sort-icon::after{content:'\\25B2\\25BC';font-size:8px;letter-spacing:-2px;opacity:.4}
  .da-tbl tbody tr{border-bottom:1px solid var(--g100);transition:background .15s}
  .da-tbl tbody tr:hover{background:var(--primary-bg)}
  .da-tbl tbody td{padding:10px 14px;font-size:13px;color:var(--g800);vertical-align:middle}
  .da-tbl .emp-name{color:var(--primary-light);font-weight:600;cursor:pointer;text-decoration:none}
  .da-tbl .emp-name:hover{text-decoration:underline}
  .da-tbl .empty-cell{color:var(--g400)}

  /* Badges */
  .bd{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:6px;font-size:11.5px;font-weight:600;white-space:nowrap}
  .bd-s{background:var(--success-bg);color:#059669}.bd-w{background:var(--warning-bg);color:#D97706}.bd-d{background:var(--danger-bg);color:var(--danger)}.bd-i{background:var(--primary-bg);color:var(--primary-light)}
  .bd-dot{width:6px;height:6px;border-radius:50%;display:inline-block}
  .bd-s .bd-dot{background:var(--success)}.bd-w .bd-dot{background:var(--warning)}.bd-d .bd-dot{background:var(--danger)}.bd-i .bd-dot{background:var(--primary-light)}

  /* Pagination */
  .da-pag{display:flex;align-items:center;justify-content:space-between;padding:12px 28px;border-top:1px solid var(--g100);background:var(--g50)}
  .da-pag .info{font-size:13px;color:var(--g500)}
  .da-pag .btns{display:flex;gap:4px}
  .da-pag .pg-btn{padding:6px 12px;border:1px solid var(--g300);border-radius:6px;background:#fff;color:var(--g700);font-size:13px;cursor:pointer;transition:.2s;font-weight:500}
  .da-pag .pg-btn:hover:not(:disabled){background:var(--primary-bg);border-color:var(--primary-light);color:var(--primary)}
  .da-pag .pg-btn:disabled{opacity:.4;cursor:default}
  .da-pag .pg-btn.active{background:var(--primary);color:#fff;border-color:var(--primary)}

  /* Buttons */
  .dbtn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:none;transition:.2s}
  .dbtn-v{background:var(--primary-bg);color:var(--primary)}.dbtn-v:hover{background:var(--primary-lighter)}
  .dbtn-del{background:var(--danger-bg);color:var(--danger)}.dbtn-del:hover{background:#FEE2E2}
  .dbtn-sec{background:#fff;color:var(--g700);border:1px solid var(--g300);padding:8px 16px;border-radius:7px;font-size:13px;font-weight:500}
  .dbtn-sec:hover{background:var(--g50)}
  .dbtn-pri{background:var(--primary);color:#fff;padding:8px 16px;border-radius:7px;font-size:13px;font-weight:500;text-decoration:none;display:inline-flex;align-items:center;gap:5px}
  .dbtn-pri:hover{background:var(--primary-light)}

  /* Detail Modal */
  .da-modal-bg{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.4);z-index:9999;align-items:center;justify-content:center}
  .da-modal-bg.show{display:flex}
  .da-modal{background:#fff;border-radius:var(--radius-lg);width:560px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.15);padding:28px}
  .da-modal h2{font-size:18px;font-weight:700;color:var(--g900);margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
  .da-modal .close-btn{background:none;border:none;cursor:pointer;color:var(--g400);font-size:20px;padding:4px}
  .da-modal .close-btn:hover{color:var(--g700)}
  .da-modal .field-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .da-modal .field-item{padding:12px;background:var(--g50);border-radius:var(--radius);border:1px solid var(--g200)}
  .da-modal .field-item.full{grid-column:1/3}
  .da-modal .field-item .lb{font-size:11px;color:var(--g400);text-transform:uppercase;letter-spacing:.5px;font-weight:600}
  .da-modal .field-item .vl{font-size:14px;font-weight:500;color:var(--g800);margin-top:3px;word-break:break-word}

  /* Loading */
  .da-loading{text-align:center;padding:60px 20px;color:var(--g400);font-size:14px}

  @keyframes daFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .da-anim{animation:daFadeIn .3s ease forwards}
  @media(max-width:1024px){.da-kpi{grid-template-columns:repeat(2,1fr)}.da-charts{grid-template-columns:1fr}.da-modal .field-grid{grid-template-columns:1fr}.da-modal .field-item.full{grid-column:1}}
</style>

<div class="da da-anim">
  <!-- Top Nav -->
  <div class="da-top">
    <div class="logo">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
      Employee Hub
    </div>
    <div class="nav">
      <a class="nl act">Analytics</a>
      <a class="nl" href="${empDashUrl}">Manage</a>
    </div>
    <div class="usr"><div class="av">${userInitial}</div><span>${userName}</span></div>
  </div>

  <!-- Page Header -->
  <div class="da-ph">
    <div><h1>Employee Analytics</h1><p class="sub">Overview of workforce data and insights</p></div>
    <div style="display:flex;gap:8px">
      <button class="dbtn-sec" onclick="daRefresh()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
        Refresh
      </button>
      <a class="dbtn-pri" href="${empDashUrl}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Employee
      </a>
    </div>
  </div>

  <!-- KPIs -->
  <div class="da-kpi">
    <div class="da-kc"><div class="da-ki bl"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E75B6" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div><div class="da-kv" id="kTotal">--</div><div class="da-kl">Total Employees</div></div></div>
    <div class="da-kc"><div class="da-ki gr"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg></div><div><div class="da-kv" id="kComplete">--%</div><div class="da-kl">Profile Completeness</div></div></div>
    <div class="da-kc"><div class="da-ki rd"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h4"/></svg></div><div><div class="da-kv" id="kJobTitles">--</div><div class="da-kl">Unique Job Titles</div></div></div>
  </div>

  <!-- Charts -->
  <div class="da-charts">
    <div class="da-chart-box"><div class="da-chart-title">Employees by Job Title</div><div id="daJobChart" style="height:260px"></div></div>
  </div>

  <!-- Employee Directory -->
  <div class="da-grid-sec">
    <div class="da-grid-head">
      <h2>Employee Directory</h2>
      <div class="da-fbar">
        <input type="text" placeholder="Search employees..." id="daSearch" oninput="daFilter()">
        <select id="daJobFilter" onchange="daFilter()"><option value="">All Job Titles</option></select>
      </div>
    </div>
    <div id="daTableWrap">
      <div class="da-loading">Loading employees...</div>
    </div>
    <div class="da-pag" id="daPag" style="display:none">
      <div class="info" id="daPagInfo">Showing 0 of 0</div>
      <div class="btns" id="daPagBtns"></div>
    </div>
  </div>
</div>

<!-- Detail Modal -->
<div class="da-modal-bg" id="daModal" onclick="if(event.target===this)daCloseModal()">
  <div class="da-modal da-anim">
    <h2><span id="daModalTitle">Employee Details</span><button class="close-btn" onclick="daCloseModal()">&times;</button></h2>
    <div class="field-grid" id="daModalBody"></div>
  </div>
</div>

<script>
(function(){
  var DASH_URL = '${dashUrl}';
  var allEmployees = [];
  var filteredEmployees = [];
  var PAGE_SIZE = 10;
  var currentPage = 1;
  var sortCol = 'name';
  var sortDir = 'asc';

  /* ── Load Data ── */
  function loadData() {
    fetch(DASH_URL + '&action=getData')
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (!d.success) { console.error(d.error); return; }
        allEmployees = d.employees;
        filteredEmployees = allEmployees.slice();
        renderKPIs(d.kpis);
        renderTable();
        renderCharts(d.employees, d.kpis);
        populateJobFilter(d.kpis.jobTitles);
      })
      .catch(function(e){ console.error(e); });
  }

  /* ── KPIs ── */
  function renderKPIs(k) {
    document.getElementById('kTotal').textContent = k.total;
    document.getElementById('kComplete').textContent = k.completeness + '%';
    document.getElementById('kJobTitles').textContent = Object.keys(k.jobTitles).length;
  }

  /* ── Populate Job Filter ── */
  function populateJobFilter(jobTitles) {
    var sel = document.getElementById('daJobFilter');
    while (sel.options.length > 1) sel.remove(1);
    Object.keys(jobTitles).sort().forEach(function(jt) {
      var opt = document.createElement('option');
      opt.value = jt;
      opt.textContent = jt + ' (' + jobTitles[jt] + ')';
      sel.appendChild(opt);
    });
  }

  /* ── Table ── */
  function renderTable() {
    sortData();
    var start = (currentPage - 1) * PAGE_SIZE;
    var page = filteredEmployees.slice(start, start + PAGE_SIZE);
    var total = filteredEmployees.length;

    var cols = [
      { key: 'id', label: 'ID', width: '60px' },
      { key: 'name', label: 'Name', width: '160px' },
      { key: 'email', label: 'Email', width: '200px' },
      { key: 'phone', label: 'Phone', width: '130px' },
      { key: 'jobTitle', label: 'Job Title', width: '150px' },
      { key: 'status', label: 'Status', width: '120px' },
      { key: '_actions', label: 'Actions', width: '140px' }
    ];

    var html = '<table class="da-tbl"><thead><tr>';
    cols.forEach(function(c) {
      var cls = '';
      if (c.key !== '_actions') {
        if (sortCol === c.key) cls = sortDir;
      }
      html += '<th class="' + cls + '" style="width:' + c.width + '" onclick="' + (c.key !== '_actions' ? "daSort('" + c.key + "')" : '') + '">';
      html += c.label;
      if (c.key !== '_actions') html += '<span class="sort-icon"></span>';
      html += '</th>';
    });
    html += '</tr></thead><tbody>';

    if (page.length === 0) {
      html += '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--g400)">No employees found</td></tr>';
    }

    page.forEach(function(emp) {
      html += '<tr>';
      html += '<td style="color:var(--g500)">' + emp.id + '</td>';
      html += '<td><a class="emp-name" onclick="window._daViewEmp(\\'' + emp.id + '\\')">' + escHtml(emp.name || '') + '</a></td>';
      html += '<td>' + escHtml(emp.email || '') + '</td>';
      html += '<td>' + escHtml(emp.phone || '') + '</td>';
      html += '<td>' + (emp.jobTitle ? '<span class="bd bd-i">' + escHtml(emp.jobTitle) + '</span>' : '<span class="empty-cell">\\u2014</span>') + '</td>';

      html += '<td>' + (emp.status ? '<span class="bd bd-s"><span class="bd-dot"></span> ' + escHtml(emp.status) + '</span>' : '<span class="empty-cell">\\u2014</span>') + '</td>';
      html += '<td><button class="dbtn dbtn-v" onclick="window._daViewEmp(\'' + emp.id + '\')">View</button> <button class="dbtn dbtn-del" onclick="window._daDeleteEmp(\'' + emp.id + '\', \'' + escHtml(emp.name || '') + '\')">Delete</button></td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
    document.getElementById('daTableWrap').innerHTML = html;

    // Pagination
    var totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    var startNum = total > 0 ? start + 1 : 0;
    var endNum = Math.min(start + PAGE_SIZE, total);
    document.getElementById('daPagInfo').textContent = 'Showing ' + startNum + '-' + endNum + ' of ' + total + ' employees';

    var btnsHtml = '<button class="pg-btn" onclick="daGoPage(' + (currentPage - 1) + ')" ' + (currentPage <= 1 ? 'disabled' : '') + '>Prev</button>';
    for (var i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 3 && i < totalPages - 2 && Math.abs(i - currentPage) > 1) {
        if (i === 4 || i === totalPages - 3) btnsHtml += '<span style="padding:6px 4px;color:var(--g400)">...</span>';
        continue;
      }
      btnsHtml += '<button class="pg-btn' + (i === currentPage ? ' active' : '') + '" onclick="daGoPage(' + i + ')">' + i + '</button>';
    }
    btnsHtml += '<button class="pg-btn" onclick="daGoPage(' + (currentPage + 1) + ')" ' + (currentPage >= totalPages ? 'disabled' : '') + '>Next</button>';
    document.getElementById('daPagBtns').innerHTML = btnsHtml;
    document.getElementById('daPag').style.display = 'flex';
  }

  function sortData() {
    filteredEmployees.sort(function(a, b) {
      var va = (a[sortCol] || '').toString().toLowerCase();
      var vb = (b[sortCol] || '').toString().toLowerCase();
      var na = parseFloat(va), nb = parseFloat(vb);
      if (!isNaN(na) && !isNaN(nb)) { va = na; vb = nb; }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ── Sort ── */
  window.daSort = function(col) {
    if (sortCol === col) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortCol = col;
      sortDir = 'asc';
    }
    currentPage = 1;
    renderTable();
  };

  /* ── Pagination ── */
  window.daGoPage = function(p) {
    var totalPages = Math.ceil(filteredEmployees.length / PAGE_SIZE) || 1;
    if (p < 1 || p > totalPages) return;
    currentPage = p;
    renderTable();
  };

  /* ── Filter ── */
  window.daFilter = function() {
    var txt = (document.getElementById('daSearch').value || '').toLowerCase();
    var jt = document.getElementById('daJobFilter').value;
    filteredEmployees = allEmployees.filter(function(e) {
      if (jt && e.jobTitle !== jt) return false;
      if (txt) {
        var haystack = [e.name, e.email, e.phone, e.jobTitle, e.status, e.id].join(' ').toLowerCase();
        if (haystack.indexOf(txt) === -1) return false;
      }
      return true;
    });
    currentPage = 1;
    renderTable();
  };

  window.daRefresh = function() { loadData(); };

  /* ── Delete Employee ── */
  window._daDeleteEmp = function(empId, empName) {
    if (!confirm('Are you sure you want to delete "' + empName + '" (ID: ' + empId + ')?')) return;
    fetch(DASH_URL + '&action=deleteEmployee&empId=' + empId)
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (!d.success) { alert('Error: ' + d.error); return; }
        loadData();
      })
      .catch(function(e){ alert('Error: ' + e.message); });
  };

  /* ── Charts ── */
  function renderCharts(employees, kpis) {
    var jc = echarts.init(document.getElementById('daJobChart'));
    var jtEntries = Object.entries(kpis.jobTitles).sort(function(a,b){ return b[1]-a[1]; });
    var jtNames = jtEntries.map(function(e){ return e[0]; });
    var jtCounts = jtEntries.map(function(e){ return e[1]; });
    var barColors = ['#2E75B6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];

    jc.setOption({
      tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e5e7eb', textStyle: { color: '#374151', fontSize: 12 } },
      grid: { left: 90, right: 20, top: 12, bottom: 24 },
      xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }, axisLabel: { color: '#9CA3AF', fontSize: 11 } },
      yAxis: { type: 'category', data: jtNames.reverse(), axisLine: { lineStyle: { color: '#e5e7eb' } }, axisLabel: { color: '#6B7280', fontSize: 11 }, axisTick: { show: false } },
      series: [{
        type: 'bar', barWidth: 22,
        itemStyle: { borderRadius: [0, 4, 4, 0], color: function(p) { return barColors[p.dataIndex % barColors.length]; } },
        data: jtCounts.reverse()
      }]
    });

    window.addEventListener('resize', function() { jc.resize(); });
  }

  /* ── View Employee Modal ── */
  window._daViewEmp = function(empId) {
    fetch(DASH_URL + '&action=getEmployee&empId=' + empId)
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (!d.success) { alert(d.error); return; }
        showModal(d.employee);
      });
  };

  function showModal(emp) {
    document.getElementById('daModalTitle').textContent = emp.name || 'Employee Details';
    var fields = [
      { label: 'Name', value: emp.name },
      { label: 'Email', value: emp.email },
      { label: 'Phone', value: emp.phone },
      { label: 'Job Title', value: emp.jobTitle },
      { label: 'Status', value: emp.status },
      { label: 'Date of Birth', value: emp.dob_text || emp.dob },
      { label: 'Address', value: emp.address, full: true },
      { label: 'About', value: emp.about, full: true }
    ];

    var html = '';
    fields.forEach(function(f) {
      var cls = f.full ? 'field-item full' : 'field-item';
      var val = f.value || '<span style="color:var(--g400)">\\u2014</span>';
      html += '<div class="' + cls + '"><div class="lb">' + f.label + '</div><div class="vl">' + val + '</div></div>';
    });

    document.getElementById('daModalBody').innerHTML = html;
    document.getElementById('daModal').classList.add('show');
  }

  window.daCloseModal = function() {
    document.getElementById('daModal').classList.remove('show');
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') window.daCloseModal();
  });

  /* ── Init ── */
  loadData();
})();
<\/script>
`;
        } catch (errGetDashboardHTML) {
            log.debug('errGetDashboardHTML', errGetDashboardHTML);
            throw errGetDashboardHTML;
        }
    };

    return { onRequest };
});
