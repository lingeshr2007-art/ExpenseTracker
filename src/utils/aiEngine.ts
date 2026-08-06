// src/utils/aiEngine.ts
import type { Transaction, Category, Budget } from "../types";

/**
 * Predicts the category of a transaction based on its description text.
 */
export function predictCategory(description: string, categories: Category[]): string {
  const desc = description.toLowerCase().trim();
  
  const mappings: { [key: string]: string } = {
    uber: "Transport",
    lyft: "Transport",
    taxi: "Transport",
    train: "Transport",
    bus: "Transport",
    flight: "Transport",
    airline: "Transport",
    gas: "Transport",
    petrol: "Transport",
    
    mcdonald: "Food",
    starbucks: "Food",
    restaurant: "Food",
    grocery: "Food",
    supermarket: "Food",
    dinner: "Food",
    lunch: "Food",
    food: "Food",
    pizza: "Food",
    cafe: "Food",
    walmart: "Food",
    wholefoods: "Food",

    amazon: "Shopping",
    target: "Shopping",
    clothing: "Shopping",
    shoes: "Shopping",
    mall: "Shopping",
    store: "Shopping",
    buy: "Shopping",
    ebay: "Shopping",

    netflix: "Entertainment",
    spotify: "Entertainment",
    disney: "Entertainment",
    cinema: "Entertainment",
    movie: "Entertainment",
    game: "Entertainment",
    steam: "Entertainment",
    concert: "Entertainment",

    hospital: "Medical",
    doctor: "Medical",
    clinic: "Medical",
    pharmacy: "Medical",
    medicine: "Medical",
    dentist: "Medical",
    health: "Medical",

    electric: "Bills",
    water: "Bills",
    power: "Bills",
    rent: "Bills",
    phone: "Bills",
    internet: "Bills",
    mobile: "Bills",
    subscription: "Bills",
    insurance: "Bills",

    school: "Education",
    college: "Education",
    university: "Education",
    course: "Education",
    book: "Education",
    tutor: "Education",
    udemy: "Education",
    coursera: "Education",

    salary: "Salary",
    dividend: "Salary",
    google: "Salary", // e.g. payout
    paycheck: "Salary",
    wage: "Salary",

    crypto: "Investment",
    stock: "Investment",
    shares: "Investment",
    etf: "Investment",
    mutual: "Investment",
    broker: "Investment",
  };

  // Find exact keyword matches
  for (const [keyword, categoryName] of Object.entries(mappings)) {
    if (desc.includes(keyword)) {
      const match = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
      if (match) return match.name;
    }
  }

  // Fallback to "Other"
  const otherCat = categories.find(c => c.name.toLowerCase() === "other") || categories[0];
  return otherCat ? otherCat.name : "Other";
}

/**
 * Predicts the next 30 days spending using statistical calculations.
 */
export function predictSpending(transactions: Transaction[]): {
  predictedTotal: number;
  confidence: number;
  trend: "up" | "down" | "flat";
  percentChange: number;
} {
  const expenses = transactions.filter(t => t.type === "expense");
  if (expenses.length === 0) {
    return { predictedTotal: 0, confidence: 50, trend: "flat", percentChange: 0 };
  }

  // Group by month
  const monthlyTotals: { [key: string]: number } = {};
  expenses.forEach(tx => {
    const month = tx.date.slice(0, 7); // YYYY-MM
    monthlyTotals[month] = (monthlyTotals[month] || 0) + tx.amount;
  });

  const months = Object.keys(monthlyTotals).sort();
  const totals = months.map(m => monthlyTotals[m]);

  if (totals.length < 2) {
    // Return average of recent transactions with moderate confidence
    const avg = expenses.reduce((sum, e) => sum + e.amount, 0) / Math.max(1, expenses.length) * 15; // 15 transactions prediction
    return { predictedTotal: avg, confidence: 60, trend: "flat", percentChange: 0 };
  }

  // Linear calculation
  let diffSum = 0;
  for (let i = 1; i < totals.length; i++) {
    diffSum += totals[i] - totals[i - 1];
  }
  const avgMonthlyChange = diffSum / (totals.length - 1);
  const lastMonthTotal = totals[totals.length - 1];
  const predicted = Math.max(0, lastMonthTotal + avgMonthlyChange);
  const percentChange = lastMonthTotal > 0 ? (avgMonthlyChange / lastMonthTotal) * 100 : 0;

  let trend: "up" | "down" | "flat" = "flat";
  if (percentChange > 2) trend = "up";
  else if (percentChange < -2) trend = "down";

  // Higher confidence with more months of historical data
  const confidence = Math.min(95, 60 + totals.length * 5);

  return {
    predictedTotal: parseFloat(predicted.toFixed(2)),
    confidence,
    trend,
    percentChange: parseFloat(percentChange.toFixed(1))
  };
}

/**
 * Scans transactions for unusual expenses (e.g. 2x above average spending in that category).
 */
export function detectUnusualSpending(transactions: Transaction[]): Array<{
  transaction: Transaction;
  multiplier: number;
  average: number;
}> {
  const expenses = transactions.filter(t => t.type === "expense");
  if (expenses.length < 5) return [];

  // Group by category to find averages
  const categoryMap: { [key: string]: { sum: number; count: number } } = {};
  expenses.forEach(tx => {
    if (!categoryMap[tx.category]) {
      categoryMap[tx.category] = { sum: 0, count: 0 };
    }
    categoryMap[tx.category].sum += tx.amount;
    categoryMap[tx.category].count += 1;
  });

  const unusual: Array<{ transaction: Transaction; multiplier: number; average: number }> = [];

  // Review the most recent 10 transactions
  const recentExpenses = expenses.slice(0, 10);
  recentExpenses.forEach(tx => {
    const stats = categoryMap[tx.category];
    if (stats && stats.count >= 2) {
      const avg = (stats.sum - tx.amount) / (stats.count - 1); // average excluding this transaction
      if (avg > 10 && tx.amount > avg * 1.8) { // 1.8x average and amount > $10
        unusual.push({
          transaction: tx,
          multiplier: parseFloat((tx.amount / avg).toFixed(1)),
          average: parseFloat(avg.toFixed(2))
        });
      }
    }
  });

  return unusual;
}

