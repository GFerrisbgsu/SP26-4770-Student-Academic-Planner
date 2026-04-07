/**
 * Sync Testing Page
 * 
 * Interactive page to test auto-save, offline mode, and sync functionality.
 * Navigate to: http://localhost:5173/test-sync (or 3030 for full stack) after starting the frontend.
 */

import { useState, useEffect } from 'react';
import { usePersistence } from '~/context/PersistenceContext';
import { useNetwork } from '~/context/NetworkContext';
import { getQueueStats } from '~/utils/network/requestQueue';
import { getQueue, addToQueue, clearQueue } from '~/utils/storage/localStorage';
import type { QueuedRequest } from '~/types/storage';

export default function TestSync() {
  const { isOnline, isSyncing, queuedCount, lastSync, sync } = usePersistence();
  const { wasOffline, quality, effectiveType } = useNetwork();
  const [logs, setLogs] = useState<string[]>([]);
  const [useRealEndpoint, setUseRealEndpoint] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh trigger
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  // Force component to re-read queue from localStorage
  const refreshQueue = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Auto-refresh when sync status changes
  useEffect(() => {
    refreshQueue();
  }, [isSyncing, queuedCount, lastSync]);

  // Poll queue every 2 seconds to catch any external changes
  useEffect(() => {
    const interval = setInterval(refreshQueue, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToQueue = (endpoint?: string) => {
    // Use provided endpoint or determine based on toggle
    // NOTE: Endpoints should NOT include /api prefix (API_BASE_URL already has it)
    const targetEndpoint = endpoint || (useRealEndpoint ? '/users' : '/test');
    const isDummy = targetEndpoint === '/test';
    
    const request: QueuedRequest = {
      id: Date.now().toString(),
      endpoint: targetEndpoint,
      method: isDummy ? 'POST' : 'GET', // GET for real endpoint to avoid creating data
      payload: isDummy ? { 
        title: 'Test Event',
        timestamp: Date.now() 
      } : undefined,
      timestamp: Date.now(),
      retries: 0,
      priority: 'high'
    };
    
    addToQueue(request);
    addLog(`✅ Added ${isDummy ? 'DUMMY' : 'REAL'} request to queue: ${request.method} ${targetEndpoint}`);
    refreshQueue(); // Refresh to show updated queue
  };

  const handleManualSync = async () => {
    addLog('🔄 Manually triggering sync...');
    try {
      await sync();
      addLog('✅ Manual sync completed');
      refreshQueue(); // Refresh to show cleared queue
    } catch (error) {
      addLog(`❌ Manual sync failed: ${error}`);
      refreshQueue(); // Refresh even on error
    }
  };

  const handleClearQueue = () => {
    clearQueue();
    addLog('🗑️ Queue cleared');
    refreshQueue(); // Refresh to show empty queue
  };

  const handleViewQueue = () => {
    const queue = getQueue();
    console.log('📋 Current queue:', queue);
    console.log('📋 Queue items:', JSON.stringify(queue, null, 2));
    addLog(`📋 Queue dumped to console (${queue.length} items)`);
  };

  // Read queue info fresh on every render (triggered by refreshKey)
  const getQueueInfo = () => {
    const queue = getQueue();
    const stats = getQueueStats();
    
    return {
      total: queue.length,
      stats,
      items: queue.slice(0, 5) // First 5 items
    };
  };

  const queueInfo = getQueueInfo(); // Recalculated on each render

  return (
    <div className="min-h-full bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Sync Testing Page</h1>
              <p className="text-gray-600">
                Test offline mode, queue management, and auto-sync functionality
              </p>
            </div>
            <div className="text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live monitoring
              </div>
              <div className="text-right mt-1">Refresh #{refreshKey}</div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Network Status */}
          <div className={`rounded-lg shadow p-6 ${isOnline ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Network Status</h2>
              <span className="text-2xl">{isOnline ? '🟢' : '🟡'}</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>Status: <strong>{isOnline ? 'Online' : 'Offline'}</strong></p>
              <p>Was Offline: <strong>{wasOffline ? 'Yes' : 'No'}</strong></p>
              <p>Quality: <strong>{quality}</strong></p>
              <p>Type: <strong>{effectiveType || 'unknown'}</strong></p>
            </div>
          </div>

          {/* Sync Status */}
          <div className={`rounded-lg shadow p-6 ${isSyncing ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Sync Status</h2>
              <span className="text-2xl">{isSyncing ? '⏳' : '✅'}</span>
            </div>
            <div className="space-y-1 text-sm">
              <p>Syncing: <strong>{isSyncing ? 'Yes' : 'No'}</strong></p>
              <p>Queued: <strong>{queuedCount} items</strong></p>
              <p>Last Sync: <strong>{lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never'}</strong></p>
            </div>
          </div>

          {/* Queue Info */}
          <div className="bg-purple-50 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Queue Info</h2>
            </div>
            <div className="space-y-1 text-sm">
              <p>Total: <strong>{queueInfo.total}</strong></p>
              <p>Pending: <strong>{queueInfo.stats.pending}</strong></p>
              <p>Failed: <strong>{queueInfo.stats.failed}</strong></p>
              <p>By Priority:</p>
              <ul className="ml-4 text-xs">
                {Object.entries(queueInfo.stats.byPriority).map(([priority, count]) => (
                  <li key={priority}>Priority {priority}: {count}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-4">Actions</h2>
          
          {/* Endpoint Type Toggle */}
          <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useRealEndpoint}
                onChange={() => setUseRealEndpoint(!useRealEndpoint)}
                className="w-4 h-4"
              />
              <span className="text-sm">
                <strong>Use real endpoint</strong> 
                <span className="text-gray-600 ml-2">
                  {useRealEndpoint ? '✅ GET /users (requires backend running)' : '❌ POST /test (dummy endpoint, will fail)'}
                </span>
              </span>
            </label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleAddToQueue()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Add to Queue
            </button>
            
            <button
              onClick={handleManualSync}
              disabled={!isOnline || isSyncing || queueInfo.total === 0}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Manual Sync
            </button>
            
            <button
              onClick={handleViewQueue}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
            >
              View Queue
            </button>
            
            <button
              onClick={handleClearQueue}
              disabled={queueInfo.total === 0}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Clear Queue
            </button>
          </div>
          
          {/* Endpoint Examples */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Or add specific endpoints:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAddToQueue('/test')}
                className="px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
              >
                POST /test (dummy)
              </button>
              <button
                onClick={() => handleAddToQueue('/users')}
                className="px-3 py-1 text-xs bg-green-100 border border-green-300 rounded hover:bg-green-200"
              >
                GET /users (real)
              </button>
              <button
                onClick={() => handleAddToQueue('/events')}
                className="px-3 py-1 text-xs bg-yellow-100 border border-yellow-300 rounded hover:bg-yellow-200"
              >
                GET /events (not implemented yet)
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">🧭 Testing Instructions</h2>
          
          {/* Endpoint Explanation */}
          <div className="mb-4 p-3 bg-white rounded border border-blue-200">
            <h3 className="font-semibold text-sm mb-2">📡 Endpoint Types:</h3>
            <ul className="text-xs space-y-1 text-gray-700">
              <li>
                <strong className="text-gray-900">Dummy (/test):</strong> 
                <span className="ml-1">Doesn't exist on backend. Will FAIL when synced. Good for testing queue and retry logic.</span>
              </li>
              <li>
                <strong className="text-green-700">Real (/users):</strong> 
                <span className="ml-1">Exists in backend (GET endpoint). Will SUCCEED if backend is running on localhost:8080.</span>
                <span className="ml-1 text-gray-500">(Full URL: http://localhost:8080/api/users)</span>
              </li>
              <li>
                <strong className="text-yellow-700">Future (/events):</strong> 
                <span className="ml-1">Will exist soon. Currently will fail with 404.</span>
              </li>
            </ul>
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              <strong>Note:</strong> Endpoints don't include <code className="bg-white px-1">/api</code> prefix - 
              that's automatically added by the API_BASE_URL (<code className="bg-white px-1">http://localhost:8080/api</code>)
            </div>
          </div>
          
          <ol className="list-decimal ml-5 space-y-2 text-sm">
            <li>
              <strong>Test Offline Detection:</strong>
              <p className="text-gray-600 ml-4">Open DevTools (F12) → Network tab → Check "Offline"</p>
              <p className="text-gray-600 ml-4">Watch "Network Status" card turn yellow</p>
            </li>
            <li>
              <strong>Add Items While Offline:</strong>
              <p className="text-gray-600 ml-4">Toggle "Use real endpoint" checkbox to choose endpoint type</p>
              <p className="text-gray-600 ml-4">Click "Add to Queue" button 3-4 times</p>
              <p className="text-gray-600 ml-4">Watch "Queue Info" card show increasing count</p>
            </li>
            <li>
              <strong>Go Back Online:</strong>
              <p className="text-gray-600 ml-4">DevTools → Network tab → Uncheck "Offline"</p>
              <p className="text-gray-600 ml-4">Watch Console for reconnection logs</p>
              <p className="text-gray-600 ml-4">Should see: "🌐 Network status: ONLINE ✅ (RECONNECTED)"</p>
            </li>
            <li>
              <strong>Watch Auto-Sync:</strong>
              <p className="text-gray-600 ml-4">Sync should trigger automatically</p>
              <p className="text-gray-600 ml-4">Watch "Sync Status" card show "Syncing: Yes"</p>
              <p className="text-gray-600 ml-4">
                <strong>Dummy endpoints:</strong> Will fail → stay in queue with retry count increased
              </p>
              <p className="text-gray-600 ml-4">
                <strong>Real endpoints:</strong> Will succeed (if backend running) → queue clears
              </p>
            </li>
            <li>
              <strong>Test With Backend:</strong>
              <p className="text-gray-600 ml-4">In another terminal: <code className="bg-gray-100 px-1">cd backend && ./mvnw spring-boot:run</code></p>
              <p className="text-gray-600 ml-4">Add real endpoint requests → sync should succeed</p>
            </li>
          </ol>
        </div>

        {/* Queue Items Preview */}
        {queueInfo.items.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-semibold mb-3">📋 Queue Preview (First 5 Items)</h2>
            <div className="space-y-2">
              {queueInfo.items.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded p-3 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs text-gray-500">#{index + 1}</span>
                      <p className="font-semibold">{item.method} {item.endpoint}</p>
                      <p className="text-xs text-gray-600">
                        ID: {item.id} | Retries: {item.retries} | Priority: {item.priority}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">📝 Activity Log</h2>
          {logs.length === 0 ? (
            <p className="text-gray-400 text-sm">No activity yet. Try clicking some buttons!</p>
          ) : (
            <div className="space-y-1 font-mono text-xs max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="py-1 border-b border-gray-100 last:border-0">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Console Messages */}
        <div className="bg-gray-900 text-green-400 rounded-lg shadow p-6">
          <h2 className="font-semibold mb-3">💻 Expected Console Messages</h2>
          <div className="font-mono text-xs space-y-1">
            <p>When going offline:</p>
            <p className="text-yellow-300 ml-4">🌐 Network status: OFFLINE [was: online → now: offline]</p>
            <p className="text-yellow-300 ml-4">Network: Gone offline</p>
            
            <p className="mt-3">When going back online:</p>
            <p className="text-green-300 ml-4">Network: Back online</p>
            <p className="text-green-300 ml-4">🌐 Network status: ONLINE ✅ (RECONNECTED - will trigger sync)</p>
            <p className="text-green-300 ml-4">🔍 Auto-sync check: {`{wasOffline: true, isOnline: true, syncNeeded: true, queueSize: X}`}</p>
            <p className="text-green-300 ml-4">🔄 Reconnected - triggering auto-sync</p>
            <p className="text-green-300 ml-4">🔄 Starting sync...</p>
            <p className="text-green-300 ml-4">Processing queue: 1 requests</p>
            <p className="text-green-300 ml-4">✓ Executed GET /users [req-...]</p>
            <p className="text-green-300 ml-4">Removed request req-... from queue (0 remaining)</p>
            <p className="text-green-300 ml-4">✅ Sync completed successfully</p>
            
            <p className="mt-3 text-blue-300">Network tab should show:</p>
            <p className="text-blue-300 ml-4">GET http://localhost:8080/api/users → 200 OK</p>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <p className="font-semibold mb-2">💡 Pro Tips:</p>
          <ul className="list-disc ml-5 space-y-1 text-gray-700">
            <li><strong>Live Updates:</strong> This page auto-refreshes every 2 seconds to show real-time queue status</li>
            <li>Keep DevTools Console open to see all the debug logs</li>
            <li>The SyncStatusIndicator (bottom-right corner) should also update</li>
            <li><strong>Dummy endpoints (/test):</strong> Will ALWAYS fail - useful for testing retry logic without backend</li>
            <li><strong>Real endpoints (/users):</strong> Will succeed if backend is running on localhost:8080</li>
            <li><strong>Endpoint format:</strong> Use <code className="bg-yellow-100 px-1">/users</code> not <code className="bg-yellow-100 px-1">/api/users</code> (API_BASE_URL adds /api automatically)</li>
            <li>If requests fail, they'll stay in queue with increased retry count (max 3 attempts)</li>
            <li>Click "View Queue" button to dump full queue details to Console</li>
            <li>Watch Network tab to see actual HTTP requests being sent during sync</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
