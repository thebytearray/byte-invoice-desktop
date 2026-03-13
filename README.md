# Byte Invoice

* [About this Repo](#about-this-repo)
* [Contributing](#contributing)
* [Security Policy](#security-policy)
* [License](#license)
* [Installation Guide](#installation-guide)

## About this Repo

This is the official Git repo of [Byte Invoice](https://thebytearray.github.io/byte-invoice/), a cross-platform invoicing app built with Tauri 2, React, and Rust. Runs on **Android**, **macOS**, **Windows**, and **Linux**.

**Repository:** [https://github.com/thebytearray/byte-invoice](https://github.com/thebytearray/byte-invoice)

## Contributing

If you are interested in contributing to the Byte Invoice project, please read our [Contributing Guidelines](.github/CONTRIBUTING.md).

## Security Policy

If you want to report a security problem, please read our [Security Policy](.github/SECURITY.md).

## License

This project is licensed under the GPLv3 - see the [License](/LICENSE) file for details.

## Installation Guide

> This is an installation summary for running Byte Invoice locally.

### Prerequisites

- **Node.js** (v18 or higher)
- **Rust** (1.77 or higher)
- **npm** or **pnpm**

### macOS / Linux / Windows (WSL)

1. Clone the repository:

    ```
    git clone https://github.com/thebytearray/byte-invoice.git
    cd byte-invoice
    ```

2. Install dependencies and run the app:

    ```
    npm install
    npm run dev
    ```

3. The app will open in a native window.

### Building for production

**Desktop (macOS, Windows, Linux):**

```
npm run build
npm run tauri build
```

**Android:**

```
npm run android:init   # First time only
npm run android:build
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Tauri |
| `npm run build` | Build frontend for production |
| `npm run tauri build` | Build native app bundle |
| `npm run lint` | Run ESLint |
| `npm run android:build` | Build Android APK |

### Project structure

```
byte-invoice/
├── src/           # React frontend (pages, components, services)
├── src-tauri/     # Rust backend (commands, db, models)
├── website/       # Marketing website (landing page)
└── build/         # Vite build output
```
