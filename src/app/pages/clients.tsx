import { Search, Plus, Mail, Phone, MessageSquare, TrendingUp } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  interests: string[];
  vehiclesOwned: string[];
  budget: string;
  lastContact: string;
  status: "active" | "warm" | "cold";
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+27 82 123 4567",
    interests: ["Porsche", "Ferrari", "McLaren"],
    vehiclesOwned: ["2021 Porsche 911 Turbo S", "2019 Ferrari 488 GTB"],
    budget: "R 5m - R 8m",
    lastContact: "2024-02-23T10:00:00Z",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+27 83 234 5678",
    interests: ["Lamborghini", "Porsche GT3"],
    vehiclesOwned: ["2022 Lamborghini Huracan EVO"],
    budget: "R 6m - R 10m",
    lastContact: "2024-02-22T14:00:00Z",
    status: "active",
  },
  {
    id: "3",
    name: "Mike Davis",
    email: "mike.davis@email.com",
    phone: "+27 84 345 6789",
    interests: ["BMW M Series", "Mercedes AMG"],
    vehiclesOwned: ["2023 BMW M4 Competition", "2020 Mercedes-AMG GT R"],
    budget: "R 2m - R 4m",
    lastContact: "2024-02-20T09:00:00Z",
    status: "warm",
  },
  {
    id: "4",
    name: "Emma Wilson",
    email: "emma.w@email.com",
    phone: "+27 85 456 7890",
    interests: ["Porsche 911", "Audi RS"],
    vehiclesOwned: ["2022 Porsche 911 GT3"],
    budget: "R 3m - R 5m",
    lastContact: "2024-02-18T11:00:00Z",
    status: "warm",
  },
  {
    id: "5",
    name: "David Brown",
    email: "d.brown@email.com",
    phone: "+27 86 567 8901",
    interests: ["Ferrari", "Lamborghini"],
    vehiclesOwned: ["2020 Ferrari F8 Tributo", "2021 Lamborghini Aventador SVJ"],
    budget: "R 7m - R 12m",
    lastContact: "2024-02-10T08:00:00Z",
    status: "cold",
  },
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export function Clients() {
  const statusColors = {
    active: "bg-[#4ade80] text-black",
    warm: "bg-yellow-500 text-black",
    cold: "bg-gray-500 text-white",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl mb-2">Client Management</h1>
          <p className="text-gray-500">{mockClients.length} total clients</p>
        </div>
        <button className="bg-[#4ade80] text-black px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#3bc970] transition-colors">
          <Plus size={20} />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search clients by name, email, or interests..."
          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[#4ade80] transition-colors"
        />
      </div>

      {/* Clients Table */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200 transition-colors">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Client</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Vehicles Owned</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Interests</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockClients.map((client) => (
                <tr 
                  key={client.id}
                  className="border-b border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#4ade80] flex items-center justify-center text-black text-sm font-medium">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone size={14} />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${statusColors[client.status]}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {client.vehiclesOwned.map((vehicle, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {vehicle}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {client.interests.map((interest, index) => (
                        <span 
                          key={index} 
                          className="bg-gray-100 px-2 py-1 rounded text-xs transition-colors"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                        title="Send email"
                      >
                        <Mail size={16} />
                      </button>
                      <button 
                        className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                        title="Call"
                      >
                        <Phone size={16} />
                      </button>
                      <button 
                        className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                        title="Send message"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}