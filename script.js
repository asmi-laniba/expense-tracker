/* =========================================
   EXPENSE TRACKER
========================================= */


/* GET SAVED DATA */

let transactions =
  JSON.parse(
    localStorage.getItem(
      "spendwise-transactions"
    )
  ) || [];


let chart;


/* SETTINGS */

const LOW_BALANCE_LIMIT = 1000;


const currency =
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR"
    }
  );


/* ELEMENTS */

const dialog =
  document.querySelector(
    "#transactionDialog"
  );


const form =
  document.querySelector(
    "#transactionForm"
  );


const list =
  document.querySelector(
    "#transactionList"
  );


const typeInput =
  document.querySelector(
    "#transactionType"
  );


const dateInput =
  document.querySelector(
    "#date"
  );


const descriptionInput =
  document.querySelector(
    "#description"
  );


const categorySelect =
  document.querySelector(
    "#category"
  );


const categoryLabel =
  document.querySelector(
    "#categoryLabel"
  );


const balanceAlert =
  document.querySelector(
    "#balanceAlert"
  );


/* CATEGORIES */

const categoryOptions = {

  expense: [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Health",
    "Entertainment",
    "Other"
  ],

  income: [
    "Salary",
    "Freelance",
    "Investment",
    "Gift",
    "Refund",
    "Other"
  ]

};


/* CHART COLORS */

const chartColors = {

  Food: "#ffb362",

  Travel: "#48bdf3",

  Shopping: "#e98dc0",

  Bills: "#f5c835",

  Health: "#c4b5fd",

  Entertainment: "#077552",

  Other: "#4c5766"

};


/* TODAY */

const today =
  new Date();


dateInput.value =
  toInputDate(today);


/* =========================================
   DATE FUNCTIONS
========================================= */

function toInputDate(date) {

  return new Date(
    date.getTime()
    -
    date.getTimezoneOffset()
    * 60000
  )
    .toISOString()
    .slice(0, 10);

}


function monthKey(date) {

  return date.slice(0, 7);

}


function currentMonthKey() {

  return toInputDate(
    new Date()
  ).slice(0, 7);

}


function monthName(key) {

  const [
    year,
    month
  ] =
    key.split("-");


  return new Intl.DateTimeFormat(
    "en-IN",
    {
      month: "long",
      year: "numeric"
    }
  ).format(
    new Date(
      Number(year),
      Number(month) - 1,
      1
    )
  );

}


function formatDate(date) {

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  ).format(
    new Date(
      `${date}T00:00:00`
    )
  );

}


/* =========================================
   SAVE
========================================= */

function saveTransactions() {

  localStorage.setItem(
    "spendwise-transactions",
    JSON.stringify(
      transactions
    )
  );


  document.querySelector(
    "#savedStatus"
  ).textContent =
    "Saved in this browser ✓";

}


/* =========================================
   TOTALS - ALL MONTHS
========================================= */

function getTotals() {

  return transactions.reduce(
    (
      totals,
      item
    ) => {

      if (
        item.type === "income"
      ) {

        totals.income +=
          item.amount;

      } else {

        totals.expense +=
          item.amount;

      }

      return totals;

    },
    {
      income: 0,
      expense: 0
    }
  );

}


/* =========================================
   CURRENT MONTH TOTALS
========================================= */

function getCurrentMonthTotals() {

  const currentMonth =
    currentMonthKey();


  return transactions
    .filter(
      item =>
        monthKey(
          item.date
        ) === currentMonth
    )
    .reduce(
      (
        totals,
        item
      ) => {

        if (
          item.type === "income"
        ) {

          totals.income +=
            item.amount;

        } else {

          totals.expense +=
            item.amount;

        }

        return totals;

      },
      {
        income: 0,
        expense: 0
      }
    );

}


/* =========================================
   SUMMARY
========================================= */

