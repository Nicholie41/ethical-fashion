// Analytics Dashboard for Ethical Fashion Platform
import React, { useState, useEffect } from 'react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  // Sample analytics data
  const analyticsData = {
    overview: {
      totalUsers: 1247,
      activeUsers: 892,
      totalOrders: 456,
      revenue: 23450,
      sustainabilityScore: 8.7,
      carbonSaved: 1240
    },
    userBehavior: {
      pageViews: {
        'Home': 2340,
        'Products': 1890,
        'Brands': 890,
        'Profile': 670,
        'Cart': 450
      },
      userJourney: [
        { step: 'Landing', users: 100, percentage: 100 },
        { step: 'Registration', users: 78, percentage: 78 },
        { step: 'Product Browse', users: 65, percentage: 65 },
        { step: 'Add to Cart', users: 42, percentage: 42 },
        { step: 'Checkout', users: 28, percentage: 28 },
        { step: 'Purchase', users: 23, percentage: 23 }
      ],
      deviceUsage: {
        desktop: 65,
        mobile: 30,
        tablet: 5
      },
      sessionDuration: {
        average: 8.5,
        median: 6.2,
        max: 45.3
      }
    },
    sustainability: {
      topMaterials: [
        { material: 'Organic Cotton', percentage: 35, sustainability: 9.2 },
        { material: 'Recycled Polyester', percentage: 28, sustainability: 8.8 },
        { material: 'Hemp', percentage: 18, sustainability: 9.5 },
        { material: 'Bamboo', percentage: 12, sustainability: 8.9 },
        { material: 'Linen', percentage: 7, sustainability: 8.6 }
      ],
      carbonSavings: {
        daily: 45.2,
        weekly: 316.4,
        monthly: 1356.8,
        total: 1240.5
      },
      ethicalCertifications: {
        'Fair Trade': 156,
        'GOTS': 89,
        'OEKO-TEX': 234,
        'B Corp': 67,
        'Carbon Neutral': 45
      }
    },
    gamification: {
      totalPoints: 45678,
      averagePoints: 36.7,
      topUsers: [
        { username: 'eco_fashionista', points: 1250, level: 'Eco Warrior' },
        { username: 'sustainable_sarah', points: 980, level: 'Green Guardian' },
        { username: 'earth_lover', points: 845, level: 'Planet Protector' },
        { username: 'green_shopper', points: 720, level: 'Sustainability Seeker' },
        { username: 'eco_conscious', points: 650, level: 'Eco Explorer' }
      ],
      achievements: {
        'First Purchase': 234,
        'Carbon Saver': 156,
        'Ethical Explorer': 89,
        'Sustainability Champion': 45,
        'Green Master': 23
      },
      engagement: {
        dailyActive: 234,
        weeklyActive: 567,
        monthlyActive: 892,
        retentionRate: 78.5
      }
    },
    performance: {
      pageLoadTimes: {
        'Home': 1.2,
        'Products': 1.8,
        'Product Details': 2.1,
        'Cart': 1.5,
        'Checkout': 2.3
      },
      apiResponse: {
        average: 180,
        p95: 450,
        p99: 890,
        errorRate: 0.8
      },
      serverMetrics: {
        cpu: 45.2,
        memory: 67.8,
        disk: 23.4,
        network: 89.1
      }
    }
  };

  const MetricCard = ({ title, value, subtitle, trend, color = 'blue' }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {trend && (
          <div className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  const ChartBar = ({ label, value, max, color = 'blue' }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`bg-${color}-500 h-2 rounded-full`}
          style={{ width: `${(value / max) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const PieChart = ({ data, title }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}
              ></div>
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <span className="text-sm font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );

  const Table = ({ headers, data, title }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {headers.map((header, index) => (
                <th key={index} className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-3 px-4 text-sm">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600">Platform performance and user behavior insights</p>
            </div>
            <div className="flex gap-4">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <select 
                value={selectedMetric} 
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="overview">Overview</option>
                <option value="userBehavior">User Behavior</option>
                <option value="sustainability">Sustainability</option>
                <option value="gamification">Gamification</option>
                <option value="performance">Performance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        {selectedMetric === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard 
              title="Total Users" 
              value={analyticsData.overview.totalUsers.toLocaleString()} 
              subtitle="Registered users"
              trend={12.5}
              color="blue"
            />
            <MetricCard 
              title="Active Users" 
              value={analyticsData.overview.activeUsers.toLocaleString()} 
              subtitle="Last 30 days"
              trend={8.3}
              color="green"
            />
            <MetricCard 
              title="Total Orders" 
              value={analyticsData.overview.totalOrders.toLocaleString()} 
              subtitle="Completed purchases"
              trend={15.7}
              color="purple"
            />
            <MetricCard 
              title="Revenue" 
              value={`$${analyticsData.overview.revenue.toLocaleString()}`} 
              subtitle="Total sales"
              trend={22.1}
              color="yellow"
            />
          </div>
        )}

        {/* User Behavior */}
        {selectedMetric === 'userBehavior' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Views</h3>
                <div className="space-y-4">
                  {Object.entries(analyticsData.userBehavior.pageViews).map(([page, views]) => (
                    <ChartBar 
                      key={page}
                      label={page} 
                      value={views.toLocaleString()} 
                      max={Math.max(...Object.values(analyticsData.userBehavior.pageViews))}
                      color="blue"
                    />
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Journey</h3>
                <div className="space-y-4">
                  {analyticsData.userBehavior.userJourney.map((step, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{step.step}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${step.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{step.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChart 
                title="Device Usage"
                data={[
                  { label: 'Desktop', value: analyticsData.userBehavior.deviceUsage.desktop },
                  { label: 'Mobile', value: analyticsData.userBehavior.deviceUsage.mobile },
                  { label: 'Tablet', value: analyticsData.userBehavior.deviceUsage.tablet }
                ]}
              />
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Duration</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average</span>
                    <span className="font-medium">{analyticsData.userBehavior.sessionDuration.average} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Median</span>
                    <span className="font-medium">{analyticsData.userBehavior.sessionDuration.median} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maximum</span>
                    <span className="font-medium">{analyticsData.userBehavior.sessionDuration.max} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sustainability Metrics */}
        {selectedMetric === 'sustainability' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MetricCard 
                title="Sustainability Score" 
                value={analyticsData.overview.sustainabilityScore} 
                subtitle="Platform average"
                color="green"
              />
              <MetricCard 
                title="Carbon Saved" 
                value={`${analyticsData.overview.carbonSaved} kg`} 
                subtitle="CO2 equivalent"
                color="green"
              />
              <MetricCard 
                title="Ethical Products" 
                value="89%" 
                subtitle="Of total inventory"
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Table 
                title="Top Materials by Usage"
                headers={['Material', 'Usage %', 'Sustainability Score']}
                data={analyticsData.sustainability.topMaterials.map(material => [
                  material.material,
                  `${material.percentage}%`,
                  material.sustainability.toFixed(1)
                ])}
              />
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Carbon Savings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily</span>
                    <span className="font-medium">{analyticsData.sustainability.carbonSavings.daily} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weekly</span>
                    <span className="font-medium">{analyticsData.sustainability.carbonSavings.weekly} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly</span>
                    <span className="font-medium">{analyticsData.sustainability.carbonSavings.monthly} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-medium">{analyticsData.sustainability.carbonSavings.total} kg</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ethical Certifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(analyticsData.sustainability.ethicalCertifications).map(([cert, count]) => (
                  <div key={cert} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{count}</div>
                    <div className="text-sm text-gray-600">{cert}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Gamification Metrics */}
        {selectedMetric === 'gamification' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <MetricCard 
                title="Total Points" 
                value={analyticsData.gamification.totalPoints.toLocaleString()} 
                subtitle="Awarded to users"
                color="purple"
              />
              <MetricCard 
                title="Average Points" 
                value={analyticsData.gamification.averagePoints} 
                subtitle="Per user"
                color="purple"
              />
              <MetricCard 
                title="Retention Rate" 
                value={`${analyticsData.gamification.engagement.retentionRate}%`} 
                subtitle="Monthly active users"
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Table 
                title="Top Users"
                headers={['Username', 'Points', 'Level']}
                data={analyticsData.gamification.topUsers.map(user => [
                  user.username,
                  user.points.toLocaleString(),
                  user.level
                ])}
              />
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements Unlocked</h3>
                <div className="space-y-3">
                  {Object.entries(analyticsData.gamification.achievements).map(([achievement, count]) => (
                    <div key={achievement} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{achievement}</span>
                      <span className="text-sm font-medium">{count} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {analyticsData.gamification.engagement.dailyActive}
                  </div>
                  <div className="text-sm text-gray-600">Daily Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {analyticsData.gamification.engagement.weeklyActive}
                  </div>
                  <div className="text-sm text-gray-600">Weekly Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {analyticsData.gamification.engagement.monthlyActive}
                  </div>
                  <div className="text-sm text-gray-600">Monthly Active Users</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {selectedMetric === 'performance' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Load Times</h3>
                <div className="space-y-4">
                  {Object.entries(analyticsData.performance.pageLoadTimes).map(([page, time]) => (
                    <div key={page} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{page}</span>
                      <span className="text-sm font-medium">{time}s</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Response</span>
                    <span className="font-medium">{analyticsData.performance.apiResponse.average}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">95th Percentile</span>
                    <span className="font-medium">{analyticsData.performance.apiResponse.p95}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">99th Percentile</span>
                    <span className="font-medium">{analyticsData.performance.apiResponse.p99}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Error Rate</span>
                    <span className="font-medium">{analyticsData.performance.apiResponse.errorRate}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {analyticsData.performance.serverMetrics.cpu}%
                  </div>
                  <div className="text-sm text-gray-600">CPU Usage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {analyticsData.performance.serverMetrics.memory}%
                  </div>
                  <div className="text-sm text-gray-600">Memory Usage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {analyticsData.performance.serverMetrics.disk}%
                  </div>
                  <div className="text-sm text-gray-600">Disk Usage</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {analyticsData.performance.serverMetrics.network}%
                  </div>
                  <div className="text-sm text-gray-600">Network Usage</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics; 