// Amazon's DOM is messy. We look for elements that typically hold the price.
function scrapeOrders() {
  let totalSpent = 0;
  let orderCount = 0;

  // Scrape all price elements on the orders page
  // Note: Amazon frequently changes classes, these are the most common current targets
  const priceElements = document.querySelectorAll('.a-color-price, .yohtmlc-order-total span.value, .yohtmlc-order-total, .a-size-base.a-color-secondary');

  priceElements.forEach((el) => {
    const text = el.innerText.trim();
    // Check if it's a dollar amount
    if (text.startsWith('$')) {
      const value = parseFloat(text.replace('$', '').replace(',', ''));
      if (!isNaN(value)) {
        totalSpent += value;
        orderCount++;
      }
    }
  });

  return { totalSpent, orderCount };
}

function injectDashboard(data) {
  // Prevent duplicate injections if the script runs twice
  if (document.getElementById('true-cost-dashboard')) return;

  const dashboard = document.createElement('div');
  dashboard.id = 'true-cost-dashboard';

  const avgOrder = data.orderCount > 0 ? (data.totalSpent / data.orderCount).toFixed(2) : 0;

  dashboard.innerHTML = `
    <h2>True Cost: Local Spending Analysis</h2>
    <div class="metric-row">
      <div class="metric-card">
        <div>Total Visible Spend</div>
        <div class="metric-value">$${data.totalSpent.toFixed(2)}</div>
      </div>
      <div class="metric-card">
        <div>Items Analyzed</div>
        <div class="metric-value" style="color: #2ed573;">${data.orderCount}</div>
      </div>
      <div class="metric-card">
        <div>Average Cost per Order</div>
        <div class="metric-value" style="color: #ffa502;">$${avgOrder}</div>
      </div>
    </div>
  `;

  // Inject at the very top of the Amazon content area
  const mainContent = document.getElementById('a-page') || document.body;
  mainContent.prepend(dashboard);
}

// Run script after a short delay to allow Amazon's dynamic elements to render
setTimeout(() => {
  const data = scrapeOrders();
  if (data.orderCount > 0) {
    injectDashboard(data);
  } else {
    console.log("True Cost: No orders found on this page.");
  }
}, 2000);
