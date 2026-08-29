# Aura-3D Medical Checkup Portal

A modern, highly interactive 3D Biometric Medical Checkup UI. Built using **React**, **TypeScript**, and **Three.js** (WebGL), featuring a futuristic dark glassmorphic medical HUD dashboard.

## 🚀 Features

- **3D Holographic Model Canvas**: Programmatically rendered rotating 3D DNA Double Helix using Three.js particles. Features interactive nodes representing organs (Cranial, Cardio, Pulmonary, Metabolic) that project responsive 2D glassmorphic tooltips in 3D coordinate space.
- **Biometric Telemetry Panel**: Fluctuating vital metrics (Heart Rate, Blood Pressure, SpO2, Temperature, Respiration) showing slight real-time oscillations with scrolling EKG wave animations.
- **Biometric Diagnostic Scanner**: Wizard workflow simulating a step-by-step full-body checkup scan, showing percentage tracking, active laser sweep bars, and real-time scrolling console terminal logs.
- **Composite Health Report**: Dynamic summary display with an animated circular score meter, breakdown parameters, and actionable medical recommendations.

---

## 🛠️ Installation & Setup

Follow these simple steps to install and run the application locally.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18.0.0 or higher is recommended) along with `npm` (Node Package Manager).

### 1. Clone or Open the Directory

Open your command line interface (Terminal / Command Prompt / PowerShell) and navigate to the project directory:

```bash
cd C:\Users\rutur_zyan8vn\Desktop\medical-checkup-3d
```

### 2. Install Dependencies

Install the required node packages (React, Three.js, TypeScript compiler, Lucide icons, Vite):

```bash
npm install
```

### 3. Start Local Dev Server

Launch the Vite local development server:

```bash
npm run dev
```

The output will display the local URL (usually `http://localhost:5173`). Open this URL in your modern web browser to view the application.

---

## 📦 Production Build

To compile a highly optimized production bundle:

```bash
npm run build
```

This compiles TypeScript, compresses CSS/JS, and outputs ready-to-deploy static assets into a `./dist` folder.

---

## Runtime Maintenance

For deterministic browser-automation readiness gates, structured console diagnostics, common incident triage, and runtime artifact-cleanup guidance, see the [Runtime Maintenance Playbook](docs/runtime-maintenance.md).

---

## 🔬 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 6](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **3D Engine**: [Three.js](https://threejs.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS (Variables, Flexbox/Grid, Glassmorphic backdrop filters, custom animations)
