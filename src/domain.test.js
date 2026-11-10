import { describe, expect, it } from 'vitest';
import { calcLeaveAccrual, calcPay, cscLateDays, dtrStatus, isDB, migrateDtr, mins, periodById, periods, r2, seed, workdays } from './domain';

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
    expect(pay.net).toBe(r2(pay.gross - pay.absentDed - pay.lateDed));
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

describe('cscLateDays', () => {
    it('converts whole hours at 0.125 day each', () => {
        expect(cscLateDays(60)).toBe(0.125);
        expect(cscLateDays(240)).toBe(0.5);
        expect(cscLateDays(480)).toBe(1);
    });

    it('converts minutes using the CSC table values', () => {
        expect(cscLateDays(1)).toBe(0.002);
        expect(cscLateDays(15)).toBe(0.031);
        expect(cscLateDays(30)).toBe(0.062);
        expect(cscLateDays(45)).toBe(0.094);
        expect(cscLateDays(59)).toBe(0.123);
    });

    it('adds hours and leftover minutes separately', () => {
        expect(cscLateDays(90)).toBe(0.187);
        expect(cscLateDays(155)).toBe(0.125 * 2 + 0.073);
    });

    it('returns zero for no or invalid late time', () => {
        expect(cscLateDays(0)).toBe(0);
        expect(cscLateDays(-5)).toBe(0);
        expect(cscLateDays(undefined)).toBe(0);
    });
});

describe('dtrStatus', () => {
    it('reports Not recorded without a record', () => {
        expect(dtrStatus(undefined)).toBe('Not recorded');
    });

    it('prioritises absences, then late, then present', () => {
        expect(dtrStatus({ absent: 1, lateMin: 10 })).toBe('Absent');
        expect(dtrStatus({ absent: 0, lateMin: 10 })).toBe('Late');
        expect(dtrStatus({ absent: 0, lateMin: 0 })).toBe('Present');
    });
});

describe('late deduction in payroll', () => {
    it('deducts late using the CSC fraction of the daily rate', () => {
        const db = seed();
        const period = periodById('2026-10-a');
        const e = emp(db, 2);
        const pay = calcPay(db, e, period);
        expect(pay.lateMin).toBe(9);
        expect(pay.lateDays).toBe(0.019);
        expect(pay.lateDed).toBe(r2(0.019 * pay.monthly / 22));
        expect(pay.net).toBe(r2(pay.gross - pay.absentDed - pay.lateDed - pay.otherDed));
    });

    it('has no late or absence deduction when no DTR is recorded', () => {
        const db = seed();
        db.dtr = [];
        const pay = calcPay(db, emp(db, 2), periodById('2026-10-a'));
        expect(pay.lateDed).toBe(0);
        expect(pay.absentDed).toBe(0);
    });

    it('never deducts undertime', () => {
        const db = seed();
        expect(Object.keys(db.dtr[0]).sort()).toEqual(['absent', 'empId', 'id', 'lateMin', 'periodId', 'present']);
    });
});

describe('seeded DTR', () => {
    it('has a record for every active employee in October 1-15 that matches its working days', () => {
        const db = seed();
        const period = periodById('2026-10-a');
        const records = db.dtr.filter((d) => d.periodId === period.id);
        expect(records).toHaveLength(db.employees.filter((e) => e.status === 'Active').length);
        records.forEach((d) => expect(d.present + d.absent).toBe(workdays(db, period.start, period.end)));
    });
});

describe('migrateDtr', () => {
    const old = (db) => {
        db.dtr = [
            { id: 1, empId: 3, date: '2026-10-09', amIn: '', amOut: '', pmIn: '', pmOut: '', absent: true },
            { id: 2, empId: 3, date: '2026-10-12', amIn: '08:14', amOut: '12:00', pmIn: '13:00', pmOut: '17:00', absent: false },
            { id: 3, empId: 3, date: '2026-10-13', amIn: '08:00', amOut: '12:00', pmIn: '13:05', pmOut: '17:00', absent: false },
            { id: 4, empId: 3, date: '2026-10-27', amIn: '08:00', amOut: '12:00', pmIn: '13:00', pmOut: '17:00', absent: false },
        ];
        return db;
    };

    it('turns daily entries into per-period totals', () => {
        const db = migrateDtr(old(seed()));
        const a = db.dtr.find((d) => d.periodId === '2026-10-a');
        expect(a).toMatchObject({ empId: 3, present: 2, absent: 1, lateMin: 19 });
        expect(db.dtr.find((d) => d.periodId === '2026-10-b')).toMatchObject({ present: 1, absent: 0, lateMin: 0 });
    });

    it('leaves data already in the new format unchanged', () => {
        const db = seed();
        const before = JSON.stringify(db.dtr);
        expect(JSON.stringify(migrateDtr(db).dtr)).toBe(before);
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
