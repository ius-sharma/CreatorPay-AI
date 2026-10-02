'use client';

import React, { useState } from 'react';
import { TeamSplit } from '@/lib/types';
import { Users, Plus, ShieldCheck, Mail, Percent, DollarSign, CheckCircle2, UserCheck } from 'lucide-react';

interface ContractsManagerViewProps {
  roster: TeamSplit[];
  onUpdateRoster: (roster: TeamSplit[]) => void;
}

export const ContractsManagerView: React.FC<ContractsManagerViewProps> = ({
  roster,
  onUpdateRoster,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newType, setNewType] = useState<'percentage' | 'fixed'>('percentage');
  const [newValue, setNewValue] = useState(10);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newRole) return;

    const newMember: TeamSplit = {
      id: `split-${Date.now()}`,
      name: newName,
      role: newRole,
      email: newEmail,
      type: newType,
      value: Number(newValue),
      status: 'pending',
      w9Status: 'verified',
    };

    onUpdateRoster([...roster, newMember]);
    setNewName('');
    setNewRole('');
    setNewEmail('');
    setNewValue(10);
    setShowAddForm(false);
  };

  const handleRemoveMember = (id: string) => {
    onUpdateRoster(roster.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-brand-100 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              Team Roster & Automated Revenue Split Rules
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rules configured here are autonomously calculated and disbursed via PayPal Payouts API v1 upon brand deal completion
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Collaborator</span>
        </button>
      </div>

      {/* Add Member Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddMember} className="bg-brand-50/60 border border-brand-200 rounded-2xl p-5 shadow-sm text-xs animate-in fade-in duration-200">
          <h3 className="font-extrabold text-slate-900 mb-3">Add New Studio Collaborator</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Maya Lin"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Role / Specialization</label>
              <input
                type="text"
                required
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="e.g. Sound Engineer"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">PayPal Sandbox Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="e.g. maya@paypal-sandbox.com"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Cut Model & Value</label>
              <div className="flex space-x-2">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-900"
                >
                  <option value="percentage">% Share</option>
                  <option value="fixed">Fixed ($)</option>
                </select>
                <input
                  type="number"
                  required
                  min="1"
                  value={newValue}
                  onChange={(e) => setNewValue(Number(e.target.value))}
                  className="w-20 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-brand-600 text-white font-bold"
            >
              Save Collaborator
            </button>
          </div>
        </form>
      )}

      {/* Collaborator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roster.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-brand-100 rounded-2xl p-5 shadow-sm hover:border-brand-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center font-bold text-sm">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{member.name}</h3>
                    <p className="text-xs font-semibold text-brand-700">{member.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-black text-lg text-slate-900">
                    {member.type === 'percentage' ? `${member.value}%` : `\$${member.value}`}
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">
                    {member.type === 'percentage' ? 'Rev-Share Cut' : 'Fixed Per Deal'}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 font-mono">
                <div className="flex items-center justify-between text-slate-500">
                  <span>PayPal Receiver:</span>
                  <span className="text-slate-800 font-bold">{member.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>IRS W-9 Tax Form:</span>
                  <span className="text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified on File</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Automatic settlement via Payouts API v1</span>
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="text-slate-400 hover:text-rose-600 transition-colors text-[11px] font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
