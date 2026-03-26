import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, Target } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

const scoreSchema = z.object({
  score: z.number().min(1).max(45),
  score_date: z.string().min(1)
});

export default function ScoreEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  
  const { data: scores, isLoading } = useQuery({
    queryKey: ['scores', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('score_date', { ascending: false });
      return data || [];
    }
  });
  
  const addScoreMutation = useMutation({
    mutationFn: async (newScore) => {
      const { data, error } = await supabase
        .from('scores')
        .insert([{ ...newScore, user_id: user.id }])
        .select();
      
      if (error) throw error;
      
      // Keep only latest 5 scores
      const allScores = [...(scores || []), data[0]];
      if (allScores.length > 5) {
        const oldest = allScores.sort((a, b) => 
          new Date(a.score_date) - new Date(b.score_date)
        )[0];
        await supabase.from('scores').delete().eq('id', oldest.id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scores', user.id]);
      reset();
    }
  });
  
  const updateScoreMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('scores')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scores', user.id]);
      setEditingId(null);
    }
  });
  
  const deleteScoreMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('scores')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scores', user.id]);
    }
  });
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(scoreSchema)
  });
  
  const onSubmit = (data) => {
    addScoreMutation.mutate({
      ...data,
      score: Number(data.score)
    });
  };
  
  const getScoreColor = (score) => {
    if (score >= 36) return 'text-green-600 bg-green-50';
    if (score >= 28) return 'text-blue-600 bg-blue-50';
    if (score >= 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900">Score Entry</h1>
          <p className="text-gray-600 mt-2">
            Track your Stableford scores. Keep your latest 5 scores updated.
          </p>
        </motion.div>
        
        {/* Add Score Form */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Add New Score</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stableford Score (1-45)
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    {...register('score', { valueAsNumber: true })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter your score"
                  />
                </div>
                {errors.score && (
                  <p className="text-red-500 text-sm mt-1">Score must be between 1 and 45</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Played
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    {...register('score_date')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                {errors.score_date && (
                  <p className="text-red-500 text-sm mt-1">Please select a date</p>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={addScoreMutation.isPending}
              className="w-full md:w-auto px-6 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {addScoreMutation.isPending ? 'Adding...' : 'Add Score'}
            </button>
          </form>
          
          {scores?.length >= 5 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg text-amber-700 text-sm">
              ℹ️ You have {scores.length} scores saved. Adding a new score will automatically replace your oldest score.
            </div>
          )}
        </motion.div>
        
        {/* Score History */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Your Score History</h2>
            <p className="text-gray-600 text-sm mt-1">
              Latest {scores?.length || 0} scores (max 5)
            </p>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">Loading scores...</div>
          ) : scores?.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No scores yet. Add your first score above!
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {scores?.map((score, index) => (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    {editingId === score.id ? (
                      <EditScoreForm
                        score={score}
                        onSave={(updates) => updateScoreMutation.mutate({ id: score.id, ...updates })}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${getScoreColor(score.score)}`}>
                            {score.score}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {format(new Date(score.score_date), 'MMMM d, yyyy')}
                            </p>
                            <p className="text-sm text-gray-500">
                              Stableford Points
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(score.id)}
                            className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Delete this score?')) {
                                deleteScoreMutation.mutate(score.id);
                              }
                            }}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function EditScoreForm({ score, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    score: score.score,
    score_date: score.score_date
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          value={formData.score}
          onChange={(e) => setFormData({ ...formData, score: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg"
          min="1"
          max="45"
        />
        <input
          type="date"
          value={formData.score_date}
          onChange={(e) => setFormData({ ...formData, score_date: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Save
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg">
          Cancel
        </button>
      </div>
    </form>
  );
}