document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const incomeInput = document.getElementById('income-input');
  const setIncomeBtn = document.getElementById('set-income-btn');
  const editIncomeBtn = document.getElementById('edit-income-btn');
  const expenseNameInput = document.getElementById('expense-name-input');
  const expenseValueInput = document.getElementById('expense-value-input');
  const addExpenseBtn = document.getElementById('add-expense-btn');
  const clearExpensesBtn = document.getElementById('clear-expenses-btn');
  const viewExpensesBtn = document.getElementById('view-expenses-btn');
  
  const summaryIncome = document.getElementById('summary-income');
  const summaryExpenses = document.getElementById('summary-expenses');
  const summaryRemaining = document.getElementById('summary-remaining');
  const balanceStatus = document.getElementById('balance-status');
  
  const expenseTableBody = document.getElementById('expense-table-body');
  const categoriesList = document.getElementById('categories-list');
  
  const budgetProgressBar = document.getElementById('budget-progress-bar');
  const budgetProgressText = document.getElementById('budget-progress-text');
  const dailyAverage = document.getElementById('daily-average');
  const largestExpense = document.getElementById('largest-expense');

  // Data
  let income = 0;
  let expenses = [];

  // Initialize the app
  function init() {
    loadData();
    renderExpenses();
    updateSummary();
    updateCategories();
    updateQuickStats();
    
    // Set up event listeners
    setIncomeBtn.addEventListener('click', setIncome);
    editIncomeBtn.addEventListener('click', editIncome);
    addExpenseBtn.addEventListener('click', addExpense);
    clearExpensesBtn.addEventListener('click', clearExpenses);
    viewExpensesBtn.addEventListener('click', scrollToExpenses);
    
    // Focus income input on page load
    incomeInput.focus();
  }

  // Helper functions
  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  // Data functions
  function setIncome() {
    const val = parseFloat(incomeInput.value);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid income amount');
      incomeInput.focus();
      return;
    }
    
    income = val;
    saveData();
    updateSummary();
    updateQuickStats();
    incomeInput.value = '';
    
    // Show success feedback
    const originalText = setIncomeBtn.innerHTML;
    setIncomeBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    setTimeout(() => {
      setIncomeBtn.innerHTML = originalText;
    }, 2000);
  }

  function editIncome() {
    incomeInput.value = income;
    incomeInput.focus();
  }

  function addExpense() {
    const name = expenseNameInput.value.trim();
    const val = parseFloat(expenseValueInput.value);
    
    if (!name) {
      alert('Please enter an expense name');
      expenseNameInput.focus();
      return;
    }
    
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid expense amount');
      expenseValueInput.focus();
      return;
    }
    
    expenses.push({
      name,
      value: val,
      category: 'Uncategorized',
      date: new Date().toISOString()
    });
    
    saveData();
    renderExpenses();
    updateSummary();
    updateCategories();
    updateQuickStats();
    
    // Clear inputs and focus
    expenseNameInput.value = '';
    expenseValueInput.value = '';
    expenseNameInput.focus();
    
    // Show success feedback
    const originalText = addExpenseBtn.innerHTML;
    addExpenseBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
    setTimeout(() => {
      addExpenseBtn.innerHTML = originalText;
    }, 2000);
  }

  function removeExpense(index) {
    expenses.splice(index, 1);
    saveData();
    renderExpenses();
    updateSummary();
    updateCategories();
    updateQuickStats();
  }

  function clearExpenses() {
    if (confirm('Are you sure you want to clear all expenses?')) {
      expenses = [];
      saveData();
      renderExpenses();
      updateSummary();
      updateCategories();
      updateQuickStats();
    }
  }

  function scrollToExpenses() {
    document.getElementById('expense-list-section').scrollIntoView({
      behavior: 'smooth'
    });
  }

  // Render functions
  function renderExpenses() {
    expenseTableBody.innerHTML = '';
    
    if (expenses.length === 0) {
      expenseTableBody.innerHTML = `
        <div class="empty-row">
          <div class="table-cell" colspan="3">No expenses added yet</div>
        </div>
      `;
      return;
    }
    
    expenses.forEach((expense, index) => {
      const row = document.createElement('div');
      row.className = 'table-row';
      row.innerHTML = `
        <div class="table-cell">${expense.name}</div>
        <div class="table-cell">${formatCurrency(expense.value)}</div>
        <div class="table-cell">
          <button class="action-btn" onclick="removeExpense(${index})">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
      expenseTableBody.appendChild(row);
    });
  }

  function updateSummary() {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.value, 0);
    const remaining = income - totalExpenses;
    const percentage = income > 0 ? Math.min(100, (totalExpenses / income) * 100) : 0;
    
    summaryIncome.textContent = formatCurrency(income);
    summaryExpenses.textContent = formatCurrency(totalExpenses);
    summaryRemaining.textContent = formatCurrency(remaining);
    
    // Update progress bar
    budgetProgressBar.innerHTML = `<div style="width: ${percentage}%"></div>`;
    budgetProgressText.textContent = `${percentage.toFixed(1)}% used`;
    
    // Update balance status
    if (remaining < 0) {
      summaryRemaining.classList.add('text-danger');
      summaryRemaining.classList.remove('text-success');
      balanceStatus.textContent = 'Over Budget';
      balanceStatus.classList.add('text-danger');
      balanceStatus.classList.remove('text-success');
    } else {
      summaryRemaining.classList.add('text-success');
      summaryRemaining.classList.remove('text-danger');
      balanceStatus.textContent = 'On Track';
      balanceStatus.classList.add('text-success');
      balanceStatus.classList.remove('text-danger');
    }
  }

  function updateCategories() {
    // Simple category grouping - in a real app you'd have proper categories
    const categories = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + expense.value;
    });
    
    categoriesList.innerHTML = '';
    
    if (Object.keys(categories).length === 0) {
      categoriesList.innerHTML = '<div class="empty-state">No expenses yet</div>';
      return;
    }
    
    for (const [category, total] of Object.entries(categories)) {
      const item = document.createElement('div');
      item.className = 'category-item';
      item.innerHTML = `
        <span>${category}</span>
        <span>${formatCurrency(total)}</span>
      `;
      categoriesList.appendChild(item);
    }
  }

  function updateQuickStats() {
    // Daily average
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.value, 0);
    const avg = totalExpenses / daysInMonth;
    dailyAverage.textContent = formatCurrency(avg);
    
    // Largest expense
    const largest = expenses.reduce((max, expense) => Math.max(max, expense.value), 0);
    largestExpense.textContent = largest > 0 ? formatCurrency(largest) : '$0.00';
  }

  // Storage functions
  function saveData() {
    localStorage.setItem('budgetData', JSON.stringify({
      income,
      expenses
    }));
  }

  function loadData() {
    const data = JSON.parse(localStorage.getItem('budgetData'));
    if (data) {
      income = data.income || 0;
      expenses = data.expenses || [];
    }
  }

  // Make removeExpense available globally for the inline onclick handler
  window.removeExpense = removeExpense;

  // Initialize the app
  init();
});