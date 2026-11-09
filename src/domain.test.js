import { describe, expect, it } from 'vitest';
import { calcDtr, calcLeaveAccrual, calcPay, isDB, mins, periods, r2, seed, workdays } from './domain';

const emp = (db, id) => db.employees.find((e) => e.id === id);

describe('periods', () => {
  it('covers 12 months starting October 2026 with two periods each', () => {
    const list = periods();
    expect(list).toHaveLength(24);
    expect(list[0].id).toBe('2026-10-a');
    expect(list.at(-1).id).toBe('2027-09-b');
  });

  it('has unique ids and correct month ends', () => {
    const list = periods();
    expect(new Set(list.map((p) => p.id)).size).toBe(list.length);
    expect(list.find((p) => p.id === '2027-02-b').end).toBe('2027-02-28');
    expect(list.find((p) => p.id === '2026-12-b').end).toBe('2026-12-31');
  });
});

describe('calcPay', () => {
  const db = seed();
  const period = periods()[0];

  it('computes semi-monthly basic pay and PERA', () => {
    const pay = calcPay(db, emp(db, 4), period);
    expect(pay.monthly).toBe(db.salaryGrades.find((s) => s.id === emp(db, 4).sgId).rate);
    expect(pay.basic).toBe(r2(pay.monthly / 2));
    expect(pay.other).toBe(1000);
  });

  it('halves percentage and flat deductions per period', () => {
    const pay = calcPay(db, emp(db, 4), period);
    const by = Object.fromEntries(pay.items.map((i) => [i.name, i.amount]));
    expect(by.GSIS).toBe(r2(pay.monthly * 0.09 / 2));
    expect(by.PhilHealth).toBe(r2(pay.monthly * 0.025 / 2));
    expect(by['Pag-IBIG']).toBe(100);
  });

  it('adds RHU hazard pay of 10% of basic', () => {
    const rhu = emp(db, 3);
    const pay = calcPay(db, rhu, period);
    expect(pay.hazard).toBe(r2(pay.basic * 0.1));
  });

  it('includes loan deductions for the borrower', () => {
    const pay = calcPay(db, emp(db, 3), period);
    expect(pay.items.some((i) => i.name === 'GSIS Salary Loan' && i.amount === 812)).toBe(true);
  });

  it('deducts absences at monthly rate over 22 days', () => {
    const pay = calcPay(db, emp(db, 3), periods().find((p) => p.id === '2026-10-a'));
    expect(pay.daysAbsent).toBe(1);
    expect(pay.absentDed).toBe(r2(pay.monthly / 22));
  });

  it('charges no deductions to Job Order staff', () => {
    const jo = emp(db, 5);
    const pay = calcPay(db, jo, period);
    expect(pay.items).toEqual([]);
    expect(pay.net).toBe(r2(pay.gross - pay.absentDed));
  });

  it('does not crash when an assigned allowance was deleted', () => {
    const broken = seed();
    broken.allowances = [];
    expect(() => calcPay(broken, emp(broken, 1), period)).not.toThrow();
    expect(calcPay(broken, emp(broken, 1), period).other).toBe(0);
  });

  it('net equals gross minus absences and deductions', () => {
    const pay = calcPay(db, emp(db, 1), period);
    expect(pay.net).toBe(r2(pay.gross - pay.absentDed - pay.otherDed));
  });
});

describe('calcDtr', () => {
  const db = seed();
  const base = { amIn: '08:00', amOut: '12:00', pmIn: '13:00', pmOut: '17:00', absent: false };

  it('marks a full on-time day as Present with 8 hours', () => {
    expect(calcDtr(db, base)).toEqual({ hours: 8, late: 0, under: 0, status: 'Present' });
  });

  it('counts lateness in minutes', () => {
    const r = calcDtr(db, { ...base, amIn: '08:14' });
    expect(r.late).toBe(14);
    expect(r.status).toBe('Late');
  });

  it('counts undertime in minutes', () => {
    const r = calcDtr(db, { ...base, pmOut: '16:20' });
    expect(r.under).toBe(40);
    expect(r.status).toBe('Undertime');
  });

  it('reports Late & Undertime when both apply', () => {
    expect(calcDtr(db, { ...base, amIn: '08:10', pmOut: '16:50' }).status).toBe('Late & Undertime');
  });

  it('does not count early arrival or overtime as late or undertime', () => {
    const r = calcDtr(db, { ...base, amIn: '07:45', pmOut: '17:30' });
    expect(r.late).toBe(0);
    expect(r.under).toBe(0);
  });

  it('returns zeros for an absent day', () => {
    expect(calcDtr(db, { ...base, absent: true })).toEqual({ hours: 0, late: 0, under: 0, status: 'Absent' });
  });

  it('treats blank times as no data instead of full undertime', () => {
    const r = calcDtr(db, { amIn: '', amOut: '', pmIn: '', pmOut: '', absent: false });
    expect(r.hours).toBe(0);
    expect(r.under).toBe(0);
    expect(r.late).toBe(0);
  });
});

describe('calcLeaveAccrual', () => {
  it('adds 1.25 days per full month', () => {
    expect(calcLeaveAccrual(10, '2026-01-15', '2026-04-15')).toBe(13.75);
  });

  it('does not accrue before the month anniversary', () => {
    expect(calcLeaveAccrual(10, '2026-01-15', '2026-02-14')).toBe(10);
  });

  it('returns the opening balance when the date is in the past or invalid', () => {
    expect(calcLeaveAccrual(10, '2026-05-01', '2026-01-01')).toBe(10);
    expect(calcLeaveAccrual(10, 'nope', '2026-01-01')).toBe(10);
  });

  it('handles month ends such as the 31st', () => {
    expect(calcLeaveAccrual(0, '2026-01-31', '2026-02-28')).toBe(1.25);
  });
});

describe('helpers', () => {
  it('mins converts HH:MM to minutes', () => {
    expect(mins('08:30')).toBe(510);
  });

  it('workdays skips weekends and holidays', () => {
    const db = seed();
    expect(workdays(db, '2026-11-02', '2026-11-06')).toBe(4);
    expect(workdays(db, '2026-11-07', '2026-11-08')).toBe(0);
  });

  it('seed data passes the storage validator', () => {
    expect(isDB(seed())).toBe(true);
    expect(isDB({})).toBe(false);
  });
});
