export function isDB(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return false;
    const data = value;
    const arrayFields = [
        'users', 'departments', 'types', 'salaryGrades', 'schedules', 'positions', 'employees', 'docs',
        'education', 'eligibility', 'experience', 'promotions', 'leaveTypes', 'credits', 'leaves',
        'overtime', 'holidays', 'dtr', 'allowances', 'empAllow', 'loans', 'dedTypes', 'payroll', 'audit',
    ];
    if (data.v !== 2 || !arrayFields.every(field => Array.isArray(data[field])))
        return false;
    if (data.leaveApprovals !== undefined && !Array.isArray(data.leaveApprovals))
        return false;
    if (!data.periodStatus || typeof data.periodStatus !== 'object' || Array.isArray(data.periodStatus))
        return false;
    const records = (field) => data[field].every(row => row !== null && typeof row === 'object' && !Array.isArray(row));
    if (!arrayFields.every(records))
        return false;
    if (Array.isArray(data.leaveApprovals) && !records('leaveApprovals'))
        return false;
    const users = data.users;
    const employees = data.employees;
    const salaryGrades = data.salaryGrades;
    const leaveTypes = data.leaveTypes;
    const approvals = (data.leaveApprovals || []);
    const leaveIds = new Set(data.leaves.map(leave => leave.id));
    const userIds = new Set(users.map(user => user.id));
    return users.every(user => typeof user.id === 'number' && typeof user.username === 'string' && ['Administrator', 'HR Staff'].includes(String(user.role)))
        && employees.every(employee => typeof employee.id === 'number' && typeof employee.no === 'string' && typeof employee.first === 'string' && typeof employee.last === 'string' && ['Active', 'Inactive'].includes(String(employee.status)))
        && salaryGrades.every(grade => typeof grade.id === 'number' && typeof grade.grade === 'number' && typeof grade.step === 'number' && typeof grade.rate === 'number')
        && leaveTypes.every(type => typeof type.id === 'number' && typeof type.name === 'string')
        && approvals.every(approval => typeof approval.id === 'number' && typeof approval.leaveRequestId === 'number'
            && (approval.approvedByUserId === null || typeof approval.approvedByUserId === 'number')
            && ['Approved', 'Rejected'].includes(String(approval.decision)) && typeof approval.dateActedOn === 'string'
            && typeof approval.remarks === 'string' && leaveIds.has(approval.leaveRequestId)
            && (approval.approvedByUserId === null || userIds.has(approval.approvedByUserId)));
}
export const DOC_TYPES = ['Appointment Papers', 'Personal Data Sheet', 'PRC License / Eligibility', 'Service Record', 'Medical Certificate', 'Oath of Office'];
export const NAV = [['dashboard', 'Dashboard'], ['employees', 'Employees'], ['leave', 'Leave'], ['dtr', 'DTR'], ['payroll', 'Payroll'], ['account', 'Settings & Account']];
export const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
export const fm = (n) => (n < 0 ? '−' : '') + '₱' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fm0 = (n) => '₱' + Math.round(n).toLocaleString('en-US');
export const D = (s) => new Date(s + 'T00:00:00');
export const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export const todayISO = () => iso(new Date());
export const fd = (s) => s ? D(s).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—';
export const fdr = (a, b) => a === b ? fd(a) : `${D(a).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${D(b).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
export const fdw = (s) => D(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
export const t12 = (t) => {
    if (!t)
        return '—'; const [h, m] = t.split(':').map(Number); return `${(h % 12) || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
export const mins = (t) => {
    if (!t)
        return 0; const [h, m] = t.split(':').map(Number); return h * 60 + m;
};
export const nid = (a) => a.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1;
export const ename = (e) => e ? `${e.first} ${e.mi ? e.mi + '. ' : ''}${e.last}` : '(removed)';
export const ini = (e) => (e.first[0] + e.last[0]).toUpperCase();
export const sgName = (db, id) => { const s = db.salaryGrades.find(x => x.id === id); return s ? `SG-${s.grade} · Step ${s.step}` : '—'; };
export function migrateLeaveApprovals(db) {
    if (Array.isArray(db.leaveApprovals))
        return db;
    let nextId = 0;
    db.leaveApprovals = db.leaves.flatMap((leave) => {
        if (!['Approved', 'Rejected'].includes(leave.status))
            return [];
        const user = db.users.find(account => account.name === leave.approvedBy || account.username === leave.approvedBy);
        return [{
            id: ++nextId,
            leaveRequestId: leave.id,
            approvedByUserId: user?.id ?? null,
            decision: leave.status,
            dateActedOn: leave.approvedOn || leave.filed || todayISO(),
            remarks: leave.remarks || '',
            ...(!user && leave.approvedBy ? { legacyActor: leave.approvedBy } : {}),
        }];
    });
    return db;
}
export function calcLeaveAccrual(openingBalance, balanceAsOf, asOf = todayISO()) {
    const start = new Date(`${balanceAsOf}T00:00:00Z`), end = new Date(`${asOf}T00:00:00Z`);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start)
        return r2(openingBalance);
    let months = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth();
    const anniversaryDay = Math.min(start.getUTCDate(), new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).getUTCDate());
    if (end.getUTCDate() < anniversaryDay)
        months--;
    return r2(openingBalance + Math.max(0, months) * 1.25);
}
export function seed() {
    const db = { v: 2 };
    db.users = [
        { id: 1, username: 'hr.admin', password: 'admin123', role: 'Administrator', name: 'HR Admin', email: 'hr.admin@pamplona.gov.ph', lastLogin: null },
        { id: 2, username: 'hr.staff', password: 'staff123', role: 'HR Staff', name: 'HR Staff', email: 'hr.staff@pamplona.gov.ph', lastLogin: null },
    ];
    db.departments = ['Mayor’s Office', 'Accounting', 'Treasury', 'Rural Health Unit', 'General Services', 'Engineering Office', 'Municipal HR Office'].map((name, i) => ({ id: i + 1, name }));
    db.types = ['Permanent', 'Casual', 'Job Order'].map((name, i) => ({ id: i + 1, name }));
    db.salaryGrades = [[1, 1, 13530], [3, 1, 14061], [14, 4, 33500], [15, 2, 35200], [15, 3, 36619], [18, 1, 43030], [24, 1, 87315]].map(([grade, step, rate], i) => ({ id: i + 1, grade, step, rate }));
    db.schedules = [{ id: 1, name: '8:00 AM – 5:00 PM', amIn: '08:00', amOut: '12:00', pmIn: '13:00', pmOut: '17:00' }];
    const positions = [['Administrative Officer IV', 'PLT-ADM-0004'], ['Municipal Accountant', 'PLT-ACC-0001'], ['Nurse II', 'PLT-NUR-0007'], ['Utility Worker I', 'PLT-UTL-0012'], ['Administrative Aide III', 'PLT-ADA-0030'], ['Engineer II', 'PLT-ENG-0003'], ['Midwife II', 'PLT-MID-0005'], ['Driver I', 'PLT-DRV-0002'], ['Administrative Officer II', 'PLT-ADM-0009']];
    db.positions = positions.map(([title, item], i) => ({ id: i + 1, title, item }));
    const employees = [
        ['Maria', 'L', 'Santos', 'Female', 'Married', '1988-02-14', 1, 1, 1, 4, '2015-03-12', 'Active', false],
        ['Juan', 'P', 'dela Cruz', 'Male', 'Married', '1979-07-30', 2, 2, 1, 7, '2012-06-03', 'Active', false],
        ['Ana', 'M', 'Reyes', 'Female', 'Married', '1991-04-08', 4, 3, 1, 5, '2018-01-20', 'Active', true],
        ['Pedro', 'C', 'Bautista', 'Male', 'Single', '1995-11-02', 5, 4, 2, 1, '2021-08-15', 'Active', false],
        ['Liza', 'R', 'Mercado', 'Female', 'Single', '1998-09-19', 3, 5, 3, 1, '2023-02-01', 'Active', false],
        ['Carlos', 'T', 'Rivera', 'Male', 'Married', '1985-01-25', 6, 6, 1, 6, '2016-09-09', 'Active', false],
        ['Elena', 'S', 'Garcia', 'Female', 'Married', '1987-12-05', 4, 7, 1, 3, '2014-11-14', 'Active', true],
        ['Ramon', 'D', 'Villanueva', 'Male', 'Single', '1993-05-17', 5, 8, 2, 2, '2022-05-02', 'Inactive', false],
    ];
    db.employees = employees.map((e, i) => ({
        id: i + 1, no: 'EMP-' + String([1, 14, 27, 33, 41, 52, 60, 71][i]).padStart(4, '0'),
        first: e[0], mi: e[1], last: e[2], sex: e[3], civil: e[4], birth: e[5],
        contact: '0917 000 00' + String(10 + i), email: `${e[0][0]}.${e[2].replace(/ /g, '')}`.toLowerCase() + '@pamplona.gov.ph',
        address: `Purok ${i % 5 + 1}, Poblacion, Pamplona, Camarines Sur`, deptId: e[6], posId: e[7], typeId: e[8], sgId: e[9], schedId: 1, hired: e[10], status: e[11], rhu: e[12],
    }));
    db.docs = [];
    db.employees.forEach((e) => DOC_TYPES.forEach((type, j) => db.docs.push({ empId: e.id, type, date: (e.id + j) % 7 === 0 || (e.id === 3 && j === 3) ? null : e.hired })));
    db.education = [{ id: 1, empId: 3, level: 'College', school: 'Bicol University', course: 'BS Nursing', year: '2012' }, { id: 2, empId: 3, level: 'Secondary', school: 'Pamplona National High School', course: '—', year: '2008' }];
    db.eligibility = [{ id: 1, empId: 3, name: 'Professional Regulation Commission — Nurse', rating: '82.40', date: '2012-11-18', license: '0712345' }];
    db.experience = [{ id: 1, empId: 3, agency: 'Bicol Medical Center', position: 'Staff Nurse', from: '2013-02-01', to: '2017-12-31' }];
    db.promotions = [{ id: 1, empId: 3, date: '2022-01-03', oldPos: 'Nurse I', newPos: 'Nurse II', oldSg: 'SG-11 · Step 4', newSg: 'SG-15 · Step 3' }];
    db.leaveTypes = [{ id: 1, name: 'Vacation Leave', annual: 15 }, { id: 2, name: 'Sick Leave', annual: 15 }, { id: 3, name: 'Special Privilege Leave', annual: 3 }, { id: 4, name: 'Compensatory Time-Off (CTO)', annual: 0 }];
    db.credits = [];
    db.employees.forEach((e) => db.leaveTypes.forEach((t) => db.credits.push({ empId: e.id, typeId: t.id, total: t.annual, used: 0 })));
    const credit = (e, t) => db.credits.find((c) => c.empId === e && c.typeId === t);
    credit(3, 1).used = 2.5;
    credit(3, 2).used = 6;
    credit(3, 4).total = 4;
    credit(3, 4).used = 1.5;
    db.leaves = [
        { id: 1, empId: 1, typeId: 1, start: '2026-10-20', end: '2026-10-22', days: 3, reason: 'Family trip', status: 'Pending', filed: '2026-10-12' },
        { id: 2, empId: 2, typeId: 2, start: '2026-10-21', end: '2026-10-21', days: 1, reason: 'Fever', status: 'Pending', filed: '2026-10-20' },
        { id: 3, empId: 3, typeId: 4, start: '2026-10-23', end: '2026-10-23', days: 1, reason: 'CTO from overtime', status: 'Approved', filed: '2026-10-19', approvedBy: 'HR Admin', approvedOn: '2026-10-19', remarks: '' },
        { id: 4, empId: 4, typeId: 3, start: '2026-10-27', end: '2026-10-27', days: 1, reason: 'Personal', status: 'Rejected', filed: '2026-10-22', approvedBy: 'HR Admin', approvedOn: '2026-10-23', remarks: 'Short staffed that day' },
        { id: 5, empId: 5, typeId: 1, start: '2026-11-03', end: '2026-11-05', days: 3, reason: 'Rest', status: 'Pending', filed: '2026-10-28' },
    ];
    db.leaveApprovals = db.leaves.filter((leave) => ['Approved', 'Rejected'].includes(leave.status)).map((leave, i) => ({
        id: i + 1, leaveRequestId: leave.id, approvedByUserId: 1, decision: leave.status, dateActedOn: leave.approvedOn || leave.filed, remarks: leave.remarks || '',
    }));
    db.overtime = [{ id: 1, empId: 3, date: '2026-10-10', hours: 8, cto: 1.25, status: 'Approved' }, { id: 2, empId: 6, date: '2026-10-28', hours: 3, cto: 0.47, status: 'Pending' }];
    db.holidays = [['2026-11-01', 'All Saints’ Day'], ['2026-11-02', 'All Souls’ Day'], ['2026-11-30', 'Bonifacio Day'], ['2026-12-25', 'Christmas Day'], ['2026-12-30', 'Rizal Day']].map(([date, name], i) => ({ id: i + 1, date, name }));
    db.dtr = [];
    const addDtr = (empId, periodId, absent = 0, lateMin = 0) => {
        const p = periodById(periodId);
        db.dtr.push({ id: db.dtr.length + 1, empId, periodId, present: workdays(db, p.start, p.end) - absent, absent, lateMin });
    };
    db.employees.filter((e) => e.status === 'Active').forEach((e) => addDtr(e.id, '2026-10-a', e.id === 3 ? 1 : 0, e.id === 2 ? 9 : e.id === 5 ? 25 : 0));
    addDtr(3, '2026-10-b', 1, 14);
    db.allowances = [{ id: 1, name: 'PERA', monthly: 2000 }];
    db.empAllow = db.employees.filter((e) => e.typeId !== 3).map((e) => ({ empId: e.id, allowId: 1 }));
    db.loans = [{ id: 1, empId: 3, name: 'GSIS Salary Loan', perPeriod: 812 }];
    db.dedTypes = [{ id: 1, name: 'GSIS', kind: 'pct', value: .09 }, { id: 2, name: 'PhilHealth', kind: 'pct', value: .025 }, { id: 3, name: 'Pag-IBIG', kind: 'flat', value: 200 }];
    db.periodStatus = {};
    db.payroll = [];
    db.audit = [['hr.admin', 'Approved leave request', 'LeaveApproval'], ['hr.admin', 'Processed payroll', 'Payroll'], ['hr.admin', 'Added DTR record', 'DTR'], ['hr.admin', 'Recorded promotion', 'Promotion']].map((a, i) => ({ id: i + 1, ts: new Date(Date.now() - i * 36e5).toISOString(), user: a[0], action: a[1], table: a[2], detail: '' }));
    const p = periodById('2026-10-a');
    db.employees.filter((e) => e.status === 'Active').forEach((e) => createPayroll(db, e, p, 'hr.admin'));
    return db;
}
export function periods() {
    const out = [];
    Array.from({ length: 12 }, (_, i) => [2026 + Math.floor((9 + i) / 12), (9 + i) % 12]).forEach(([y, m]) => {
        const last = new Date(y, m + 1, 0).getDate(), mm = String(m + 1).padStart(2, '0');
        out.push({ id: `${y}-${mm}-a`, start: `${y}-${mm}-01`, end: `${y}-${mm}-15` }, { id: `${y}-${mm}-b`, start: `${y}-${mm}-16`, end: `${y}-${mm}-${last}` });
    });
    out.forEach(p => p.label = fdr(p.start, p.end).replace(/, \d{4}$/, '') + ', ' + p.start.slice(0, 4));
    return out;
}
export const periodById = (id) => periods().find(p => p.id === id);
export function calcPay(db, e, p) {
    const sg = db.salaryGrades.find(s => s.id === e.sgId), monthly = sg ? sg.rate : 0, basic = r2(monthly / 2), hazard = e.rhu ? r2(basic * .1) : 0;
    const other = r2(db.empAllow.filter(a => a.empId === e.id).reduce((s, a) => s + (db.allowances.find(x => x.id === a.allowId)?.monthly ?? 0) / 2, 0));
    const gross = r2(basic + hazard + other);
    const dtr = db.dtr.find(d => d.empId === e.id && d.periodId === p.id);
    const daysAbsent = dtr?.absent ?? 0, lateMin = dtr?.lateMin ?? 0, lateDays = cscLateDays(lateMin);
    const absentDed = r2(daysAbsent * monthly / 22), lateDed = r2(lateDays * monthly / 22);
    const items = e.typeId !== 3 ? db.dedTypes.map(t => ({ name: t.name, amount: r2((t.kind === 'pct' ? monthly * t.value : t.value) / 2) })).concat(db.loans.filter(l => l.empId === e.id).map(l => ({ name: l.name, amount: l.perPeriod }))) : [];
    const otherDed = r2(items.reduce((s, i) => s + i.amount, 0));
    return { empId: e.id, periodId: p.id, monthly, basic, hazard, other, gross, daysAbsent, absentDed, lateMin, lateDays, lateDed, items, otherDed, net: r2(gross - absentDed - lateDed - otherDed) };
}
export function createPayroll(db, e, p, by) {
    const r = calcPay(db, e, p);
    r.id = nid(db.payroll);
    r.status = 'Processing';
    r.processedBy = by;
    r.processedOn = todayISO();
    db.payroll.push(r);
    return r;
}
export function cscLateDays(totalMinutes) {
    const m = Math.max(0, Math.floor(Number(totalMinutes) || 0)), hours = Math.floor(m / 60), rest = m % 60;
    return (hours * 125 + Math.max(0, Math.ceil(25 * rest / 12 - 0.5))) / 1000;
}
export function dtrStatus(record) {
    if (!record)
        return 'Not recorded';
    return record.absent > 0 ? 'Absent' : record.lateMin > 0 ? 'Late' : 'Present';
}
export function migrateDtr(db) {
    db.payroll = db.payroll.map(r => ({ lateMin: 0, lateDays: 0, lateDed: 0, ...r }));
    if (!db.dtr.some(d => d.date !== undefined))
        return db;
    const schedule = db.schedules[0], late = (d) => (d.amIn ? Math.max(0, mins(d.amIn) - mins(schedule.amIn)) : 0) + (d.pmIn ? Math.max(0, mins(d.pmIn) - mins(schedule.pmIn)) : 0);
    const groups = new Map();
    db.dtr.filter(d => d.date !== undefined).forEach(d => {
        const period = periods().find(p => d.date >= p.start && d.date <= p.end);
        if (!period)
            return;
        const key = `${d.empId}|${period.id}`, g = groups.get(key) || { empId: d.empId, periodId: period.id, present: 0, absent: 0, lateMin: 0 };
        if (d.absent)
            g.absent++;
        else {
            g.present++;
            g.lateMin += late(d);
        }
        groups.set(key, g);
    });
    const kept = db.dtr.filter(d => d.date === undefined && d.periodId !== undefined);
    db.dtr = [...kept, ...groups.values()].map((d, i) => ({ ...d, id: i + 1 }));
    return db;
}
export function workdays(db, a, b) {
    let n = 0;
    for (let d = D(a); d <= D(b); d.setDate(d.getDate() + 1)) {
        const w = d.getDay();
        if (w !== 0 && w !== 6 && !db.holidays.some(h => h.date === iso(d)))
            n++;
    }
    return n;
}
export function loadDB() {
    try {
        const raw = localStorage.getItem('pamhr.v2');
        if (raw) {
            const data = JSON.parse(raw);
            if (data?.v === 2)
                return migrateDtr(migrateLeaveApprovals(data));
        }
    }
    catch { /* use sample data */ }
    return null;
}
export const saveDB = (db) => {
    try {
        localStorage.setItem('pamhr.v2', JSON.stringify(db));
    }
    catch { /* storage may be unavailable */ }
};
