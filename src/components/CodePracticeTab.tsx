import React, { useState, useEffect, useRef } from "react";
import {
  Code,
  Play,
  Download,
  Upload,
  Database,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Flashcard } from "../types/flashcard";

interface CodePracticeTabProps {
  flashcards: Flashcard[];
  addFlashcard: (
    question: string,
    answer: string,
    category: string,
    folder?: string
  ) => void;
}

interface CodeExercise {
  id: string;
  title: string;
  description: string;
  language: "python" | "sql";
  initialCode: string;
  expectedOutput?: string;
  hints: string[];
  difficulty: "easy" | "medium" | "hard";
  category: string;
  dataset?: string;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

const CodePracticeTab: React.FC<CodePracticeTabProps> = ({ addFlashcard }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<"python" | "sql">(
    "python"
  );
  const [selectedExercise, setSelectedExercise] = useState<CodeExercise | null>(
    null
  );
  const [code, setCode] = useState("");
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [, setUploadedData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample exercises
  const exercises: CodeExercise[] = [
    {
      id: "pandas-basic",
      title: "Basic DataFrame Operations",
      description:
        "Create a DataFrame and perform basic operations like filtering and grouping.",
      language: "python",
      initialCode: `import pandas as pd

# Create a sample DataFrame
data = {
    'name': ['Alice', 'Bob', 'Charlie', 'Diana'],
    'age': [25, 30, 35, 28],
    'city': ['NYC', 'LA', 'Chicago', 'Boston'],
    'salary': [50000, 60000, 70000, 55000]
}

df = pd.DataFrame(data)

# Your code here:
# 1. Filter people older than 30
# 2. Calculate average salary by city
# 3. Sort by age in descending order

print("Filtered data:")
print(df[df['age'] > 30])

print("\\nAverage salary by city:")
print(df.groupby('city')['salary'].mean())

print("\\nSorted by age:")
print(df.sort_values('age', ascending=False))`,
      difficulty: "easy",
      category: "Data Manipulation",
      hints: [
        "Use boolean indexing with df[condition] to filter",
        "Use groupby() method to group data",
        "Use sort_values() to sort the DataFrame",
      ],
    },
    {
      id: "pandas-advanced",
      title: "Data Analysis with Pandas",
      description:
        "Perform advanced data analysis including missing data handling and statistical operations.",
      language: "python",
      initialCode: `import pandas as pd
import numpy as np

# Create a more complex dataset with missing values
np.random.seed(42)
data = {
    'product': ['A', 'B', 'C', 'A', 'B', 'C', 'A', 'B', 'C'],
    'sales': [100, 150, np.nan, 120, 180, 200, 90, 160, 220],
    'region': ['North', 'South', 'North', 'South', 'North', 'South', 'North', 'South', 'North'],
    'quarter': [1, 1, 1, 2, 2, 2, 3, 3, 3]
}

df = pd.DataFrame(data)

# Your tasks:
# 1. Handle missing values in sales column
# 2. Calculate total sales by product and region
# 3. Find the product with highest average sales
# 4. Create a pivot table showing sales by region and quarter

print("Original data:")
print(df)

print("\\nAfter handling missing values:")
df['sales'] = df['sales'].fillna(df['sales'].mean())
print(df)

print("\\nTotal sales by product and region:")
print(df.groupby(['product', 'region'])['sales'].sum())

print("\\nProduct with highest average sales:")
avg_sales = df.groupby('product')['sales'].mean()
print(avg_sales.idxmax(), ":", avg_sales.max())

print("\\nPivot table:")
print(df.pivot_table(values='sales', index='region', columns='quarter', aggfunc='sum'))`,
      difficulty: "medium",
      category: "Data Analysis",
      hints: [
        "Use fillna() to handle missing values",
        "Use groupby() with multiple columns",
        "Use pivot_table() for cross-tabulation",
      ],
    },
    {
      id: "sql-basic",
      title: "Basic SQL Queries",
      description:
        "Write SQL queries to retrieve and filter data from a sample database.",
      language: "sql",
      initialCode: `-- Sample data tables
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT,
    department TEXT,
    salary INTEGER,
    hire_date DATE
);

INSERT INTO employees VALUES
(1, 'Alice Johnson', 'Engineering', 75000, '2020-01-15'),
(2, 'Bob Smith', 'Marketing', 65000, '2019-03-20'),
(3, 'Charlie Brown', 'Engineering', 80000, '2021-06-10'),
(4, 'Diana Prince', 'Sales', 70000, '2020-11-05'),
(5, 'Eve Wilson', 'Engineering', 85000, '2018-09-12');

-- Your queries:
-- 1. Find all employees in Engineering department
-- 2. Calculate average salary by department
-- 3. Find employees hired after 2020
-- 4. Count employees by department

SELECT * FROM employees WHERE department = 'Engineering';

SELECT department, AVG(salary) as avg_salary 
FROM employees 
GROUP BY department;

SELECT * FROM employees WHERE hire_date > '2020-12-31';

SELECT department, COUNT(*) as employee_count 
FROM employees 
GROUP BY department;`,
      difficulty: "easy",
      category: "SQL Basics",
      hints: [
        "Use WHERE clause for filtering",
        "Use GROUP BY with aggregate functions",
        "Use COUNT() to count records",
      ],
    },
    {
      id: "sql-advanced",
      title: "Advanced SQL with Joins",
      description:
        "Practice complex SQL queries with multiple table joins and subqueries.",
      language: "sql",
      initialCode: `-- Create sample tables
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    order_date DATE,
    total_amount DECIMAL(10,2)
);

CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    city TEXT
);

CREATE TABLE products (
    product_id INTEGER PRIMARY KEY,
    name TEXT,
    category TEXT,
    price DECIMAL(10,2)
);

-- Insert sample data
INSERT INTO customers VALUES
(1, 'John Doe', 'john@email.com', 'New York'),
(2, 'Jane Smith', 'jane@email.com', 'Los Angeles'),
(3, 'Bob Johnson', 'bob@email.com', 'Chicago');

INSERT INTO products VALUES
(1, 'Laptop', 'Electronics', 999.99),
(2, 'Mouse', 'Electronics', 29.99),
(3, 'Desk', 'Furniture', 199.99);

INSERT INTO orders VALUES
(1, 1, 1, 1, '2023-01-15', 999.99),
(2, 2, 2, 2, '2023-01-20', 59.98),
(3, 1, 3, 1, '2023-02-01', 199.99),
(4, 3, 1, 1, '2023-02-10', 999.99);

-- Your queries:
-- 1. Find all orders with customer and product details
-- 2. Calculate total sales by customer
-- 3. Find customers who spent more than $500
-- 4. Get product sales by category

SELECT o.order_id, c.name as customer_name, p.name as product_name, 
       o.quantity, o.total_amount, o.order_date
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN products p ON o.product_id = p.product_id;

SELECT c.name, SUM(o.total_amount) as total_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name;

SELECT c.name, SUM(o.total_amount) as total_spent
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name
HAVING SUM(o.total_amount) > 500;

SELECT p.category, SUM(o.total_amount) as category_sales
FROM products p
JOIN orders o ON p.product_id = o.product_id
GROUP BY p.category;`,
      difficulty: "medium",
      category: "SQL Joins",
      hints: [
        "Use JOIN to combine tables",
        "Use HAVING for filtering grouped results",
        "Use aggregate functions with GROUP BY",
      ],
    },
  ];

  useEffect(() => {
    if (selectedExercise) {
      setCode(selectedExercise.initialCode);
      setExecutionResult(null);
      setShowHints(false);
      setCurrentHintIndex(0);
    }
  }, [selectedExercise]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setUploadedData(content);

      // Create a flashcard from the uploaded data
      addFlashcard(
        `Code Practice: ${file.name}`,
        `Uploaded data file for practice:\n\`\`\`\n${content.substring(
          0,
          500
        )}${content.length > 500 ? "..." : ""}\n\`\`\``,
        "Code Practice",
        "general"
      );
    };
    reader.readAsText(file);
  };

  const executeCode = async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      if (selectedLanguage === "python") {
        // For Python, we'll use a mock execution for now
        // In a real implementation, you'd use Pyodide or a backend service
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate execution time

        // Mock execution result
        const mockOutput = `Execution completed successfully!

Sample output:
${
  code.includes("print")
    ? "Output would appear here..."
    : "Code executed without output"
}

Note: This is a mock execution. For real Python execution, you would need to integrate Pyodide or a backend service.`;

        setExecutionResult({
          success: true,
          output: mockOutput,
          executionTime: 1000,
        });
      } else if (selectedLanguage === "sql") {
        // For SQL, we'll use SQL.js or a mock execution
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockOutput = `SQL Query executed successfully!

Query Results:
${
  code.includes("SELECT")
    ? "Results would appear here..."
    : "SQL executed successfully"
}

Note: This is a mock execution. For real SQL execution, you would need to integrate SQL.js or a backend service.`;

        setExecutionResult({
          success: true,
          output: mockOutput,
          executionTime: 800,
        });
      }
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

  const saveAsFlashcard = () => {
    if (!selectedExercise || !code.trim()) return;

    const question = `Code Practice: ${selectedExercise.title}`;
    const answer = `**${selectedExercise.description}**

\`\`\`${selectedLanguage}
${code}
\`\`\`

**Difficulty:** ${selectedExercise.difficulty}
**Category:** ${selectedExercise.category}`;

    addFlashcard(question, answer, "Code Practice", "general");
  };

  const showNextHint = () => {
    if (!selectedExercise) return;
    setCurrentHintIndex((prev) =>
      Math.min(prev + 1, selectedExercise.hints.length - 1)
    );
  };

  const filteredExercises = exercises.filter(
    (ex) => ex.language === selectedLanguage
  );

  return (
    <div className="code-practice-tab">
      <div className="practice-header">
        <h2>Code Practice</h2>
        <p>Practice pandas and SQL with interactive exercises</p>
      </div>

      <div className="practice-controls">
        <div className="language-selector">
          <button
            className={`lang-btn ${
              selectedLanguage === "python" ? "active" : ""
            }`}
            onClick={() => setSelectedLanguage("python")}
          >
            <Code size={16} />
            Python (Pandas)
          </button>
          <button
            className={`lang-btn ${selectedLanguage === "sql" ? "active" : ""}`}
            onClick={() => setSelectedLanguage("sql")}
          >
            <Database size={16} />
            SQL
          </button>
        </div>

        <div className="file-upload">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary btn-sm"
          >
            <Upload size={16} />
            Upload Data
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.txt"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </div>
      </div>

      <div className="practice-layout">
        <div className="exercise-panel">
          <h3>Available Exercises</h3>
          <div className="exercise-list">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className={`exercise-item ${
                  selectedExercise?.id === exercise.id ? "selected" : ""
                }`}
                onClick={() => setSelectedExercise(exercise)}
              >
                <div className="exercise-header">
                  <h4>{exercise.title}</h4>
                  <span className={`difficulty-badge ${exercise.difficulty}`}>
                    {exercise.difficulty}
                  </span>
                </div>
                <p>{exercise.description}</p>
                <div className="exercise-meta">
                  <span className="category">{exercise.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="code-panel">
          {selectedExercise ? (
            <>
              <div className="exercise-info">
                <h3>{selectedExercise.title}</h3>
                <p>{selectedExercise.description}</p>
                <div className="exercise-controls">
                  <button
                    onClick={() => setShowHints(!showHints)}
                    className="btn btn-secondary btn-sm"
                  >
                    {showHints ? "Hide" : "Show"} Hints
                  </button>
                  {showHints && (
                    <button
                      onClick={showNextHint}
                      className="btn btn-secondary btn-sm"
                      disabled={
                        currentHintIndex >= selectedExercise.hints.length - 1
                      }
                    >
                      Next Hint
                    </button>
                  )}
                </div>
                {showHints && selectedExercise.hints[currentHintIndex] && (
                  <div className="hint-box">
                    <strong>Hint {currentHintIndex + 1}:</strong>{" "}
                    {selectedExercise.hints[currentHintIndex]}
                  </div>
                )}
              </div>

              <div className="code-editor">
                <div className="editor-header">
                  <span>Code Editor</span>
                  <div className="editor-actions">
                    <button
                      onClick={executeCode}
                      disabled={isExecuting || !code.trim()}
                      className="btn btn-primary btn-sm"
                    >
                      {isExecuting ? (
                        <>
                          <RefreshCw size={16} className="spinning" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          Run Code
                        </>
                      )}
                    </button>
                    <button
                      onClick={saveAsFlashcard}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download size={16} />
                      Save as Card
                    </button>
                  </div>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`Write your ${selectedLanguage} code here...`}
                  className="code-textarea"
                  rows={20}
                />
              </div>

              {executionResult && (
                <div className="execution-result">
                  <div className="result-header">
                    <span>Execution Result</span>
                    <div className="result-status">
                      {executionResult.success ? (
                        <CheckCircle size={16} className="success" />
                      ) : (
                        <XCircle size={16} className="error" />
                      )}
                      {executionResult.success ? "Success" : "Error"}
                      {executionResult.executionTime > 0 && (
                        <span className="execution-time">
                          ({executionResult.executionTime}ms)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="result-output">
                    {executionResult.error ? (
                      <div className="error-output">
                        <strong>Error:</strong> {executionResult.error}
                      </div>
                    ) : (
                      <pre>{executionResult.output}</pre>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-exercise">
              <h3>Select an Exercise</h3>
              <p>Choose an exercise from the left panel to start practicing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodePracticeTab;
