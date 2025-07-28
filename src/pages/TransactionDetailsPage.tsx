import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const tabOptions = ['Details', 'Documents'];

const TransactionDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Details');
  const [paperwork, setPaperwork] = useState<any[]>([]);
  const [paperworkLoading, setPaperworkLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransaction = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*, property:property_id(title), agent:agent_id(full_name), buyer:buyer_id(full_name), seller:seller_id(full_name)')
        .eq('id', id)
        .single();
      if (error) setError(error.message);
      else setTransaction(data);
      setLoading(false);
    };
    fetchTransaction();
  }, [id]);

  useEffect(() => {
    if (tab === 'Documents') {
      const fetchPaperwork = async () => {
        setPaperworkLoading(true);
        try {
          const { data } = await supabase
            .from('paperwork')
            .select('*')
            .eq('transaction_id', id);
          setPaperwork(data || []);
        } finally {
          setPaperworkLoading(false);
        }
      };
      fetchPaperwork();
    }
  }, [tab, id, showUpload]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!transaction) return <div>Transaction not found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transaction Details</h1>
      {/* Agent-only payment and property details */}
      {user?.role === 'agent' && transaction && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="text-lg font-semibold mb-2">Buyer & Payment Details</h2>
          <div><b>Buyer Name:</b> {transaction.buyer?.full_name || '-'}</div>
          <div><b>Buyer Email:</b> {transaction.buyer?.email || '-'}</div>
          <div><b>Property:</b> {transaction.property?.title || '-'}</div>
          <div><b>Property Price:</b> {transaction.price}</div>
          <div><b>Token Amount (to collect):</b> {transaction.token_amount || 'Not set'}</div>
          <div className="mt-2 text-sm text-gray-700">Collect the token amount from the buyer. The remaining payment should be handled via your preferred offline/secure medium and updated in the system once completed.</div>
        </div>
      )}
      <div className="mb-4">
        {tabOptions.map(t => (
          <button key={t} className={`mr-2 px-3 py-1 ${tab === t ? 'bg-blue-500 text-white' : 'bg-gray-200'}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === 'Details' && (
        <div>
          <div><b>Property:</b> {transaction.property?.title || '-'}</div>
          <div><b>Agent:</b> {transaction.agent?.full_name || '-'}</div>
          <div><b>Buyer:</b> {transaction.buyer?.full_name || '-'}</div>
          <div><b>Seller:</b> {transaction.seller?.full_name || '-'}</div>
          <div><b>Price:</b> {transaction.price}</div>
          <div><b>Status:</b> {transaction.status}</div>
          <div><b>Offer Date:</b> {transaction.offer_date || '-'}</div>
          <div><b>Contract Date:</b> {transaction.contract_date || '-'}</div>
          <div><b>Closing Date:</b> {transaction.closing_date || '-'}</div>
        </div>
      )}
      {tab === 'Documents' && (
        <div>
          <button className="mb-4 px-3 py-1 bg-green-500 text-white" onClick={() => setShowUpload(true)}>Upload Document</button>
          {paperworkLoading ? <div>Loading documents...</div> : (
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>File</th>
                  <th>Uploaded By</th>
                  <th>Status</th>
                  <th>Uploaded At</th>
                </tr>
              </thead>
              <tbody>
                {paperwork.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.document_type}</td>
                    <td><a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a></td>
                    <td>{doc.uploaded_by}</td>
                    <td>{doc.status}</td>
                    <td>{doc.uploaded_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {showUpload && <UploadPaperworkModal transactionId={id!} onClose={() => setShowUpload(false)} />}
        </div>
      )}
    </div>
  );
};

// Placeholder for the upload modal
const UploadPaperworkModal: React.FC<{ transactionId: string; onClose: () => void }> = ({ transactionId, onClose }) => {
  const [documentType, setDocumentType] = useState('contract');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('pending');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documentTypes = ['contract', 'disclosure', 'id', 'offer', 'other'];
  const statusOptions = ['pending', 'signed', 'reviewed', 'completed'];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      // Upload file to Supabase Storage
      const filePath = `paperwork/${transactionId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('paperwork').upload(filePath, file);
      if (uploadError) throw uploadError;
      // Get public URL
      const { publicUrl } = supabase.storage.from('paperwork').getPublicUrl(filePath).data;
      // Insert into paperwork table
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || 'unknown';
      const { error: insertError } = await supabase.from('paperwork').insert([
        {
          transaction_id: transactionId,
          document_type: documentType,
          file_url: publicUrl,
          uploaded_by: userId,
          status,
          uploaded_at: new Date().toISOString(),
        },
      ]);
      if (insertError) throw insertError;
      onClose();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Upload Document</h2>
        <form onSubmit={handleUpload}>
          <div className="mb-2">
            <label>Document Type:</label>
            <select value={documentType} onChange={e => setDocumentType(e.target.value)} className="ml-2">
              {documentTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="mb-2">
            <label>Status:</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="ml-2">
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="mb-2">
            <label>File:</label>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="ml-2" />
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <div className="flex justify-end">
            <button type="button" className="mr-2 px-3 py-1 bg-gray-300" onClick={onClose} disabled={uploading}>Cancel</button>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionDetailsPage; 