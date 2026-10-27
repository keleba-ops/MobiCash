# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024

### Added
- **Core Banking Operations**
  - Deposit and withdrawal transaction recording
  - Multi-provider support (Orange Money, Mascom, MyZaka, FNB eWallet)
  - Real-time float management per provider
  - Cash position tracking with automatic calculations
  - Commission calculation (0.5% deposits, 1.0% withdrawals)
  - Daily reconciliation with variance tracking

- **User Management**
  - Role-based access control (Admin, Supervisor, Agent)
  - User creation, editing, and deactivation
  - Shift tracking with automatic start/end timestamps
  - Shift history with transaction metrics

- **Dashboard & Analytics**
  - Real-time dashboard with 12+ widgets
  - Interactive charts (bar, line, pie, area)
  - 7-day transaction trends
  - Provider performance metrics
  - Monthly commission tracking

- **Reports**
  - Daily reports with comprehensive metrics
  - Monthly reports with provider breakdown
  - Reconciliation reports with variance analysis
  - CSV export functionality

- **Theme Management**
  - 7 preset themes (Light & Dark variants)
  - Custom color picker for primary and accent colors
  - Light/Dark/System mode switching
  - Border radius customization
  - Custom logo upload (max 2MB)
  - Theme persistence across sessions

- **Responsive Design**
  - Mobile-first approach
  - Desktop sidebar navigation
  - Mobile bottom navigation with FAB
  - Adaptive layouts for all screen sizes

- **Alerts & Notifications**
  - Low float alerts
  - High transaction alerts
  - Variance alerts during reconciliation
  - In-app notification panel

- **Security**
  - User authentication system
  - Role-based permissions
  - Session management
  - Shift-based transaction tracking

### Technical
- React 18 with TypeScript
- Vite build system
- Tailwind CSS for styling
- Recharts for data visualization
- localStorage for data persistence
- Custom state management solution

---

## [Unreleased]

### Planned
- Backend API integration
- Multi-branch support enhancements
- Advanced reporting features
- Mobile app (React Native)
- SMS/Email notifications
- Audit logging
- Backup and restore functionality

---

For more information, visit [Verge Dynamics](https://vergedynamics.com).
