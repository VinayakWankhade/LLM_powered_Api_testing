import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import axios from 'axios';

interface FeedbackData {
  system_stats: {
    knowledge_base_entries: number;
    unique_endpoints: number;
    recent_feedback_count: number;
    policy_updates: number;
    last_update: string;
  };
  learning_metrics: {
    total_episodes: number;
    avg_episode_reward: number;
    policy_size: number;
    coverage_history: number[];
    reward_history: number[];
  };
}

interface FeedbackSubmission {
  source: string;
  endpoint: string;
  observed_issue: string;
  severity: string;
  parameters?: Record<string, any>;
  metadata?: Record<string, any>;
}

const FeedbackView = () => {
  console.log('FeedbackView component is rendering');
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackSubmission>({
    source: 'user_report',
    endpoint: '',
    observed_issue: '',
    severity: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, metricsResponse] = await Promise.all([
        axios.get('/api/feedback/stats'),
        axios.get('/api/feedback/learning/metrics')
      ]);
      
      setData({
        system_stats: statsResponse.data,
        learning_metrics: metricsResponse.data
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch feedback data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await axios.post('/api/feedback/submit', feedbackForm);
      setSubmitMessage('Feedback submitted successfully!');
      setFeedbackForm({
        source: 'user_report',
        endpoint: '',
        observed_issue: '',
        severity: 'medium',
      });
      // Refresh data after submission
      setTimeout(() => {
        fetchData();
        setSubmitMessage(null);
      }, 2000);
    } catch (err) {
      setSubmitMessage('Failed to submit feedback');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const cleanupKnowledgeBase = async () => {
    try {
      await axios.post('/api/feedback/knowledge-base/cleanup?days=30');
      setSubmitMessage('Knowledge base cleanup completed');
      fetchData();
    } catch (err) {
      setSubmitMessage('Failed to cleanup knowledge base');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        {error || 'No data available'}
      </div>
    );
  }

  // Transform data for charts
  const coverageHistoryData = data.learning_metrics.coverage_history.map((coverage, index) => ({
    episode: index + 1,
    coverage: coverage * 100,
  }));

  const rewardHistoryData = data.learning_metrics.reward_history.map((reward, index) => ({
    episode: index + 1,
    reward: reward,
  }));

  return (
    <div className="space-y-6">
      {/* Submit Feedback Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Submit Feedback</h3>
        <form onSubmit={submitFeedback} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={feedbackForm.source}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, source: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="user_report">User Report</option>
                <option value="test_execution">Test Execution</option>
                <option value="production">Production</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={feedbackForm.severity}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, severity: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endpoint
            </label>
            <input
              type="text"
              value={feedbackForm.endpoint}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, endpoint: e.target.value })}
              placeholder="/api/endpoint"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observed Issue
            </label>
            <textarea
              value={feedbackForm.observed_issue}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, observed_issue: e.target.value })}
              placeholder="Describe the issue you observed..."
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            {submitMessage && (
              <span className={`text-sm ${submitMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {submitMessage}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Knowledge Base</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {data.system_stats.knowledge_base_entries.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">Entries</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Unique Endpoints</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {data.system_stats.unique_endpoints}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Recent Feedback</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {data.system_stats.recent_feedback_count}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Policy Updates</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {data.system_stats.policy_updates}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Total Episodes</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {data.learning_metrics.total_episodes}
          </p>
        </div>
      </div>

      {/* Learning Performance Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Coverage Learning Progress</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={coverageHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="episode" />
                <YAxis unit="%" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="coverage"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Reward History</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rewardHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="episode" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="reward"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Learning Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Learning System Metrics</h3>
          <button
            onClick={cleanupKnowledgeBase}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm"
          >
            Cleanup Knowledge Base
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Average Episode Reward</p>
            <p className="text-2xl font-semibold mt-1">
              {data.learning_metrics.avg_episode_reward.toFixed(3)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Policy Size</p>
            <p className="text-2xl font-semibold mt-1">
              {data.learning_metrics.policy_size.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Last Update</p>
            <p className="text-2xl font-semibold mt-1">
              {new Date(data.system_stats.last_update).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackView;