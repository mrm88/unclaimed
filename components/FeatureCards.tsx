import React from 'react';
import { 
  Mail, 
  BarChart3, 
  Shield, 
  Zap, 
  Download, 
  Bell,
  Plane,
  Building,
  CreditCard,
  DollarSign
} from 'lucide-react';

const features = [
  {
    icon: Mail,
    title: 'Gmail Integration',
    description: 'Securely connect your Gmail to automatically scan for reward statements and balances.',
    color: 'bg-blue-500',
    stats: '50+ programs'
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Beautiful dashboard with charts showing your rewards portfolio and trends over time.',
    color: 'bg-green-500',
    stats: 'Real-time data'
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description: 'Get your complete rewards summary in under 30 seconds with our advanced parsing engine.',
    color: 'bg-purple-500',
    stats: '< 30 seconds'
  },
  {
    icon: Shield,
    title: 'Bank-Level Security',
    description: 'OAuth2 authentication means we never see your passwords. Your data stays private.',
    color: 'bg-indigo-500',
    stats: '100% secure'
  },
  {
    icon: Download,
    title: 'Export & Share',
    description: 'Export to CSV or Google Sheets. Share with financial advisors or track in your own tools.',
    color: 'bg-orange-500',
    stats: 'Multiple formats'
  },
  {
    icon: Bell,
    title: 'Expiration Alerts',
    description: 'Never lose rewards again. Get notified before your miles or points expire.',
    color: 'bg-red-500',
    stats: 'Smart reminders'
  }
];

const supportedPrograms = [
  { icon: Plane, name: 'Delta SkyMiles', type: 'Airline' },
  { icon: Plane, name: 'United MileagePlus', type: 'Airline' },
  { icon: Building, name: 'Marriott Bonvoy', type: 'Hotel' },
  { icon: Building, name: 'Hilton Honors', type: 'Hotel' },
  { icon: CreditCard, name: 'Chase UR', type: 'Credit Card' },
  { icon: CreditCard, name: 'Amex MR', type: 'Credit Card' },
  { icon: DollarSign, name: 'Capital One', type: 'Travel Credit' },
  { icon: DollarSign, name: 'Discover', type: 'Cash Back' }
];

export default function FeatureCards() {
  return (
    <div id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="block text-blue-600">Track Your Rewards</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform automatically finds and organizes all your travel rewards 
            so you never miss out on free flights, hotel stays, or cash back.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className={`${feature.color} rounded-xl p-3 mr-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                    <span className="text-sm font-medium text-gray-500">{feature.stats}</span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            );
          })}
        </div>

        {/* Supported programs */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            50+ Supported Programs
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {supportedPrograms.map((program, index) => {
              const Icon = program.icon;
              return (
                <div
                  key={index}
                  className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Icon className="h-5 w-5 text-gray-600 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 text-sm">{program.name}</div>
                    <div className="text-xs text-gray-500">{program.type}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-gray-500 mt-6">+ 42 more programs supported</p>
        </div>
      </div>
    </div>
  );
}