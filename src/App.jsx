import { useEffect, useState } from 'react';
import {
    CalendarCheck, Check, CheckCircle, CircleAlert, Clock, Copy, Download, Eye,
    Info, LayoutDashboard, List, Lock, LogIn, LogOut, PanelLeftClose, PanelLeftOpen, Pencil,
    Plus, RefreshCw, RotateCcw, Trash2, TriangleAlert, UserRound, Users, WalletCards, X,
} from 'lucide-react';
import lguLogo from './assets/lgu_logo.png';
import DashboardPage from './components/dashboard/DashboardPage';
import NotificationContainer from './components/notifications/NotificationContainer';
import { calcDtr, createPayroll, DOC_TYPES, ename, fd, fdw, fm, fm0, fdr, ini, loadDB, calcLeaveAccrual, isDB, migrateLeaveApprovals, NAV, nid, periodById, periods, r2, saveDB, seed, sgName, todayISO, t12, workdays, } from './domain';
const classes = (...v) => v.filter(Boolean).join(' ');
function Button({ children, tone = 'default', size = 'normal', className = '', ...props }) {
    const tones = { default: 'border-line bg-card text-ink hover:border-brand hover:bg-interactive-hover hover:text-interactive-hover-text', primary: 'border-brand bg-brand text-white hover:brightness-95', danger: 'border-danger bg-danger text-white hover:brightness-95', ghost: 'border-transparent bg-transparent text-brand hover:bg-interactive-hover hover:text-interactive-hover-text' };
    const label = typeof children === 'string' ? children.trim().toLowerCase() : '';
    const icon = label.startsWith('add') || label.startsWith('new ') ? Plus
        : label.startsWith('record') ? 'record'
            : label.startsWith('edit') || label.startsWith('save') ? Pencil
                : label.startsWith('delete') || label.startsWith('remove') ? Trash2
                    : label.startsWith('review') ? Eye
                        : label.startsWith('approve') ? Check
                            : label.startsWith('reject') ? X
                                : label.startsWith('process') ? List
                                    : label.startsWith('finalize') ? CheckCircle
                                        : label.startsWith('copy') ? Copy
                                            : label.startsWith('sign out') ? LogOut
                                                : label.startsWith('reset') ? RotateCcw
                                                    : label.startsWith('update') ? RefreshCw
                                                        : label.startsWith('mark') || label.startsWith('confirm') ? Check
                                                            : null;
    const Icon = icon === 'record' ? Pencil : icon;
    return <button className={classes('inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50', tones[tone], size === 'small' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm', className)} {...props}>{Icon && <Icon aria-hidden="true" className={classes('shrink-0', size === 'small' ? 'h-3.5 w-3.5' : 'h-4 w-4')} strokeWidth={1.8} />}{children}</button>;
}
function Card({ children, className = '' }) {
    return <section className={classes('min-w-0 overflow-hidden rounded-xl border border-line bg-card shadow-sm', className)}>{children}</section>;
}
function CardTitle({ children, action }) {
    return <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4"><h2 className="text-sm font-bold">{children}</h2>{action}</div>;
}
function Field({ label, name, required, children, className = '' }) {
    return <label className={classes('grid min-w-0 gap-1.5 text-sm font-medium text-ink', className)}><span>{label}{required && <b className="ml-1 text-danger">*</b>}</span>{children || <input className="control" name={name} required={required} />}</label>;
}
function Input(props) { return <input {...props} className={classes('control', props.className)} />; }
function Select({ name, options, value, required, ...props }) {
    return <select name={name} defaultValue={value} required={required} className="control" {...props}>{options.map((x) => <option value={x[0]} key={x[0]}>{x[1]}</option>)}</select>;
}
function Table({ headers, children }) {
    return <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead><tr>{headers.map((h, i) => <th className="whitespace-nowrap border-b border-line bg-thead px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-muted" key={i}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}
function Empty({ children }) { return <div className="px-5 py-10 text-center text-sm text-muted">{children}</div>; }
function Notice({ children, kind = 'info' }) {
    const Icon = kind === 'warning' ? TriangleAlert : kind === 'error' ? CircleAlert : Info;
    return <div className={classes('notice flex items-start gap-3 rounded-lg border p-3 text-sm', `notice-${kind}`)} role={kind === 'info' ? undefined : 'alert'}><Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><div>{children}</div></div>;
}
function Badge({ children }) {
    const tone = ['Approved', 'Finalized', 'Active', 'Present'].includes(children) ? 'bg-green-100 text-green-800' :
        ['Pending', 'Late', 'Undertime', 'On Leave', 'Late & Undertime'].includes(children) ? 'bg-amber-100 text-amber-800' :
            ['Rejected', 'Absent'].includes(children) ? 'bg-red-100 text-red-800' :
                ['Processing'].includes(children) ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600';
    return <span className={classes('inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', tone)}>{children}</span>;
}
function Stat({ label, value, hint }) {
    return <Card className="px-5 py-4"><div className="text-xs font-medium text-muted">{label}</div><div className="mt-1 text-2xl font-bold tracking-tight">{value}</div><div className="mt-1 text-xs text-muted">{hint}</div></Card>;
}
function PageTop({ title, subtitle, actions }) {
    return <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted">{subtitle}</p></div><div className="flex flex-wrap gap-2">{actions}</div></div>;
}
function Tabs({ items, value, onChange }) {
    return <div role="tablist" className="mb-5 flex gap-1 overflow-x-auto border-b border-line">{items.map(([id, label]) => <button key={id} role="tab" aria-selected={value === id} onClick={() => onChange(id)} className={classes('whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold', value === id ? 'border-brand text-brand' : 'border-transparent text-muted hover:bg-interactive-hover hover:text-interactive-hover-text')}>{label}</button>)}</div>;
}
function Person({ employee }) { return <div className="flex items-center gap-3"><span className="avatar">{ini(employee)}</span><span className="min-w-0"><b className="block truncate">{ename(employee)}</b><small className="text-muted">{employee.no}</small></span></div>; }
const icons = {
    dashboard: LayoutDashboard,
    employees: Users,
    leave: CalendarCheck,
    dtr: Clock,
    payroll: WalletCards,
    account: UserRound,
};
export default function App() {
    const [db, setDb] = useState(() => loadDB() || seed());
    const [user, setUser] = useState(null);
    const [logoVisible, setLogoVisible] = useState(true);
    const [page, setPage] = useState('dashboard');
    const [collapsed, setCollapsed] = useState(false);
    const [mobileNav, setMobileNav] = useState(false);
    const [employeeId, setEmployeeId] = useState(null);
    const [profileTab, setProfileTab] = useState('info');
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({ dept: '', type: '', status: '' });
    const [leaveTab, setLeaveTab] = useState('requests');
    const [leaveFilter, setLeaveFilter] = useState('');
    const [creditEmployee, setCreditEmployee] = useState(3);
    const [dtrEmployee, setDtrEmployee] = useState(3);
    const [dtrMonth, setDtrMonth] = useState('2026-10');
    const [payPeriod, setPayPeriod] = useState('2026-10-a');
    const [payrollId, setPayrollId] = useState(null);
    const [settingsTab, setSettingsTab] = useState('account');
    const [modal, setModal] = useState(null);
    const [loginError, setLoginError] = useState('');
    const [toasts, setToasts] = useState([]);
    const [preview, setPreview] = useState(null);
    const [restoreCandidate, setRestoreCandidate] = useState(null);
    const [restoreFilename, setRestoreFilename] = useState('');
    const activeUser = (user && db.users.find(u => u.id === user.id)) || db.users.find(u => String(u.id) === sessionStorage.getItem('pamhr.u')) || null;
    const admins = activeUser?.role === 'Administrator';
    const employees = db.employees;
    const employee = (id) => db.employees.find(e => e.id == id);
    const empName = (id) => ename(employee(id));
    const get = (table, id) => db[table]?.find((x) => x.id == id);
    const credits = (id) => db.leaveTypes.map(t => {
        const c = db.credits.find(x => x.empId == id && x.typeId === t.id) || { total: 0, used: 0 };
        const accrualType = ['Vacation Leave', 'Sick Leave'].includes(t.name);
        const validBalanceDate = typeof c.balanceAsOf === 'string' && Number.isFinite(new Date(`${c.balanceAsOf}T00:00:00Z`).getTime());
        const configured = accrualType && Number.isFinite(c.openingBalance) && validBalanceDate;
        const total = configured ? calcLeaveAccrual(c.openingBalance, c.balanceAsOf) : c.total;
        const firstDayAfterBalance = configured
            ? new Date(new Date(`${c.balanceAsOf}T00:00:00Z`).getTime() + 86400000).toISOString().slice(0, 10)
            : '';
        const used = configured
            ? r2(db.leaves.filter(l => l.empId == id && l.typeId === t.id && l.status === 'Approved' && l.end >= firstDayAfterBalance)
                .reduce((sum, l) => sum + workdays(db, l.start > firstDayAfterBalance ? l.start : firstDayAfterBalance, l.end), 0))
            : c.used;
        return { type: t, credit: c, total, used, configured, accrualType, remaining: r2(total - used) };
    });
    useEffect(() => { saveDB(db); }, [db]);
    useEffect(() => {
        const onHash = () => {
            const key = location.hash.slice(1); if (NAV.some(n => n[0] === key)) {
                setPage(key);
                if (key !== 'employees')
                    setEmployeeId(null);
            }
        };
        window.addEventListener('hashchange', onHash);
        if (NAV.some(n => n[0] === location.hash.slice(1)))
            setPage(location.hash.slice(1));
        return () => window.removeEventListener('hashchange', onHash);
    }, []);
    useEffect(() => {
        const esc = (e) => {
            if (e.key === 'Escape')
                setModal(null);
        }; window.addEventListener('keydown', esc); return () => window.removeEventListener('keydown', esc);
    }, []);
    const update = (fn) => setDb(old => { const copy = structuredClone(old); fn(copy); return copy; });
    const notify = (title, message, error = false) => {
        const id = Date.now() + Math.random();
        setToasts(old => [...old, { id, title, message, role: error ? 'error' : 'success' }]);
        window.setTimeout(() => setToasts(old => old.filter(t => t.id !== id)), 4500);
    };
    const exportBackup = () => {
        if (!onlyAdmin('export a data backup'))
            return;
        const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pamhr-backup-${todayISO()}.json`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        notify('Backup downloaded', 'Store it securely; it contains sensitive employee records.');
    };
    const selectBackup = async (event) => {
        const file = event.currentTarget.files?.[0];
        event.currentTarget.value = '';
        if (!file)
            return;
        if (!onlyAdmin('restore a data backup'))
            return;
        if (file.size > 10 * 1024 * 1024)
            return notify('Backup too large', 'Choose a JSON backup smaller than 10 MB.', true);
        try {
            const parsed = JSON.parse(await file.text());
            if (!isDB(parsed))
                return notify('Invalid backup', 'The file is not a valid PamHR v2 backup. No data was changed.', true);
            setRestoreCandidate(migrateLeaveApprovals(parsed));
            setRestoreFilename(file.name);
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                notify('Could not read backup', 'The selected file is not valid JSON. No data was changed.', true);
            }
            else {
                notify('Could not read backup', error instanceof Error ? error.message : 'The file could not be read. No data was changed.', true);
            }
        }
    };
    const restoreBackup = () => {
        if (!restoreCandidate || !onlyAdmin('restore a data backup'))
            return;
        update(copy => {
            Object.assign(copy, structuredClone(restoreCandidate));
            log(copy, 'Restored backup', 'System', restoreFilename);
        });
        setRestoreCandidate(null);
        setRestoreFilename('');
        sessionStorage.removeItem('pamhr.u');
        setUser(null);
        notify('Backup restored', 'Restored data is now saved in this browser. Sign in again to continue.');
    };
    const log = (copy, action, table, detail = '') => {
        copy.audit.unshift({ id: nid(copy.audit), ts: new Date().toISOString(), user: activeUser?.username || 'system', action, table, detail });
        copy.audit = copy.audit.slice(0, 200);
    };
    const onlyAdmin = (what) => {
        if (admins)
            return true; notify('Administrator only', `Only an Administrator can ${what}.`, true); return false;
    };
    const go = (next, tab) => {
        setPage(next);
        setEmployeeId(null);
        setMobileNav(false);
        if (tab)
            setSettingsTab(tab);
        if (location.hash !== `#${next}`)
            location.hash = next;
        window.scrollTo(0, 0);
    };
    const open = (type, id, extra) => { setPreview(null); setModal({ type, id, extra }); };
    const confirm = (action, id) => open('confirm', id, action);
    const showEmployee = (id) => { setEmployeeId(id); setProfileTab('info'); setPage('employees'); window.scrollTo(0, 0); };
    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const f = Object.fromEntries(new FormData(form).entries());
        const submitter = event.nativeEvent.submitter;
        if (submitter?.name)
            f[submitter.name] = submitter.value;
        const type = form.dataset.form || modal?.type;
        const id = modal?.id;
        if (type === 'login') {
            const found = db.users.find(x => x.username === f.username.trim().toLowerCase() && x.password === f.password);
            if (!found) {
                setLoginError('Username or password is incorrect. Check the demo accounts below the form.');
                return;
            }
            update(copy => {
                const u = copy.users.find(x => x.id === found.id);
                u.lastLogin = new Date().toISOString();
                copy.audit.unshift({ id: nid(copy.audit), ts: new Date().toISOString(), user: u.username, action: 'Signed in', table: 'UserAccount', detail: u.username });
                copy.audit = copy.audit.slice(0, 200);
            });
            sessionStorage.setItem('pamhr.u', String(found.id));
            setUser(found);
            setLoginError('');
            go('dashboard');
            return;
        }
        if (type === 'password') {
            if (f.current !== activeUser.password)
                return notify('Password not changed', 'The current password is incorrect.', true);
            if (f.next.length < 8 || f.next !== f.confirm)
                return notify('Password not changed', 'New passwords must match and be at least 8 characters.', true);
            update(copy => { copy.users.find(x => x.id === activeUser.id).password = f.next; log(copy, 'Changed password', 'UserAccount', activeUser.username); });
            form.reset();
            notify('Password updated');
            return;
        }
        if (type === 'leaveAccrual') {
            if (!onlyAdmin('configure leave credits'))
                return;
            const target = employee(id);
            const openingVl = Number(f.vl), openingSl = Number(f.sl);
            if (!target || !Number.isFinite(openingVl) || openingVl < 0 || !Number.isFinite(openingSl) || openingSl < 0 || !f.balanceAsOf || f.balanceAsOf > todayISO()) {
                return notify('Leave credits not updated', 'Enter valid opening balances and a balance date no later than today.', true);
            }
            update(copy => {
                [[1, openingVl], [2, openingSl]].forEach(([typeId, openingBalance]) => {
                    let credit = copy.credits.find(x => x.empId === id && x.typeId === typeId);
                    if (!credit) {
                        credit = { empId: id, typeId, total: 0, used: 0 };
                        copy.credits.push(credit);
                    }
                    credit.openingBalance = openingBalance;
                    credit.balanceAsOf = f.balanceAsOf;
                    credit.total = openingBalance;
                });
                log(copy, 'Configured leave accrual', 'LeaveCredit', `${ename(target)} · as of ${f.balanceAsOf}`);
            });
            setModal(null);
            notify('Leave accrual configured', `${ename(target)}’s VL and SL balances will accrue from the verified opening date.`);
            return;
        }
        if (type === 'employee') {
            const duplicate = employees.some(e => e.id !== id && e.first.toLowerCase() === f.first.trim().toLowerCase() && e.last.toLowerCase() === f.last.trim().toLowerCase() && e.birth === f.birth);
            if (duplicate)
                return notify('Employee already exists', 'An employee with the same name and birthdate is already on file.', true);
            const value = { first: f.first.trim(), mi: (f.mi || '').trim().toUpperCase(), last: f.last.trim(), sex: f.sex, civil: f.civil, birth: f.birth, contact: f.contact, email: f.email, address: f.address, deptId: +f.deptId, posId: +f.posId, typeId: +f.typeId, sgId: +f.sgId, schedId: 1, hired: f.hired, status: f.status, rhu: f.rhu === 'on' };
            update(copy => {
                if (id) {
                    Object.assign(copy.employees.find(e => e.id === id), value);
                    log(copy, 'Updated employee', 'Employee', ename(copy.employees.find(e => e.id === id)));
                }
                else {
                    const next = nid(copy.employees), e = { id: next, no: `EMP-${String(Math.max(...copy.employees.map(x => +x.no.slice(4))) + 1).padStart(4, '0')}`, ...value };
                    copy.employees.push(e);
                    DOC_TYPES.forEach(doc => copy.docs.push({ empId: next, type: doc, date: null }));
                    copy.leaveTypes.forEach(t => copy.credits.push({ empId: next, typeId: t.id, total: [1, 2].includes(t.id) ? 0 : t.annual, used: 0 }));
                    if (e.typeId !== 3)
                        copy.empAllow.push({ empId: next, allowId: 1 });
                    log(copy, 'Added employee', 'Employee', ename(e));
                }
            });
            notify(id ? 'Employee updated' : 'Employee added', id ? ename(employee(id)) : undefined);
            setModal(null);
            return;
        }
        if (type === 'leave') {
            if (f.start < todayISO() || f.end < todayISO())
                return notify('Choose valid dates', 'Leave dates cannot be in the past.', true);
            if (f.end < f.start)
                return notify('Check the dates', 'The end date is before the start date.', true);
            const days = workdays(db, f.start, f.end);
            if (!days)
                return notify('No working days', 'The dates fall on weekends or holidays only.', true);
            const credit = credits(f.empId).find(x => x.type.id == f.typeId);
            if (days > credit.remaining)
                return notify('Not enough leave credits', `${empName(f.empId)} has ${credit.remaining} day(s) of ${credit.type.name} left but asked for ${days}.`, true);
            if (db.leaves.some(l => l.empId == f.empId && l.status !== 'Rejected' && l.start <= f.end && l.end >= f.start))
                return notify('Dates overlap', 'This employee already has a leave request covering some of these dates.', true);
            update(copy => { copy.leaves.push({ id: nid(copy.leaves), empId: +f.empId, typeId: +f.typeId, start: f.start, end: f.end, days, reason: f.reason.trim(), status: 'Pending', filed: todayISO() }); log(copy, 'Filed leave request', 'LeaveRequest', `${empName(f.empId)} ${fdr(f.start, f.end)}`); });
            notify('Leave request added', 'Pending approval. No leave credits deducted.');
            setLeaveTab('requests');
            setModal(null);
            return;
        }
        if (type === 'review') {
            const leave = db.leaves.find(x => x.id === id);
            if (!f.decision)
                return;
            if (f.decision === 'Approved' && credits(leave.empId).find(x => x.type.id === leave.typeId).remaining < leave.days)
                return notify('Cannot approve', 'Not enough leave credits remain for this request.', true);
            update(copy => {
                const l = copy.leaves.find(x => x.id === id), c = copy.credits.find(x => x.empId === l.empId && x.typeId === l.typeId);
                if (f.decision === 'Approved' && !c.balanceAsOf)
                    c.used = r2(c.used + l.days);
                copy.leaveApprovals.push({
                    id: nid(copy.leaveApprovals), leaveRequestId: l.id, approvedByUserId: activeUser.id,
                    decision: f.decision, dateActedOn: todayISO(), remarks: f.remarks || '',
                });
                l.status = f.decision;
                l.approvedBy = activeUser.name;
                l.approvedOn = todayISO();
                l.remarks = f.remarks || '';
                log(copy, f.decision === 'Approved' ? 'Approved leave request' : 'Rejected leave request', 'LeaveApproval', `${empName(l.empId)} ${fdr(l.start, l.end)}`);
            });
            notify(f.decision === 'Approved' ? 'Leave approved' : 'Leave rejected', f.decision === 'Approved' ? `${leave.days} day(s) deducted from ${get('leaveTypes', leave.typeId).name}.` : 'No credits deducted.');
            setModal(null);
            return;
        }
        if (type === 'overtime') {
            const hours = +f.hours;
            if (!(hours > 0) || hours > 24)
                return notify('Check the hours', 'Overtime hours must be between 0 and 24.', true);
            if (db.overtime.some(o => o.empId == f.empId && o.date === f.date))
                return notify('Overtime already filed', 'This employee already has overtime on that date.', true);
            update(copy => { copy.overtime.push({ id: nid(copy.overtime), empId: +f.empId, date: f.date, hours, cto: r2(hours * 1.25 / 8), status: 'Pending' }); log(copy, 'Filed overtime', 'Overtime', `${empName(f.empId)} ${hours} h`); });
            notify('Overtime added', 'Pending approval. CTO is credited once approved.');
            setLeaveTab('ot');
            setModal(null);
            return;
        }
        if (type === 'dtr') {
            if (D(f.date).getDay() % 6 === 0)
                return notify('Not a working day', 'Weekends cannot have a DTR entry.', true);
            if (db.dtr.some(d => d.empId == f.empId && d.date === f.date))
                return notify('Entry already exists', 'This employee already has a DTR entry for that date. Remove it first to re-enter.', true);
            const absent = f.absent === 'on', record = { id: nid(db.dtr), empId: +f.empId, date: f.date, amIn: absent ? '' : f.amIn, amOut: absent ? '' : f.amOut, pmIn: absent ? '' : f.pmIn, pmOut: absent ? '' : f.pmOut, absent };
            if (!absent && !(record.amIn && record.amOut && record.pmIn && record.pmOut))
                return notify('Missing time logs', 'Enter all four time logs or mark the day as absent.', true);
            if (!absent && !(record.amIn < record.amOut && record.amOut <= record.pmIn && record.pmIn < record.pmOut))
                return notify('Check the time logs', 'Times must run in order: AM in, AM out, PM in, PM out.', true);
            update(copy => { copy.dtr.push(record); log(copy, 'Added DTR entry', 'DTR', `${empName(record.empId)} ${record.date}`); });
            setDtrEmployee(+f.empId);
            setDtrMonth(f.date.slice(0, 7));
            notify('DTR entry added', `${empName(f.empId)} · ${fd(f.date)} · ${calcDtr(db, record).status}`);
            setModal(null);
            return;
        }
        if (type === 'payroll') {
            if (db.payroll.some(r => r.empId == f.empId && r.periodId === f.periodId))
                return notify('Payroll record already exists', 'No duplicate was added. Review the existing record for this period.', true);
            if (db.periodStatus[f.periodId] === 'Finalized')
                return notify('Period is finalized', 'Records cannot be added to a finalized period.', true);
            const emp = employee(f.empId), period = periodById(f.periodId), nextPayrollId = nid(db.payroll);
            update(copy => { createPayroll(copy, emp, period, activeUser.username); log(copy, 'Added payroll record', 'Payroll', ename(emp)); });
            setPayPeriod(f.periodId);
            setPayrollId(nextPayrollId);
            setModal(null);
            notify('Payroll record added', `${ename(emp)} · ${period.label} · Processing`);
            return;
        }
        if (type === 'promotion') {
            const emp = employee(id);
            if (+f.posId === emp.posId && +f.sgId === emp.sgId)
                return notify('Nothing to promote', 'Choose a different position or salary grade.', true);
            update(copy => {
                const e = copy.employees.find(x => x.id === id);
                copy.promotions.push({ id: nid(copy.promotions), empId: e.id, date: f.date, oldPos: get('positions', e.posId).title, newPos: get('positions', +f.posId).title, oldSg: sgName(db, e.sgId), newSg: sgName(db, +f.sgId) });
                e.posId = +f.posId;
                e.sgId = +f.sgId;
                log(copy, 'Recorded promotion', 'Promotion', ename(e));
            });
            setProfileTab('promo');
            setModal(null);
            notify('Promotion recorded', `${ename(emp)} · ${get('positions', +f.posId).title}`);
            return;
        }
        if (['education', 'eligibility', 'experience'].includes(type || '')) {
            if (type === 'experience' && f.to < f.from)
                return notify('Check the dates', 'The end date is before the start date.', true);
            const table = type === 'education' ? 'education' : type === 'eligibility' ? 'eligibility' : 'experience';
            update(copy => {
                const row = type === 'education' ? { empId: id, level: f.level, school: f.school, course: f.course || '—', year: f.year || '—' } :
                    type === 'eligibility' ? { empId: id, name: f.name, rating: f.rating || '—', date: f.date, license: f.license } :
                        { empId: id, agency: f.agency, position: f.position, from: f.from, to: f.to };
                copy[table].push({ id: nid(copy[table]), ...row });
                log(copy, `Added ${table}`, table, f.school || f.name || f.agency);
            });
            setModal(null);
            notify(`${type} added`);
            return;
        }
        if (type === 'department' || type === 'position') {
            if (type === 'department' && db.departments.some(d => d.name.toLowerCase() === f.name.trim().toLowerCase()))
                return notify('Department exists', 'That department is already listed.', true);
            update(copy => {
                if (type === 'department')
                    copy.departments.push({ id: nid(copy.departments), name: f.name.trim() });
                else
                    copy.positions.push({ id: nid(copy.positions), title: f.title.trim(), item: f.item.trim() });
                log(copy, type === 'department' ? 'Added department' : 'Added position', type === 'department' ? 'Department' : 'Position', f.name || f.title);
            });
            setModal(null);
            notify(`${type} added`);
            return;
        }
    };
    const doAction = (action, id) => {
        if (action === 'reset') {
            if (!onlyAdmin('reset demo data'))
                return;
            setDb(seed());
            setModal(null);
            setUser(db.users[0]);
            sessionStorage.setItem('pamhr.u', '1');
            setEmployeeId(null);
            notify('Demo data reset');
            go('dashboard');
            return;
        }
        if (action === 'deleteEmployee') {
            if (!onlyAdmin('delete an employee'))
                return;
            const e = employee(id);
            if (!e)
                return;
            update(copy => {
                const leaveIds = new Set(copy.leaves.filter(l => l.empId === e.id).map(l => l.id));
                copy.leaveApprovals = copy.leaveApprovals.filter(approval => !leaveIds.has(approval.leaveRequestId));
                ['docs', 'education', 'eligibility', 'experience', 'promotions', 'leaves', 'overtime', 'dtr', 'payroll', 'credits', 'empAllow', 'loans'].forEach(t => copy[t] = copy[t].filter((r) => r.empId !== e.id));
                copy.employees = copy.employees.filter(x => x.id !== e.id);
                log(copy, 'Deleted employee', 'Employee', ename(e));
            });
            setEmployeeId(null);
            setModal(null);
            notify('Employee deleted', ename(e));
            return;
        }
        if (action === 'deleteLeave') {
            const l = db.leaves.find(x => x.id === id);
            if (!l)
                return;
            update(copy => {
                if (l.status === 'Approved') {
                    const c = copy.credits.find(x => x.empId === l.empId && x.typeId === l.typeId);
                    if (!c.balanceAsOf)
                        c.used = r2(Math.max(0, c.used - l.days));
                }
                copy.leaveApprovals = copy.leaveApprovals.filter(approval => approval.leaveRequestId !== l.id);
                copy.leaves = copy.leaves.filter(x => x.id !== id);
                log(copy, 'Removed leave request', 'LeaveRequest', empName(l.empId));
            });
            setModal(null);
            notify('Leave request removed', l.status === 'Approved' ? 'Credits were returned.' : 'No leave credits were deducted.');
            return;
        }
        if (action === 'deleteDtr') {
            const d = db.dtr.find(x => x.id === id);
            update(copy => { copy.dtr = copy.dtr.filter(x => x.id !== id); log(copy, 'Removed DTR entry', 'DTR', `${empName(d.empId)} ${d.date}`); });
            setModal(null);
            notify('DTR entry removed', fd(d.date));
            return;
        }
        if (action === 'deletePayroll') {
            if (!onlyAdmin('remove a payroll record'))
                return;
            const r = db.payroll.find(x => x.id === id);
            if (db.periodStatus[r.periodId] === 'Finalized') {
                setModal(null);
                notify('Period is finalized', 'Records in a finalized period cannot be removed.', true);
                return;
            }
            update(copy => { copy.payroll = copy.payroll.filter(x => x.id !== id); log(copy, 'Removed payroll record', 'Payroll', empName(r.empId)); });
            setPayrollId(null);
            setModal(null);
            notify('Payroll record removed');
            return;
        }
        if (action === 'removeRecord') {
            const table = modal?.extra || '', row = db[table]?.find((x) => x.id === id);
            if (row)
                update(copy => { copy[table] = copy[table].filter((x) => x.id !== id); log(copy, 'Removed record', table); });
            setModal(null);
            notify('Record removed');
            return;
        }
        if (action === 'approveOt' || action === 'rejectOt') {
            const o = db.overtime.find(x => x.id === id);
            if (!o)
                return;
            update(copy => {
                const item = copy.overtime.find(x => x.id === id);
                if (action === 'approveOt') {
                    item.status = 'Approved';
                    const c = copy.credits.find(x => x.empId === item.empId && x.typeId === 4);
                    c.total = r2(c.total + item.cto);
                }
                else
                    copy.overtime = copy.overtime.filter(x => x.id !== id);
                log(copy, action === 'approveOt' ? 'Approved overtime' : 'Rejected overtime', 'Overtime', empName(o.empId));
            });
            notify(action === 'approveOt' ? 'Overtime approved' : 'Overtime rejected', action === 'approveOt' ? `${o.cto.toFixed(2)} day(s) of CTO added.` : 'No CTO credited.');
            return;
        }
        if (action === 'doc') {
            update(copy => { const d = copy.docs.find(x => x.empId === id && x.type === modal?.extra); d.date = d.date ? null : todayISO(); log(copy, d.date ? 'Filed document' : 'Marked document missing', 'Employee201File', d.type); });
            setModal(null);
            notify('Document updated');
            return;
        }
        if (action === 'process') {
            const p = periodById(payPeriod);
            if (db.periodStatus[p.id] === 'Finalized')
                return notify('Period is finalized', 'Open a different period to process.', true);
            const todo = employees.filter(e => e.status === 'Active' && !db.payroll.some(r => r.empId === e.id && r.periodId === p.id));
            if (!todo.length)
                return notify('Nothing to process', 'Every active employee already has a record for this period.', true);
            update(copy => { todo.forEach(e => createPayroll(copy, e, p, activeUser.username)); log(copy, 'Processed payroll', 'Payroll', `${p.label} · ${todo.length} records`); });
            notify('Payroll processed', `${todo.length} record(s) added as Processing for ${p.label}.`);
            return;
        }
        if (action === 'finalize') {
            if (!onlyAdmin('finalize payroll'))
                return;
            const p = periodById(payPeriod), rows = db.payroll.filter(r => r.periodId === p.id);
            if (!rows.length)
                return notify('No records', 'Process payroll before finalizing.', true);
            update(copy => { copy.payroll.filter(r => r.periodId === p.id).forEach(r => r.status = 'Finalized'); copy.periodStatus[p.id] = 'Finalized'; log(copy, 'Finalized payroll', 'PayrollPeriod', p.label); });
            notify('Period finalized', p.label);
            return;
        }
        if (action === 'csv') {
            const rows = db.payroll.filter(r => r.periodId === payPeriod);
            const text = [['Employee', 'Basic Pay', 'Hazard Pay', 'Allowances', 'Gross', 'Absent Deduction', 'Other Deductions', 'Net Pay', 'Status'], ...rows.map(r => [empName(r.empId), r.basic, r.hazard, r.other, r.gross, r.absentDed, r.otherDed, r.net, r.status])].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
            navigator.clipboard?.writeText(text).then(() => notify('CSV copied', 'Payroll register copied to the clipboard.')).catch(() => notify('Clipboard unavailable', 'Please allow clipboard access.', true));
            return;
        }
        if (action === 'logout') {
            update(copy => log(copy, 'Signed out', 'UserAccount', activeUser.username));
            sessionStorage.removeItem('pamhr.u');
            setUser(null);
            go('dashboard');
        }
    };
    const employeeOptions = (includeInactive = true) => employees.filter(e => includeInactive || e.status !== 'Inactive').map(e => [e.id, ename(e)]);
    const tableRow = (children, key, onClick) => <tr key={key} onClick={onClick} className={classes('border-b border-line last:border-0 hover:bg-row-hover', onClick && 'cursor-pointer')}>{children}</tr>;
    const cell = (children, className = '') => <td className={classes('px-4 py-3 align-middle', className)}>{children}</td>;
    const rowActions = (...children) => <div className="flex flex-wrap gap-1.5">{children.map((child, i) => <span key={i}>{child}</span>)}</div>;
    const dashboard = () => {
        const active = employees.filter(e => e.status === 'Active').length, pending = db.leaves.filter(l => l.status === 'Pending');
        const latest = db.dtr.reduce((m, d) => d.date > m ? d.date : m, ''), today = db.dtr.filter(d => d.date === latest);
        const statusCounts = { Present: 0, Late: 0, Absent: 0 };
        today.forEach(d => {
            const status = calcDtr(db, d).status; if (status === 'Absent')
                statusCounts.Absent++;
            else if (status === 'Present')
                statusCounts.Present++;
            else
                statusCounts.Late++;
        });
        const period = periodById(payPeriod), payroll = db.payroll.filter(r => r.periodId === payPeriod);
        const stats = [
            { label: 'Active Employees', value: active, hint: `${db.departments.length} departments` },
            { label: 'Pending Leave Requests', value: pending.length, hint: `${db.overtime.filter(o => o.status === 'Pending').length} overtime pending for CTO` },
            { label: `Attendance on ${latest ? fd(latest) : '—'}`, value: today.length, hint: `${Math.max(0, active - today.length)} active employees not recorded` },
            { label: `Payroll · ${period.label}`, value: fm0(payroll.reduce((s, r) => s + r.net, 0)), hint: `Demo rates · ${payroll.length} records · net pay` },
        ];
        const pendingLeaves = pending.map(leave => ({
            id: leave.id,
            employeeName: empName(leave.empId),
            leaveType: get('leaveTypes', leave.typeId).name,
            dateRange: fdr(leave.start, leave.end),
            days: leave.days,
        }));
        const recentActivities = db.audit.slice(0, 6).map(activity => ({
            id: activity.id,
            user: activity.user,
            action: activity.action,
            table: activity.table,
            time: new Date(activity.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        }));

        return <DashboardPage
            userName={activeUser.name}
            stats={stats}
            attendanceCounts={statusCounts}
            activeEmployees={active}
            pendingLeaves={pendingLeaves}
            recentActivities={recentActivities}
            onAddEmployee={() => open('employee')}
            onViewAllLeave={() => go('leave')}
            onReviewLeave={id => open('review', id)}
            onViewAudit={() => go('account', 'audit')}
        />;
    };
    const employeeList = () => {
        const list = employees.filter(e => (!query || `${ename(e)}${e.no}`.toLowerCase().includes(query.toLowerCase())) && (!filters.dept || String(e.deptId) === filters.dept) && (!filters.type || String(e.typeId) === filters.type) && (!filters.status || e.status === filters.status));
        return <><PageTop title="Employees" subtitle={`${employees.length} records · Employee table`} actions={<Button tone="primary" onClick={() => open('employee')}>Add Employee</Button>} />
            <div className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><Input type="search" placeholder="Search name or employee no." aria-label="Search employees" value={query} onChange={(e) => setQuery(e.target.value)} />
                <Select value={filters.dept} onChange={(e) => setFilters({ ...filters, dept: e.target.value })} options={[['', 'Department: All'], ...db.departments.map(d => [d.id, d.name])]} />
                <Select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} options={[['', 'Type: All'], ...db.types.map(d => [d.id, d.name])]} />
                <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} options={[['', 'Status: All'], ['Active', 'Status: Active'], ['Inactive', 'Status: Inactive']]} />
            </div>
            <Card>{list.length ? <Table headers={['Employee', 'Position', 'Department', 'Type', 'Salary grade', 'Date hired', 'Status', '']}>{list.map(e => {
                const onLeave = db.leaves.some(l => l.empId === e.id && l.status === 'Approved' && l.start <= todayISO() && l.end >= todayISO());
                return tableRow(<>
                    {cell(<Person employee={e} />, 'min-w-[220px]')}
                    {cell(get('positions', e.posId)?.title)}
                    {cell(get('departments', e.deptId)?.name)}
                    {cell(get('types', e.typeId)?.name)}
                    {cell(sgName(db, e.sgId))}
                    {cell(fd(e.hired))}
                    {cell(<Badge>{onLeave ? 'On Leave' : e.status}</Badge>)}
                    {cell(rowActions(<Button size="small" onClick={(ev) => { ev.stopPropagation(); open('employee', e.id); }}>Edit</Button>, <Button size="small" onClick={(ev) => { ev.stopPropagation(); confirm('deleteEmployee', e.id); }}>Delete</Button>))}
                </>, e.id, () => showEmployee(e.id));
            })}</Table> : <Empty>No employees match these filters. Clear the search or add a new employee.</Empty>}</Card>
        </>;
    };
    const profile = () => {
        const e = employee(employeeId);
        if (!e)
            return employeeList();
        const salary = get('salaryGrades', e.sgId), tabItems = [['info', 'Personal Info'], ['docs', '201 File'], ['edu', 'Education'], ['elig', 'Eligibility'], ['work', 'Work Experience'], ['promo', 'Promotions']];
        const info = (pairs) => <div className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">{pairs.map(([label, value]) => <div key={label}><div className="text-xs text-muted">{label}</div><b className="mt-1 block break-words">{value || '—'}</b></div>)}</div>;
        let body;
        if (profileTab === 'info')
            body = <div className="grid gap-5 xl:grid-cols-2">
                <div className="grid content-start gap-5"><Card><CardTitle>Personal Information</CardTitle>{info([['Full Name', ename(e)], ['Birthdate', fd(e.birth)], ['Sex', e.sex], ['Civil Status', e.civil], ['Contact No.', e.contact], ['Email', e.email], ['Address', e.address]])}</Card>
                    <Card><CardTitle>Employment Details</CardTitle>{info([['Department', get('departments', e.deptId)?.name], ['Position', get('positions', e.posId)?.title], ['Plantilla Item No.', get('positions', e.posId)?.item], ['Employment Type', get('types', e.typeId)?.name], ['Work Schedule', get('schedules', e.schedId)?.name], ['Employment Status', e.status], ['RHU Personnel (hazard pay)', e.rhu ? 'Yes' : 'No']])}</Card></div>
                <div className="grid content-start gap-5"><Card><CardTitle action={<Button tone="ghost" size="small" onClick={() => setProfileTab('docs')}>Manage</Button>}>201 File Documents</CardTitle>{db.docs.filter(d => d.empId === e.id).map(d => <div className="flex items-center justify-between border-b border-line px-5 py-3 text-sm last:border-0" key={d.type}>{d.type}<Badge>{d.date ? 'On file' : 'Missing'}</Badge></div>)}</Card>
                    <Card><CardTitle action={<Button tone="ghost" size="small" onClick={() => { setCreditEmployee(e.id); go('leave'); }}>View</Button>}>Leave Credits</CardTitle>{credits(e.id).map(x => <div className="flex justify-between border-b border-line px-5 py-3 text-sm last:border-0" key={x.type.id}>{x.type.name}<b>{x.remaining} / {x.credit.total} days</b></div>)}</Card></div>
            </div>;
        else if (profileTab === 'docs') {
            const rows = db.docs.filter(d => d.empId === e.id);
            body = <Card><CardTitle>201 File Documents</CardTitle>{rows.length ? <Table headers={['Document', 'Status', 'Date filed', '']}>{rows.map(d => tableRow(<>{cell(d.type)}{cell(<Badge>{d.date ? 'On file' : 'Missing'}</Badge>)}{cell(fd(d.date))}{cell(<Button size="small" onClick={() => open('doc', e.id, d.type)}>{d.date ? 'Mark missing' : 'Mark as filed today'}</Button>)}</>, d.type))}</Table> : <Empty>No documents configured.</Empty>}</Card>;
        }
        else if (profileTab === 'edu' || profileTab === 'elig' || profileTab === 'work') {
            const configs = { edu: ['Education', 'education', ['Level', 'School', 'Course', 'Year graduated'], ['level', 'school', 'course', 'year']], elig: ['Eligibility', 'eligibility', ['Examination / license', 'Rating', 'Exam date', 'License no.'], ['name', 'rating', 'date', 'license']], work: ['Work Experience', 'experience', ['Agency', 'Position', 'From', 'To'], ['agency', 'position', 'from', 'to']] };
            const [title, tableName, headers, keys] = configs[profileTab], rows = db[tableName].filter((x) => x.empId === e.id);
            body = <Card><CardTitle action={<Button tone="primary" size="small" onClick={() => open(tableName, e.id)}>Add</Button>}>{title}</CardTitle>{rows.length ? <Table headers={[...headers, '']}>{rows.map((r) => tableRow(<>{keys.map((key) => cell(key === 'date' || key === 'from' || key === 'to' ? fd(r[key]) : r[key] || '—', 'whitespace-nowrap'))}{cell(<Button size="small" onClick={() => open('removeRecord', r.id, tableName)}>Remove</Button>)}</>, r.id))}</Table> : <Empty>{`No ${title.toLowerCase()} records yet.`}</Empty>}</Card>;
        }
        else {
            const rows = db.promotions.filter(x => x.empId === e.id).sort((a, b) => b.date.localeCompare(a.date));
            body = <Card><CardTitle action={<Button tone="primary" size="small" onClick={() => open('promotion', e.id)}>Record Promotion</Button>}>Promotion History</CardTitle>{rows.length ? <Table headers={['Date', 'From position', 'To position', 'From grade', 'To grade']}>{rows.map(r => tableRow(<>{cell(fd(r.date))}{cell(r.oldPos)}{cell(r.newPos)}{cell(r.oldSg)}{cell(r.newSg)}</>, r.id))}</Table> : <Empty>No promotions recorded.</Empty>}</Card>;
        }
        return <><PageTop title="Employee Profile" subtitle={<><button className="text-brand" onClick={() => setEmployeeId(null)}>Employees</button> › {e.no}</>} actions={<><Button onClick={() => open('employee', e.id)}>Edit</Button><Button tone="primary" onClick={() => open('promotion', e.id)}>Record Promotion</Button></>} />
            <Card className="mb-5"><div className="flex flex-wrap items-center gap-4 p-5"><span className="avatar h-14 w-14 text-lg">{ini(e)}</span><div className="min-w-[190px] flex-1"><h2 className="text-xl font-bold">{ename(e)}</h2><p className="text-sm text-muted">{get('positions', e.posId)?.title} · {get('departments', e.deptId)?.name}</p><div className="mt-2 flex gap-2"><Badge>{e.status}</Badge><Badge>{get('types', e.typeId)?.name}</Badge>{e.rhu && <Badge>RHU Personnel · Hazard Pay</Badge>}</div></div><div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4"><div><small className="block text-muted">Employee No.</small><b>{e.no}</b></div><div><small className="block text-muted">Date Hired</small><b>{fd(e.hired)}</b></div><div><small className="block text-muted">Salary Grade (demo)</small><b>{sgName(db, e.sgId)}</b></div><div><small className="block text-muted">Monthly Rate (demo)</small><b>{fm(salary?.rate || 0)}</b></div></div></div></Card>
            <Tabs items={tabItems} value={profileTab} onChange={setProfileTab} />{body}
        </>;
    };
    const leavePage = () => {
        const pending = db.leaves.filter(l => l.status === 'Pending').length, approved = db.leaves.filter(l => l.status === 'Approved');
        const cto = db.overtime.filter(o => o.status === 'Approved').reduce((s, o) => s + o.cto, 0);
        const chosen = employee(creditEmployee) || employees[0];
        const employeeCredits = credits(chosen.id);
        const creditsBlock = <Card><CardTitle action={admins && <Button size="small" onClick={() => open('leaveAccrual', chosen.id)}>Configure VL / SL</Button>}>Leave Credits</CardTitle><div className="p-4"><Select value={chosen.id} onChange={(e) => setCreditEmployee(+e.target.value)} options={employeeOptions()} /></div><div className="border-b border-line px-5 pb-3"><Notice kind="warning">VL and SL accrue at 1.25 days per completed month after a verified opening balance date. Approved leave after that date is deducted automatically. Unconfigured demo balances are not official.</Notice></div>{employeeCredits.map(x => <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm" key={x.type.id}><span>{x.type.name}{x.accrualType && <small className="ml-2 text-muted">{x.configured ? `as of ${fd(x.credit.balanceAsOf)}` : x.credit.total > 0 ? 'Demo' : 'Not configured'}</small>}</span><b>{x.total} / {x.used}</b></div>)}<div className="flex justify-between border-t border-line px-5 py-3 text-sm"><b>Total remaining</b><b>{r2(employeeCredits.reduce((s, x) => s + x.remaining, 0))} days</b></div></Card>;
        const requests = db.leaves.filter(l => !leaveFilter || l.status === leaveFilter).sort((a, b) => b.start.localeCompare(a.start));
        const overtime = db.overtime.slice().sort((a, b) => b.date.localeCompare(a.date));
        return <><PageTop title="Leave Management" subtitle="Leave requests · approval · leave credits · overtime (CTO)" actions={<><Button onClick={() => open('overtime')}>Add Overtime</Button><Button tone="primary" onClick={() => open('leave')}>New Leave Request</Button></>} />
            <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Pending Requests" value={pending} hint="Awaiting approval" /><Stat label="Approved Requests" value={approved.length} hint={`${r2(approved.reduce((s, l) => s + l.days, 0))} days total`} /><Stat label="Pending Overtime" value={db.overtime.filter(o => o.status === 'Pending').length} hint="For CTO approval" /><Stat label="CTO Earned" value={`${r2(cto)} d`} hint="From approved overtime" /></div>
            <Tabs items={[['requests', 'Leave Requests'], ['ot', 'Overtime and CTO']]} value={leaveTab} onChange={setLeaveTab} />
            {leaveTab === 'requests' ? <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]"><Card><CardTitle action={<Select value={leaveFilter} onChange={(e) => setLeaveFilter(e.target.value)} options={[['', 'All statuses'], ['Pending', 'Pending'], ['Approved', 'Approved'], ['Rejected', 'Rejected']]} />}>Leave Requests</CardTitle>{requests.length ? <Table headers={['Employee', 'Leave type', 'Dates', 'Days', 'Reason', 'Status', '']}>{requests.map(l => tableRow(<>{cell(empName(l.empId))}{cell(get('leaveTypes', l.typeId)?.name)}{cell(fdr(l.start, l.end))}{cell(l.days)}{cell(l.reason)}{cell(<Badge>{l.status}</Badge>)}{cell(rowActions(l.status === 'Pending' ? <Button size="small" onClick={() => open('review', l.id)}>Review</Button> : null, <Button size="small" onClick={() => open('leaveApprovalHistory', l.id)}>History</Button>, <Button size="small" onClick={() => confirm('deleteLeave', l.id)}>Remove</Button>))}</>, l.id))}</Table> : <Empty>No leave requests. Use New Leave Request to file one.</Empty>}</Card>{creditsBlock}</div> :
                <Card><CardTitle action={<Button tone="primary" size="small" onClick={() => open('overtime')}>Add Overtime</Button>}>Overtime and CTO</CardTitle><p className="px-5 py-3 text-sm text-muted">Overtime is paid back as compensatory time-off, not cash. Sample rule: 1 hour of overtime earns 1.25 hours of CTO (÷ 8 hours per day).</p>{overtime.length ? <Table headers={['Employee', 'Date', 'Hours', 'CTO earned (days)', 'Status', '']}>{overtime.map(o => tableRow(<>{cell(empName(o.empId))}{cell(fd(o.date))}{cell(o.hours)}{cell(o.cto.toFixed(2))}{cell(<Badge>{o.status}</Badge>)}{cell(o.status === 'Pending' ? rowActions(<Button size="small" onClick={() => doAction('approveOt', o.id)}>Approve</Button>, <Button size="small" onClick={() => doAction('rejectOt', o.id)}>Reject</Button>) : null)}</>, o.id))}</Table> : <Empty>No overtime filed yet.</Empty>}</Card>}
        </>;
    };
    const dtrPage = () => {
        const e = employee(dtrEmployee) || employees[0], [year, month] = dtrMonth.split('-').map(Number), lastDay = new Date(year, month, 0).getDate();
        const first = `${dtrMonth}-01`, end = `${dtrMonth}-${String(lastDay).padStart(2, '0')}`;
        const entries = db.dtr.filter(d => d.empId === e.id && d.date >= first && d.date <= end);
        const holidays = db.holidays.filter(h => h.date >= first && h.date <= end && !entries.some(d => d.date === h.date));
        const rows = [...entries.map(d => ({ date: d.date, record: d })), ...holidays.map(h => ({ date: h.date, holiday: h }))].sort((a, b) => a.date.localeCompare(b.date));
        const totals = entries.map(d => calcDtr(db, d)), late = totals.filter(c => c.late), under = totals.filter(c => c.under);
        const monthWorkdays = workdays(db, first, end), underTotal = totals.reduce((s, x) => s + x.under, 0);
        return <><PageTop title="Daily Time Record" subtitle="DTR · Holiday · WorkSchedule" actions={<Button tone="primary" onClick={() => open('dtr')}>Add Entry</Button>} />
            <div className="mb-4 flex flex-wrap gap-2"><Select value={e.id} onChange={(ev) => setDtrEmployee(+ev.target.value)} options={employeeOptions()} /><Input type="month" value={dtrMonth} onChange={(ev) => setDtrMonth(ev.target.value)} /><span className="control inline-flex items-center">Schedule: {get('schedules', e.schedId)?.name}</span></div>
            <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Days Present" value={entries.filter(d => !d.absent).length} hint={`of ${monthWorkdays} working days`} /><Stat label="Tardiness" value={`${late.reduce((s, c) => s + c.late, 0)} min`} hint={`${late.length} occurrences`} /><Stat label="Undertime" value={`${Math.floor(underTotal / 60)} h ${underTotal % 60} m`} hint={`${under.length} occurrences`} /><Stat label="Days Absent" value={entries.filter(d => d.absent).length} hint="Deducted in payroll" /></div>
            <Card>{rows.length ? <Table headers={['Date', 'AM in', 'AM out', 'PM in', 'PM out', 'Hours', 'Late (min)', 'Undertime (min)', 'Status', '']}>{rows.map(row => {
                if (row.holiday)
                    return tableRow(<>{cell(fdw(row.date))}{cell('—', 'text-muted')}{cell('—')}{cell('—')}{cell('—')}{cell('—')}{cell('—')}{cell('—')}{cell(<Badge>{`${row.holiday.name} (Holiday)`}</Badge>)}{cell('')}</>, row.date);
                const d = row.record, c = calcDtr(db, d);
                return tableRow(<>{cell(fdw(d.date))}{cell(d.absent ? '—' : t12(d.amIn))}{cell(d.absent ? '—' : t12(d.amOut))}{cell(d.absent ? '—' : t12(d.pmIn))}{cell(d.absent ? '—' : t12(d.pmOut))}{cell(c.hours.toFixed(1))}{cell(c.late)}{cell(c.under)}{cell(<Badge>{c.status}</Badge>)}{cell(<Button size="small" onClick={() => confirm('deleteDtr', d.id)}>Remove</Button>)}</>, d.id);
            })}</Table> : <Empty>No time logs for this employee and month. Use Add Entry to record a day.</Empty>}</Card>
        </>;
    };
    const payrollPage = () => {
        const period = periodById(payPeriod) || periods()[0], records = db.payroll.filter(r => r.periodId === period.id);
        const status = db.periodStatus[period.id] || (records.length ? 'Processing' : 'No records');
        const sum = (k) => records.reduce((s, r) => s + r[k], 0), selected = records.find(r => r.id === payrollId) || records[0];
        const selectedEmployee = selected && employee(selected.empId);
        return <><PageTop title="Payroll" subtitle="Payroll period · Payroll · deductions · employee allowances" actions={<><Button onClick={() => doAction('csv')}>Copy as CSV</Button><Button onClick={() => doAction('finalize')}>Finalize Period</Button><Button onClick={() => open('payroll')}>Add Record</Button><Button tone="primary" onClick={() => doAction('process')}>Process Payroll</Button></>} /><div className="mb-4"><Notice kind="warning">Payroll uses sample salary rates and is for demonstration only. Replace them with the LGU-approved salary schedule before relying on payroll amounts.</Notice></div>
            <div className="mb-4 flex flex-wrap gap-2"><Select value={period.id} onChange={(ev) => setPayPeriod(ev.target.value)} options={periods().map(p => [p.id, `Period: ${p.label}`])} /><span className="control inline-flex items-center">Status: {status}</span></div>
            <div className="mb-5 grid gap-4 lg:grid-cols-3"><Stat label="Total Gross" value={fm0(sum('gross'))} hint={`${records.length} employees`} /><Stat label="Total Deductions" value={fm0(sum('absentDed') + sum('otherDed'))} hint="Absences, GSIS, PhilHealth, Pag-IBIG, loans" /><Stat label="Total Net Pay" value={fm0(sum('net'))} hint="After deductions" /></div>
            <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.8fr)_minmax(340px,1fr)]"><Card><CardTitle>Payroll Register</CardTitle>{records.length ? <Table headers={['Employee', 'Basic pay', 'Hazard pay', 'Allowances', 'Gross', 'Absent deduction', 'Other deductions', 'Net pay', 'Status']}>{records.map(r => tableRow(<>{cell(empName(r.empId), 'min-w-[180px]')}{cell(fm(r.basic))}{cell(r.hazard ? fm(r.hazard) : '—')}{cell(fm(r.other))}{cell(fm(r.gross))}{cell(r.absentDed ? `−${fm(r.absentDed)}` : '0.00')}{cell(r.otherDed ? `−${fm(r.otherDed)}` : '—')}{cell(<b>{fm(r.net)}</b>)}{cell(<Badge>{r.status}</Badge>)}</>, r.id, () => setPayrollId(r.id)))}</Table> : <Empty>No payroll records for this period yet. Process payroll to compute active employees.</Empty>}</Card>
                {selected ? <Card><CardTitle action={admins ? <Button size="small" onClick={() => confirm('deletePayroll', selected.id)}>Remove</Button> : undefined}>Payslip · {ename(selectedEmployee)}</CardTitle>
                    {[['Basic Pay (' + sgName(db, selectedEmployee?.sgId) + ', half-month)', fm(selected.basic)], ['Hazard Pay (RHU)', fm(selected.hazard)], ['Other Allowances', fm(selected.other)], ['Gross Pay', fm(selected.gross)], [`Absent deduction (${selected.daysAbsent} days)`, `−${fm(selected.absentDed)}`], ...selected.items.map((x) => [x.name, `−${fm(x.amount)}`]), ['Net Pay', fm(selected.net)], ['Processed by', `${selected.processedBy} · ${fd(selected.processedOn)}`]].map(([label, value], i) => <div className={classes('flex justify-between gap-3 border-t border-line px-5 py-3 text-sm', ['Gross Pay', 'Net Pay'].includes(label) && 'font-bold')} key={i}><span>{label}</span><b>{value}</b></div>)}
                </Card> : <Card><Empty>Select a payroll record to see its payslip.</Empty></Card>}
            </div>
        </>;
    };
    const settingsPage = () => {
        const tabs = [['account', 'My Account'], ['ref', 'Reference Data'], ['audit', 'Audit Log'], ['data', 'Demo Data']];
        return <><PageTop title="Settings & Account" subtitle="Profile, reference data and audit log" actions={<Button onClick={() => doAction('logout')}>Sign out</Button>} /><Tabs items={tabs} value={settingsTab} onChange={setSettingsTab} />
            {settingsTab === 'account' && <><div className="grid gap-5 xl:grid-cols-2"><Card><CardTitle>Account Information</CardTitle><div className="grid gap-4 p-5 sm:grid-cols-2">{[['Display name', activeUser.name], ['Username', activeUser.username], ['Email', activeUser.email], ['Role', activeUser.role], ['Access scope', 'All departments'], ['Last sign-in', activeUser.lastLogin ? new Date(activeUser.lastLogin).toLocaleString('en-US') : 'This session']].map(([k, v]) => <div key={k}><small className="block text-muted">{k}</small><b>{v}</b></div>)}</div></Card>
                <Card><CardTitle>Change Password</CardTitle><form onSubmit={handleSubmit} data-form="password" className="grid gap-3 p-5"><Field label="Current password" name="current" required><Input name="current" type="password" autoComplete="current-password" required /></Field><Field label="New password (8+ characters)" required><Input name="next" type="password" minLength={8} autoComplete="new-password" required /></Field><Field label="Confirm new password" required><Input name="confirm" type="password" autoComplete="new-password" required /></Field><Button tone="primary" type="submit" className="justify-self-start">Update password</Button></form></Card></div>
                <Card className="mt-5"><CardTitle>Role and Access</CardTitle><Table headers={['Module', 'Administrator', 'HR Staff']}><>{[['Employees & 201 files', 'Manage', 'Add and edit; cannot delete'], ['Leave management', 'Approve', 'Approve'], ['Daily time record', 'Manage', 'Manage'], ['Payroll', 'Process, finalize, remove', 'Process only'], ['Reference data and audit log', 'Manage', 'View']].map((r, i) => tableRow(<>{cell(r[0])}{cell(<Badge>{r[1]}</Badge>)}{cell(<Badge>{r[2]}</Badge>)}</>, i))}</></Table></Card></>}
            {settingsTab === 'ref' && <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                <Card><CardTitle action={admins && <Button size="small" tone="primary" onClick={() => open('department')}>Add</Button>}>Departments</CardTitle>{db.departments.map(d => <div className="flex justify-between border-t border-line px-5 py-3 text-sm" key={d.id}>{d.name}{admins && <Button size="small" onClick={() => open('removeRef', d.id, 'departments')}>Remove</Button>}</div>)}</Card>
                <Card><CardTitle action={admins && <Button size="small" tone="primary" onClick={() => open('position')}>Add</Button>}>Positions</CardTitle>{db.positions.map(d => <div className="flex justify-between gap-3 border-t border-line px-5 py-3 text-sm" key={d.id}><span>{d.title} <small className="text-muted">{d.item}</small></span>{admins && <Button size="small" onClick={() => open('removeRef', d.id, 'positions')}>Remove</Button>}</div>)}</Card>
                <Card><CardTitle>Salary Grades</CardTitle>{db.salaryGrades.map(s => <div className="flex justify-between border-t border-line px-5 py-3 text-sm" key={s.id}><span>SG-{s.grade} · Step {s.step}</span><b>{fm(s.rate)}</b></div>)}<p className="border-t border-line px-5 py-3 text-xs text-muted">Sample rates for demonstration, not the official table.</p></Card>
            </div>}
            {settingsTab === 'audit' && <Card><CardTitle>Audit Log</CardTitle>{db.audit.length ? <Table headers={['Time', 'User', 'Action', 'Table', 'Detail']}>{db.audit.map(a => tableRow(<>{cell(new Date(a.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))}{cell(a.user)}{cell(a.action)}{cell(a.table)}{cell(a.detail || '')}</>, a.id))}</Table> : <Empty>No activity recorded yet.</Empty>}</Card>}
            {settingsTab === 'data' && <div className="grid gap-5">
                <Card><CardTitle>Backup and Restore</CardTitle><div className="grid max-w-2xl gap-4 p-5">
                    <Notice kind="warning">Backups contain sensitive employee records and account passwords in an unencrypted JSON file. Save them only in a secure, access-controlled location. Restoring replaces all data currently stored in this browser.</Notice>
                    <p className="text-sm text-muted">Backups are JSON files and can be restored in PamHR. Only valid PamHR v2 files are accepted. Restoring signs you out.</p>
                    {admins ? <div className="flex flex-wrap gap-2"><Button onClick={exportBackup}>Download backup</Button><label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:bg-interactive-hover hover:text-interactive-hover-text focus-within:outline focus-within:outline-2 focus-within:outline-brand"><Download className="h-4 w-4" aria-hidden="true" />Choose backup file<input className="sr-only" type="file" accept=".json,application/json" onChange={selectBackup} /></label></div> : <p className="text-sm text-muted">Backup and restore are available to Administrators only.</p>}
                    {restoreCandidate && admins && <div className="grid gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                        <p><b>{restoreFilename}</b> passed the PamHR v2 format check. Restoring it will replace all current employees, leave, attendance, payroll, settings, and account data.</p>
                        <div className="flex flex-wrap gap-2"><Button tone="danger" onClick={restoreBackup}>Restore and replace current data</Button><Button onClick={() => { setRestoreCandidate(null); setRestoreFilename(''); }}>Cancel</Button></div>
                    </div>}
                </div></Card>
                <Card><CardTitle>Demo Data</CardTitle><div className="grid max-w-xl gap-4 p-5"><p className="text-sm text-muted">Everything you add here is saved in this browser only. Resetting restores the sample LGU Pamplona records.</p><Button tone="danger" className="justify-self-start" onClick={() => confirm('reset')}>Reset demo data</Button></div></Card>
            </div>}
        </>;
    };
    const renderModal = () => {
        if (!modal)
            return null;
        if (modal.type === 'confirm') {
            const titleMap = { deleteEmployee: 'Delete employee?', deleteLeave: 'Remove leave request?', deleteDtr: 'Remove DTR entry?', deletePayroll: 'Remove payroll record?', reset: 'Reset demo data?' };
            const warning = { deleteEmployee: 'This permanently removes the employee and their 201 file, leave, DTR and payroll records. This action cannot be undone.', deleteLeave: 'This permanently removes the leave request. Approved leave credits are returned.', deleteDtr: 'This permanently removes the time logs for this day. Attendance totals and payroll deductions may change.', deletePayroll: 'This permanently removes the payroll record and payslip for this period.', reset: 'This replaces everything in this browser with the original sample data. This action cannot be undone.' };
            const entity = modal.id ? employee(modal.id) : null;
            return <Dialog title={titleMap[modal.extra] || 'Confirm action'} subtitle="Review before continuing." onClose={() => setModal(null)}>
                {entity && <div className="surface-muted mb-4 rounded-lg p-4"><b>{ename(entity)}</b><div className="mt-1 text-sm text-muted">{entity.no} · {get('positions', entity.posId)?.title}</div></div>}
                <Notice kind="warning">{warning[modal.extra] || 'This action cannot be undone.'}</Notice>
                <div className="mt-5 flex justify-end gap-2"><Button onClick={() => setModal(null)}>Cancel</Button><Button tone="danger" onClick={() => doAction(modal.extra, modal.id)}>{modal.extra === 'reset' ? 'Reset Data' : modal.extra === 'deleteEmployee' ? 'Delete Employee' : 'Remove'}</Button></div>
            </Dialog>;
        }
        const e = modal.id ? employee(modal.id) : null;
        const options = (values) => values.map(v => [v, v]);
        let title = '', subtitle = '', content = null;
        const form = (type, children, submitLabel) => <form key={`${type}-${modal.id || ''}`} data-form={type} onSubmit={handleSubmit} className="grid gap-4" onChange={type === 'leave' ? event => {
            const f = event.currentTarget;
            const data = new FormData(f);
            const start = String(data.get('start') || ''), end = String(data.get('end') || ''), employeeId = String(data.get('empId') || ''), leaveType = String(data.get('typeId') || '');
            const endInput = f.elements.namedItem('end');
            endInput.min = start > todayISO() ? start : todayISO();
            if (start && end >= start) {
                const count = workdays(db, start, end), credit = credits(employeeId).find(x => String(x.type.id) === leaveType);
                setPreview({ kind: 'leave', count, remaining: credit?.remaining || 0, name: credit?.type.name || '' });
            }
        } : type === 'dtr' ? event => {
            const data = new FormData(event.currentTarget), absent = data.get('absent') === 'on';
            const record = Object.fromEntries(data.entries());
            setPreview({ kind: 'dtr', result: calcDtr(db, { ...record, absent }) });
        } : undefined}>
            {children}
            <div className="mt-1 flex justify-end gap-2 border-t border-line pt-4"><Button type="button" onClick={() => setModal(null)}>Cancel</Button><Button type="submit" tone="primary">{submitLabel}</Button></div>
        </form>;
        switch (modal.type) {
            case 'leaveApprovalHistory': {
                const leave = db.leaves.find(item => item.id === modal.id);
                if (!leave)
                    return null;
                const history = db.leaveApprovals.filter(item => item.leaveRequestId === leave.id).sort((a, b) => b.id - a.id);
                title = 'Leave Approval History';
                subtitle = `${empName(leave.empId)} · ${get('leaveTypes', leave.typeId)?.name} · ${fdr(leave.start, leave.end)}`;
                content = <>{history.length ? <Table headers={['Decision', 'Acted on', 'Reviewer', 'Remarks']}>{history.map(item => {
                    const reviewer = db.users.find(account => account.id === item.approvedByUserId);
                    return tableRow(<>{cell(<Badge>{item.decision}</Badge>)}{cell(fd(item.dateActedOn))}{cell(reviewer?.name || item.legacyActor || 'Unavailable')}{cell(item.remarks || '—')}</>, item.id);
                })}</Table> : <Empty>No approval decisions have been recorded.</Empty>}<div className="mt-4 flex justify-end"><Button onClick={() => setModal(null)}>Close</Button></div></>;
                break;
            }
            case 'leaveAccrual': {
                const leaveCredits = credits(modal.id);
                const vl = leaveCredits.find(x => x.type.name === 'Vacation Leave')?.credit;
                const sl = leaveCredits.find(x => x.type.name === 'Sick Leave')?.credit;
                title = 'Configure Leave Accrual';
                subtitle = `${empName(modal.id)} · verified opening balances required`;
                content = form('leaveAccrual', <>
                    <Notice>Enter HR-verified VL and SL balances as of the selected date. The opening balances must already include approved leave through that date. From then on, the app adds 1.25 days per completed month and deducts approved leave after that date, including the portion of a request that overlaps it. Check service eligibility and any interruptions with HR.</Notice>
                    <Field label="Opening balance date" required><Input name="balanceAsOf" type="date" max={todayISO()} defaultValue={vl?.balanceAsOf || todayISO()} required /></Field>
                    <div className="grid gap-3 sm:grid-cols-2"><Field label="Vacation Leave opening balance (days)" required><Input name="vl" type="number" min="0" step="0.01" defaultValue={Number.isFinite(vl?.openingBalance) ? vl.openingBalance : ''} required /></Field><Field label="Sick Leave opening balance (days)" required><Input name="sl" type="number" min="0" step="0.01" defaultValue={Number.isFinite(sl?.openingBalance) ? sl.openingBalance : ''} required /></Field></div>
                    <Notice kind="warning">Do not use the current demo totals as opening balances. The balance must include approved leave through the selected date; the app will deduct later leave from its retained request records.</Notice>
                </>, 'Save balances');
                break;
            }
            case 'employee': {
                title = e ? 'Edit Employee' : 'Add Employee';
                subtitle = 'Fields marked * are required.';
                const v = e || { first: '', mi: '', last: '', sex: 'Female', civil: 'Single', birth: '', contact: '', email: '', address: 'Pamplona, Camarines Sur', deptId: 1, posId: 1, typeId: 1, sgId: 1, hired: todayISO(), status: 'Active', rhu: false };
                content = form('employee', <>
                    <div className="grid gap-3 sm:grid-cols-3"><Field label="First name" required><Input name="first" defaultValue={v.first} required /></Field><Field label="Middle initial"><Input name="mi" maxLength={2} defaultValue={v.mi} /></Field><Field label="Last name" required><Input name="last" defaultValue={v.last} required /></Field></div>
                    <div className="grid gap-3 sm:grid-cols-3"><Field label="Sex"><Select name="sex" value={v.sex} options={options(['Female', 'Male'])} /></Field><Field label="Civil status"><Select name="civil" value={v.civil} options={options(['Single', 'Married', 'Widowed', 'Separated'])} /></Field><Field label="Birthdate" required><Input name="birth" type="date" defaultValue={v.birth} required /></Field></div>
                    <div className="grid gap-3 sm:grid-cols-2"><Field label="Contact Number"><Input name="contact" type="tel" inputMode="numeric" pattern="[0-9]{11}" maxLength={11} placeholder="09XXXXXXXXX" title="Enter exactly 11 digits." defaultValue={v.contact} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, '').slice(0, 11); }} /></Field><Field label="Email"><Input name="email" type="email" placeholder="name@example.com" defaultValue={v.email} /></Field></div>
                    <Field label="Address"><Input name="address" defaultValue={v.address} /></Field>
                    <div className="grid gap-3 sm:grid-cols-2"><Field label="Department" required><Select name="deptId" value={v.deptId} options={db.departments.map(d => [d.id, d.name])} required /></Field><Field label="Position" required><Select name="posId" value={v.posId} options={db.positions.map(d => [d.id, d.title])} required /></Field></div>
                    <div className="grid gap-3 sm:grid-cols-2"><Field label="Employment type" required><Select name="typeId" value={v.typeId} options={db.types.map(d => [d.id, d.name])} required /></Field><Field label="Salary grade" required><Select name="sgId" value={v.sgId} options={db.salaryGrades.map(s => [s.id, `SG-${s.grade} · Step ${s.step}`])} required /></Field></div>
                    <div className="grid gap-3 sm:grid-cols-2"><Field label="Date hired" required><Input name="hired" type="date" defaultValue={v.hired} required /></Field><Field label="Status"><Select name="status" value={v.status} options={options(['Active', 'Inactive'])} /></Field></div>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="rhu" defaultChecked={v.rhu} />Rural Health Unit personnel (receives hazard pay)</label>
                </>, e ? 'Save changes' : 'Add Employee');
                break;
            }
            case 'leave':
                title = 'New Leave Request';
                subtitle = 'Enter the employee’s leave details for approval.';
                content = form('leave', <><Field label="Employee" required><Select name="empId" options={employeeOptions(false)} required /></Field><Field label="Leave type" required><Select name="typeId" options={db.leaveTypes.map(t => [t.id, t.name])} required /></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Start date" required><Input name="start" type="date" min={todayISO()} required /></Field><Field label="End date" required><Input name="end" type="date" min={todayISO()} required /></Field></div>
                    {preview?.kind === 'leave' ? <Notice kind={preview.count > preview.remaining ? 'warning' : 'info'}><b>{preview.count} working day{preview.count === 1 ? '' : 's'}</b> (weekends and holidays excluded). Remaining {preview.name}: {preview.remaining} days.</Notice> : <Notice>Pick dates to see working days and remaining credits.</Notice>}
                    <Field label="Reason" required><textarea className="control" name="reason" rows={3} required /></Field><Notice>New requests are marked Pending and sent for approval. Leave credits are applied after approval.</Notice></>, 'Add Leave Request');
                break;
            case 'review': {
                const leave = db.leaves.find(l => l.id === modal.id);
                title = 'Review Leave Request';
                subtitle = `${empName(leave.empId)} · ${get('leaveTypes', leave.typeId)?.name}`;
                content = <form data-form="review" onSubmit={handleSubmit} className="grid gap-4"><div className="surface-muted rounded-lg p-4"><b>{empName(leave.empId)}</b><p className="text-sm text-muted">{fdr(leave.start, leave.end)}</p><div className="mt-3 grid gap-2 text-sm">{[['Leave type', get('leaveTypes', leave.typeId)?.name], ['Number of days', leave.days], ['Reason', leave.reason], ['Remaining credit', `${credits(leave.empId).find(x => x.type.id === leave.typeId)?.remaining} days`]].map(([k, v]) => <div className="flex justify-between gap-3" key={k}><span>{k}</span><b>{v}</b></div>)}</div></div><Field label="Remarks (optional)"><Input name="remarks" /></Field><div className="flex justify-end gap-2 border-t border-line pt-4"><Button type="button" onClick={() => setModal(null)}>Cancel</Button><Button name="decision" value="Rejected" tone="danger">Reject</Button><Button name="decision" value="Approved" tone="primary">Approve</Button></div></form>;
                break;
            }
            case 'overtime':
                title = 'Add Overtime';
                subtitle = 'Approved overtime earns compensatory time-off (CTO).';
                content = form('overtime', <><Field label="Employee" required><Select name="empId" options={employeeOptions(false)} value={3} required /></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Date worked" required><Input name="date" type="date" defaultValue={todayISO()} required /></Field><Field label="Overtime hours" required><Input name="hours" type="number" min=".5" max="24" step=".5" required /></Field></div><Notice>Sample rule: 1 hour of overtime earns 1.25 hours of CTO. Credit is added once approved.</Notice></>, 'Add Overtime');
                break;
            case 'dtr':
                title = 'Add DTR Entry';
                subtitle = 'Record the employee’s attendance and time logs for a day.';
                content = form('dtr', <><Field label="Employee" required><Select name="empId" options={employeeOptions()} value={dtrEmployee} required /></Field><Field label="Date" required><Input name="date" type="date" defaultValue={`${dtrMonth}-01`} required /></Field><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="absent" />Absent (no time logs for this day)</label><div className="grid gap-3 sm:grid-cols-2">{[['AM in', 'amIn'], ['AM out', 'amOut'], ['PM in', 'pmIn'], ['PM out', 'pmOut']].map(([label, name]) => <Field label={label} key={name}><Input name={name} type="time" defaultValue={get('schedules', 1)[name]} /></Field>)}</div>{preview?.kind === 'dtr' && <Notice>Calculated attendance: {preview.result.status} · Hours {preview.result.hours.toFixed(1)} · Late {preview.result.late} min · Undertime {preview.result.under} min</Notice>}<Notice>Hours, tardiness, undertime and status are calculated from the time logs and schedule.</Notice></>, 'Add Entry');
                break;
            case 'payroll':
                title = 'Add Payroll Record';
                subtitle = 'Amounts are computed from salary grade, allowances, DTR absences and deductions.';
                content = form('payroll', <><Field label="Employee" required><Select name="empId" options={employeeOptions(false)} value={3} required /></Field><Field label="Payroll period" required><Select name="periodId" value={payPeriod} options={periods().map(p => [p.id, p.label])} required /></Field><Notice>Record will be added as Processing. Review amounts before finalizing; adding a record does not release payment.</Notice></>, 'Add Payroll Record');
                break;
            case 'promotion':
                title = 'Record Promotion';
                subtitle = `${ename(e)} · currently ${get('positions', e?.posId)?.title}, ${sgName(db, e?.sgId)}`;
                content = form('promotion', <><Field label="New position" required><Select name="posId" value={e?.posId} options={db.positions.map(p => [p.id, p.title])} required /></Field><Field label="New salary grade" required><Select name="sgId" value={e?.sgId} options={db.salaryGrades.map(s => [s.id, `SG-${s.grade} · Step ${s.step} — ${fm(s.rate)}`])} required /></Field><Field label="Effective date" required><Input name="date" type="date" defaultValue={todayISO()} required /></Field><Notice>The employee’s position and salary grade are updated, and the change is added to promotion history. Future payroll uses the new rate.</Notice></>, 'Record Promotion');
                break;
            case 'education':
                title = 'Add Education';
                content = form('education', <><Field label="Level"><Select name="level" value="College" options={options(['Elementary', 'Secondary', 'Vocational', 'College', 'Graduate Studies'])} /></Field><Field label="School" required><Input name="school" required /></Field><Field label="Course / degree"><Input name="course" /></Field><Field label="Year graduated"><Input name="year" maxLength={4} /></Field></>, 'Add Education');
                break;
            case 'eligibility':
                title = 'Add Eligibility';
                content = form('eligibility', <><Field label="Examination or license" required><Input name="name" required /></Field><Field label="Rating"><Input name="rating" /></Field><Field label="Exam date"><Input name="date" type="date" /></Field><Field label="License no."><Input name="license" /></Field></>, 'Add Eligibility');
                break;
            case 'experience':
                title = 'Add Work Experience';
                content = form('experience', <><Field label="Agency or company" required><Input name="agency" required /></Field><Field label="Position" required><Input name="position" required /></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="From" required><Input name="from" type="date" required /></Field><Field label="To" required><Input name="to" type="date" required /></Field></div></>, 'Add Experience');
                break;
            case 'department':
                title = 'Add Department';
                content = form('department', <Field label="Department name" required><Input name="name" required /></Field>, 'Add Department');
                break;
            case 'position':
                title = 'Add Position';
                content = form('position', <><Field label="Position title" required><Input name="title" required /></Field><Field label="Plantilla item no." required><Input name="item" required /></Field></>, 'Add Position');
                break;
            case 'doc': {
                const doc = db.docs.find(d => d.empId === modal.id && d.type === modal.extra);
                title = doc?.date ? 'Mark document missing?' : 'Mark document filed?';
                content = <><p className="mb-5 text-sm">{modal.extra}</p><div className="flex justify-end gap-2"><Button onClick={() => setModal(null)}>Cancel</Button><Button tone="primary" onClick={() => doAction('doc', modal.id)}>Confirm</Button></div></>;
                break;
            }
            case 'removeRecord':
                title = 'Remove record?';
                content = <><p className="mb-5 text-sm">This permanently removes the selected record.</p><div className="flex justify-end gap-2"><Button onClick={() => setModal(null)}>Cancel</Button><Button tone="danger" onClick={() => doAction('removeRecord', modal.id)}>Remove</Button></div></>;
                break;
            case 'removeRef':
                title = 'Remove reference data?';
                content = <><p className="mb-5 text-sm">This removes the selected value from reference data.</p><div className="flex justify-end gap-2"><Button onClick={() => setModal(null)}>Cancel</Button><Button tone="danger" onClick={() => {
                    const table = modal.extra, record = db[table].find((x) => x.id === modal.id);
                    const used = table === 'departments' ? db.employees.some(x => x.deptId === modal.id) : db.employees.some(x => x.posId === modal.id);
                    if (used)
                        return notify('Reference data in use', 'Update employee records before removing this value.', true);
                    update(copy => { copy[table] = copy[table].filter((x) => x.id !== modal.id); log(copy, 'Removed reference data', table, record?.name || record?.title); });
                    setModal(null);
                    notify('Reference data removed');
                }}>Remove</Button></div></>;
                break;
            default: return null;
        }
        return <Dialog title={title} subtitle={subtitle} onClose={() => setModal(null)}>{content}</Dialog>;
    };
    if (!activeUser)
        return <div className="login-screen-bg flex min-h-screen items-center justify-center p-4 sm:p-8">
            <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-line bg-card shadow-2xl md:grid-cols-2">
                <section className="login-brand-panel flex min-h-[250px] flex-col justify-center px-6 py-8 sm:px-10 md:min-h-[560px] md:px-12 lg:px-16">
                    <div className="mx-auto w-full max-w-lg">
                        <div className="flex items-center gap-4">
                            {logoVisible && <button type="button" className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand" aria-label="Hide LGU Pamplona logo" title="Hide logo" onClick={() => setLogoVisible(false)}><img src={lguLogo} alt="LGU Pamplona seal" className="h-16 w-16 rounded-full bg-white object-contain p-1 shadow-sm sm:h-20 sm:w-20" /></button>}
                            <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">PamHR</h1><p className="text-sm text-side-muted">LGU Pamplona, Camarines Sur</p></div>
                        </div>
                        <div className="mt-8 sm:mt-12">
                            <h2 className="text-2xl font-bold leading-tight sm:text-3xl">Human Resource Information Management System</h2>
                            <p className="mt-4 max-w-lg text-side-muted">Employee records, 201 files, leave, daily time records and payroll in one application for the Municipal HR Office.</p>
                        </div>
                        <small className="mt-8 block text-side-muted">Municipal Human Resource Management Office</small>
                    </div>
                </section>
                <section className="flex items-center justify-center p-5 sm:p-8 md:p-10">
                    <form data-form="login" onSubmit={handleSubmit} className="grid w-full max-w-md gap-4">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Sign in</h2>
                            <p className="mt-1 text-sm text-muted">Use your PamHR account to continue.</p>
                        </div>
                        <Field label="Username" required><span className="relative block"><UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" /><Input name="username" autoComplete="username" autoFocus required className="w-full pl-9" /></span></Field>
                        <Field label="Password" required><span className="relative block"><Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" /><Input name="password" type="password" autoComplete="current-password" required className="w-full pl-9" /></span></Field>
                        {loginError && <Notice kind="error">{loginError}</Notice>}
                        <Button type="submit" tone="primary" className="w-full"><LogIn className="h-4 w-4" aria-hidden="true" />Sign in</Button>
                        <Notice><><b>Demo accounts</b><br />hr.admin / admin123 (Administrator)<br />hr.staff / staff123 (HR Staff)</></Notice>
                    </form>
                </section>
            </div>
        </div>;
    const content = page === 'dashboard' ? dashboard() : page === 'employees' ? (employeeId ? profile() : employeeList()) : page === 'leave' ? leavePage() : page === 'dtr' ? dtrPage() : page === 'payroll' ? payrollPage() : settingsPage();
    return <>
        <div className={classes('min-h-screen md:grid', collapsed ? 'md:grid-cols-[76px_minmax(0,1fr)]' : 'md:grid-cols-[250px_minmax(0,1fr)]')}>
            {mobileNav && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setMobileNav(false)} />}
            <aside className={classes('sidebar-ink fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-side px-3 py-5 transition-transform md:sticky md:top-0 md:h-screen md:w-auto md:translate-x-0', mobileNav ? 'translate-x-0' : '-translate-x-full', collapsed && 'md:px-2')}>
                <div className={classes('mb-6 flex items-center gap-2 px-2', collapsed && 'md:flex-col md:items-center md:gap-3 md:px-0')}>{logoVisible && <button type="button" className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand" aria-label="Hide LGU Pamplona logo" title="Hide logo" onClick={() => setLogoVisible(false)}><img src={lguLogo} alt="LGU Pamplona seal" className="h-10 w-10 rounded-full bg-white object-contain p-0.5" /></button>}<div className={classes('min-w-0 flex-1', collapsed && 'md:hidden')}><b className="block text-xl">PamHR</b><small className="sidebar-muted block text-xs">LGU Pamplona, Camarines Sur</small></div><button className="sidebar-toggle rounded-lg border p-2" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} title={collapsed ? 'Expand' : 'Collapse'} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}</button></div>
                <nav aria-label="Main" className="grid gap-1">{NAV.map(([key, label]) => {
                    const Icon = icons[key];
                    return <button key={key} title={collapsed ? label : undefined} aria-label={label} aria-current={page === key ? 'page' : undefined} onClick={() => go(key)} className={classes('sidebar-nav-link flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium', page === key && 'sidebar-nav-link-active', collapsed && 'md:justify-center md:px-2')}><Icon className="h-5 w-5 shrink-0" /><span className={collapsed ? 'md:hidden' : ''}>{label}</span></button>;
                })}</nav>
                <div className={classes('sidebar-footer mt-auto flex items-center gap-3 border-t px-2 pt-4', collapsed && 'md:justify-center')}><span className="avatar">{activeUser.name.split(' ').map((w) => w[0]).join('')}</span><div className={classes('min-w-0 flex-1', collapsed && 'md:hidden')}><b className="block truncate text-sm">{activeUser.name}</b><small className="sidebar-muted text-xs">{activeUser.role}</small></div><button onClick={() => doAction('logout')} className={classes('sidebar-signout text-xs font-semibold', collapsed && 'md:hidden')}>Sign out</button></div>
            </aside>
            <button onClick={() => setMobileNav(true)} aria-label="Open navigation" className="fixed left-3 top-3 z-20 rounded-lg border border-line bg-card p-2 shadow-sm md:hidden"><span className="block h-0.5 w-5 bg-ink" /><span className="my-1 block h-0.5 w-5 bg-ink" /><span className="block h-0.5 w-5 bg-ink" /></button>
            <main className="min-w-0 px-4 pb-10 pt-16 sm:px-6 md:px-8 md:pt-7">{content}</main>
        </div>
        <NotificationContainer notifications={toasts} />
        {renderModal()}
    </>;
}
function Dialog({ children, title, subtitle, onClose }) {
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6" onMouseDown={e => {
        if (e.target === e.currentTarget)
            onClose();
    }}>
        <section role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-line bg-card p-5 shadow-2xl sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">{title}</h2>{subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}</div><button className="rounded-md px-2 py-1 text-xl leading-none text-muted hover:bg-interactive-hover hover:text-interactive-hover-text" aria-label="Close dialog" onClick={onClose}>×</button></div>{children}
        </section>
    </div>;
}
function D(value) { return new Date(value + 'T00:00:00'); }
