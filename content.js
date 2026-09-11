// 1. Core Scraper Engine (Wrapped in try/catch so it cannot crash)
function scrapeOrders() {
  let totalSpent = 0;
  let orderCount = 0;
  let liberatedData = [];

  try {
    // The selector we KNOW works from your previous successful screenshot
    const priceElements = document.querySelectorAll('.a-color-price, .yohtmlc-order-total span.value, .a-size-base.a-color-secondary');

    priceElements.forEach((el) => {
      const text = el.innerText.trim();
      if (text.startsWith('$')) {
        const priceValue = parseFloat(text.replace('$', '').replace(',', ''));

        if (!isNaN(priceValue)) {
          totalSpent += priceValue;
          orderCount++;

          // Safe, error-proof title extraction
          let cleanTitle = "Amazon Purchase";
          try {
            const container = el.closest('.a-box-group') || el.closest('.a-box') || el.parentElement.parentElement;
            if (container) {
              const links = container.querySelectorAll('.a-link-normal');
              links.forEach(l => {
                const lText = l.innerText.trim();
                if (lText.length > 15 && !lText.includes('View') && !lText.includes('Track') && !lText.includes('Return')) {
                  cleanTitle = lText.replace(/,/g, '');
                }
              });
            }
          } catch (e) {
            // Ignore traversal errors, just keep the default title
          }

          liberatedData.push({ date: "Recent", item: cleanTitle, price: priceValue });
        }
      }
    });
  } catch (e) {
    console.log("True Cost: Silent error caught, continuing execution.");
  }

  return { totalSpent, orderCount, liberatedData };
}

// 2. The Dashboard Injector
function injectDashboard(data) {
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

  // 3. The Data Heist Button
  const exportBtn = document.createElement('button');
  exportBtn.innerText = "↓ Liberate Data (CSV)";
  exportBtn.style = "margin-top: 15px; background: #00ffcc; color: #1e1e1e; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 16px; transition: 0.2s;";

  exportBtn.onclick = () => {
    let csvContent = "Order Date,Item Description,Price\n";

    if (data.liberatedData.length > 0) {
      data.liberatedData.forEach(row => {
        csvContent += `"${row.date}","${row.item}",$${row.price.toFixed(2)}\n`;
      });
    } else {
      csvContent += `"Recent","Data Extraction Failed",$${data.totalSpent.toFixed(2)}\n`;
    }

    csvContent += `\nTOTAL,,$${data.totalSpent.toFixed(2)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'liberated_amazon_data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  dashboard.appendChild(exportBtn);

  const mainContent = document.getElementById('a-page') || document.body;
  mainContent.prepend(dashboard);
}

// --- EXECUTION W/ NO FAIL SAFES ---

// 1. Force the dashboard to inject no matter what
setTimeout(() => {
  const data = scrapeOrders();
  injectDashboard(data); // Removed the 'if orderCount > 0' check. It WILL render.
}, 1500);

// 2. Aggressive Visual Moderation (Blur almost everything to be safe)
setTimeout(() => {
  // Broadened selector to catch all product images regardless of Amazon's layout
  const productImages = document.querySelectorAll('img');
  productImages.forEach(img => {
    // Don't blur the main Amazon logo at the top so the page still looks real
    if (!img.src.includes('logo')) {
      img.style.filter = "blur(15px) grayscale(100%)";
      img.style.transition = "filter 0.5s";

      // Reveal on hover for the demo
      img.onmouseover = () => img.style.filter = "none";
      img.onmouseout = () => img.style.filter = "blur(15px) grayscale(100%)";
    }
  });
}, 2000);
