import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { createAccount, updateAccount, deleteAccount } from '../db/repositories/accountRepository';
import { calculateAccountSummary, calculateNetWorth } from '../core/accounting/balanceEngine';
import type { Account, AccountCalculatedSummary } from '../core/types/account.types';

export function useAccounts() {
  const data = useLiveQuery(async () => {
    const accounts = await db.accounts.toArray();
    const transactions = await db.transactions.toArray();

    const summaries: AccountCalculatedSummary[] = accounts.map((acc) =>
      calculateAccountSummary(acc, transactions)
    );

    const netWorth = calculateNetWorth(summaries);

    return {
      accounts,
      summaries,
      netWorth,
    };
  }, []);

  return {
    accounts: data?.accounts || [],
    summaries: data?.summaries || [],
    netWorth: data?.netWorth || { totalAssetsInCents: 0, totalLiabilitiesInCents: 0, netWorthInCents: 0 },
    isLoading: !data,
    createAccount,
    updateAccount,
    deleteAccount,
  };
}
