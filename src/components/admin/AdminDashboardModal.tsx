import React from 'react';
import { X, Users, Flag, Activity, ShieldCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDeleteUser = (username: string) => {
    if (confirm(`Ban user @${username}?`)) {
      toast.success(`User @${username} has been suspended.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-dark-secondary border border-dark-border w-full max-w-4xl h-[550px] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="h-14 border-b border-dark-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <ShieldCheck className="w-5 h-5" /> Admin Control Portal
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          {/* ANALYTICS STATS */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dark-card border border-dark-border p-4 rounded-xl flex items-center gap-4">
              <Users className="w-8 h-8 text-instagram-blue" />
              <div>
                <span className="text-xs text-neutral-400">Total Registered Users</span>
                <h3 className="text-xl font-bold text-white">1,482</h3>
              </div>
            </div>

            <div className="bg-dark-card border border-dark-border p-4 rounded-xl flex items-center gap-4">
              <Activity className="w-8 h-8 text-emerald-400" />
              <div>
                <span className="text-xs text-neutral-400">Daily Active Users</span>
                <h3 className="text-xl font-bold text-white">924</h3>
              </div>
            </div>

            <div className="bg-dark-card border border-dark-border p-4 rounded-xl flex items-center gap-4">
              <Flag className="w-8 h-8 text-instagram-like" />
              <div>
                <span className="text-xs text-neutral-400">Pending Moderation Reports</span>
                <h3 className="text-xl font-bold text-white">3</h3>
              </div>
            </div>
          </div>

          {/* USER MANAGEMENT TABLE */}
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm text-white">User Moderation & Management</h4>
            <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-dark-primary border-b border-dark-border text-neutral-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Role</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {[
                    { username: 'alex_tech', status: 'Active', role: 'Member', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
                    { username: 'spam_bot_99', status: 'Flagged', role: 'Member', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' }
                  ].map((u, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-3 flex items-center gap-2">
                        <img src={u.avatar} className="w-7 h-7 rounded-full object-cover" alt="" />
                        <span className="font-semibold text-white">@{u.username}</span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3">{u.role}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleDeleteUser(u.username)} className="p-1.5 text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
