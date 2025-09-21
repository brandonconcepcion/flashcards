# Code Execution Implementation Guide

This guide explains how to implement real code execution features for the Code Practice tab.

## 🐍 Python Execution with Pyodide

### Installation

```bash
npm install pyodide
```

### Implementation

```typescript
import { loadPyodide } from "pyodide";

class PythonExecutor {
  private pyodide: any = null;

  async initialize() {
    this.pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
    });

    // Install common data science packages
    await this.pyodide.loadPackage(["pandas", "numpy", "matplotlib"]);
  }

  async executeCode(code: string): Promise<ExecutionResult> {
    try {
      const startTime = Date.now();

      // Capture stdout
      let output = "";
      this.pyodide.runPython(`
        import sys
        from io import StringIO
        sys.stdout = StringIO()
      `);

      // Execute the code
      await this.pyodide.runPythonAsync(code);

      // Get the output
      output = this.pyodide.runPython("sys.stdout.getvalue()");

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        output,
        executionTime,
      };
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error.message,
        executionTime: 0,
      };
    }
  }
}
```

## 🗄️ SQL Execution with SQL.js

### Installation

```bash
npm install sql.js
```

### Implementation

```typescript
import initSqlJs from "sql.js";

class SQLExecutor {
  private SQL: any = null;

  async initialize() {
    this.SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
  }

  async executeCode(code: string): Promise<ExecutionResult> {
    try {
      const startTime = Date.now();

      // Create a new database
      const db = new this.SQL.Database();

      // Split code into individual statements
      const statements = code.split(";").filter((stmt) => stmt.trim());

      let output = "";

      for (const statement of statements) {
        if (statement.trim()) {
          const result = db.exec(statement);

          if (result.length > 0) {
            // Format table output
            output += this.formatTableResult(result[0]);
          }
        }
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        output,
        executionTime,
      };
    } catch (error) {
      return {
        success: false,
        output: "",
        error: error.message,
        executionTime: 0,
      };
    }
  }

  private formatTableResult(result: any): string {
    if (!result.columns || !result.values) return "";

    const { columns, values } = result;

    // Create table header
    let table = columns.join(" | ") + "\n";
    table += columns.map(() => "---").join(" | ") + "\n";

    // Add rows
    values.forEach((row) => {
      table += row.map((cell) => cell || "NULL").join(" | ") + "\n";
    });

    return table;
  }
}
```

## 🔧 Integration with CodePracticeTab

### Update the executeCode function:

```typescript
const CodePracticeTab: React.FC<CodePracticeTabProps> = ({
  flashcards,
  addFlashcard,
}) => {
  const [pythonExecutor, setPythonExecutor] = useState<PythonExecutor | null>(
    null
  );
  const [sqlExecutor, setSqlExecutor] = useState<SQLExecutor | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeExecutors = async () => {
      try {
        const pyExec = new PythonExecutor();
        await pyExec.initialize();
        setPythonExecutor(pyExec);

        const sqlExec = new SQLExecutor();
        await sqlExec.initialize();
        setSqlExecutor(sqlExec);

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize executors:", error);
      }
    };

    initializeExecutors();
  }, []);

  const executeCode = async () => {
    if (!code.trim() || !isInitialized) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      let result: ExecutionResult;

      if (selectedLanguage === "python") {
        result = await pythonExecutor!.executeCode(code);
      } else if (selectedLanguage === "sql") {
        result = await sqlExecutor!.executeCode(code);
      } else {
        throw new Error("Unsupported language");
      }

      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        success: false,
        output: "",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        executionTime: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // ... rest of component
};
```

## 📊 Data Visualization Integration

### For Python charts, you can capture matplotlib output:

```typescript
// In PythonExecutor
async executeCode(code: string): Promise<ExecutionResult> {
  try {
    // ... existing code ...

    // Check if matplotlib was used
    const hasMatplotlib = code.includes('matplotlib') || code.includes('plt.');

    if (hasMatplotlib) {
      // Capture the plot as base64
      const plotData = this.pyodide.runPython(`
        import base64
        from io import BytesIO
        buf = BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        base64.b64encode(buf.getvalue()).decode()
      `);

      return {
        success: true,
        output,
        plotData: `data:image/png;base64,${plotData}`,
        executionTime
      };
    }

    return { success: true, output, executionTime };
  } catch (error) {
    // ... error handling
  }
}
```