function updateSummary() {

  /* ALL MONTHS */

  const allTotals =
    getTotals();


  const balance =
    allTotals.income
    -
    allTotals.expense;


  /* CURRENT MONTH */

  const currentTotals =
    getCurrentMonthTotals();


  const currentMonth =
    currentMonthKey();


  const month =
    monthName(
      currentMonth
    );


  /* CURRENT BALANCE */

  document.querySelector(
    "#balance"
  ).textContent =
    currency.format(
      balance
    );


  /* CURRENT MONTH INCOME */

  document.querySelector(
    "#totalIncome"
  ).textContent =
    currency.format(
      currentTotals.income
    );


  /* CURRENT MONTH EXPENSE */

  document.querySelector(
    "#totalExpense"
  ).textContent =
    currency.format(
      currentTotals.expense
    );


  document.querySelector(
    "#incomeMonth"
  ).textContent =
    month;


  document.querySelector(
    "#expenseMonth"
  ).textContent =
    month;


  /* ALERT */

  balanceAlert.hidden =
    true;


  balanceAlert.className =
    "balance-alert";


  if (
    transactions.length
    &&
    balance < 0
  ) {

    balanceAlert.textContent =
      `⚠ Overall balance is negative by ${currency.format(
        Math.abs(balance)
      )}.`;


    balanceAlert.classList.add(
      "danger"
    );


    balanceAlert.hidden =
      false;


  } else if (
    transactions.length
    &&
    balance <= LOW_BALANCE_LIMIT
  ) {

    balanceAlert.textContent =
      `⚠ Low overall balance: ${currency.format(
        balance
      )} remaining.`;


    balanceAlert.classList.add(
      "warning"
    );


    balanceAlert.hidden =
      false;

  }

}


/* =========================================
   CATEGORY ICONS
========================================= */

function categoryIcon(
  category
) {

  const icons = {

    Food: "🍜",

    Travel: "✈️",

    Shopping: "🛍️",

    Bills: "🧾",

    Health: "💊",

    Entertainment: "🎬",

    Salary: "💼",

    Freelance: "💻",

    Investment: "📈",

    Gift: "🎁",

    Refund: "↩",

    Other: "✦"

  };


  return (
    icons[category]
    ||
    "✦"
  );

}


/* =========================================
   SECURITY
========================================= */

function escapeHtml(
  value
) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    value;


  return div.innerHTML;

}


/* =========================================
   TRANSACTIONS
   ALL MONTHS
========================================= */

function renderTransactions() {

  const filter =
    document.querySelector(
      "#typeFilter"
    ).value;


  const visibleItems =
    [...transactions]

      .filter(
        item =>
          filter === "all"
          ||
          item.type === filter
      )

      .sort(
        (a, b) =>
          new Date(
            b.date
          )
          -
          new Date(
            a.date
          )
      );


  if (
    !visibleItems.length
  ) {

    list.innerHTML = `
      <div class="empty">

        <span>◎</span>

        <strong>
          No transactions yet
        </strong>

        <small>
          Add your first income or expense.
        </small>

      </div>
    `;

    return;

  }


  list.innerHTML =
    visibleItems
      .map(
        item => `

        <div class="transaction">

          <div class="category-badge">
            ${categoryIcon(
              item.category
            )}
          </div>


          <div>

            <p class="transaction-name">
              ${escapeHtml(
                item.description
              )}
            </p>

            <p class="transaction-meta">
              ${item.category}
              ·
              ${formatDate(
                item.date
              )}
            </p>

          </div>


          <span
            class="transaction-value ${item.type}"
          >

            ${
              item.type === "income"
                ? "+"
                : "−"
            }

            ${currency.format(
              item.amount
            )}

          </span>


          <button
            class="delete-button"
            data-id="${item.id}"
            aria-label="Delete transaction"
          >
            ×
          </button>

        </div>

      `
      )
      .join("");

}


/* =========================================
   CURRENT MONTH CHART ONLY
========================================= */

function updateChart() {

  const currentMonth =
    currentMonthKey();


  const expenses =
    transactions
      .filter(
        item =>
          item.type === "expense"
          &&
          monthKey(
            item.date
          ) === currentMonth
      );


  const grouped =
    expenses.reduce(
      (
        result,
        item
      ) => {

        result[item.category] =
          (
            result[item.category]
            ||
            0
          )
          +
          item.amount;


        return result;

      },
      {}
    );


  const labels =
    Object.keys(
      grouped
    );


  const values =
    Object.values(
      grouped
    );


  document.querySelector(
    "#chartMonth"
  ).textContent =
    monthName(
      currentMonth
    );


  document.querySelector(
    "#chartNote"
  ).textContent =
    labels.length
      ?
      "Current month's expenses by category."
      :
      "Add expenses to view this month's split.";


  if (chart) {

    chart.destroy();

  }


  chart =
    new Chart(
      document.querySelector(
        "#expenseChart"
      ),
      {

        type: "doughnut",

        data: {

          labels: labels,

          datasets: [

            {

              data: values,

              backgroundColor:
                labels.map(
                  label =>
                    chartColors[
                      label
                    ]
                    ||
                    "#0f766e"
                ),

              borderWidth: 0,

              hoverOffset: 5

            }

          ]

        },


        options: {

          cutout: "70%",

          plugins: {

            legend: {

              position: "bottom",

              labels: {

                boxWidth: 11,

                boxHeight: 11,

                padding: 15,

                font: {
                  family: "Arial"
                }

              }

            }

          },

          maintainAspectRatio:
            false

        }

      }
    );

}


