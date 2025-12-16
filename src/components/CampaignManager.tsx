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

  if (isLoading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-400">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Campaigns</h2>
        <button onClick={handleOpenCreateForm} className="bg-indigo-500 text-white font-bold px-5 py-2 rounded-lg hover:bg-indigo-600">
          Create Campaign
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-700 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="campaignName" className="block text-sm font-medium text-gray-300 mb-1">Campaign Name</label>
              <input id="campaignName" type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)} required className="w-full p-3 bg-gray-800 rounded-lg" />
            </div>
            <div className="relative">
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-300 mb-1">Keywords</label>
              <input id="keywords" type="text" value={keywordQuery} onChange={e => setKeywordQuery(e.target.value)} placeholder="Search and add keywords" className="w-full p-3 bg-gray-800 rounded-lg" />
              {(keywordSuggestions.length > 0 || isSearchingKeywords) && (
                <ul className="absolute z-10 w-full bg-gray-800 border rounded-lg mt-1">
                  {isSearchingKeywords ? <li>Searching...</li> : keywordSuggestions.map(kw => (
                    <li key={kw.id} onClick={() => addKeyword(kw.value)} className="p-2 cursor-pointer hover:bg-gray-600">{kw.value}</li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedKeywords.map(kw => (
                  <span key={kw} className="bg-indigo-500 text-white px-2 py-1 rounded-full text-sm">{kw} <button type="button" onClick={() => removeKeyword(kw)} className="ml-2">×</button></span>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-300 mb-1">Bid Amount</label>
              <input id="bidAmount" type="number" value={bidAmount} onChange={e => setBidAmount(parseFloat(e.target.value))} required min="0.01" step="0.01" className="w-full p-3 bg-gray-800 rounded-lg" />
            </div>
            <div>
              <label htmlFor="campaignFund" className="block text-sm font-medium text-gray-300 mb-1">Campaign Fund</label>
              <input id="campaignFund" type="number" value={campaignFund} onChange={e => setCampaignFund(parseFloat(e.target.value))} required min="0.01" step="0.01" className="w-full p-3 bg-gray-800 rounded-lg" />
            </div>
            <div>
              <label htmlFor="townId" className="block text-sm font-medium text-gray-300 mb-1">Town</label>
              <select id="townId" value={townId ?? ''} onChange={e => setTownId(Number(e.target.value))} className="w-full p-3 bg-gray-800 rounded-lg">
                <option value="">Select a town</option>
                {towns.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="radiusKm" className="block text-sm font-medium text-gray-300 mb-1">Radius (km)</label>
              <input id="radiusKm" type="number" value={radiusKm} onChange={e => setRadiusKm(parseInt(e.target.value))} required min="1" className="w-full p-3 bg-gray-800 rounded-lg" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value as 'ON' | 'OFF')} className="w-full p-3 bg-gray-800 rounded-lg">
                <option value="ON">ON</option>
                <option value="OFF">OFF</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg">{editingCampaign ? 'Update' : 'Create'}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="p-6 bg-gray-700 rounded-lg shadow-lg relative cursor-pointer" onClick={() => handleOpenEditForm(campaign)}>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(campaign.id); }}
              className="absolute top-2 right-2 text-gray-400 hover:text-white font-bold text-2xl"
            >
              &times;
            </button>
            <h3 className="font-bold text-xl text-white">{campaign.campaignName}</h3>
            <div className="mt-4 space-y-2 text-gray-300">
              <p>Status: <span className={`font-semibold px-2 py-1 rounded-full text-sm ${campaign.status === 'ON' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{campaign.status}</span></p>
              <p>Bid: <span className="font-mono text-cyan-400">{campaign.bidAmount}</span></p>
              <p>Fund: <span className="font-mono text-cyan-400">{campaign.campaignFund}</span></p>
              <p>Keywords: <span className="text-indigo-300">{campaign.keywords.join(', ')}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignManager;
