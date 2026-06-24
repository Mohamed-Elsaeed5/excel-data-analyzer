# Corporate Data Audit Hub 📊✨

The **Corporate Data Audit Hub** is an executive-grade, no-code dataset profiling and cleansing application. Built utilizing **React 19, Vite, TypeScript, SheetJS (xlsx)**, and **Recharts**, the application allows business managers to drag and drop *any* Excel spreadsheet (`.xlsx` or `.xls`) and instantly generate complete diagnostic data quality reviews, descriptive statistics, interactive visualizations, verbal insights, and actionable strategic recommendations and cleanups.

---

## 🚀 Key Advantages of Client-Side Architecture

Unlike legacy Python/Streamlit servers that experience reloading flicker, lag, and require uploading sensitive company files to external remote environments, this application is engineered to work **100% inside your local browser memory space**:
1. **Pristine Corporate Data Security**: Your Excel records are never uploaded to a remote hosting space or third-party database. All parsing, profiling, math formulas, and exports happen locally inside the client browser.
2. **Sub-Millisecond Responsiveness**: Fluid, instantaneous charting and tab transitions powered by React's state management.
3. **Advanced Micro-Interactions**: Pristine typographic layout, hovering metric details, and responsive vector gauges styled with modern Tailwind CSS.
4. **Rich Multi-Sheet Reports Export**: The system compiles a detailed audit report workbook directly from memory and downloads a beautifully organized multi-worksheet Excel document to your computer.

---

## 📁 Project Structure

```bash
/
├── package.json              # Node.js workspace dependencies and scripts
├── requirements.txt          # Python equivalent scripting dependencies
├── README.md                 # Project documentation
├── metadata.json             # AI Studio configuration file
├── src/
│   ├── main.tsx              # Virtual DOM entry rendering point
│   ├── App.tsx               # Primary dashboard shell and responsive router
│   ├── index.css             # Tailwind CSS global rules
│   ├── types.ts              # High-precision TypeScript interfaces
│   ├── components/           # Modular workspace sub-panels
│   │   ├── UploadPreview.tsx      # Sheet upload, dimensions, and previews
│   │   ├── ColumnDescriptions.tsx # Schema variables mapping dictionary
│   │   ├── DataQuality.tsx        # Diagnostics checking and visual indicators
│   │   ├── ColumnStatistics.tsx   # Detailed descriptive stats panel
│   │   ├── DashboardInsights.tsx  # Dynamic interactive Recharts visuals
│   │   ├── AutomaticInsights.tsx  # Natural verbal business insights
│   │   ├── Recommendations.tsx    # strategic operational checklist
│   │   ├── CleaningTools.tsx      # Configurable cleansing toolbox
│   │   └── ExportReport.tsx       # Export multi-sheet Excel, CSV or PDF
│   └── utils/                # Mathematical engine logic
│       ├── analyzer.ts            # Type inferences, IQR, and Pearson formulas
│       └── cleaner.ts             # Row duplicates, trims, and imputations
```

---

## 📊 Core Functions & Mathematical Methodology

### 1. Inferred Column Type & Use (in `/src/utils/analyzer.ts`)
The engine scans raw data arrays dynamically to determine variables types:
- **Numerical**: If $>75\%$ of populated items resolve to numbers.
- **Date / Time**: Scans date-serial integers and standard temporal markers (`YYYY-MM-DD`, `MM/DD/YYYY`, ISO 8601 strings).
- **Boolean**: Active if values exclusively represent binary pairs (`True/False`, `Yes/No`, `1/0`).
- **Unique Key (ID)**: Triggered if column headers match database ID tags or display $>95\%$ distinct alphanumeric cell strings.
- **Categorical**: Serves as the standard grouping factor for text labels.

### 2. Descriptive Statistical Formulas (in `/src/utils/analyzer.ts`)
- **Quartiles (Q1, Q2, Q3) & IQR**:
  Uses percentile interpolation across sorted numerical arrays:
  $$\text{IQR} = Q3 - Q1$$
- **Anomalous Outlier Diagnostics**:
  Flags cells lying outside standard Tukey boundaries:
  $$\text{Anomaly Bounds} = [Q1 - 1.5 \times \text{IQR}, \ Q3 + 1.5 \times \text{IQR}]$$
- **Skewness & Kurtosis Shape Parameters**:
  Calculates the third and fourth standardized moments of column distributions:
  $$\text{Skewness} = \frac{\sum (x_i - \bar{x})^3}{N \cdot \sigma^3}$$
  $$\text{Kurtosis} = \frac{\sum (x_i - \bar{x})^4}{N \cdot \sigma^4} - 3$$
- **Linear Pearson Correlation Matrix**:
  Evaluates trend alignment between independent quantitative columns:
  $$r = \frac{N \sum xy - \sum x \sum y}{\sqrt{[N \sum x^2 - (\sum x)^2][N \sum y^2 - (\sum y)^2]}}$$

### 3. Cleaning Operations (in `/src/utils/cleaner.ts`)
- **Row Duplicates Removal**: Clears identical value-matching rows, preserving first entries.
- **Imputation**: Populates numerical blanks with exact medians, and empty categorical tags with column modes or "Unknown".
- **Casing Standardization**: Converts categorical labels to Title Case to merge misspelled groups (e.g. "active", "ACTIVE" $\to$ "Active").

---

## 🛠️ Instructions to Build and Execute the Application

Ensure you have **Node.js (v18+)** installed locally on your system.

### 1. Install Workspace Dependencies
Execute the following inside the root directory:
```bash
npm install
```

### 2. Launch Local Development Server
Boot the web client onto port 3000:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 3. Build & Package for Production
bundle and optimize the static code inside the `/dist` output folder:
```bash
npm run build
```
The output can be deployed as static files to any hosting space (Cloud Run, Netlify, GitHub Pages, Vercel) with zero back-end setup requirements.

---

## 💡 Future Expansion Paths
- **Collaborative DB Integrations**: Connect Firestore databases to let corporate teams audit shared Excel logs simultaneously.
- **API integrations**: Enable OAuth integrations to read directly from Google Drive or Microsoft OneDrive spaces.
- **Advanced Forecast Modeling**: Integrate browser-based client neural networks (TensorFlow.js) to perform sales forecasting directly in the user environment.