/**
 * Calculates a consolidated financial health score (0 to 100).
 */
export function calculateHealthScore(
  transactions: Transaction[],
  budgets: Budget[]
): {
  score: number;
  breakdown: { savings: number; budget: number; consistency: number };
} {
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const currentMonthTx = transactions.filter(t => t.date.slice(0, 7) === currentMonth);
  const income = currentMonthTx.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = currentMonthTx.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  // 1. Savings Rate Score (40% weight)
  // Optimal: 20% savings rate = 100 points
  let savingsRateScore = 50; // Neutral fallback
  if (income > 0) {
    const savingsRate = (income - expense) / income;
    if (savingsRate >= 0.20) savingsRateScore = 100;
    else if (savingsRate < 0) savingsRateScore = Math.max(0, 30 + savingsRate * 50);
    else savingsRateScore = Math.min(100, Math.round(savingsRate * 500));
  }

  // 2. Budget Discipline Score (40% weight)
  // Exceeding budgets decreases score
  let budgetScore = 100;
  if (budgets.length > 0) {
    let overCount = 0;
    let limitSum = 0;
    let spentSum = 0;
    budgets.forEach(b => {
      if (b.spent > b.limit) overCount++;
      limitSum += b.limit;
      spentSum += b.spent;
    });

    const budgetPercent = limitSum > 0 ? spentSum / limitSum : 0;
    const overWeight = overCount * 25; // 25 points off per broken budget
    const ratioWeight = budgetPercent > 1 ? (budgetPercent - 1) * 100 : 0;

    budgetScore = Math.max(0, 100 - Math.round(overWeight + ratioWeight));
  }

  // 3. Consistency/Activity Score (20% weight)
  // Number of active transaction records
  const count = transactions.length;
  const consistencyScore = Math.min(100, Math.round(count * 5)); // 20+ transactions = 100

  const score = Math.round(
    savingsRateScore * 0.4 +
    budgetScore * 0.4 +
    consistencyScore * 0.2
  );

  return {
    score,
    breakdown: {
      savings: Math.round(savingsRateScore),
      budget: Math.round(budgetScore),
      consistency: Math.round(consistencyScore)
    }
  };
}

/**
 * Compiles personalized suggestions based on financial analysis.
 */
export function generateInsights(
  transactions: Transaction[],
  budgets: Budget[]
): string[] {
  const insights: string[] = [];
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);

  const currentMonthTx = transactions.filter(t => t.date.slice(0, 7) === currentMonth);
  const income = currentMonthTx.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = currentMonthTx.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  // 1. Savings insights
  if (income > 0) {
    const savingsRate = (income - expense) / income;
    if (savingsRate >= 0.25) {
      insights.push(`Superb savings rate! You saved ${(savingsRate * 100).toFixed(0)}% of your income this month. Consider shifting some savings into low-cost investments.`);
    } else if (savingsRate < 0) {
      insights.push(`Critical: You spent more than you earned this month. Review your non-essential shopping to avoid drawing down savings.`);
    } else {
      insights.push(`Your savings rate is ${(savingsRate * 100).toFixed(0)}%. Increasing it to 20% would accelerate your financial targets. Look into reducing subscription overheads.`);
    }
  } else {
    insights.push("Add your salary or other income streams to generate savings rate metrics.");
  }

  // 2. Budget insights
  if (budgets.length > 0) {
    const overBudgets = budgets.filter(b => b.spent > b.limit);
    if (overBudgets.length > 0) {
      insights.push(`Budget Alerts: You exceeded limits in ${overBudgets.map(b => b.category).join(", ")}. Consider pausing non-essential transactions in these sectors.`);
    }
    const nearBudgets = budgets.filter(b => b.spent > b.limit * 0.8 && b.spent <= b.limit);
    if (nearBudgets.length > 0) {
      insights.push(`Caution: You are approaching 80% of budget limits in ${nearBudgets.map(b => b.category).join(", ")}.`);
    }
  } else if (expense > 0) {
    insights.push("No category budgets set. Establishing custom monthly budgets on Food or Shopping usually saves up to 15% in those categories.");
  }

  // 3. Category concentration
  const catSums: { [key: string]: number } = {};
  currentMonthTx.filter(t => t.type === "expense").forEach(t => {
    catSums[t.category] = (catSums[t.category] || 0) + t.amount;
  });

  const sortedCats = Object.entries(catSums).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length > 0 && expense > 0) {
    const [topCat, topVal] = sortedCats[0];
    const topPercent = (topVal / expense) * 100;
    if (topPercent >= 40 && topCat !== "Housing") {
      insights.push(`Expense Concentration: ${topCat} accounted for ${topPercent.toFixed(0)}% of your total spending. Diversifying your savings away from this category is recommended.`);
    }
  }

  // 4. Unusual transactions alerts
  const unusual = detectUnusualSpending(transactions);
  if (unusual.length > 0) {
    const first = unusual[0];
    insights.push(`Unusual Transaction: Spent $${first.transaction.amount} on ${first.transaction.description} (${first.transaction.category}), which is ${first.multiplier}x your typical expense level.`);
  }

  return insights;
}
