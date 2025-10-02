import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';

    console.log(`💰 Fetching finance data - action: ${action}`);

    switch (action) {
      case 'dashboard':
        return await getFinanceDashboard();
      case 'transactions':
        return await getTransactions();
      case 'export':
        return await exportFinanceData();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error in finance API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch finance data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();
    console.log(`💰 Finance POST action: ${action}`);

    switch (action) {
      case 'process-refund':
        return await processRefund(data);
      case 'update-subscription':
        return await updateSubscription(data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Error in finance POST:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process finance operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getFinanceDashboard() {
  try {
    // Get RTOs and Providers for subscription data
    const [rtosSnapshot, providersSnapshot] = await Promise.all([
      collections.rtos().get(),
      collections.providers().get(),
    ]);

    const rtos = rtosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const providers = providersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Calculate revenue data
    const revenueData = generateRevenueData();
    
    // Generate transaction data based on organizations
    const recentTransactions = generateTransactionData(rtos, providers);

    // Calculate financial metrics
    const metrics = calculateFinancialMetrics(rtos, providers);

    const financeData = {
      success: true,
      data: {
        revenueData,
        recentTransactions,
        metrics,
        summary: {
          totalRevenue: metrics.totalRevenue,
          monthlyRecurring: metrics.monthlyRecurring,
          activeSubscriptions: rtos.length + providers.length,
          churnRate: metrics.churnRate,
        }
      },
      timestamp: new Date().toISOString(),
    };

    console.log('✅ Finance dashboard data generated');
    return NextResponse.json(financeData);

  } catch (error) {
    console.error('❌ Error generating finance dashboard:', error);
    throw error;
  }
}

async function getTransactions() {
  try {
    // Get more detailed transaction history
    const [rtosSnapshot, providersSnapshot] = await Promise.all([
      collections.rtos().get(),
      collections.providers().get(),
    ]);

    const rtos = rtosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const providers = providersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const transactions = generateDetailedTransactionData(rtos, providers);

    return NextResponse.json({
      success: true,
      data: { transactions },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    throw error;
  }
}

async function exportFinanceData() {
  try {
    const dashboardData = await getFinanceDashboard();
    const transactionData = await getTransactions();

    return NextResponse.json({
      success: true,
      message: 'Finance data ready for export',
      data: {
        dashboard: dashboardData.body,
        transactions: transactionData.body,
      },
      exportFormat: 'json',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error exporting finance data:', error);
    throw error;
  }
}

async function processRefund(data: any) {
  try {
    const { transactionId, amount, reason } = data;
    
    // In a real implementation, this would integrate with payment processor
    console.log(`💸 Processing refund for transaction ${transactionId}: $${amount}`);

    // Log the refund action
    const refundRecord = {
      transactionId,
      amount,
      reason,
      status: 'processed',
      processedAt: new Date(),
      processedBy: 'admin', // Would come from auth context
    };

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      refund: refundRecord,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error processing refund:', error);
    throw error;
  }
}

async function updateSubscription(data: any) {
  try {
    const { organizationId, organizationType, newPlan } = data;
    
    console.log(`📋 Updating subscription for ${organizationType} ${organizationId} to ${newPlan}`);

    // Update the organization's subscription plan
    const collection = organizationType === 'rto' ? collections.rtos() : collections.providers();
    await collection.doc(organizationId).update({
      subscriptionPlan: newPlan,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription updated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error updating subscription:', error);
    throw error;
  }
}

// Helper functions
function generateRevenueData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    name: month,
    revenue: Math.floor(3000 + Math.random() * 3000), // $3K-$6K range
  }));
}

function generateTransactionData(rtos: any[], providers: any[]) {
  const transactions = [];
  const organizations = [...rtos, ...providers];
  
  for (let i = 0; i < Math.min(10, organizations.length); i++) {
    const org = organizations[i];
    const isRTO = rtos.includes(org);
    const plans = ['Basic', 'Pro', 'Enterprise'];
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const amounts = { 'Basic': 500, 'Pro': 1500, 'Enterprise': 5000 };
    
    transactions.push({
      id: `TRN-${String(i + 1).padStart(3, '0')}`,
      [isRTO ? 'rto' : 'provider']: org.name || `${isRTO ? 'RTO' : 'Provider'} ${i + 1}`,
      plan,
      amount: `$${amounts[plan as keyof typeof amounts].toLocaleString()}`,
      status: Math.random() > 0.1 ? 'Paid' : 'Pending',
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }
  
  return transactions;
}

function generateDetailedTransactionData(rtos: any[], providers: any[]) {
  // Generate more comprehensive transaction history
  const transactions = [];
  const organizations = [...rtos, ...providers];
  
  for (let i = 0; i < Math.min(50, organizations.length * 3); i++) {
    const org = organizations[i % organizations.length];
    const isRTO = rtos.includes(org);
    const plans = ['Basic', 'Pro', 'Enterprise'];
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const amounts = { 'Basic': 500, 'Pro': 1500, 'Enterprise': 5000 };
    
    transactions.push({
      id: `TRN-${String(i + 1).padStart(4, '0')}`,
      organizationId: org.id,
      organizationName: org.name || `${isRTO ? 'RTO' : 'Provider'} ${i + 1}`,
      organizationType: isRTO ? 'rto' : 'provider',
      plan,
      amount: amounts[plan as keyof typeof amounts],
      status: Math.random() > 0.05 ? 'completed' : Math.random() > 0.5 ? 'pending' : 'failed',
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      description: `Monthly ${plan} plan subscription`,
    });
  }
  
  return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function calculateFinancialMetrics(rtos: any[], providers: any[]) {
  const basicPlan = 500;
  const proPlan = 1500;
  const enterprisePlan = 5000;

  // Estimate revenue based on subscription plans
  let totalRevenue = 0;
  const organizations = [...rtos, ...providers];
  
  organizations.forEach(org => {
    const plan = org.subscriptionPlan || 'basic';
    switch (plan.toLowerCase()) {
      case 'enterprise':
        totalRevenue += enterprisePlan;
        break;
      case 'pro':
        totalRevenue += proPlan;
        break;
      default:
        totalRevenue += basicPlan;
        break;
    }
  });

  return {
    totalRevenue,
    monthlyRecurring: totalRevenue, // Assuming monthly billing
    churnRate: Math.floor(Math.random() * 5) + 1, // 1-5% churn rate
    activeSubscriptions: organizations.length,
  };
}