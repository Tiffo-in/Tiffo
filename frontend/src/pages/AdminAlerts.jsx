import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BellAlertIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ShieldExclamationIcon,
  ServerIcon,
  CpuChipIcon,
  SignalIcon,
  ClockIcon,
  EyeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAlertData();
  }, []);

  const loadAlertData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/alerts');
      if (res.data.success) {
        setSystemHealth(res.data.data.health || {});
        setAlerts(
          res.data.data.alerts.map((alert) => ({
            ...alert,
            timestamp: new Date(alert.timestamp),
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'bg-red-500',
          text: 'text-red-700',
          badge: 'bg-red-100 text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          icon: 'bg-amber-500',
          text: 'text-amber-700',
          badge: 'bg-amber-100 text-amber-700',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'bg-blue-500',
          text: 'text-blue-700',
          badge: 'bg-blue-100 text-blue-700',
        };
      default:
        return {
          bg: 'bg-neutral-50 border-neutral-200',
          icon: 'bg-neutral-500',
          text: 'text-neutral-700',
          badge: 'bg-neutral-100 text-neutral-700',
        };
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <XCircleIcon className="w-5 h-5 text-white" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-white" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-white" />;
      default:
        return <BellAlertIcon className="w-5 h-5 text-white" />;
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-amber-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-neutral-500';
    }
  };

  const acknowledgeAlert = (id) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, acknowledged: true } : alert))
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.acknowledged;
    return alert.type === filter;
  });

  const alertCounts = {
    critical: alerts.filter((a) => a.type === 'critical' && !a.acknowledged).length,
    warning: alerts.filter((a) => a.type === 'warning' && !a.acknowledged).length,
    info: alerts.filter((a) => a.type === 'info' && !a.acknowledged).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-500 dark:from-red-900 dark:via-red-800 dark:to-rose-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 pt-[110px] pb-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-white" />
              </Link>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <BellAlertIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">System Alerts</h1>
                  {alertCounts.critical > 0 && (
                    <span className="px-2 py-0.5 bg-white text-red-600 text-xs font-bold rounded-full">
                      {alertCounts.critical} Critical
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm">Monitor and manage alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* System Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-12 mb-8">
          {[
            { label: 'Server', icon: ServerIcon, ...systemHealth.server },
            { label: 'Database', icon: CpuChipIcon, ...systemHealth.database },
            { label: 'API', icon: SignalIcon, ...systemHealth.api },
            { label: 'Payments', icon: ShieldExclamationIcon, ...systemHealth.payments },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-neutral-600" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${item.status === 'healthy' ? 'bg-green-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}
                  />
                  <span className={`text-sm font-medium capitalize ${getHealthColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-neutral-900">{item.label}</h3>
              <div className="mt-2 text-sm text-neutral-500">
                {item.uptime && <p>Uptime: {item.uptime}</p>}
                {item.latency && <p>Latency: {item.latency}</p>}
                {item.connections && <p>Connections: {item.connections}</p>}
                {item.queryTime && <p>Avg Query: {item.queryTime}</p>}
                {item.requests && <p>Requests: {item.requests}</p>}
                {item.errorRate && <p>Error Rate: {item.errorRate}</p>}
                {item.successRate && <p>Success: {item.successRate}</p>}
                {item.avgTime && <p>Avg Time: {item.avgTime}</p>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {[
            { key: 'all', label: 'All Alerts', count: alerts.length },
            { key: 'unread', label: 'Unread', count: alerts.filter((a) => !a.acknowledged).length },
            { key: 'critical', label: 'Critical', count: alertCounts.critical },
            { key: 'warning', label: 'Warning', count: alertCounts.warning },
            { key: 'info', label: 'Info', count: alertCounts.info },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                filter === tab.key
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {tab.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-xs ${
                  filter === tab.key ? 'bg-white/20' : 'bg-neutral-100'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Alerts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-12 text-center">
              <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-2">All Clear!</h3>
              <p className="text-neutral-500">No alerts matching your filter criteria.</p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => {
              const styles = getAlertStyles(alert.type);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`${styles.bg} border rounded-2xl p-4 ${alert.acknowledged ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 ${styles.icon} rounded-xl flex items-center justify-center flex-shrink-0`}
                    >
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold ${styles.text}`}>{alert.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles.badge}`}
                        >
                          {alert.type}
                        </span>
                        {alert.acknowledged && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <CheckIcon className="w-3 h-3" />
                            Acknowledged
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-600 text-sm mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <ServerIcon className="w-3 h-3" />
                          {alert.source}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {alert.timestamp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors border border-neutral-200"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-white rounded-lg transition-colors">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAlerts;