## 🔒 Security Considerations

### Sandboxing

- **Resource Limits**: Set memory and execution time limits
- **Network Access**: Disable network access for security
- **File System**: Restrict file system access
- **Import Restrictions**: Limit which modules can be imported

### Implementation Example:

```typescript
class SecurePythonExecutor {
  private pyodide: any = null;
  private readonly MAX_EXECUTION_TIME = 10000; // 10 seconds
  private readonly MAX_MEMORY = 100 * 1024 * 1024; // 100MB

  async executeCode(code: string): Promise<ExecutionResult> {
    // Check for dangerous imports
    const dangerousImports = ["os", "subprocess", "sys", "importlib"];
    const hasDangerousImports = dangerousImports.some(
      (imp) => code.includes(`import ${imp}`) || code.includes(`from ${imp}`)
    );

    if (hasDangerousImports) {
      return {
        success: false,
        output: "",
        error: "Import of system modules is not allowed for security reasons.",
        executionTime: 0,
      };
    }

    // Set execution timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Execution timeout")),
        this.MAX_EXECUTION_TIME
      );
    });

    try {
      const executionPromise = this.pyodide.runPythonAsync(code);
      await Promise.race([executionPromise, timeoutPromise]);

      // ... rest of execution logic
    } catch (error) {
      // ... error handling
    }
  }
}
```

## 🚀 Performance Optimizations

### 1. Lazy Loading

```typescript
// Only load executors when needed
const loadExecutor = async (language: "python" | "sql") => {
  if (language === "python" && !pythonExecutor) {
    const pyExec = new PythonExecutor();
    await pyExec.initialize();
    setPythonExecutor(pyExec);
  }
  // ... similar for SQL
};
```

### 2. Caching

```typescript
// Cache common datasets
const commonDatasets = {
  employees: `CREATE TABLE employees (...);`,
  sales: `CREATE TABLE sales (...);`,
};

// Pre-load common datasets
await sqlExecutor.loadDataset("employees");
```

### 3. Web Workers

```typescript
// Run heavy computations in a web worker
const worker = new Worker("/executor-worker.js");

worker.postMessage({
  type: "execute",
  language: "python",
  code: code,
});

worker.onmessage = (event) => {
  setExecutionResult(event.data.result);
};
```

## 📱 Mobile Considerations

### 1. Bundle Size

- Use CDN for Pyodide and SQL.js
- Implement progressive loading
- Consider lighter alternatives for mobile

### 2. Performance

- Reduce execution time limits on mobile
- Implement better error handling for slow devices
- Add loading indicators

### 3. UI/UX

- Responsive code editor
- Touch-friendly controls
- Simplified output display

## 🔄 Alternative Approaches

### 1. Backend Execution

```typescript
// Send code to backend for execution
const executeOnBackend = async (code: string, language: string) => {
  const response = await fetch("/api/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language }),
  });

  return response.json();
};
```

### 2. Docker Containers

```typescript
// Use Docker containers for isolated execution
const executeInContainer = async (code: string) => {
  const response = await fetch("/api/container/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  return response.json();
};
```

### 3. Jupyter Kernel

```typescript
// Connect to Jupyter kernel
import { Kernel } from "@jupyterlab/services";

const kernel = await Kernel.startNew();
const future = kernel.requestExecute({ code });
const reply = await future.done;
```

## 🎯 Next Steps

1. **Start with Pyodide** - Easiest to implement
2. **Add SQL.js** - Good for database practice
3. **Implement security measures** - Essential for production
4. **Add visualization support** - Enhances learning experience
5. **Optimize for mobile** - Improve accessibility
6. **Consider backend execution** - For more complex scenarios

This implementation will give you a fully functional code execution environment within your flashcard app!

