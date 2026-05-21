// --- 1. COMPARISON DATASET ---
const comparisonDataset = [
  { id: "espresso_machine", label: "High-end Espresso Machines", cost: 600, icon: "☕" },
  { id: "tokyo_flight", label: "Round-trip Flights to Tokyo", cost: 1200, icon: "✈️" },
  { id: "flagship_phone", label: "Flagship Smartphones", cost: 1100, icon: "📱" },
  { id: "omakase_dinner", label: "Premium Omakase Dinners", cost: 300, icon: "🍣" },
  { id: "vespa_scooter", label: "Brand New Vespa Scooters", cost: 4500, icon: "🛵" },
  { id: "luxury_watch", label: "Luxury Swiss Watches", cost: 7500, icon: "⌚" },
  { id: "coachella_vip", label: "Coachella VIP Weekend Passes", cost: 1300, icon: "🎸" },
  { id: "distillery_tour", label: "Private Whiskey Distillery Tours", cost: 2500, icon: "🥃" },
  { id: "tesla_model3", label: "Tesla Model 3s (Cash)", cost: 39000, icon: "🚗" },
  { id: "home_downpayment", label: "Home Down Payments", cost: 60000, icon: "🏠" },
  { id: "sabbatical_year", label: "Years of Fully Funded Sabbatical", cost: 50000, icon: "🌴" }
];

// --- 2. MONETIZATION PRO CONTROL ---
let isProUser = localStorage.getItem('habit_receipt_pro') === 'true';
const urlParams = new URLSearchParams(window.location.search);

if (urlParams.get('paid') === 'true') {
  localStorage.setItem('habit_receipt_pro', 'true');
  isProUser = true;
  window.history.replaceState({}, document.title, window.location.pathname);
}

const proButton = document.getElementById('pro-unlock-btn');
if (isProUser) {
  proButton.textContent = "✨ Pro Unlocked: Custom Yield Active";
  proButton.style.backgroundColor = "#10B981";
  proButton.disabled = true;
} else {
  proButton.addEventListener('click', () => {
    // Replace with your actual live Stripe Payment Link when ready
    window.location.href = "https://buy.stripe.com/mock_your_payment_link_id";
  });
}

// --- 3. DOM ELEMENT SELECTORS ---
const habitNameInput = document.getElementById('habit-name');
const habitCostInput = document.getElementById('habit-cost');
const costSlider = document.getElementById('cost-slider');
const timeSlider = document.getElementById('time-slider');
const yearsDisplay = document.getElementById('years-display');
const futureValueDisplay = document.getElementById('future-value-display');
const cashSpentDisplay = document.getElementById('cash-spent-display');
const itemMatchesContainer = document.getElementById('item-matches-container');
const insightDisplay = document.getElementById('insight-display');
const shareBtn = document.getElementById('share-btn');

// --- 4. MATH ENGINE ---
function calculateOpportunityCost(cost, frequency, years) {
  const ANNUAL_RETURN_RATE = 0.08; 
  const MONTHS_IN_YEAR = 12;
  
  let monthlyContribution = 0;
  if (frequency === 'daily') monthlyContribution = cost * 30.44;
  else if (frequency === 'weekly') monthlyContribution = cost * 4.33;
  else if (frequency === 'monthly') monthlyContribution = cost;

  const totalMonths = years * MONTHS_IN_YEAR;
  const monthlyRate = ANNUAL_RETURN_RATE / MONTHS_IN_YEAR;
  const totalCashSpent = Math.round(monthlyContribution * totalMonths);

  let futureValue = 0;
  if (monthlyRate > 0) {
    futureValue = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  } else {
    futureValue = totalCashSpent;
  }

  return { cashSpent: totalCashSpent, futureValue: Math.round(futureValue) };
}

function getTangibleMatches(finalAmount) {
  return comparisonDataset
    .map(item => ({ ...item, count: Math.floor(finalAmount / item.cost) }))
    .filter(item => item.count > 0 && item.count < 150)
    .sort((a, b) => b.cost - a.cost);
}

