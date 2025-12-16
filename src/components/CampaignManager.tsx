import React, { useState, useEffect } from 'react';
import type { Campaign, Town, Keyword } from '../types/types';
import { 
  getCampaignsByProduct, 
  createCampaign, 
  updateCampaign,
  deleteCampaign,
  getTowns, 
  searchKeywords 
} from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

interface CampaignManagerProps {
  productId: number;
  onCampaignChange: () => void;
}

const CampaignManager: React.FC<CampaignManagerProps> = ({ productId, onCampaignChange }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Form state
  const [campaignName, setCampaignName] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [bidAmount, setBidAmount] = useState(0.01);
  const [campaignFund, setCampaignFund] = useState(0.01);
  const [status, setStatus] = useState<'ON' | 'OFF'>('ON');
  const [townId, setTownId] = useState<number | undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState(1);
  
  // Data for form
  const [towns, setTowns] = useState<Town[]>([]);
  const [keywordQuery, setKeywordQuery] = useState('');
  const [keywordSuggestions, setKeywordSuggestions] = useState<Keyword[]>([]);
  const [isSearchingKeywords, setIsSearchingKeywords] = useState(false);
  
  const debouncedKeywordQuery = useDebounce(keywordQuery, 300);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [campaignData, townData] = await Promise.all([
        getCampaignsByProduct(productId),
        getTowns(),
      ]);
      setCampaigns(campaignData);
      setTowns(townData);
    } catch {
      setError('Failed to fetch initial data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [productId]);

  useEffect(() => {
    if (debouncedKeywordQuery.trim()) {
      setIsSearchingKeywords(true);
      searchKeywords(debouncedKeywordQuery)
        .then(setKeywordSuggestions)
        .finally(() => setIsSearchingKeywords(false));
    } else {
      setKeywordSuggestions([]);
    }
  }, [debouncedKeywordQuery]);

  const resetForm = () => {
    setCampaignName('');
    setSelectedKeywords([]);
    setBidAmount(0.01);
    setCampaignFund(0.01);
    setStatus('ON');
    setTownId(undefined);
    setRadiusKm(1);
    setEditingCampaign(null);
    setShowForm(false);
  };

  const handleOpenCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEditForm = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setCampaignName(campaign.campaignName);
    setSelectedKeywords(campaign.keywords);
    setBidAmount(campaign.bidAmount);
    setCampaignFund(campaign.campaignFund);
    setStatus(campaign.status);
    setTownId(campaign.townId);
    setRadiusKm(campaign.radiusKm);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const campaignData = { campaignName, keywords: selectedKeywords, bidAmount, campaignFund, status, townId, radiusKm };
    
    try {
      if (editingCampaign) {
        const updated = await updateCampaign(editingCampaign.id, campaignData);
        setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c));
      } else {
        const newCampaign = await createCampaign(productId, campaignData);
        setCampaigns([...campaigns, newCampaign]);
      }
      onCampaignChange();
      resetForm();
    } catch {
      setError(editingCampaign ? 'Failed to update campaign' : 'Failed to create campaign');
    }
  };

  const handleDelete = async (campaignId: number) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(campaignId);
        setCampaigns(campaigns.filter(c => c.id !== campaignId));
        onCampaignChange();
      } catch {
        setError('Failed to delete campaign');
      }
    }
  };

  const addKeyword = (keyword: string) => {
    if (!selectedKeywords.includes(keyword)) setSelectedKeywords([...selectedKeywords, keyword]);
    setKeywordQuery('');
  };

  const removeKeyword = (keyword: string) => {
    setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
  };

  if (isLoading) return <div className="text-center p-12 text-slate-400">Loading campaigns...</div>;
  if (error) return <div className="text-center p-12 text-red-400 bg-red-900/20 rounded-lg">{error}</div>;

  return (
    <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold text-white">Campaigns</h2>
        <button onClick={handleOpenCreateForm} className="group relative inline-flex items-center justify-center px-6 py-3 text-white font-bold overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105">
          <span className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
          <span className="relative">Create Campaign</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-8 bg-slate-800/60 rounded-xl shadow-inner border border-slate-700 animate-in fade-in duration-500">
          <h3 className="text-2xl font-bold mb-6">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form fields with updated styling */}
            <div>
              <label htmlFor="campaignName" className="block text-sm font-medium text-slate-300 mb-2">Campaign Name</label>
              <input id="campaignName" type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} required className="w-full p-3 bg-slate-900/70 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-purple-500 transition-colors" />
            </div>
            <div className="relative">
              <label htmlFor="keywords" className="block text-sm font-medium text-slate-300 mb-2">Keywords</label>
              <input id="keywords" type="text" value={keywordQuery} onChange={e => setKeywordQuery(e.target.value)} placeholder="Search and add keywords" className="w-full p-3 bg-slate-900/70 border-2 border-slate-700 rounded-lg" />
              {(keywordSuggestions.length > 0 || isSearchingKeywords) && (
                <ul className="absolute z-10 w-full bg-slate-800 border border-slate-700 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                  {isSearchingKeywords ? <li className="p-3 text-slate-400">Searching...</li> : keywordSuggestions.map(kw => (
                    <li key={kw.id} onClick={() => addKeyword(kw.value)} className="p-3 cursor-pointer hover:bg-slate-700">{kw.value}</li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedKeywords.map(kw => (
                  <span key={kw} className="bg-indigo-500/80 text-indigo-100 text-sm font-medium px-3 py-1 rounded-full flex items-center">{kw} <button type="button" onClick={() => removeKeyword(kw)} className="ml-2 text-indigo-200 hover:text-white">×</button></span>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="bidAmount" className="block text-sm font-medium text-slate-300 mb-2">Bid Amount</label>
              <input id="bidAmount" type="number" value={bidAmount} onChange={e => setBidAmount(parseFloat(e.target.value))} required min="0.01" step="0.01" className="w-full p-3 bg-slate-900/70 border-2 border-slate-700 rounded-lg" />
            </div>
            <div>
              <label htmlFor="campaignFund" className="block text-sm font-medium text-slate-300 mb-2">Campaign Fund</label>
              <input id="campaignFund" type="number" value={campaignFund} onChange={e => setCampaignFund(parseFloat(e.target.value))} required min="0.01" step="0.01" className="w-full p-3 bg-slate-900/70 border-2 border-slate-700 rounded-lg" />
            </div>
            <div>
              <label htmlFor="townId" className="block text-sm font-medium text-slate-300 mb-2">Town</label>
              <select id="townId" value={townId ?? ''} onChange={e => setTownId(Number(e.target.value))} className="w-full p-3 bg-slate-900/70 border-2 border-slate-700 rounded-lg">
                <option value="">Select a town</option>
                {towns.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="radiusKm" className="block text-sm font-medium text-slate-300 mb-2">Radius (km)</label>
              <input id="radiusKm" type="number" value={radiusKm} onChange={e => setRadiusKm(parseInt(e.target.value))} required min="1" className="w-full p-3 bg-slate-900/70 border-2 border-slate-700 rounded-lg" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value as 'ON' | 'OFF')} className="w-full p-3 bg-slate-900/70 border-2 border-slate-700 rounded-lg">
                <option value="ON">ON</option>
                <option value="OFF">OFF</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={resetForm} className="bg-slate-700 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-slate-600 transition-colors">Cancel</button>
            <button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2.5 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all">{editingCampaign ? 'Update Campaign' : 'Create Campaign'}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="group relative p-6 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-purple-500/20 border border-slate-800 hover:border-slate-700" onClick={() => handleOpenEditForm(campaign)}>
            <div className="absolute -inset-px bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(campaign.id); }}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="font-bold text-xl text-white truncate pr-8">{campaign.campaignName}</h3>
              <div className="mt-4 space-y-3 text-slate-300">
                <p className="flex items-center gap-2">Status: <span className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${campaign.status === 'ON' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{campaign.status}</span></p>
                <p className="flex items-center gap-2">Bid: <span className="font-mono text-cyan-400">{campaign.bidAmount.toFixed(2)}</span></p>
                <p className="flex items-center gap-2">Fund: <span className="font-mono text-cyan-400">{campaign.campaignFund.toFixed(2)}</span></p>
                <p className="flex items-center gap-2">Keywords: <span className="text-indigo-300 truncate">{campaign.keywords.join(', ')}</span></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignManager;
