import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

const services = [
  { name: 'API', status: 'operational', uptime: '99.99%' },
  { name: 'Web App', status: 'operational', uptime: '99.95%' },
  { name: 'Mobile App', status: 'operational', uptime: '99.90%' },
  { name: 'NFT Minting', status: 'operational', uptime: '100%' },
  { name: 'NFT Trading', status: 'operational', uptime: '99.98%' },
  { name: 'Wallet Connection', status: 'operational', uptime: '99.85%' },
];

const incidents = [
  { id: 1, date: '2025-03-15', title: 'API Latency Issues', status: 'resolved', description: 'Experienced elevated latency on the API for approximately 30 minutes. Issue has been resolved.' },
  { id: 2, date: '2025-03-10', title: 'Scheduled Maintenance', status: 'resolved', description: 'System maintenance completed successfully. All services remain operational.' },
];

const PlatformStatus = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'outage':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Platform Status</h1>
          <p className="text-gray-500 dark:text-gray-400">Real-time status of all Nexus services</p>
        </div>

        {/* Overall Status */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-green-900 dark:text-green-300">All Systems Operational</h2>
              <p className="text-green-700 dark:text-green-400">Last updated: Just now</p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Services</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-slate-800">
            {services.map((service) => (
              <div key={service.name} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{service.name}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{service.uptime}</span>
                  {getStatusIcon(service.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Incidents</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-slate-800">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{incident.title}</h3>
                  <span className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Resolved</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{incident.date}</p>
                <p className="text-gray-600 dark:text-gray-400">{incident.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformStatus;