(() => {
  "use strict";

  // Elements
  const incomeInput = document.getElementById('income-input');
  const setIncomeBtn = document.getElementById('set-income-btn');
  const expenseNameInput = document.getElementById('expense-name-input');
  const expenseValueInput = document.getElementById('expense-value-input');
  const addExpenseBtn = document.getElementById('add-expense-btn');
  const summaryIncome = document.getElementById('summary-income');
  const summaryExpenses = document.getElementById('summary-expenses');
  const summaryRemaining = document.getElementById('summary-remaining');
  const expenseList = document.getElementById('expense-list');
  
  // New Elements
  const allExpensesTable = document.getElementById('all-expenses-table');
  const saveSettingsBtn = document.getElementById('save-settings');
  const exportDataBtn = document.getElementById('export-data');
  const importDataBtn = document.getElementById('import-data');
  const resetDataBtn = document.getElementById('reset-data');
  const currencySelect = document.getElementById('currency-select');

  // Data
  let income = 0;
  let expenses = [];
  let currency = 'USD';

  // Helpers
  function formatCurrency(value) {
    return value.toLocaleString(undefined, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    });
  }

  function updateSummary() {
    const totalExpenses = expenses.reduce((acc, e) => acc + e.value, 0);
    const remaining = income - totalExpenses;
    summaryIncome.textContent = formatCurrency(income);
    summaryExpenses.textContent = formatCurrency(totalExpenses);
    summaryRemaining.textContent = formatCurrency(remaining);
    summaryRemaining.style.color = remaining >= 0 ? '#2a7f62' : '#c0392b';
  }

  function renderExpenses() {
    expenseList.innerHTML = '';
    if (expenses.length === 0) {
      expenseList.innerHTML = '<p style="text-align:center; color:#777;">No expenses added yet.</p>';
      return;
    }
    
    // Show only last 5 expenses in dashboard
    const recentExpenses = expenses.slice(-5);
    
    recentExpenses.forEach((expense, index) => {
      const expenseDiv = document.createElement('div');
      expenseDiv.className = 'expense-item';
      expenseDiv.setAttribute('role', 'listitem');
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'expense-name';
      nameSpan.textContent = expense.name;
      
      const valueSpan = document.createElement('span');
      valueSpan.className = 'expense-value';
      valueSpan.textContent = formatCurrency(expense.value);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'expense-remove';
      removeBtn.setAttribute('aria-label', `Remove expense ${expense.name}`);
      removeBtn.textContent = '×';
      removeBtn.onclick = () => {
        expenses.splice(index, 1);
        saveData();
        renderExpenses();
        renderAllExpenses();
        updateSummary();
      };
      
      expenseDiv.appendChild(nameSpan);
      expenseDiv.appendChild(valueSpan);
      expenseDiv.appendChild(removeBtn);
      expenseList.appendChild(expenseDiv);
    });
  }

  function renderAllExpenses() {
    allExpensesTable.innerHTML = '';
    if (expenses.length === 0) {
      allExpensesTable.innerHTML = '<div class="empty-state">No expenses recorded yet</div>';
      return;
    }
    
    expenses.forEach((expense, index) => {
      const row = document.createElement('div');
      row.className = 'table-row';
      row.innerHTML = `
        <div class="table-cell">${expense.name}</div>
        <div class="table-cell">${formatCurrency(expense.value)}</div>
        <div class="table-cell">${new Date(expense.date || Date.now()).toLocaleDateString()}</div>
        <div class="table-cell">
          <button class="expense-remove" onclick="removeExpenseGlobal(${index})">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
      allExpensesTable.appendChild(row);
    });
  }

  function renderSpendingChart() {
    const ctx = document.getElementById('spending-chart').getContext('2d');
    
    // Group expenses by category (simplified)
    const categories = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      categories[category] = (categories[category] || 0) + expense.value;
    });
    
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          data: Object.values(categories),
          backgroundColor: [
            '#4361ee',
            '#3f37c9',
            '#4895ef',
            '#4cc9f0',
            '#f72585',
            '#7209b7'
          ]
        }]
      }
    });
  }

  function saveData() {
    const data = {
      income,
      expenses,
      currency,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('smartBudgetData', JSON.stringify(data));
  }

  function loadData() {
    const dataStr = localStorage.getItem('smartBudgetData');
    if (dataStr) {
      try {
        const data = JSON.parse(dataStr);
        income = typeof data.income === 'number' ? data.income : 0;
        expenses = Array.isArray(data.expenses) ? data.expenses : [];
        currency = data.currency || 'USD';
        incomeInput.value = income || '';
        currencySelect.value = currency;
      } catch {
        income = 0;
        expenses = [];
      }
    }
  }

  // Event Handlers
  setIncomeBtn.addEventListener('click', () => {
    const val = parseFloat(incomeInput.value);
    if (isNaN(val) || val < 0) {
      alert('Please enter a valid non-negative income amount.');
      incomeInput.focus();
      return;
    }
    income = val;
    saveData();
    updateSummary();
    
    // Show feedback
    const originalText = setIncomeBtn.textContent;
    setIncomeBtn.textContent = '✓ Saved!';
    setTimeout(() => {
      setIncomeBtn.textContent = originalText;
    }, 2000);
  });

  addExpenseBtn.addEventListener('click', () => {
    const name = expenseNameInput.value.trim();
    const val = parseFloat(expenseValueInput.value);
    
    if (!name) {
      alert('Please enter an expense name.');
      expenseNameInput.focus();
      return;
    }
    
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid positive expense amount.');
      expenseValueInput.focus();
      return;
    }
    
    if (name.length > 30) {
      alert('Expense name must be 30 characters or less.');
      expenseNameInput.focus();
      return;
    }
    
    expenses.push({
      name,
      value: val,
      date: new Date().toISOString()
    });
    
    expenseNameInput.value = '';
    expenseValueInput.value = '';
    expenseNameInput.focus();
    saveData();
    renderExpenses();
    renderAllExpenses();
    updateSummary();
    
    // Show feedback
    const originalText = addExpenseBtn.textContent;
    addExpenseBtn.textContent = '✓ Added!';
    setTimeout(() => {
      addExpenseBtn.textContent = originalText;
    }, 2000);
  });

  saveSettingsBtn.addEventListener('click', () => {
    currency = currencySelect.value;
    saveData();
    updateSummary();
    renderExpenses();
    renderAllExpenses();
    alert('Settings saved successfully!');
  });

  exportDataBtn.addEventListener('click', () => {
    const data = {
      income,
      expenses,
      currency,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-budget-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  });

  importDataBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.income !== undefined && data.expenses !== undefined) {
            income = data.income;
            expenses = data.expenses;
            currency = data.currency || 'USD';
            saveData();
            loadData();
            renderExpenses();
            renderAllExpenses();
            updateSummary();
            alert('Data imported successfully!');
          } else {
            alert('Invalid data format');
          }
        } catch {
          alert('Error reading file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  resetDataBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
      localStorage.clear();
      income = 0;
      expenses = [];
      incomeInput.value = '';
      expenseNameInput.value = '';
      expenseValueInput.value = '';
      saveData();
      renderExpenses();
      renderAllExpenses();
      updateSummary();
      alert('All data has been reset');
    }
  });

  // Navigation
  function handleNavigation() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    document.querySelectorAll('.page-section').forEach(section => {
      section.classList.toggle('active', section.id === hash);
    });
    
    // Update active nav link
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${hash}`);
    });
    
    // Render charts if on reports page
    if (hash === 'reports') {
      renderSpendingChart();
    }
  }

  // Make removeExpense available globally for table buttons
  window.removeExpenseGlobal = function(index) {
    expenses.splice(index, 1);
    saveData();
    renderExpenses();
    renderAllExpenses();
    updateSummary();
  };

  // Initialization
  loadData();
  renderExpenses();
  renderAllExpenses();
  updateSummary();
  handleNavigation();
  
  // Set up navigation listeners
  window.addEventListener('hashchange', handleNavigation);
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.hash = this.getAttribute('href');
    });
  });

  // Focus first input on page load
  incomeInput.focus();
})();