// --- 5. UI UPDATES ---
function updateDashboard() {
  const name = habitNameInput.value.trim() || "This Habit";
  const cost = parseFloat(habitCostInput.value) || 0;
  const years = parseInt(timeSlider.value);
  const frequency = document.querySelector('input[name="frequency"]:checked').value;

  yearsDisplay.textContent = years;

  const results = calculateOpportunityCost(cost, frequency, years);
  
  futureValueDisplay.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(results.futureValue);
  cashSpentDisplay.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(results.cashSpent);

  const matches = getTangibleMatches(results.futureValue);
  itemMatchesContainer.innerHTML = '';

  if (matches.length === 0) {
    itemMatchesContainer.innerHTML = '<p class="item-label">Keep adjusting values to see comparisons.</p>';
  } else {
    matches.slice(0, 4).forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      card.innerHTML = `
        <div class="item-icon">${item.icon}</div>
        <div class="item-details">
          <span class="item-count">${item.count}x</span>
          <span class="item-label">${item.label}</span>
        </div>
      `;
      itemMatchesContainer.appendChild(card);
    });
  }

  if (results.futureValue > 50000) {
    insightDisplay.textContent = `At year ${years}, cutting out your ${name.toLowerCase()} habit entirely could buy you a luxury vehicle or fund a massive life pivot.`;
  } else if (results.futureValue > 5000) {
    insightDisplay.textContent = `Over ${years} years, your ${name.toLowerCase()} routine adds up to a world-class vacation or a top-tier home electronics overhaul.`;
  } else {
    insightDisplay.textContent = `Small daily lifestyle tracking adds up. Move the sliders or track longer timelines to see massive market compounding effects.`;
  }
}

// --- 6. SHARING LOGIC ---
function copyReceiptToClipboard() {
  const name = habitNameInput.value.trim() || "My Secret Habit";
  const cost = habitCostInput.value;
  const frequency = document.querySelector('input[name="frequency"]:checked').value;
  const years = timeSlider.value;
  const fvText = futureValueDisplay.textContent;

  const topMatchCard = itemMatchesContainer.querySelector('.item-card');
  let matchSnippet = "a massive stack of financial security";
  if (topMatchCard) {
    const count = topMatchCard.querySelector('.item-count').textContent;
    const label = topMatchCard.querySelector('.item-label').textContent;
    const icon = topMatchCard.querySelector('.item-icon').textContent;
    matchSnippet = `${count} ${icon} ${label}`;
  }

  const shareText = `🧾 THE HABIT RECEIPT\n--------------------------\n• Habit: ${name}\n• Cost: $${cost} / ${frequency}\n• Timeline: ${years} Years\n\n💰 Opportunity Cost: ${fvText}\n🔥 That's equivalent to buying ${matchSnippet}!\n\nCalculate yours live!`;

  navigator.clipboard.writeText(shareText).then(() => {
    const originalText = shareBtn.textContent;
    shareBtn.textContent = "✅ Receipt Copied!";
    setTimeout(() => shareBtn.textContent = originalText, 2000);
  }).catch(err => {
    alert("Could not copy receipt automatically.");
  });
}

// --- 7. EVENT LISTENERS ---
habitCostInput.addEventListener('input', (e) => {
  costSlider.value = e.target.value;
  updateDashboard();
});

costSlider.addEventListener('input', (e) => {
  habitCostInput.value = e.target.value;
  updateDashboard();
});

timeSlider.addEventListener('input', updateDashboard);
document.querySelectorAll('input[name="frequency"]').forEach(radio => {
  radio.addEventListener('change', updateDashboard);
});
habitNameInput.addEventListener('input', updateDashboard);
shareBtn.addEventListener('click', copyReceiptToClipboard);

window.addEventListener('DOMContentLoaded', updateDashboard);