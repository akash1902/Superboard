// App.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface Contract {
  id: string;
  address: string;
  network: 'ethereum' | 'polygon' | 'base';
}

interface FormData {
  address: string;
  network: 'ethereum' | 'polygon' | 'base';
}

interface AnalyzeResponse {
  contractAddress: string;
  methods: string[];
  totalTransactions: number;
}

interface EvaluateResponse {
  meetsCondition: boolean;
  message: string;
}

const methodsRequiringMinAmount = [
  'swap',
  'bridge',
  'trading',
  'staking',
  'claimrewards',
  'nftminting',
  'nftburning',
  'nfttransfer',
  'nftbuysell',
  'burning'
];

const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({ address: '', network: 'ethereum' });
  const [analyzeData, setAnalyzeData] = useState<AnalyzeResponse | null>(null);
  const [contractId, setContractId] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>(''); // New state for minimum amount
  const [evaluationResult, setEvaluationResult] = useState<EvaluateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAnalyzeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create the contract entry in the backend
      const createResponse = await axios.post<Contract>('http://localhost:3000/contracts', formData);
      const contractIdToUse = createResponse.data.id || formData.address;
      setContractId(contractIdToUse);
      // Analyze transactions using the contractId
      const analyzeResponse = await axios.get<AnalyzeResponse>(
        `http://localhost:3000/contracts/${contractIdToUse}/transactions`
      );
      setAnalyzeData(analyzeResponse.data);
      setStep(2);
    } catch (error) {
      console.error('Error analyzing contract:', error);
      alert('Failed to analyze contract. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMethod) {
      alert('Please select a method to validate');
      return;
    }
    setLoading(true);
    try {
      const payload: any = { contractId, functionName: selectedMethod };
      // Only include minAmount if this method requires it
      if (methodsRequiringMinAmount.includes(selectedMethod.toLowerCase()) && minAmount) {
        payload.minAmount = Number(minAmount);
      }
      const response = await axios.post<EvaluateResponse>(
        'http://localhost:3000/contracts/evaluate',
        payload
      );
      setEvaluationResult(response.data);
      setStep(3);
    } catch (error) {
      console.error('Evaluation failed:', error);
      alert('Evaluation failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  // Render the min amount field conditionally
  const renderMinAmountField = () => {
    if (methodsRequiringMinAmount.includes(selectedMethod.toLowerCase())) {
      return (
        <div className="form-group">
          <label>Minimum Amount:</label>
          <input
            type="number"
            name="minAmount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            placeholder="Enter minimum amount"
            required
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container">
      <h1 className="title">Contract Verification Engine</h1>

      {step === 1 && (
        <form className="form-container" onSubmit={handleAnalyzeSubmit}>
          <h2>Enter Contract Details</h2>
          <div className="form-group">
            <label>Contract Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Network:</label>
            <select name="network" value={formData.network} onChange={handleChange} required>
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="base">Base</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Analyze Contract'}
          </button>
        </form>
      )}

      {step === 2 && analyzeData && (
        <div className="form-container">
          <h2>Analysis Result</h2>
          <p>
            <strong>Contract Address:</strong> {analyzeData.contractAddress}
          </p>
          <p>
            <strong>Total Transactions:</strong> {analyzeData.totalTransactions}
          </p>
          <div className="form-group">
            <label>Select Method to Validate:</label>
            <select
              value={selectedMethod}
              onChange={e => {
                setSelectedMethod(e.target.value);
                setMinAmount(''); // Reset minAmount when method changes
              }}
              required
            >
              <option value="">Select a method</option>
              {analyzeData.methods.map(method => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          {renderMinAmountField()}
          <form onSubmit={handleEvaluateSubmit}>
            <button type="submit" disabled={loading}>
              {loading ? 'Evaluating...' : 'Verify Transaction'}
            </button>
            <button type="button" className="back-button" onClick={() => setStep(1)}>
              Back
            </button>
          </form>
        </div>
      )}

      {step === 3 && evaluationResult && (
        <div className="result-container">
          <h2>Evaluation Result</h2>
          <div className="result-box">
            <p>
              <strong>Selected Method:</strong> {selectedMethod}
            </p>
            {methodsRequiringMinAmount.includes(selectedMethod.toLowerCase()) && (
              <p>
                <strong>Minimum Required:</strong> {minAmount}
              </p>
            )}
            <p
              className={`result ${evaluationResult.meetsCondition ? 'success' : 'failure'}`}
            >
              {evaluationResult.meetsCondition ? '✅ Valid' : '❌ Invalid'} -{' '}
              {evaluationResult.message}
            </p>
          </div>
          <button className="back-button" onClick={() => setStep(2)}>
            Back
          </button>
        </div>
      )}

      <style>{`
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; font-family: Arial, sans-serif; }
        .title { text-align: center; color: #2c3e50; margin-bottom: 2rem; }
        .form-container { background: #f8f9fa; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .form-group { margin-bottom: 1.5rem; }
        label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #4a5568; }
        input, select { width: 100%; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 1rem; }
        button { background: #4299e1; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; }
        .back-button { background: #718096; margin-left: 1rem; }
        .result-container { text-align: center; }
        .result-box { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin: 2rem 0; }
        .success { color: #38a169; }
        .failure { color: #e53e3e; }
      `}</style>
    </div>
  );
};

export default App;
