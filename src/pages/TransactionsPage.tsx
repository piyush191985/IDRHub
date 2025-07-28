import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const statusOptions = ['all', 'pending', 'in_progress', 'completed', 'cancelled'];

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      let query = supabase.from('transactions').select('*, property:property_id(title), agent:agent_id(full_name), buyer:buyer_id(full_name), seller:seller_id(full_name)');
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setTransactions(data || []);
      setLoading(false);
    };
    fetchTransactions();
  }, [status]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <div className="mb-4">
        <label>Status: </label>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th>ID</th>
              <th>Property</th>
              <th>Agent</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{tx.id}</td>
                <td>{tx.property?.title || '-'}</td>
                <td>{tx.agent?.full_name || '-'}</td>
                <td>{tx.buyer?.full_name || '-'}</td>
                <td>{tx.seller?.full_name || '-'}</td>
                <td>{tx.price}</td>
                <td>{tx.status}</td>
                <td>
                  <Link to={`/transactions/${tx.id}`} className="text-blue-600 underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TransactionsPage; 