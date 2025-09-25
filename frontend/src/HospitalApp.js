import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, FileText, Trash2, Edit, Package, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, Filter, Menu, Bell, Settings, Eye, BarChart3, Zap, Star, Sparkles } from 'lucide-react';

const ReportsPage = ({ orders, onBack }) => {
  console.log('🔍 ReportsPage render ediliyor!');
  console.log('📊 Orders data:', orders);
  console.log('🔢 Orders sayısı:', orders ? orders.length : 'undefined');

  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedCategory, setSelectedCategory] = useState('');

  const today = new Date();
  const filterDate = new Date();
  filterDate.setDate(today.getDate() - parseInt(dateRange));

  const filteredReports = orders.filter(order => {
    const orderDate = new Date(order.bestelldatum);
    const categoryMatch = selectedCategory === '' || order.kategorie === selectedCategory;
    const dateMatch = orderDate >= filterDate;
    return categoryMatch && dateMatch;
  });

  const totalBestellungen = filteredReports.reduce((sum, order) => sum + (order.menge || 0), 0);
  const totalVerteilte = filteredReports.reduce((sum, order) => sum + (order.verteilteAnzahl || 0), 0);
  const totalAktuell = filteredReports.reduce((sum, order) => sum + (order.aktuellerBestand || 0), 0);

  const kategorieStats = {};
  filteredReports.forEach(order => {
    if (!kategorieStats[order.kategorie]) {
      kategorieStats[order.kategorie] = { bestellt: 0, verteilt: 0, bestand: 0 };
    }
    kategorieStats[order.kategorie].bestellt += order.menge || 0;
    kategorieStats[order.kategorie].verteilt += order.verteilteAnzahl || 0;
    kategorieStats[order.kategorie].bestand += order.aktuellerBestand || 0;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            📊 Bestellungen & Verbrauch Berichte
          </h2>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <span>⬅️ Zurück</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all duration-300 text-white font-medium"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="1" className="bg-gray-800 text-white">Letzter Tag</option>
            <option value="7" className="bg-gray-800 text-white">Letzte Woche</option>
            <option value="30" className="bg-gray-800 text-white">Letzter Monat</option>
            <option value="90" className="bg-gray-800 text-white">Letzte 3 Monate</option>
            <option value="365" className="bg-gray-800 text-white">Letztes Jahr</option>
          </select>

          <select
            className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white font-medium"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="" className="bg-gray-800 text-white">Alle Kategorien</option>
            <option value="Getränke" className="bg-gray-800 text-white">Getränke</option>
            <option value="Hygieneartikel" className="bg-gray-800 text-white">Hygieneartikel</option>
            <option value="Medizinische Verbrauchsmaterialien" className="bg-gray-800 text-white">Medizinische Verbrauchsmaterialien</option>
            <option value="Reinigungsmittel" className="bg-gray-800 text-white">Reinigungsmittel</option>
            <option value="Büromaterial" className="bg-gray-800 text-white">Büromaterial</option>
            <option value="Lebensmittel" className="bg-gray-800 text-white">Lebensmittel</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-white/90 text-sm font-bold uppercase tracking-wider">Gesamte Bestellungen</p>
              <p className="text-3xl font-black">{totalBestellungen}</p>
              <p className="text-white/80 text-xs font-semibold">Letzte {dateRange} Tage</p>
            </div>
            <Package className="h-12 w-12 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-white/90 text-sm font-bold uppercase tracking-wider">Verteilte Menge</p>
              <p className="text-3xl font-black">{totalVerteilte}</p>
              <p className="text-white/80 text-xs font-semibold">Verbrauch</p>
            </div>
            <TrendingUp className="h-12 w-12 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-white/90 text-sm font-bold uppercase tracking-wider">Aktueller Bestand</p>
              <p className="text-3xl font-black">{totalAktuell}</p>
              <p className="text-white/80 text-xs font-semibold">Verfügbar</p>
            </div>
            <BarChart3 className="h-12 w-12 text-white/80" />
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
        <h3 className="text-2xl font-black text-white mb-6">📈 Kategorie Analyse</h3>
        <div className="space-y-4">
          {Object.entries(kategorieStats).map(([kategorie, stats]) => (
            <div key={kategorie} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-white">{kategorie}</h4>
                <div className="flex space-x-4 text-sm text-white/80">
                  <span>📦 Bestellt: {stats.bestellt}</span>
                  <span>🚀 Verteilt: {stats.verteilt}</span>
                  <span>📊 Bestand: {stats.bestand}</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((stats.verteilt / (stats.bestellt || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white/70 mt-1">
                  Verbrauchsrate: {stats.bestellt > 0 ? ((stats.verteilt / stats.bestellt) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
          <h3 className="text-xl font-black text-white">📋 Detaillierte Übersicht ({dateRange} Tage)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Produkt</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Kategorie</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Bestellt</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Verteilt</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Bestand</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Verbrauchsrate</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((order, index) => {
                const verbrauchsrate = order.menge > 0 ? ((order.verteilteAnzahl || 0) / order.menge * 100) : 0;
                return (
                  <tr key={order.id} className={index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}>
                    <td className="px-6 py-4 text-white font-medium">{order.produktName}</td>
                    <td className="px-6 py-4 text-white/80">{order.kategorie}</td>
                    <td className="px-6 py-4 text-white font-bold">{order.menge} {order.einheit}</td>
                    <td className="px-6 py-4 text-white font-bold">{order.verteilteAnzahl || 0} {order.verteilungseinheit || order.einheit}</td>
                    <td className="px-6 py-4 text-white font-bold">{order.aktuellerBestand} {order.bestandseinheit || order.einheit}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        verbrauchsrate > 80 ? 'bg-red-500/80 text-white' :
                          verbrauchsrate > 50 ? 'bg-yellow-500/80 text-white' :
                            'bg-green-500/80 text-white'
                      }`}>
                        {verbrauchsrate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UltraModernHospitalApp = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      produktName: 'Mineralwasser 1,5L',
      kategorie: 'Getränke',
      menge: 50,
      einheit: 'Flaschen',
      lieferant: '',
      bestelldatum: '2025-08-15',
      lieferdatum: '2025-08-20',
      status: 'Bestellt',
      notizen: 'Kepler Universitätsklinikum Neuromed Campus',
      anfangsBestand: 25,
      erhalteneBestellungen: 100,
      verteilteAnzahl: 125,
      aktuellerBestand: 0, // 25 + 100 - 125 = 0
      mindestBestand: 30,
      maxBestand: 200,
      prioritaet: 'Kritisch'
    },
    {
      id: 2,
      produktName: 'Toilettenpapier 3-lagig',
      kategorie: 'Hygieneartikel',
      menge: 100,
      einheit: 'Rollen',
      lieferant: '',
      bestelldatum: '2025-08-16',
      lieferdatum: '2025-08-21',
      status: 'Geliefert',
      notizen: 'Kepler Universitätsklinikum Neuromed Campus',
      anfangsBestand: 50,
      erhalteneBestellungen: 200,
      verteilteAnzahl: 120,
      aktuellerBestand: 130, // 50 + 200 - 120
      mindestBestand: 50,
      maxBestand: 300,
      prioritaet: 'Hoch'
    },
    {
      id: 3,
      produktName: 'Desinfektionsmittel 500ml',
      kategorie: 'Hygieneartikel',
      menge: 30,
      einheit: 'Flaschen',
      lieferant: '',
      bestelldatum: '2025-08-17',
      lieferdatum: '2025-08-22',
      status: 'Ausstehend',
      notizen: 'Kepler Universitätsklinikum Neuromed Campus',
      anfangsBestand: 15,
      erhalteneBestellungen: 60,
      verteilteAnzahl: 58,
      aktuellerBestand: 17, // 15 + 60 - 58
      mindestBestand: 20,
      maxBestand: 100,
      prioritaet: 'Kritisch'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategorie, setFilterKategorie] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [showReports, setShowReports] = useState(false);

  const kategorien = ['Getränke', 'Hygieneartikel', 'Medizinische Verbrauchsmaterialien', 'Reinigungsmittel', 'Büromaterial', 'Lebensmittel'];
  const statusOptions = ['Bestellt', 'Geliefert', 'Storniert', 'Ausstehend'];
  const prioritaetOptions = ['Kritisch', 'Hoch', 'Normal', 'Niedrig'];

  const [newOrder, setNewOrder] = useState({
    id: 0,
    produktName: '',
    kategorie: '',
    menge: 0,
    einheit: '',
    lieferant: '',
    bestelldatum: new Date().toISOString().split('T')[0],
    lieferdatum: '',
    status: 'Bestellt',
    notizen: '',
    mindestBestand: 0,
    maxBestand: 100,
    prioritaet: 'Normal',
    aktuellerBestand: 0,
    verteilteAnzahl: 0,
    verteilungseinheit: 'Stück',
    bestandseinheit: 'Stück',
    anfangsBestand: 0,
    erhalteneBestellungen: 0
  });

  // 🔄 Otomatik hesaplama için useEffect
  useEffect(() => {
    const anfangsBestand = parseInt(newOrder.anfangsBestand.toString()) || 0;
    const neueBestellung = parseInt(newOrder.menge.toString()) || 0;
    const verteilteAnzahl = parseInt(newOrder.verteilteAnzahl.toString()) || 0;

    if (editingOrder) {
      // Düzenleme modunda: mevcut bestand kullan
      const currentOrder = orders.find(o => o.id === editingOrder);
      const vorherigerBestand = currentOrder ? currentOrder.aktuellerBestand : 0;
      const berechneterBestand = vorherigerBestand + neueBestellung - verteilteAnzahl;
      setNewOrder(prev => ({ ...prev, aktuellerBestand: berechneterBestand }));
    } else {
      // Yeni kayıt modunda: başlangıç + bestellung - verteilt
      const berechneterBestand = anfangsBestand + neueBestellung - verteilteAnzahl;
      setNewOrder(prev => ({ ...prev, aktuellerBestand: berechneterBestand }));
    }
  }, [newOrder.anfangsBestand, newOrder.menge, newOrder.verteilteAnzahl, editingOrder, orders]);

  const handleAddOrder = () => {
    if (newOrder.produktName && newOrder.kategorie && newOrder.menge > 0) {
      const anfangsBestand = parseInt(newOrder.anfangsBestand.toString()) || 0;
      const erhalteneBestellungen = parseInt(newOrder.menge.toString()) || 0;
      const verteilteAnzahl = parseInt(newOrder.verteilteAnzahl.toString()) || 0;
      const aktuellerBestand = anfangsBestand + erhalteneBestellungen - verteilteAnzahl;

      const order = {
        ...newOrder,
        id: Math.max(...orders.map(o => o.id), 0) + 1,
        menge: parseInt(newOrder.menge.toString()),
        mindestBestand: parseInt(newOrder.mindestBestand.toString()) || 0,
        maxBestand: parseInt(newOrder.maxBestand.toString()) || 100,
        anfangsBestand: anfangsBestand,
        erhalteneBestellungen: erhalteneBestellungen,
        verteilteAnzahl: verteilteAnzahl,
        aktuellerBestand: aktuellerBestand,
        lieferdatum: newOrder.lieferdatum || null
      };
      setOrders([...orders, order]);
      setNewOrder({
        id: 0,
        produktName: '',
        kategorie: '',
        menge: 0,
        einheit: '',
        lieferant: '',
        bestelldatum: new Date().toISOString().split('T')[0],
        lieferdatum: '',
        status: 'Bestellt',
        notizen: '',
        mindestBestand: 0,
        maxBestand: 100,
        prioritaet: 'Normal',
        aktuellerBestand: 0,
        verteilteAnzahl: 0,
        verteilungseinheit: 'Stück',
        bestandseinheit: 'Stück',
        anfangsBestand: 0,
        erhalteneBestellungen: 0
      });
      setShowAddForm(false);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order.id);
    setNewOrder(order);
    setShowAddForm(true);
  };

  const handleUpdateOrder = () => {
    const neueBestellmenge = parseInt(newOrder.menge.toString()) || 0;
    const verteilteAnzahl = parseInt(newOrder.verteilteAnzahl.toString()) || 0;

    // 🔄 Vorherigen Bestand vom aktuellen Auftrag holen
    const currentOrder = orders.find(o => o.id === editingOrder);
    const vorherigerBestand = currentOrder ? currentOrder.aktuellerBestand : 0;

    // Einfache Logik: Vorheriger Bestand + Neue Bestellung - Verteilte
    const finalBestand = vorherigerBestand + neueBestellmenge - verteilteAnzahl;

    setOrders(orders.map(order =>
      order.id === editingOrder
        ? {
          ...newOrder,
          menge: neueBestellmenge,
          mindestBestand: parseInt(newOrder.mindestBestand.toString()) || 0,
          maxBestand: parseInt(newOrder.maxBestand.toString()) || 100,
          aktuellerBestand: finalBestand, // 📦 Basit Formel
          verteilteAnzahl: verteilteAnzahl,
          // Ältere Felder für Kompatibilität
          anfangsBestand: vorherigerBestand,
          erhalteneBestellungen: neueBestellmenge,
          lieferdatum: newOrder.lieferdatum || null

        }
        : order
    ));

    setEditingOrder(null);
    setNewOrder({
      id: 0,
      produktName: '',
      kategorie: '',
      menge: 0,
      einheit: '',
      lieferant: '',
      bestelldatum: new Date().toISOString().split('T')[0],
      lieferdatum: '',
      status: 'Bestellt',
      notizen: '',
      mindestBestand: 0,
      maxBestand: 100,
      prioritaet: 'Normal',
      aktuellerBestand: 0,
      verteilteAnzahl: 0,
      verteilungseinheit: 'Stück',
      bestandseinheit: 'Stück',
      anfangsBestand: 0,
      erhalteneBestellungen: 0
    });
    setShowAddForm(false);
  };

  const handleDeleteOrder = (id) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  const filteredOrders = orders.filter(order => {
    return (
      order.produktName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterKategorie === '' || order.kategorie === filterKategorie) &&
      (filterStatus === '' || order.status === filterStatus)
    );
  });

  const exportToExcel = async () => {
    try {
      console.log('🏥 Hastane Excel Export Başlatılıyor...');

      // CSV formatında veri hazırla
      const csvData = [
        ['Ürün Adı', 'Kategorie', 'Bestell Menge', 'Einheit', 'Aktueller Bestand', 'Mindest Bestand', 'Status', 'Priorität', 'Bestelldatum'],
        ...filteredOrders.map(order => [
          order.produktName || '',
          order.kategorie || '',
          order.menge || '',
          order.einheit || '',
          order.aktuellerBestand || '',
          order.mindestBestand || '',
          order.status || '',
          order.prioritaet || '',
          order.bestelldatum || ''
        ])
      ];

      // CSV string oluştur
      const csvString = csvData.map(row =>
        row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
      ).join('\n');

      // Clipboard API kullan (modern approach)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(csvString);

        // Modal göster
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
          background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
          align-items: center; justify-content: center; font-family: Arial;
        `;

        modal.innerHTML = `
          <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 500px;">
            <h2 style="color: #667eea; margin-bottom: 15px;">✅ Excel Verisi Hazır!</h2>
            <p style="margin-bottom: 20px; color: #333;">
              Hastane bestellungen verisi panoya kopyalandı.<br>
              <strong>Excel'i açın → Ctrl+V yapın</strong>
            </p>
            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 12px;">
              📊 ${filteredOrders.length} adet sipariş<br>
              📋 CSV formatında hazırlandı
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
              Tamam
            </button>
          </div>
        `;

        document.body.appendChild(modal);
        console.log('✅ CSV verisi panoya kopyalandı');

      } else {
        // Fallback: Console'a yazdır
        console.log('=== HASTANE EXCEL DATA START ===');
        console.log(csvString);
        console.log('=== HASTANE EXCEL DATA END ===');

        alert('📋 CSV verisi console\'a yazdırıldı!\n\nF12 → Console → Verileri seçin → Kopyalayın → Excel\'e yapıştırın');
      }

    } catch (error) {
      console.error('❌ Excel Export Hatası:', error);

      // Basit fallback
      const simpleData = filteredOrders.map(o =>
        `${o.produktName}\t${o.kategorie}\t${o.menge}\t${o.aktuellerBestand}\t${o.status}`
      ).join('\n');

      console.log('FALLBACK DATA:\n', simpleData);
      alert('📊 Basit format console\'da hazır. F12 → Console\'dan kopyalayın.');
    }
  };

  const exportToPDF = () => {
    alert('📄 PDF için Ctrl+P (Windows) veya Cmd+P (Mac) kullanın.\n\nTarayıcı print menüsünden "PDF olarak kaydet" seçin.');
  };

  const totalItems = filteredOrders.reduce((sum, order) => sum + order.menge, 0);
  const kritischeLager = filteredOrders.filter(order => order.aktuellerBestand <= order.mindestBestand).length;
  const niedrigeLager = filteredOrders.filter(order => order.aktuellerBestand > order.mindestBestand && order.aktuellerBestand <= order.mindestBestand * 1.5).length;

  const getLagerStatus = (order) => {
    if (order.aktuellerBestand <= order.mindestBestand) return 'kritisch';
    if (order.aktuellerBestand <= order.mindestBestand * 1.5) return 'niedrig';
    return 'normal';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Kritisch': return 'bg-gradient-to-r from-red-500 via-pink-500 to-red-600';
      case 'Hoch': return 'bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500';
      case 'Normal': return 'bg-gradient-to-r from-blue-400 via-purple-400 to-blue-500';
      case 'Niedrig': return 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Geliefert': return 'bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500';
      case 'Bestellt': return 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500';
      case 'Ausstehend': return 'bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500';
      case 'Storniert': return 'bg-gradient-to-r from-red-400 via-pink-400 to-red-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getCategoryColor = (kategorie) => {
    switch (kategorie) {
      case 'Getränke': return 'bg-gradient-to-r from-cyan-400 to-blue-500';
      case 'Hygieneartikel': return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'Medizinische Verbrauchsmaterialien': return 'bg-gradient-to-r from-red-400 to-pink-500';
      case 'Reinigungsmittel': return 'bg-gradient-to-r from-purple-400 to-indigo-500';
      case 'Büromaterial': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'Lebensmittel': return 'bg-gradient-to-r from-pink-400 to-rose-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  // DÜZELTME: Burada eksik kalan onClick function'ını tamamlıyorum
  const handleReportsClick = () => {
    console.log('Berichte butonu tıklandı, showReports:', showReports);
    setShowReports(!showReports);
  };

  if (showReports) {
    return <ReportsPage orders={orders} onBack={() => setShowReports(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-auto">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Glassmorphism Navigation */}
      <nav className="backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl shadow-2xl animate-pulse">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🚀 HospitalGo
                </h1>
                <p className="text-white/80 font-medium">Smart Hospital Solutions</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleReportsClick}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                data-testid="reports-button"
              >
                <BarChart3 className="h-5 w-5" />
                <span>📊 Berichte</span>
              </button>

              <button
                onClick={exportToExcel}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                data-testid="export-excel-button"
              >
                <Download className="h-5 w-5" />
                <span>📋 Excel</span>
              </button>

              <button
                onClick={exportToPDF}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                data-testid="export-pdf-button"
              >
                <FileText className="h-5 w-5" />
                <span>📄 PDF</span>
              </button>

              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                data-testid="add-order-button"
              >
                <Plus className="h-5 w-5" />
                <span>➕ Neue Bestellung</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-white/90 text-sm font-bold uppercase tracking-wider">Gesamte Artikel</p>
                <p className="text-3xl font-black">{totalItems}</p>
                <p className="text-white/80 text-xs font-semibold">Bestellungen</p>
              </div>
              <Package className="h-12 w-12 text-white/80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-400 via-pink-500 to-red-600 rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-white/90 text-sm font-bold uppercase tracking-wider">Kritische Lager</p>
                <p className="text-3xl font-black">{kritischeLager}</p>
                <p className="text-white/80 text-xs font-semibold">Sofortiger Handlungsbedarf</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-white/80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-white/90 text-sm font-bold uppercase tracking-wider">Niedrige Lager</p>
                <p className="text-3xl font-black">{niedrigeLager}</p>
                <p className="text-white/80 text-xs font-semibold">Aufmerksamkeit erforderlich</p>
              </div>
              <Clock className="h-12 w-12 text-white/80" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
              <input
                type="text"
                placeholder="🔍 Produkt suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all duration-300 text-white placeholder-white/60 font-medium"
                data-testid="search-input"
              />
            </div>

            <select
              value={filterKategorie}
              onChange={(e) => setFilterKategorie(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white font-medium"
              data-testid="category-filter"
            >
              <option value="" className="bg-gray-800 text-white">Alle Kategorien</option>
              {kategorien.map(k => (
                <option key={k} value={k} className="bg-gray-800 text-white">{k}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-pink-500/50 focus:border-pink-400 transition-all duration-300 text-white font-medium"
              data-testid="status-filter"
            >
              <option value="" className="bg-gray-800 text-white">Alle Status</option>
              {statusOptions.map(s => (
                <option key={s} value={s} className="bg-gray-800 text-white">{s}</option>
              ))}
            </select>

            <div className="flex bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30 overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-6 py-3 font-bold transition-all duration-300 ${
                  viewMode === 'cards' 
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                data-testid="cards-view-button"
              >
                📋 Karten
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-6 py-3 font-bold transition-all duration-300 ${
                  viewMode === 'table' 
                    ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                data-testid="table-view-button"
              >
                📊 Tabelle
              </button>
            </div>
          </div>
        </div>

        {/* Orders Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-500">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white mb-2" data-testid={`order-title-${order.id}`}>
                      {order.produktName}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getCategoryColor(order.kategorie)}`}>
                        {order.kategorie}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getPriorityColor(order.prioritaet)}`}>
                        {order.prioritaet}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg"
                      data-testid={`edit-order-${order.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg"
                      data-testid={`delete-order-${order.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-white">
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase">Menge</p>
                    <p className="font-bold text-lg">{order.menge} {order.einheit}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase">Aktueller Bestand</p>
                    <p className={`font-bold text-lg ${
                      getLagerStatus(order) === 'kritisch' ? 'text-red-400' :
                      getLagerStatus(order) === 'niedrig' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {order.aktuellerBestand} {order.bestandseinheit || order.einheit}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase">Bestelldatum</p>
                    <p className="font-bold">{new Date(order.bestelldatum).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase">Lieferant</p>
                    <p className="font-bold">{order.lieferant || 'N/A'}</p>
                  </div>
                </div>

                {/* Stock Level Indicator */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Lagerstand</span>
                    <span>{order.mindestBestand} min / {order.maxBestand} max</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        getLagerStatus(order) === 'kritisch' ? 'bg-gradient-to-r from-red-400 to-red-600' :
                        getLagerStatus(order) === 'niedrig' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        'bg-gradient-to-r from-green-400 to-emerald-500'
                      }`}
                      style={{ 
                        width: `${Math.min((order.aktuellerBestand / order.maxBestand) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {order.notizen && (
                  <div className="mt-4 p-3 bg-white/5 rounded-xl">
                    <p className="text-white/60 text-xs font-semibold uppercase mb-1">Notizen</p>
                    <p className="text-white text-sm">{order.notizen}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Produkt</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Kategorie</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Menge</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Bestand</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Priorität</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, index) => (
                    <tr key={order.id} className={index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}>
                      <td className="px-6 py-4 text-white font-medium" data-testid={`table-product-${order.id}`}>
                        {order.produktName}
                      </td>
                      <td className="px-6 py-4 text-white/80">{order.kategorie}</td>
                      <td className="px-6 py-4 text-white font-bold">
                        {order.menge} {order.einheit}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${
                          getLagerStatus(order) === 'kritisch' ? 'text-red-400' :
                          getLagerStatus(order) === 'niedrig' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {order.aktuellerBestand} {order.bestandseinheit || order.einheit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getPriorityColor(order.prioritaet)}`}>
                          {order.prioritaet}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg"
                            data-testid={`table-edit-order-${order.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg"
                            data-testid={`table-delete-order-${order.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-black text-white mb-6">
                {editingOrder ? '✏️ Bestellung bearbeiten' : '➕ Neue Bestellung hinzufügen'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Produkt Name *</label>
                  <input
                    type="text"
                    value={newOrder.produktName}
                    onChange={(e) => setNewOrder({...newOrder, produktName: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all duration-300 text-white placeholder-white/60"
                    placeholder="z.B. Mineralwasser 1,5L"
                    data-testid="product-name-input"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Kategorie *</label>
                  <select
                    value={newOrder.kategorie}
                    onChange={(e) => setNewOrder({...newOrder, kategorie: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white"
                    data-testid="category-select"
                  >
                    <option value="" className="bg-gray-800">Kategorie wählen</option>
                    {kategorien.map(k => (
                      <option key={k} value={k} className="bg-gray-800">{k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Bestellmenge *</label>
                  <input
                    type="number"
                    value={newOrder.menge}
                    onChange={(e) => setNewOrder({...newOrder, menge: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-green-500/50 focus:border-green-400 transition-all duration-300 text-white placeholder-white/60"
                    placeholder="0"
                    data-testid="quantity-input"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Einheit</label>
                  <input
                    type="text"
                    value={newOrder.einheit}
                    onChange={(e) => setNewOrder({...newOrder, einheit: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-white placeholder-white/60"
                    placeholder="z.B. Flaschen, Stück, Packungen"
                    data-testid="unit-input"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Anfangsbestand</label>
                  <input
                    type="number"
                    value={newOrder.anfangsBestand}
                    onChange={(e) => setNewOrder({...newOrder, anfangsBestand: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-orange-500/50 focus:border-orange-400 transition-all duration-300 text-white placeholder-white/60"
                    placeholder="0"
                    data-testid="initial-stock-input"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Verteilte Anzahl</label>
                  <input
                    type="number"
                    value={newOrder.verteilteAnzahl}
                    onChange={(e) => setNewOrder({...newOrder, verteilteAnzahl: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-red-500/50 focus:border-red-400 transition-all duration-300 text-white placeholder-white/60"
                    placeholder="0"
                    data-testid="distributed-quantity-input"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Mindestbestand</label>
                  <input
                    type="number"
                    value={newOrder.mindestBestand}
                    onChange={(e) => setNewOrder({...newOrder, mindestBestand: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-yellow-500/50 focus:border-yellow-400 transition-all duration-300 text-white placeholder-white/60"
                    placeholder="0"
                    data-testid="minimum-stock-input"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Maximaler Bestand</label>
                  <input
                    type="number"
                    value={newOrder.maxBestand}
                    onChange={(e) => setNewOrder({...newOrder, maxBestand: parseInt(e.target.value) || 100})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-pink-500/50 focus:border-pink-400 transition-all duration-300 text-white placeholder-white/60"
                    placeholder="100"
                    data-testid="maximum-stock-input"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Status</label>
                  <select
                    value={newOrder.status}
                    onChange={(e) => setNewOrder({...newOrder, status: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-300 text-white"
                    data-testid="status-select"
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s} className="bg-gray-800">{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Priorität</label>
                  <select
                    value={newOrder.prioritaet}
                    onChange={(e) => setNewOrder({...newOrder, prioritaet: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white"
                    data-testid="priority-select"
                  >
                    {prioritaetOptions.map(p => (
                      <option key={p} value={p} className="bg-gray-800">{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Lieferant</label>
                  <input
                    type="text"
                    value={newOrder.lieferant}
                    onChange={(e) => setNewOrder({...newOrder, lieferant: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-teal-500/50 focus:border-teal-400 transition-all duration-300 text-white placeholder-white/60"
                    placeholder="z.B. Medizin Großhandel GmbH"
                    data-testid="supplier-input"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Lieferdatum</label>
                  <input
                    type="date"
                    value={newOrder.lieferdatum || ''}
                    onChange={(e) => setNewOrder({...newOrder, lieferdatum: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all duration-300 text-white"
                    data-testid="delivery-date-input"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-white/80 text-sm font-bold mb-2">Notizen</label>
                <textarea
                  value={newOrder.notizen}
                  onChange={(e) => setNewOrder({...newOrder, notizen: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white placeholder-white/60 h-24 resize-none"
                  placeholder="Zusätzliche Informationen..."
                  data-testid="notes-textarea"
                />
              </div>

              {/* Berechneter Bestand Anzeige */}
              <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-2xl">
                <h4 className="text-white font-bold mb-2">📊 Berechneter aktueller Bestand:</h4>
                <p className="text-2xl font-black text-cyan-400">
                  {newOrder.aktuellerBestand} {newOrder.bestandseinheit || newOrder.einheit || 'Stück'}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  Formel: Anfangsbestand ({newOrder.anfangsBestand}) + Neue Bestellung ({newOrder.menge}) - Verteilte Anzahl ({newOrder.verteilteAnzahl})
                </p>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingOrder(null);
                    setNewOrder({
                      id: 0,
                      produktName: '',
                      kategorie: '',
                      menge: 0,
                      einheit: '',
                      lieferant: '',
                      bestelldatum: new Date().toISOString().split('T')[0],
                      lieferdatum: '',
                      status: 'Bestellt',
                      notizen: '',
                      mindestBestand: 0,
                      maxBestand: 100,
                      prioritaet: 'Normal',
                      aktuellerBestand: 0,
                      verteilteAnzahl: 0,
                      verteilungseinheit: 'Stück',
                      bestandseinheit: 'Stück',
                      anfangsBestand: 0,
                      erhalteneBestellungen: 0
                    });
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105"
                  data-testid="cancel-button"
                >
                  ❌ Abbrechen
                </button>
                <button
                  onClick={editingOrder ? handleUpdateOrder : handleAddOrder}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105"
                  data-testid="save-button"
                >
                  {editingOrder ? '💾 Aktualisieren' : '➕ Hinzufügen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UltraModernHospitalApp;