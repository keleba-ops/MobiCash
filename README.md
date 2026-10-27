# MobiCash Agent - Mobile Money Banking System

A comprehensive mobile-first web application for mobile money agent banking operations. Built by **Verge Dynamics**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build](https://img.shields.io/badge/build-passing-brightgreen)

## 🚀 Features

### Core Banking Operations
- ✅ **Deposits & Withdrawals** - Record transactions instantly
- ✅ **Multi-Provider Support** - Orange Money, Mascom, MyZaka, FNB eWallet
- ✅ **Float Management** - Track electronic money per provider
- ✅ **Cash Position Tracking** - Real-time cash on hand
- ✅ **Commission Calculation** - Automatic commission tracking (0.5% deposits, 1.0% withdrawals)
- ✅ **Daily Reconciliation** - Balance system vs physical counts
- ✅ **Transaction History** - Search, filter, and export transactions

### User Management
- 🔐 **Role-Based Access Control** - Admin, Supervisor, Agent roles
- 👥 **User Management** - Add, edit, deactivate users (Admin only)
- 🕐 **Shift Tracking** - Automatic shift start/end with timestamps
- 📊 **Shift Reports** - Track transactions, hours, and commissions per shift

### Advanced Features
- 📈 **Dashboard Analytics** - Real-time widgets and charts
- 📋 **Reports** - Daily, monthly, and reconciliation reports
- 📥 **Export** - CSV export for transactions and reports
- 🔔 **Alerts & Notifications** - Low float, high transaction, variance alerts
- 🎨 **Theme Management** - 7 presets, custom colors, dark mode, custom logo upload

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: Custom store with localStorage persistence
- **Icons**: Font Awesome

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mobicash-agent.git
cd mobicash-agent

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔑 Demo Credentials

### Admin
- **Username**: `admin`
- **Password**: `admin123`

### Agent
- **Username**: `thabo`
- **Password**: `agent123`

### Supervisor
- **Username**: `mpho`
- **Password**: `super123`

## 📱 Responsive Design

- **Desktop**: Full sidebar navigation with all features
- **Tablet**: Adaptive layout with collapsible sidebar
- **Mobile**: Bottom navigation with FAB for quick actions

## 🎨 Theme Customization

Access Settings → Theme Management to:
- Choose from 7 preset themes
- Customize primary and accent colors
- Switch between Light/Dark/System modes
- Adjust border radius
- Upload custom logo (max 2MB)

## 📊 Key Formulas

### Float Management
```
Deposit: Float = Float + Deposit Amount
Withdrawal: Float = Float - Withdrawal Amount
```

### Cash Position
```
Current Cash = Opening Cash + Deposits - Withdrawals
```

### Commission
```
Deposit Commission = Amount × 0.5%
Withdrawal Commission = Amount × 1.0%
```

### Reconciliation
```
Variance = Actual - System (for Float and Cash separately)
Status: Balanced (0), Over (>0), Short (<0)
```

## 🗂️ Project Structure

```
mobicash-agent/
├── src/
│   ├── components/
│   │   ├── VergeDynamicsLogo.tsx
│   │   ├── DynamicLogo.tsx
│   │   └── ThemeProvider.tsx
│   ├── utils/
│   │   └── format.ts
│   ├── App.tsx
│   ├── LoginPage.tsx
│   ├── store.ts
│   ├── types.ts
│   ├── hooks.ts
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Click "Deploy"

### GitHub Pages
1. Install gh-pages: `npm install -D gh-pages`
2. Add to package.json:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/mobicash-agent",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Deploy: `npm run deploy`

### Netlify
1. Build: `npm run build`
2. Drag `dist` folder to [netlify.com](https://netlify.com)

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Built By

**Verge Dynamics**  
Enterprise software solutions for mobile money & fintech innovation.

- Mobile Money
- Fintech
- Agent Banking
- Enterprise Solutions

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

For support or inquiries, please contact Verge Dynamics.

---

© 2024 Verge Dynamics. All rights reserved.
