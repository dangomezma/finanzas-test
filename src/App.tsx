/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, type NavView } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { AccountsView } from './components/accounts/AccountsView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { GoalsView } from './components/goals/GoalsView';
import { RecurringView } from './components/recurring/RecurringView';
import { ReportsView } from './components/reports/ReportsView';
import { CategoriesView } from './components/categories/CategoriesView';
import { BackupView } from './components/backup/BackupView';
import { CalendarView } from './components/calendar/CalendarView';
import { NewTransactionModal } from './components/transactions/NewTransactionModal';
import { NewAccountModal } from './components/accounts/NewAccountModal';
import { EditAccountModal } from './components/accounts/EditAccountModal';
import { useAccounts } from './hooks/useAccounts';
import { useCategories } from './hooks/useCategories';
import { useTransactions } from './hooks/useTransactions';
import { useBudgets } from './hooks/useBudgets';
import { useGoals } from './hooks/useGoals';
import { useRecurring } from './hooks/useRecurring';
import { initializeDatabaseIfNeeded } from './db/repositories/accountRepository';
import type { Account } from './core/types/account.types';
import type { Transaction } from './core/types/transaction.types';

export default function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const {
    accounts,
    summaries,
    netWorth,
    createAccount,
    updateAccount,
    deleteAccount,
  } = useAccounts();

  const {
    categories,
    expenseCategories,
    incomeCategories,
    createCategory,
    deleteCategory,
  } = useCategories();

  const {
    transactions,
    filteredTransactions,
    currentMonthSummary,
    filter,
    setFilter,
    resetFilter,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const {
    status: budgetStatus,
    selectedYear: budgetYear,
    selectedMonth: budgetMonth,
    setSelectedYear: setBudgetYear,
    setSelectedMonth: setBudgetMonth,
    createOrUpdateBudget,
    deleteBudget,
  } = useBudgets();

  const {
    goalsWithStatus,
    totalSavedInGoalsInCents,
    createGoal,
    updateGoal,
    addFundsToGoal,
    deleteGoal,
  } = useGoals();

  const {
    recurringList,
    upcomingStatus,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    executeRecurringPayment,
  } = useRecurring();

  // Inicializar base de datos local de manera segura al montar
  useEffect(() => {
    initializeDatabaseIfNeeded();
  }, []);

  // Sincronizar clase 'dark' con el elemento raíz HTML
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsNewTxOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsNewTxOpen(true);
  };

  const handleViewAccountTransactions = (accountId: string) => {
    setFilter({ accountId });
    setCurrentView('transactions');
  };

  const handlePayCreditCard = (cardAccount: Account, debtInCents: number) => {
    const defaultBank = accounts.find((a) => a.type === 'savings' || a.type === 'bank') || accounts[0];
    setEditingTransaction({
      id: '',
      type: 'credit_card_payment',
      amountInCents: debtInCents,
      currency: 'COP',
      date: new Date().toISOString().split('T')[0],
      sourceAccountId: defaultBank?.id || '',
      targetAccountId: cardAccount.id,
      description: `Abono a ${cardAccount.name}`,
      notes: `Pago directo para reducir deuda de tarjeta de crédito`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsNewTxOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Barra lateral de navegación */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenNewTransaction={handleOpenNewTransaction}
      />

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          netWorthInCents={netWorth.netWorthInCents}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView
                summaries={summaries}
                netWorth={netWorth}
                monthSummary={currentMonthSummary}
                recentTransactions={transactions}
                categories={categories}
                recurringList={recurringList}
                upcomingPayments={upcomingStatus.items}
                onOpenNewTransaction={handleOpenNewTransaction}
                onNavigateToAccounts={() => setCurrentView('accounts')}
                onNavigateToTransactions={() => setCurrentView('transactions')}
                onNavigateToReports={() => setCurrentView('reports')}
                onNavigateToRecurring={() => setCurrentView('recurring')}
                onNavigateToCalendar={() => setCurrentView('calendar')}
                onExecutePayment={async (id) => {
                  await executeRecurringPayment(id);
                }}
              />
            )}

            {currentView === 'calendar' && (
              <CalendarView
                accounts={accounts}
                categories={categories}
                recurringList={recurringList}
                onCreateRecurring={createRecurring}
                onDeleteRecurring={deleteRecurring}
                onExecutePayment={async (id, paymentDate) => {
                  await executeRecurringPayment(id, paymentDate);
                }}
              />
            )}

            {currentView === 'accounts' && (
              <AccountsView
                summaries={summaries}
                onOpenNewAccount={() => setIsNewAccountOpen(true)}
                onEditAccount={(acc) => setEditingAccount(acc)}
                onDeleteAccount={deleteAccount}
                onViewAccountTransactions={handleViewAccountTransactions}
                onPayCreditCard={handlePayCreditCard}
              />
            )}

            {currentView === 'transactions' && (
              <TransactionsView
                transactions={filteredTransactions}
                accounts={accounts}
                categories={categories}
                filter={filter}
                onFilterChange={setFilter}
                onResetFilter={resetFilter}
                onOpenNewTransaction={handleOpenNewTransaction}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={deleteTransaction}
              />
            )}

            {currentView === 'budgets' && (
              <BudgetsView
                status={budgetStatus}
                categories={categories}
                selectedYear={budgetYear}
                selectedMonth={budgetMonth}
                onSelectYear={setBudgetYear}
                onSelectMonth={setBudgetMonth}
                onCreateOrUpdateBudget={createOrUpdateBudget}
                onDeleteBudget={deleteBudget}
              />
            )}

            {currentView === 'goals' && (
              <GoalsView
                goalsWithStatus={goalsWithStatus}
                totalSavedInGoalsInCents={totalSavedInGoalsInCents}
                onCreateGoal={createGoal}
                onUpdateGoal={updateGoal}
                onAddFunds={addFundsToGoal}
                onDeleteGoal={deleteGoal}
              />
            )}

            {currentView === 'recurring' && (
              <RecurringView
                recurringList={recurringList}
                upcomingStatus={upcomingStatus}
                accounts={accounts}
                categories={categories}
                onCreateRecurring={createRecurring}
                onUpdateRecurring={updateRecurring}
                onDeleteRecurring={deleteRecurring}
                onExecutePayment={async (id) => {
                  await executeRecurringPayment(id);
                }}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView
                transactions={transactions}
                categories={categories}
                accounts={accounts}
              />
            )}

            {currentView === 'categories' && (
              <CategoriesView
                expenseCategories={expenseCategories}
                incomeCategories={incomeCategories}
                onCreateCategory={createCategory}
                onDeleteCategory={deleteCategory}
              />
            )}

            {currentView === 'backup' && (
              <BackupView
                accountsCount={accounts.length}
                transactionsCount={transactions.length}
                categoriesCount={categories.length}
                onRefreshData={() => {
                  window.location.reload();
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modales globales */}
      <NewTransactionModal
        isOpen={isNewTxOpen}
        onClose={() => {
          setIsNewTxOpen(false);
          setEditingTransaction(null);
        }}
        accounts={accounts}
        categories={categories}
        transactionToEdit={editingTransaction}
        onSubmit={async (tx) => {
          if (tx.id) {
            await updateTransaction(tx.id, tx);
          } else {
            await createTransaction(tx);
          }
        }}
      />

      <NewAccountModal
        isOpen={isNewAccountOpen}
        onClose={() => setIsNewAccountOpen(false)}
        onSubmit={async (account) => {
          await createAccount(account);
        }}
      />

      <EditAccountModal
        account={editingAccount}
        isOpen={Boolean(editingAccount)}
        onClose={() => setEditingAccount(null)}
        onSubmit={async (id, updates) => {
          await updateAccount(id, updates);
        }}
      />
    </div>
  );
}