/* =========================================
   MONTHLY OVERVIEW
========================================= */

function renderMonthlyOverview() {

  const monthlyData = {};


  transactions.forEach(
    item => {

      const key =
        monthKey(
          item.date
        );


      if (
        !monthlyData[key]
      ) {

        monthlyData[key] = {

          income: 0,

          expense: 0

        };

      }


      if (
        item.type === "income"
      ) {

        monthlyData[key].income +=
          item.amount;

      } else {

        monthlyData[key].expense +=
          item.amount;

      }

    }
  );


  const months =
    Object.keys(
      monthlyData
    )
      .sort()
      .reverse();


  const tbody =
    document.querySelector(
      "#monthlyBody"
    );


  if (!months.length) {

    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          No monthly data yet.
        </td>
      </tr>
    `;

    return;

  }


  tbody.innerHTML =
    months
      .map(
        month => {

          const data =
            monthlyData[
              month
            ];


          const balance =
            data.income
            -
            data.expense;


          return `

            <tr>

              <td>
                ${monthName(
                  month
                )}
              </td>

              <td>
                ${currency.format(
                  data.income
                )}
              </td>

              <td>
                ${currency.format(
                  data.expense
                )}
              </td>

              <td
                class="${
                  balance >= 0
                    ? "month-positive"
                    : "month-negative"
                }"
              >
                ${currency.format(
                  balance
                )}
              </td>

            </tr>

          `;

        }
      )
      .join("");

}


/* =========================================
   RENDER EVERYTHING
========================================= */

function renderApp() {

  updateSummary();

  renderTransactions();

  updateChart();

  renderMonthlyOverview();

}


/* =========================================
   TRANSACTION TYPE
========================================= */

function setTransactionType(
  type
) {

  typeInput.value =
    type;


  document
    .querySelectorAll(
      ".type-button"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.type ===
            type
        );

      }
    );


  const isIncome =
    type === "income";


  descriptionInput.placeholder =
    isIncome
      ?
      "e.g. August salary"
      :
      "e.g. Lunch with friends";


  categoryLabel.childNodes[0]
    .nodeValue =
      isIncome
        ?
        "Income source"
        :
        "Category";


  categorySelect.innerHTML =
    categoryOptions[type]
      .map(
        category =>
          `
          <option value="${category}">
            ${category}
          </option>
          `
      )
      .join("");

}


/* =========================================
   OPEN MODAL
========================================= */

document
  .querySelector(
    "#addTransactionButton"
  )
  .addEventListener(
    "click",
    () => {

      dialog.showModal();

    }
  );


/* CLOSE MODAL */

document
  .querySelector(
    "#closeDialog"
  )
  .addEventListener(
    "click",
    () => {

      dialog.close();

    }
  );


/* TYPE BUTTONS */

document
  .querySelectorAll(
    ".type-button"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          setTransactionType(
            button.dataset.type
          );

        }
      );

    }
  );


/* =========================================
   SAVE TRANSACTION
========================================= */

form.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const amount =
      Number(
        document.querySelector(
          "#amount"
        ).value
      );


    if (
      amount <= 0
    ) {

      return;

    }


    const defaultDescription =
      typeInput.value === "income"
        ?
        "Income received"
        :
        "Expense added";


    const transaction = {

      id:
        crypto.randomUUID(),

      type:
        typeInput.value,

      amount:
        amount,

      description:
        descriptionInput.value.trim()
        ||
        defaultDescription,

      category:
        categorySelect.value,

      date:
        dateInput.value

    };


    transactions.push(
      transaction
    );


    saveTransactions();

    renderApp();


    /* RESET */

    form.reset();

    setTransactionType(
      "expense"
    );


    dateInput.value =
      toInputDate(
        new Date()
      );


    dialog.close();

  }
);


/* =========================================
   DELETE TRANSACTION
========================================= */

list.addEventListener(
  "click",
  event => {

    const id =
      event.target.dataset.id;


    if (!id) {

      return;

    }


    transactions =
      transactions.filter(
        item =>
          item.id !== id
      );


    saveTransactions();

    renderApp();

  }
);


/* =========================================
   FILTER
========================================= */

document
  .querySelector(
    "#typeFilter"
  )
  .addEventListener(
    "change",
    renderTransactions
  );


/* =========================================
   START
========================================= */

setTransactionType(
  "expense"
);


renderApp();