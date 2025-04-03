# Stock Calculator

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-0.41.0-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-supported-9cf)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-blueviolet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)

A robust application for tracking and analyzing Taiwan stock market data. This tool automatically fetches the latest stock information from the Taiwan Stock Exchange (TWSE), displays comprehensive stock listings, and provides essential stock calculation functionality.

## ✨ Key Features

- 🔄 Automatic data synchronization with TWSE
- 📊 Paginated stock listings with filtering capabilities
- 💰 Dividend tracking and analysis
- 🧮 Investment return calculator (coming soon)
- 📱 Fully responsive design
- 🛠️ Built on PostgreSQL with Drizzle ORM

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Language**: TypeScript
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0+
- PostgreSQL database
- PNPM package manager (recommended)

### Environment Setup

Create a `.env` file in the project root with:

```Makefile
DATABASE_URL=postgresql://username:password@localhost:5432/stock_calculator
```

### Installation & Launch

1. Clone the repo:

   ```bash
   git clone <repository-url>
   cd stock-calculator
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run database migrations:

   ```bash
   pnpm migrate
   ```

4. Fetch latest Taiwan stock data:

   ```bash
   pnpm fetch:twse
   ```

5. Start the development server:

   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your app in action.

## 💾 Database Structure

The app utilizes Drizzle ORM with these primary tables:

- **dailyStocks**: Daily stock trading information
- **dividends**: Stock dividend history and analysis

## 📊 Data Sources

- Taiwan Stock Exchange (TWSE) public API

## 👩‍💻 Developer Guide

### Available Scripts

```bash
# Development
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint

# Drizzle schema generation
pnpm generate

# Database migrations
pnpm migrate

# Push schema to database
pnpm push

# TWSE data sync
pnpm fetch:twse
```

### Page Structure

- `/`: Home page
- `/stocks`: Stock listings page

### API Endpoints

- `/api/stocks`: Retrieve all stock information

## 🔧 Project Architecture

The application follows a modern, modular architecture:

```Makefile
stock-calculator/
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── db/           # Database models and connection
│   └── scripts/      # Utility scripts for data fetching
├── drizzle/          # Drizzle ORM migrations
├── public/           # Static assets
└── ...config files
```

## 🤝 Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you'd like to change.

## 📝 License

[MIT](LICENSE)

## 🔮 Roadmap

- [ ] Implement investment calculator with scenario modeling
- [ ] Add interactive stock price charts
- [ ] Create user portfolio tracking features
- [ ] Support OTC (over-the-counter) stock data
- [ ] Add data visualization dashboards
- [ ] Integrate with additional Taiwanese financial data sources
- [ ] Implement alerting system for price movements
