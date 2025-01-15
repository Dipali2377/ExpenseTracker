let expenses = [
  {
    id: 1,
    description: "Groceries",
    amount: 50,
    category: "Food",
    timestamp: "2025-01-10T10:00:00",
  },
  {
    id: 2,
    description: "Bus Ticket",
    amount: 20,
    category: "Transport",
    timestamp: "2025-01-10T14:00:00",
  },
  {
    id: 3,
    description: "Movie Ticket",
    amount: 30,
    category: "Entertainment",
    timestamp: "2025-01-11T18:00:00",
  },
];

let expenseToUpdate = null;

// Function to generate random colors for the chart
function generateColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    colors.push(color);
  }
  return colors;
}

// Function to render the Category Chart (Pie Chart)
function renderCategoryChart(filteredExpenses) {
  const data = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const labels = Object.keys(data);
  const values = Object.values(data);

  // Destroy the existing chart if it's there
  if (window.categoryChart) {
    window.categoryChart.destroy();
  }

  const ctx = document.getElementById("category-chart").getContext("2d");

  // Create a new chart with updated data
  window.categoryChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: generateColors(labels.length),
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

// Function to render the Time-based Chart (Line Chart)
// Function to render the Time-based Chart (Line Chart)
function renderTimeChart(filteredExpenses) {
  const data = filteredExpenses.reduce((acc, exp) => {
    const date = new Date(exp.timestamp);
    const dateString = date.toISOString().split("T")[0]; // Get the date in YYYY-MM-DD format

    // If the date doesn't exist in the accumulator, initialize it to 0
    if (!acc[dateString]) acc[dateString] = 0;
    acc[dateString] += exp.amount; // Add the expense amount to the specific date
    return acc;
  }, {});

  // Extract the dates (YYYY-MM-DD) and the corresponding total expenses
  const labels = Object.keys(data); // These are the dates (e.g., ["2025-01-10", "2025-01-11"])
  const values = Object.values(data); // These are the corresponding total expenses

  const ctx = document.getElementById("time-chart").getContext("2d");

  // Destroy the previous chart if it exists to avoid duplicate charts
  if (window.timeChart) {
    window.timeChart.destroy();
  }

  // Create a new line chart with updated data
  window.timeChart = new Chart(ctx, {
    type: "line", // Line chart type
    data: {
      labels: labels, // X-axis: the dates (e.g., "2025-01-10")
      datasets: [
        {
          label: "Expenses per Day", // The label for the dataset
          data: values, // Y-axis: total expenses for each day
          fill: false, // No fill under the line
          borderColor: "#36A2EB", // Line color
          tension: 0.1, // Smoothness of the line
        },
      ],
    },
    options: {
      responsive: true, // Ensure the chart is responsive
    },
  });
}

// Function to render the expenses list in a table format
function renderExpenseList(filteredExpenses) {
  const expenseList = document.getElementById("expense-list");
  expenseList.innerHTML = ""; // Clear the existing list

  filteredExpenses.forEach((expense) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${expense.description}</td>
      <td>${expense.amount}</td>
      <td>${expense.category}</td>
      <td>
        <button class="update" onclick="prepareUpdateExpense(${expense.id})">Update</button>
        <button class="delete" onclick="deleteExpense(${expense.id})">Delete</button>
      </td>
    `;
    expenseList.appendChild(row);
  });
}

// Function to add a new expense to the list
function addExpense(description, amount, category) {
  const expense = {
    id: Date.now(), // Ensure a unique id
    description,
    amount,
    category,
    timestamp: new Date().toISOString(),
  };
  expenses.push(expense);

  // Reset the form fields and focus on the description field
  document.getElementById("expense-form").reset();
  document.getElementById("description").focus(); // Focus on description input field

  renderExpenseList(expenses);
  renderCategoryChart(expenses);
  renderTimeChart(expenses);
}

// Function to prepare the expense for updating
function prepareUpdateExpense(id) {
  expenseToUpdate = expenses.find((expense) => expense.id === id);

  // Populate form fields with the expense data
  document.getElementById("description").value = expenseToUpdate.description;
  document.getElementById("amount").value = expenseToUpdate.amount;
  document.getElementById("category").value = expenseToUpdate.category;

  // Change the button text to "Update Expense"
  document.getElementById("submit-button").textContent = "Update Expense";
}

// Function to update an existing expense
function updateExpense() {
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (description && amount && category && expenseToUpdate) {
    // Update the expense in the list
    expenseToUpdate.description = description;
    expenseToUpdate.amount = amount;
    expenseToUpdate.category = category;

    // Reset the form fields and button text after the update
    document.getElementById("expense-form").reset();
    document.getElementById("submit-button").textContent = "Add Expense"; // Reset button text

    // Clear the expenseToUpdate variable
    expenseToUpdate = null;

    renderExpenseList(expenses);
    renderCategoryChart(expenses);
    renderTimeChart(expenses);
  }
}

// Function to delete an expense
function deleteExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);
  renderExpenseList(expenses);
  renderCategoryChart(expenses);
  renderTimeChart(expenses);
}

// Event listener for form submission to add or update an expense
document.getElementById("expense-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (description && amount && category) {
    if (expenseToUpdate) {
      updateExpense(); // Update the expense
    } else {
      addExpense(description, amount, category); // Add a new expense
    }
  }
});

// Event listener for filter changes
document.getElementById("filter-category").addEventListener("change", (e) => {
  const filteredExpenses =
    e.target.value === "All"
      ? expenses
      : expenses.filter((expense) => expense.category === e.target.value);

  renderExpenseList(filteredExpenses);
  renderCategoryChart(filteredExpenses);
  renderTimeChart(filteredExpenses);
});

// Initial render of charts and expense list
renderExpenseList(expenses);
renderCategoryChart(expenses);
renderTimeChart(expenses);

// Function to convert expenses data to CSV format
function convertToCSV(expenses) {
  const headers = ["Description", "Amount", "Category", "Timestamp"];
  const rows = expenses.map((expense) => [
    expense.description,
    expense.amount,
    expense.category,
    expense.timestamp,
  ]);

  // Convert rows to CSV format
  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

  return csvContent;
}

// Function to trigger CSV download
function exportToCSV() {
  const csvContent = convertToCSV(expenses);

  // Create a Blob object with the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create a download link
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "expenses.csv";

  // Trigger the download by simulating a click on the link
  link.click();
}

// Event listener for the export CSV button
document.getElementById("export-csv").addEventListener("click", exportToCSV);
