// Retrieve expenses from localStorage or use an empty array
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Variable to store the expense being updated
let expenseToUpdate = null;

// Save expenses to localStorage
function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

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

  if (window.categoryChart) {
    window.categoryChart.destroy();
  }

  const ctx = document.getElementById("category-chart").getContext("2d");
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
    const dateString = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    acc[dateString] = (acc[dateString] || 0) + exp.amount;
    return acc;
  }, {});

  // Ensure there is data to display
  if (Object.keys(data).length === 0) {
    console.log("No expenses to display in the time chart.");
    return;
  }

  const labels = Object.keys(data);
  const values = Object.values(data);

  // Check if there is an existing chart and destroy it
  if (window.timeChart) {
    window.timeChart.destroy();
  }

  // Create or update the chart
  const ctx = document.getElementById("time-chart").getContext("2d");
  window.timeChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Expenses per Day",
          data: values,
          fill: false,
          borderColor: "#36A2EB",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: "category", // Ensure that the x-axis is treated as a category axis
          title: {
            display: true,
            text: "Date",
          },
        },
        y: {
          title: {
            display: true,
            text: "Amount",
          },
          beginAtZero: true, // Ensure the y-axis starts at 0
        },
      },
    },
  });
}

// Function to render the expenses list
function renderExpenseList(filteredExpenses) {
  const expenseList = document.getElementById("expense-list");
  expenseList.innerHTML = "";

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

// Function to add a new expense
function addExpense(description, amount, category) {
  const expense = {
    id: Date.now(),
    description,
    amount,
    category,
    timestamp: new Date().toISOString(),
  };
  expenses.push(expense);
  saveToLocalStorage();

  document.getElementById("expense-form").reset();
  document.getElementById("description").focus();

  Swal.fire({
    icon: "success",
    title: "Expense Added!",
    text: "Your expense added successfully.",
    showConfirmButton: false,
    timer: 3000,
  });

  renderExpenseList(expenses);
  renderCategoryChart(expenses);
  renderTimeChart(expenses);
}

// Function to prepare the expense for updating
function prepareUpdateExpense(id) {
  expenseToUpdate = expenses.find((expense) => expense.id === id);

  document.getElementById("description").value = expenseToUpdate.description;
  document.getElementById("amount").value = expenseToUpdate.amount;
  document.getElementById("category").value = expenseToUpdate.category;

  document.getElementById("submit-button").textContent = "Update Expense";
}

// Function to update an existing expense
function updateExpense() {
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (description && amount && category && expenseToUpdate) {
    expenseToUpdate.description = description;
    expenseToUpdate.amount = amount;
    expenseToUpdate.category = category;

    document.getElementById("expense-form").reset();
    document.getElementById("submit-button").textContent = "Add Expense";
    expenseToUpdate = null;

    saveToLocalStorage();

    Swal.fire({
      icon: "success",
      title: "Expense Updated!",
      text: "The expense has been updated successfully.",
      showConfirmButton: false,
      timer: 3000,
    });

    renderExpenseList(expenses);
    renderCategoryChart(expenses);
    renderTimeChart(expenses);
  }
}

// Function to delete an expense
function deleteExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);
  saveToLocalStorage();
  renderExpenseList(expenses);
  renderCategoryChart(expenses);
  renderTimeChart(expenses);
}

// Function to export expenses to CSV
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

// Event listener for form submission
document.getElementById("expense-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (description && amount && category) {
    if (expenseToUpdate) {
      updateExpense();
    } else {
      addExpense(description, amount, category);
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

// Initial render
renderExpenseList(expenses);
renderCategoryChart(expenses);
renderTimeChart(expenses);
