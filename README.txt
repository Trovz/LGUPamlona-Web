PamHR · LGU Pamplona, Camarines Sur

Requirements: Node.js 18+ and npm.

Install dependencies:
  npm install

Start the development server:
  npm run dev

Create a production build:
  npm run build

Preview the production build:
  npm run preview

Demo accounts:
  hr.admin / admin123 (Administrator)
  hr.staff / staff123 (HR Staff)

Data is saved in this browser using localStorage. Administrators can download or restore a
JSON backup from Settings & Account > Demo Data > Backup and Restore. Restore validates the
PamHR v2 data format, requires confirmation, replaces this browser's current data, and signs
the current user out. Backups are unencrypted JSON and contain sensitive employee records and
account passwords; store them securely.
Settings & Account > Demo Data also resets the app to its sample records.
Modules: Employees (201 file, education, eligibility, work experience, promotions), Leave requests with approval history + Overtime/CTO,
DTR, Payroll (process, add, finalize, remove), Settings (reference data, audit log).
The UI uses Inter from Google Fonts when online and falls back to system fonts offline.
