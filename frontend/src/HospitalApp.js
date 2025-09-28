import React, { useState, useEffect } from 'react';
import { Plus, Search, Download, FileText, Trash2, Edit, Package, Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock, Filter, Menu, Bell, Settings, Eye, BarChart3, Zap, Star, Sparkles } from 'lucide-react';
import PWAInstaller from './PWAInstaller';

const ReportsPage = ({ orders, onBack }) => {
  console.log('🔍 ReportsPage wird gerendert!');
  console.log('📊 Bestelldaten:', orders);
  console.log('🔢 Anzahl Bestellungen:', orders ? orders.length : 'undefiniert');

  const [dateRange, setDateRange] = useState('30'); // Tage
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);

  // Filtered data based on date range and category
  const getFilteredReports = () => {
    let filtered = orders;

    // Date filtering
    if (useCustomDateRange && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the end day
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.bestelldatum);
        return orderDate >= start && orderDate <= end;
      });
    } else if (!useCustomDateRange) {
      const today = new Date();
      const filterDate = new Date();
      filterDate.setDate(today.getDate() - parseInt(dateRange));
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.bestelldatum);
        return orderDate >= filterDate;
      });
    }

    // Category filtering
    if (selectedCategory) {
      filtered = filtered.filter(order => order.kategorie === selectedCategory);
    }

    return filtered;
  };

  const filteredReports = getFilteredReports();
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

  // Excel Export für Reports - DÜZELTME: Semikolon Delimiter
  const exportReportsToExcel = async () => {
    try {
      console.log('📊 Reports Excel Export wird gestartet...');

      const dateRangeText = useCustomDateRange && startDate && endDate 
        ? `${startDate} bis ${endDate}` 
        : `Letzte ${dateRange} Tage`;

      // CSV Daten vorbereiten - SEMICOLON für deutsche Excel
      const csvData = [
        ['HospitalGo Berichte - ' + dateRangeText],
        [''],
        ['Produkt Name', 'Kategorie', 'Bestellmenge', 'Einheit', 'Aktueller Bestand', 'Verteilte Anzahl', 'Status', 'Priorität', 'Bestelldatum', 'Lieferant', 'Verbrauchsrate'],
        ...filteredReports.map(order => {
          const verbrauchsrate = order.menge > 0 ? ((order.verteilteAnzahl || 0) / order.menge * 100).toFixed(1) : '0';
          return [
            order.produktName || '',
            order.kategorie || '',
            order.menge || '',
            order.einheit || '',
            order.aktuellerBestand || '',
            order.verteilteAnzahl || 0,
            order.status || '',
            order.prioritaet || '',
            order.bestelldatum || '',
            order.lieferant || '',
            verbrauchsrate + '%'
          ];
        })
      ];

      // CSV String erstellen - SEMICOLON als Delimiter für Deutsche Excel
      const csvString = csvData.map(row =>
        row.map(field => {
          const stringField = String(field);
          // Escaping für Anführungszeichen und Semikolons
          if (stringField.includes(';') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
        }).join(';') // SEMICOLON als Delimiter
      ).join('\r\n'); // Windows Line Endings

      // BOM für deutsche Umlaute hinzufügen
      const BOM = '\uFEFF';
      const csvContent = BOM + csvString;

      // Blob erstellen und Download auslösen
      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      const link = document.createElement('a');
      const filename = `HospitalGo_Berichte_${dateRangeText.replace(/\s+/g, '_')}.csv`;
      
      if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
      } else {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      // Erfolgsmeldung anzeigen
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
        align-items: center; justify-content: center; font-family: Arial;
      `;

      modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 500px;">
          <h2 style="color: #667eea; margin-bottom: 15px;">✅ Berichte Excel-Datei heruntergeladen!</h2>
          <p style="margin-bottom: 20px; color: #333;">
            Die Berichtsdaten wurden erfolgreich als Excel-kompatible CSV-Datei gespeichert.<br>
            <strong>Zeitraum:</strong> ${dateRangeText}<br>
            <strong>Dateiname:</strong> ${filename}<br>
            <strong>Format:</strong> Deutsche Excel-Kompatibilität (Semikolon-getrennt)
          </p>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 12px;">
            📊 ${filteredReports.length} Berichte exportiert<br>
            📋 Optimiert für deutsche Excel-Version<br>
            🔧 Jede Spalte wird korrekt getrennt angezeigt
          </div>
          <button onclick="this.parentElement.parentElement.remove()" 
                  style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
            Schließen
          </button>
        </div>
      `;

      document.body.appendChild(modal);
      console.log('✅ Reports CSV-Datei mit Semikolon-Delimiter erfolgreich heruntergeladen');

    } catch (error) {
      console.error('❌ Reports Excel Export Fehler:', error);
      alert('❌ Fehler beim Excel-Export. Bitte versuchen Sie es erneut.');
    }
  };

  // PDF Export für Reports
  const exportReportsToPDF = () => {
    try {
      console.log('📄 Reports PDF Export wird gestartet...');

      const dateRangeText = useCustomDateRange && startDate && endDate 
        ? `${startDate} bis ${endDate}` 
        : `Letzte ${dateRange} Tage`;

      // HTML-Inhalt für PDF erstellen
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>HospitalGo Berichte</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              color: #333;
            }
            .header { 
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #7c3aed;
              padding-bottom: 20px;
            }
            h1 { 
              color: #7c3aed; 
              margin-bottom: 10px;
            }
            .summary-cards {
              display: flex;
              justify-content: space-around;
              margin: 30px 0;
            }
            .summary-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              min-width: 150px;
            }
            .card-value {
              font-size: 24px;
              font-weight: bold;
              color: #7c3aed;
            }
            .card-label {
              font-size: 12px;
              color: #64748b;
              margin-top: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
              font-size: 11px;
            }
            th { 
              background-color: #7c3aed; 
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9fafb; 
            }
            .kritisch { color: #dc2626; font-weight: bold; }
            .hoch { color: #f59e0b; font-weight: bold; }
            .normal { color: #059669; }
            .niedrig { color: #6b7280; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 HospitalGo - Bestellungsberichte</h1>
            <p><strong>Berichtszeitraum:</strong> ${dateRangeText}</p>
            <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}</p>
          </div>
          
          <div class="summary-cards">
            <div class="summary-card">
              <div class="card-value">${totalBestellungen}</div>
              <div class="card-label">Gesamte Bestellungen</div>
            </div>
            <div class="summary-card">
              <div class="card-value">${totalVerteilte}</div>
              <div class="card-label">Verteilte Menge</div>
            </div>
            <div class="summary-card">
              <div class="card-value">${totalAktuell}</div>
              <div class="card-label">Aktueller Bestand</div>
            </div>
            <div class="summary-card">
              <div class="card-value">${filteredReports.length}</div>
              <div class="card-label">Anzahl Produkte</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Kategorie</th>
                <th>Menge</th>
                <th>Einheit</th>
                <th>Bestand</th>
                <th>Verteilt</th>
                <th>Status</th>
                <th>Priorität</th>
                <th>Bestelldatum</th>
                <th>Lieferant</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              ${filteredReports.map(order => {
                const verbrauchsrate = order.menge > 0 ? ((order.verteilteAnzahl || 0) / order.menge * 100).toFixed(1) : 0;
                return `
                <tr>
                  <td>${order.produktName}</td>
                  <td>${order.kategorie}</td>
                  <td>${order.menge}</td>
                  <td>${order.einheit}</td>
                  <td>${order.aktuellerBestand}</td>
                  <td>${order.verteilteAnzahl || 0}</td>
                  <td>${order.status}</td>
                  <td class="${order.prioritaet.toLowerCase()}">${order.prioritaet}</td>
                  <td>${new Date(order.bestelldatum).toLocaleDateString('de-DE')}</td>
                  <td>${order.lieferant || 'N/A'}</td>
                  <td>${verbrauchsrate}%</td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generiert von HospitalGo - Smart Hospital Solutions</p>
            <p>© ${new Date().getFullYear()} - Alle Rechte vorbehalten</p>
          </div>
        </body>
        </html>
      `;

      // Neues Fenster öffnen und Druckdialog anzeigen
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Warten bis Inhalt geladen ist, dann Druckdialog öffnen
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          
          // Optional: Fenster nach dem Drucken schließen
          printWindow.onafterprint = function() {
            printWindow.close();
          };
        }, 500);
      };

      console.log('✅ Reports PDF-Druckdialog geöffnet');
      
    } catch (error) {
      console.error('❌ Reports PDF Export Fehler:', error);
      alert('❌ Fehler beim PDF-Export. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 md:w-80 h-60 md:h-80 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 md:w-80 h-60 md:h-80 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-4 md:py-6">
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                📊 Bestellungen & Verbrauch Berichte
              </h1>
              <p className="text-white/80 text-sm md:text-base mt-1">
                Analysieren Sie Ihre Bestellungen und Verbrauchsdaten
              </p>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
              <button
                onClick={exportReportsToExcel}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl flex items-center justify-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
              >
                <Download className="h-4 w-4" />
                <span>📋 Excel exportieren</span>
              </button>
              
              <button
                onClick={exportReportsToPDF}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl flex items-center justify-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
              >
                <FileText className="h-4 w-4" />
                <span>📄 PDF exportieren</span>
              </button>
              
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl flex items-center justify-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
              >
                <span>⬅️ Zurück</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-4 md:py-6">
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20 mb-6">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4">🔍 Filter & Zeitraum</h3>
          
          {/* Date Range Toggle */}
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <button
                onClick={() => setUseCustomDateRange(false)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  !useCustomDateRange 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                📅 Vorgefertigte Zeiträume
              </button>
              <button
                onClick={() => setUseCustomDateRange(true)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  useCustomDateRange 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                🗓️ Benutzerdefinierter Zeitraum
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Predefined Date Range */}
            {!useCustomDateRange && (
              <select
                className="px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all duration-300 text-white font-medium text-sm md:text-base"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="1" className="bg-gray-800 text-white">Letzter Tag</option>
                <option value="7" className="bg-gray-800 text-white">Letzte Woche</option>
                <option value="30" className="bg-gray-800 text-white">Letzter Monat</option>
                <option value="90" className="bg-gray-800 text-white">Letzte 3 Monate</option>
                <option value="180" className="bg-gray-800 text-white">Letzte 6 Monate</option>
                <option value="365" className="bg-gray-800 text-white">Letztes Jahr</option>
              </select>
            )}

            {/* Custom Date Range */}
            {useCustomDateRange && (
              <>
                <div>
                  <label className="block text-white/80 text-xs font-bold mb-1">Von Datum</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-xs font-bold mb-1">Bis Datum</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white text-sm"
                  />
                </div>
              </>
            )}

            {/* Category Filter */}
            <select
              className="px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-4 focus:ring-green-500/50 focus:border-green-400 transition-all duration-300 text-white font-medium text-sm md:text-base"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="" className="bg-gray-800 text-white">Alle Kategorien</option>
              <option value="Getränke" className="bg-gray-800 text-white">Getränke</option>
              <option value="Hygieneartikel" className="bg-gray-800 text-white">Hygieneartikel</option>
              <option value="Medizinische Verbrauchsmaterialien" className="bg-gray-800 text-white">Med. Verbrauchsmat.</option>
              <option value="Reinigungsmittel" className="bg-gray-800 text-white">Reinigungsmittel</option>
              <option value="Büromaterial" className="bg-gray-800 text-white">Büromaterial</option>
              <option value="Lebensmittel" className="bg-gray-800 text-white">Lebensmittel</option>
            </select>

            {/* Results Info */}
            <div className="flex items-center justify-center bg-white/5 rounded-xl px-4 py-2">
              <span className="text-white font-medium text-sm">
                📈 {filteredReports.length} Ergebnisse
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider">Gesamte Bestellungen</p>
                <p className="text-xl md:text-3xl font-black">{totalBestellungen}</p>
                <p className="text-white/80 text-xs font-semibold">
                  {useCustomDateRange && startDate && endDate 
                    ? `${startDate} bis ${endDate}` 
                    : `Letzte ${dateRange} Tage`}
                </p>
              </div>
              <Package className="h-6 md:h-12 w-6 md:w-12 text-white/80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-400 via-red-500 to-orange-600 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider">Verteilte Menge</p>
                <p className="text-xl md:text-3xl font-black">{totalVerteilte}</p>
                <p className="text-white/80 text-xs font-semibold">Verbrauch</p>
              </div>
              <TrendingUp className="h-6 md:h-12 w-6 md:w-12 text-white/80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider">Aktueller Bestand</p>
                <p className="text-xl md:text-3xl font-black">{totalAktuell}</p>
                <p className="text-white/80 text-xs font-semibold">Verfügbar</p>
              </div>
              <BarChart3 className="h-6 md:h-12 w-6 md:w-12 text-white/80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider">Anzahl Produkte</p>
                <p className="text-xl md:text-3xl font-black">{filteredReports.length}</p>
                <p className="text-white/80 text-xs font-semibold">Gefiltert</p>
              </div>
              <Eye className="h-6 md:h-12 w-6 md:w-12 text-white/80" />
            </div>
          </div>
        </div>

        {/* Category Analysis */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20 mb-6">
          <h3 className="text-lg md:text-2xl font-black text-white mb-4 md:mb-6">📈 Kategorie Analyse</h3>
          {Object.keys(kategorieStats).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {Object.entries(kategorieStats).map(([kategorie, stats]) => (
                <div key={kategorie} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6">
                  <div className="flex flex-col space-y-2 mb-4">
                    <h4 className="text-sm md:text-lg font-bold text-white">{kategorie}</h4>
                    <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-white/80">
                      <span>📦 Bestellt: {stats.bestellt}</span>
                      <span>🚀 Verteilt: {stats.verteilt}</span>
                      <span>📊 Bestand: {stats.bestand}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-white/20 rounded-full h-2 md:h-3">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 md:h-3 rounded-full transition-all duration-1000"
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
          ) : (
            <div className="text-center py-8">
              <p className="text-white/60 text-lg">📭 Keine Daten für den ausgewählten Zeitraum verfügbar</p>
              <p className="text-white/40 text-sm mt-2">Versuchen Sie einen anderen Zeitraum oder Filter</p>
            </div>
          )}
        </div>

        {/* Detailed Table */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-4 md:p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
            <h3 className="text-lg md:text-xl font-black text-white">
              📋 Detaillierte Übersicht 
              ({useCustomDateRange && startDate && endDate 
                ? `${startDate} bis ${endDate}` 
                : `Letzte ${dateRange} Tage`})
            </h3>
          </div>
          <div className="overflow-x-auto">
            {filteredReports.length > 0 ? (
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white">Produkt</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white hidden md:table-cell">Kategorie</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white">Bestellt</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white">Verteilt</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white">Bestand</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white hidden lg:table-cell">Rate</th>
                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-bold text-white hidden lg:table-cell">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((order, index) => {
                    const verbrauchsrate = order.menge > 0 ? ((order.verteilteAnzahl || 0) / order.menge * 100) : 0;
                    return (
                      <tr key={order.id} className={index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-white font-medium text-xs md:text-sm">
                          <div>
                            <div className="font-bold">{order.produktName}</div>
                            <div className="text-xs text-white/60 md:hidden">{order.kategorie}</div>
                            <div className="text-xs text-white/60 lg:hidden">
                              {new Date(order.bestelldatum).toLocaleDateString('de-DE')}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-white/80 text-xs md:text-sm hidden md:table-cell">{order.kategorie}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-white font-bold text-xs md:text-sm">{order.menge} {order.einheit}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-white font-bold text-xs md:text-sm">{order.verteilteAnzahl || 0}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-white font-bold text-xs md:text-sm">{order.aktuellerBestand}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 hidden lg:table-cell">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold ${
                            verbrauchsrate > 80 ? 'bg-red-500/80 text-white' :
                              verbrauchsrate > 50 ? 'bg-yellow-500/80 text-white' :
                                'bg-green-500/80 text-white'
                          }`}>
                            {verbrauchsrate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-white text-xs md:text-sm hidden lg:table-cell">
                          {new Date(order.bestelldatum).toLocaleDateString('de-DE')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-white/60 text-xl mb-2">Keine Berichte gefunden</p>
                <p className="text-white/40 text-sm">Versuchen Sie einen anderen Zeitraum oder entfernen Sie Filter</p>
              </div>
            )}
          </div>
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
      lieferant: 'Getränke Großhandel GmbH',
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
      lieferant: 'Hygiene Service AG',
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
      lieferant: 'MedCare Supplies',
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 🤖 INTELLIGENT STOCK MANAGEMENT SYSTEM - German
  const [showStockMergeDialog, setShowStockMergeDialog] = useState(false);
  const [existingProduct, setExistingProduct] = useState(null);
  const [duplicateProductWarning, setDuplicateProductWarning] = useState('');

  // 📋 Prüfe ob Produkt bereits existiert
  const checkExistingProduct = (produktName) => {
    if (!produktName || produktName.trim() === '') {
      setDuplicateProductWarning('');
      setExistingProduct(null);
      return;
    }

    const existing = orders.find(order => 
      order.produktName.toLowerCase().trim() === produktName.toLowerCase().trim()
    );

    if (existing && !editingOrder) {
      setExistingProduct(existing);
      setDuplicateProductWarning(
        `⚠️ Produkt "${produktName}" bereits vorhanden! Aktueller Bestand: ${existing.aktuellerBestand} ${existing.einheit || 'Stück'}`
      );
    } else {
      setDuplicateProductWarning('');
      setExistingProduct(null);
    }
  };

  // 🔗 Bestehende Bestände zusammenführen
  const mergeWithExistingStock = () => {
    if (!existingProduct) return;

    const neueGesamtmenge = existingProduct.aktuellerBestand + (parseInt(newOrder.menge) || 0);
    
    // Update existing order with new stock
    setOrders(orders.map(order =>
      order.id === existingProduct.id
        ? {
          ...order,
          menge: existingProduct.menge + (parseInt(newOrder.menge) || 0),
          aktuellerBestand: neueGesamtmenge,
          erhalteneBestellungen: existingProduct.erhalteneBestellungen + (parseInt(newOrder.menge) || 0),
          bestelldatum: new Date().toISOString().split('T')[0] // Update to today
        }
        : order
    ));

    // Reset form
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
      erhalteneBestellungen: 0,
      sku: '',
      teslimatSuresi: 0,
      alternatifTedarikci: '',
      sonKullanmaTarihi: '',
      lagerStatus: 'normal',
      otomatikSiparisOneri: 0,
      budgetKodu: ''
    });

    setShowAddForm(false);
    setDuplicateProductWarning('');
    setExistingProduct(null);
    
    // Zeige Erfolgsbenachrichtigung
    alert(`✅ Bestand erfolgreich aktualisiert!\n${existingProduct.produktName}: ${neueGesamtmenge} ${existingProduct.einheit || 'Stück'}`);
  };

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
    mindestBestand: 0, // Nur für Warnungen
    prioritaet: 'Normal',
    aktuellerBestand: 0,
    // 🆕 SIMPLIFIED FEATURES - Only Essential Fields
    sku: '',
    lagerStatus: 'normal',
    otomatikSiparisOneri: 0
  });

  // 🧮 SIMPLIFIED CALCULATION ENGINE - Fixed Logic
  useEffect(() => {
    const anfangsBestand = parseInt((newOrder.anfangsBestand || 0).toString()) || 0;
    const neueBestellung = parseInt((newOrder.menge || 0).toString()) || 0;
    const verteilteAnzahl = parseInt((newOrder.verteilteAnzahl || 0).toString()) || 0;
    const mindestBestand = parseInt((newOrder.mindestBestand || 0).toString()) || 0;

    // 📦 KORREKTE BESTANDSBERECHNUNG
    let berechneterBestand;
    if (editingOrder) {
      // Beim Bearbeiten: Nur die neue Bestellung zählen
      berechneterBestand = neueBestellung;
    } else {
      // Neuer Eintrag: Einfache Logik - nur Bestellmenge
      berechneterBestand = neueBestellung;
    }

    // 🚨 LAGER STATUS (nur wenn Mindestbestand gesetzt ist)
    let lagerStatus = 'normal';
    if (mindestBestand > 0) {
      if (berechneterBestand <= mindestBestand * 0.5) {
        lagerStatus = 'kritisch';
      } else if (berechneterBestand <= mindestBestand) {
        lagerStatus = 'niedrig';
      } else if (berechneterBestand > mindestBestand * 3) {
        lagerStatus = 'hoch';
      }
    }

    // 🤖 BESTELLEMPFEHLUNG (nur bei niedrigem Bestand)
    let otomatikSiparisOneri = 0;
    if (mindestBestand > 0 && berechneterBestand < mindestBestand) {
      otomatikSiparisOneri = Math.max(mindestBestand * 2 - berechneterBestand, 0);
    }

    setNewOrder(prev => ({ 
      ...prev, 
      aktuellerBestand: berechneterBestand,
      lagerStatus: lagerStatus,
      otomatikSiparisOneri: otomatikSiparisOneri
    }));
  }, [
    newOrder.menge, 
    newOrder.mindestBestand,
    editingOrder
  ]);

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
        erhalteneBestellungen: 0,
        // 🆕 PROFESSIONAL FEATURES
        sku: '',
        teslimatSuresi: 0,
        alternatifTedarikci: '',
        sonKullanmaTarihi: '',
        lagerStatus: 'normal',
        otomatikSiparisOneri: 0,
        budgetKodu: ''
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
          aktuellerBestand: finalBestand, // 📦 Einfache Formel
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
      erhalteneBestellungen: 0,
      // 🆕 PROFESSIONAL FEATURES
      sku: '',
      teslimatSuresi: 0,
      alternatifTedarikci: '',
      sonKullanmaTarihi: '',
      lagerStatus: 'normal',
      otomatikSiparisOneri: 0,
      budgetKodu: ''
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

  // 📋 DÜZELTME: Excel CSV Export için Almanca format
  const exportToExcel = async () => {
    try {
      console.log('🏥 Excel Export wird gestartet...');

      // CSV Daten vorbereiten (Deutsche Spaltenköpfe) - SEMICOLON für deutsche Excel
      const csvData = [
        ['Produkt Name', 'Kategorie', 'Bestellmenge', 'Einheit', 'Aktueller Bestand', 'Mindestbestand', 'Status', 'Priorität', 'Bestelldatum', 'Lieferant'],
        ...filteredOrders.map(order => [
          order.produktName || '',
          order.kategorie || '',
          order.menge || '',
          order.einheit || '',
          order.aktuellerBestand || '',
          order.mindestBestand || '',
          order.status || '',
          order.prioritaet || '',
          order.bestelldatum || '',
          order.lieferant || ''
        ])
      ];

      // CSV String erstellen - SEMICOLON als Delimiter für Deutsche Excel
      const csvString = csvData.map(row =>
        row.map(field => {
          const stringField = String(field);
          // Escaping für Anführungszeichen und Semikolons
          if (stringField.includes(';') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
        }).join(';') // SEMICOLON als Delimiter
      ).join('\r\n'); // Windows Line Endings

      // BOM für deutsche Umlaute hinzufügen
      const BOM = '\uFEFF';
      const csvContent = BOM + csvString;

      // Blob erstellen und Download auslösen
      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      const link = document.createElement('a');
      
      if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, 'HospitalGo_Bestellungen.csv');
      } else {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'HospitalGo_Bestellungen.csv';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      // Erfolgsmeldung anzeigen
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; display: flex; 
        align-items: center; justify-content: center; font-family: Arial;
      `;

      modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 15px; text-align: center; max-width: 500px;">
          <h2 style="color: #667eea; margin-bottom: 15px;">✅ Excel-Datei heruntergeladen!</h2>
          <p style="margin-bottom: 20px; color: #333;">
            Die Bestellungsdaten wurden erfolgreich als Excel-kompatible CSV-Datei gespeichert.<br>
            <strong>Dateiname:</strong> HospitalGo_Bestellungen.csv<br>
            <strong>Format:</strong> Deutsche Excel-Kompatibilität (Semikolon-getrennt)
          </p>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 12px;">
            📊 ${filteredOrders.length} Bestellungen exportiert<br>
            📋 Optimiert für deutsche Excel-Version<br>
            🔧 Jede Spalte wird korrekt getrennt angezeigt
          </div>
          <button onclick="this.parentElement.parentElement.remove()" 
                  style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
            Schließen
          </button>
        </div>
      `;

      document.body.appendChild(modal);
      console.log('✅ CSV-Datei mit Semikolon-Delimiter erfolgreich heruntergeladen');

    } catch (error) {
      console.error('❌ Excel Export Fehler:', error);
      alert('❌ Fehler beim Excel-Export. Bitte versuchen Sie es erneut.');
    }
  };

  // 📄 DÜZELTME: Gerçek PDF Datei Download
  const exportToPDF = () => {
    try {
      console.log('📄 PDF Export wird gestartet...');

      // HTML-Inhalt für PDF erstellen
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>HospitalGo Bestellungen</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              color: #333;
            }
            h1 { 
              color: #7c3aed; 
              text-align: center;
              margin-bottom: 30px;
            }
            .header-info {
              text-align: center;
              margin-bottom: 30px;
              color: #666;
            }
            table { 
              width: 100%; 
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
              font-size: 12px;
            }
            th { 
              background-color: #7c3aed; 
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .kritisch { color: #dc2626; font-weight: bold; }
            .hoch { color: #f59e0b; font-weight: bold; }
            .normal { color: #059669; }
            .niedrig { color: #6b7280; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>🏥 HospitalGo - Bestellungsübersicht</h1>
          <div class="header-info">
            <p>Erstellt am: ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')}</p>
            <p>Anzahl Bestellungen: ${filteredOrders.length}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Produkt</th>
                <th>Kategorie</th>
                <th>Menge</th>
                <th>Einheit</th>
                <th>Bestand</th>
                <th>Status</th>
                <th>Priorität</th>
                <th>Bestelldatum</th>
                <th>Lieferant</th>
              </tr>
            </thead>
            <tbody>
              ${filteredOrders.map(order => `
                <tr>
                  <td>${order.produktName}</td>
                  <td>${order.kategorie}</td>
                  <td>${order.menge}</td>
                  <td>${order.einheit}</td>
                  <td>${order.aktuellerBestand}</td>
                  <td>${order.status}</td>
                  <td class="${order.prioritaet.toLowerCase()}">${order.prioritaet}</td>
                  <td>${new Date(order.bestelldatum).toLocaleDateString('de-DE')}</td>
                  <td>${order.lieferant || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generiert von HospitalGo - Smart Hospital Solutions</p>
          </div>
        </body>
        </html>
      `;

      // Neues Fenster öffnen und Druckdialog anzeigen
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Warten bis Inhalt geladen ist, dann Druckdialog öffnen
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          
          // Optional: Fenster nach dem Drucken schließen
          printWindow.onafterprint = function() {
            printWindow.close();
          };
        }, 500);
      };

      // Erfolgsmeldung
      console.log('✅ PDF-Druckdialog geöffnet');
      
    } catch (error) {
      console.error('❌ PDF Export Fehler:', error);
      alert('❌ Fehler beim PDF-Export. Bitte versuchen Sie es erneut.');
    }
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

  const handleReportsClick = () => {
    console.log('Berichte-Button geklickt, showReports:', showReports);
    setShowReports(!showReports);
  };

  // 📊 Reports page handling  
  if (showReports) {
    return <ReportsPage orders={orders} onBack={() => setShowReports(false)} />;
  }

  // 🏠 Main Application
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-auto">
      {/* PWA Installer */}
      <PWAInstaller />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 md:w-80 h-60 md:h-80 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 md:w-80 h-60 md:h-80 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-60 md:w-80 h-60 md:h-80 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Glassmorphism Navigation */}
      <nav className="backdrop-blur-xl bg-white/10 border-b border-white/20 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl md:rounded-2xl shadow-2xl animate-pulse">
                <Package className="h-5 md:h-8 w-5 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🚀 HospitalGo
                </h1>
                <p className="text-white/80 font-medium text-xs md:text-base hidden sm:block">Smart Hospital Solutions</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={handleReportsClick}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm md:text-base"
                data-testid="reports-button"
              >
                <BarChart3 className="h-4 md:h-5 w-4 md:w-5" />
                <span>📊 Berichte</span>
              </button>

              <button
                onClick={exportToExcel}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm md:text-base"
                data-testid="export-excel-button"
              >
                <Download className="h-4 md:h-5 w-4 md:w-5" />
                <span className="hidden md:inline">📋 Excel</span>
                <span className="md:hidden">📋</span>
              </button>

              <button
                onClick={exportToPDF}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm md:text-base"
                data-testid="export-pdf-button"
              >
                <FileText className="h-4 md:h-5 w-4 md:w-5" />
                <span className="hidden md:inline">📄 PDF</span>
                <span className="md:hidden">📄</span>
              </button>

              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl flex items-center space-x-2 font-bold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm md:text-base"
                data-testid="add-order-button"
              >
                <Plus className="h-4 md:h-5 w-4 md:w-5" />
                <span className="hidden md:inline">➕ Neue Bestellung</span>
                <span className="md:hidden">➕</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-all duration-300"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden border-t border-white/20 py-4">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    handleReportsClick();
                    setShowMobileMenu(false);
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-4 py-3 rounded-xl flex items-center space-x-2 font-bold transition-all duration-300 text-sm"
                  data-testid="mobile-reports-button"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>📊 Berichte</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      exportToExcel();
                      setShowMobileMenu(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 font-bold transition-all duration-300 text-sm"
                    data-testid="mobile-export-excel-button"
                  >
                    <Download className="h-4 w-4" />
                    <span>📋 Excel</span>
                  </button>

                  <button
                    onClick={() => {
                      exportToPDF();
                      setShowMobileMenu(false);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 font-bold transition-all duration-300 text-sm"
                    data-testid="mobile-export-pdf-button"
                  >
                    <FileText className="h-4 w-4" />
                    <span>📄 PDF</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setShowMobileMenu(false);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 font-bold transition-all duration-300 text-sm"
                  data-testid="mobile-add-order-button"
                >
                  <Plus className="h-4 w-4" />
                  <span>➕ Neue Bestellung</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-4 md:py-8 relative z-10">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-blue-600 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider">Gesamte Artikel</p>
                <p className="text-2xl md:text-3xl font-black">{totalItems}</p>
                <p className="text-white/80 text-xs font-semibold">Bestellungen</p>
              </div>
              <Package className="h-8 md:h-12 w-8 md:w-12 text-white/80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-400 via-pink-500 to-red-600 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider">Kritische Lager</p>
                <p className="text-2xl md:text-3xl font-black">{kritischeLager}</p>
                <p className="text-white/80 text-xs font-semibold">Sofortiger Handlungsbedarf</p>
              </div>
              <AlertTriangle className="h-8 md:h-12 w-8 md:w-12 text-white/80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl transform hover:scale-105 transition-all duration-500">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-white/90 text-xs md:text-sm font-bold uppercase tracking-wider">Niedrige Lager</p>
                <p className="text-2xl md:text-3xl font-black">{niedrigeLager}</p>
                <p className="text-white/80 text-xs font-semibold">Aufmerksamkeit erforderlich</p>
              </div>
              <Clock className="h-8 md:h-12 w-8 md:w-12 text-white/80" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20 mb-6 md:mb-8">
          <div className="flex flex-col space-y-3 md:space-y-4">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-white/60 h-4 md:h-5 w-4 md:w-5" />
              <input
                type="text"
                placeholder="🔍 Produkt suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all duration-300 text-white placeholder-white/60 font-medium text-sm md:text-base"
                data-testid="search-input"
              />
            </div>

            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <select
                value={filterKategorie}
                onChange={(e) => setFilterKategorie(e.target.value)}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white font-medium text-sm md:text-base"
                data-testid="category-filter"
              >
                <option value="" className="bg-gray-800 text-white">Alle Kategorien</option>
                {kategorien.map(k => (
                  <option key={k} value={k} className="bg-gray-800 text-white">
                    {k.length > 20 && window.innerWidth < 768 ? k.substring(0, 20) + '...' : k}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-pink-500/50 focus:border-pink-400 transition-all duration-300 text-white font-medium text-sm md:text-base"
                data-testid="status-filter"
              >
                <option value="" className="bg-gray-800 text-white">Alle Status</option>
                {statusOptions.map(s => (
                  <option key={s} value={s} className="bg-gray-800 text-white">{s}</option>
                ))}
              </select>
            </div>

            <div className="flex bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/30 overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex-1 px-4 md:px-6 py-2 md:py-3 font-bold transition-all duration-300 text-sm md:text-base ${
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
                className={`flex-1 px-4 md:px-6 py-2 md:py-3 font-bold transition-all duration-300 text-sm md:text-base ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="backdrop-blur-xl bg-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20 transform hover:scale-105 transition-all duration-500">
                <div className="flex justify-between items-start mb-3 md:mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-black text-white mb-2 truncate" data-testid={`order-title-${order.id}`} title={order.produktName}>
                      {order.produktName}
                    </h3>
                    <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-3">
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold text-white ${getCategoryColor(order.kategorie)}`}>
                        {order.kategorie.length > 15 ? order.kategorie.substring(0, 15) + '...' : order.kategorie}
                      </span>
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold text-white ${getPriorityColor(order.prioritaet)}`}>
                        {order.prioritaet}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-2 ml-2">
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg"
                      data-testid={`edit-order-${order.id}`}
                    >
                      <Edit className="h-3 md:h-4 w-3 md:w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg"
                      data-testid={`delete-order-${order.id}`}
                    >
                      <Trash2 className="h-3 md:h-4 w-3 md:w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 text-white mb-3 md:mb-4">
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase">Menge</p>
                    <p className="font-bold text-sm md:text-lg truncate">{order.menge} {order.einheit}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase">Aktueller Bestand</p>
                    <p className={`font-bold text-sm md:text-lg truncate ${
                      getLagerStatus(order) === 'kritisch' ? 'text-red-400' :
                      getLagerStatus(order) === 'niedrig' ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {order.aktuellerBestand} {order.bestandseinheit || order.einheit}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase">Bestelldatum</p>
                    <p className="font-bold text-sm md:text-base">{new Date(order.bestelldatum).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase">Lieferant</p>
                    <p className="font-bold text-sm md:text-base truncate" title={order.lieferant || 'N/A'}>{order.lieferant || 'N/A'}</p>
                  </div>
                </div>

                {/* Stock Level Indicator */}
                <div className="mb-3 md:mb-4">
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
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-white/60 text-xs font-semibold uppercase mb-1">Notizen</p>
                    <p className="text-white text-xs md:text-sm break-words">{order.notizen}</p>
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
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl border border-white/20 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
              <h3 className="text-xl md:text-2xl font-black text-white mb-4 md:mb-6">
                {editingOrder ? '✏️ Bestellung bearbeiten' : '🚀 Professionelle Neue Bestellung'}
              </h3>
              
              {/* SMART ALERTS */}
              {newOrder.otomatikSiparisOneri > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🤖</div>
                    <div>
                      <h4 className="text-yellow-300 font-bold">Intelligente Bestellempfehlung</h4>
                      <p className="text-white/80 text-sm">
                        Aktueller Lagerbestand niedrig! Empfohlene Bestellmenge: <strong className="text-yellow-300">{newOrder.otomatikSiparisOneri} {newOrder.einheit}</strong>
                      </p>
                      <button
                        onClick={() => setNewOrder({...newOrder, menge: newOrder.otomatikSiparisOneri})}
                        className="mt-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 text-sm hover:bg-yellow-500/30 transition-all"
                      >
                        ✅ Empfohlene Menge übernehmen
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* EXISTING PRODUCT WARNING */}
              {duplicateProductWarning && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🔍</div>
                      <div>
                        <h4 className="text-blue-300 font-bold">Produkt bereits vorhanden!</h4>
                        <p className="text-white/80 text-sm">{duplicateProductWarning}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={mergeWithExistingStock}
                        className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm hover:bg-green-500/30 transition-all"
                      >
                        🔗 Bestand zusammenführen
                      </button>
                      <button
                        onClick={() => {
                          setDuplicateProductWarning('');
                          setExistingProduct(null);
                        }}
                        className="px-4 py-2 bg-gray-500/20 border border-gray-500/50 rounded-lg text-gray-300 text-sm hover:bg-gray-500/30 transition-all"
                      >
                        ➕ Separat hinzufügen
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-white/80 text-sm font-bold mb-2">Produktname *</label>
                  <input
                    type="text"
                    value={newOrder.produktName}
                    onChange={(e) => {
                      setNewOrder({...newOrder, produktName: e.target.value});
                      // Check for existing product in real-time
                      setTimeout(() => checkExistingProduct(e.target.value), 500);
                    }}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all duration-300 text-white placeholder-white/60 text-sm md:text-base"
                    placeholder="z.B. Mineralwasser 1,5L"
                    data-testid="product-name-input"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-white/80 text-sm font-bold mb-2">SKU/Artikel-Nr.</label>
                  <input
                    type="text"
                    value={newOrder.sku}
                    onChange={(e) => setNewOrder({...newOrder, sku: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-gray-500/50 focus:border-gray-400 transition-all duration-300 text-white placeholder-white/60 text-sm md:text-base"
                    placeholder="z.B. MW-150-PR"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-white/80 text-sm font-bold mb-2">Kategorie *</label>
                  <select
                    value={newOrder.kategorie}
                    onChange={(e) => setNewOrder({...newOrder, kategorie: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white text-sm md:text-base"
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
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-green-500/50 focus:border-green-400 transition-all duration-300 text-white placeholder-white/60 text-sm md:text-base"
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
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 text-white placeholder-white/60 text-sm md:text-base"
                    placeholder="z.B. Flaschen, Stück"
                    data-testid="unit-input"
                  />
                </div>

                {/* OPTIONAL: Minimum Stock Warning */}
                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Mindestbestand (optional)</label>
                  <input
                    type="number"
                    value={newOrder.mindestBestand}
                    onChange={(e) => setNewOrder({...newOrder, mindestBestand: parseInt(e.target.value) || 0})}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-yellow-500/50 focus:border-yellow-400 transition-all duration-300 text-white placeholder-white/60 text-sm md:text-base"
                    placeholder="Für Warnungen (optional)"
                    data-testid="minimum-stock-input"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Lieferant</label>
                  <input
                    type="text"
                    value={newOrder.lieferant}
                    onChange={(e) => setNewOrder({...newOrder, lieferant: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-teal-500/50 focus:border-teal-400 transition-all duration-300 text-white placeholder-white/60 text-sm md:text-base"
                    placeholder="z.B. Medizinischer Großhandel"
                    data-testid="supplier-input"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Status</label>
                  <select
                    value={newOrder.status}
                    onChange={(e) => setNewOrder({...newOrder, status: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all duration-300 text-white text-sm md:text-base"
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
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white text-sm md:text-base"
                    data-testid="priority-select"
                  >
                    {prioritaetOptions.map(p => (
                      <option key={p} value={p} className="bg-gray-800">{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-bold mb-2">Lieferdatum</label>
                  <input
                    type="date"
                    value={newOrder.lieferdatum || ''}
                    onChange={(e) => setNewOrder({...newOrder, lieferdatum: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all duration-300 text-white text-sm md:text-base"
                    data-testid="delivery-date-input"
                  />
                </div>
              </div>

              <div className="mt-4 md:mt-6">
                <label className="block text-white/80 text-sm font-bold mb-2">Notizen</label>
                <textarea
                  value={newOrder.notizen}
                  onChange={(e) => setNewOrder({...newOrder, notizen: e.target.value})}
                  className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-300 text-white placeholder-white/60 h-20 md:h-24 resize-none text-sm md:text-base"
                  placeholder="Zusätzliche Informationen..."
                  data-testid="notes-textarea"
                />
              </div>

              {/* SIMPLIFIED CALCULATION DISPLAY */}
              <div className="mt-4 md:mt-6 p-3 md:p-4 rounded-xl border" style={{
                background: newOrder.lagerStatus === 'kritisch' ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))' :
                          newOrder.lagerStatus === 'niedrig' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))' :
                          newOrder.lagerStatus === 'hoch' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))' :
                          'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))',
                borderColor: newOrder.lagerStatus === 'kritisch' ? 'rgba(239, 68, 68, 0.3)' :
                           newOrder.lagerStatus === 'niedrig' ? 'rgba(245, 158, 11, 0.3)' :
                           newOrder.lagerStatus === 'hoch' ? 'rgba(34, 197, 94, 0.3)' :
                           'rgba(59, 130, 246, 0.3)'
              }}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-bold text-sm md:text-base flex items-center">
                    {newOrder.lagerStatus === 'kritisch' ? '🚨' : 
                     newOrder.lagerStatus === 'niedrig' ? '⚠️' : 
                     newOrder.lagerStatus === 'hoch' ? '📈' : '✅'} 
                     Bestellmenge:
                  </h4>
                  <div className={`text-xs font-bold px-2 py-1 rounded ${
                    newOrder.lagerStatus === 'kritisch' ? 'bg-red-500/20 text-red-400' :
                    newOrder.lagerStatus === 'niedrig' ? 'bg-yellow-500/20 text-yellow-400' :
                    newOrder.lagerStatus === 'hoch' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {newOrder.lagerStatus.toUpperCase()}
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-black text-cyan-400">
                  {newOrder.aktuellerBestand} {newOrder.einheit || 'Stück'}
                </p>
                <p className="text-white/60 text-xs md:text-sm mt-1">
                  Einfache Bestellmenge ohne komplexe Berechnungen
                </p>
                
                {/* Existing Product Info */}
                {existingProduct && (
                  <div className="mt-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-blue-300 text-sm">
                      📊 Nach Zusammenführung: <strong>{existingProduct.aktuellerBestand + (parseInt(newOrder.menge) || 0)} {existingProduct.einheit || 'Stück'}</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-4 mt-6 md:mt-8">
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
                      erhalteneBestellungen: 0,
                      sku: '',
                      teslimatSuresi: 0,
                      alternatifTedarikci: '',
                      sonKullanmaTarihi: '',
                      lagerStatus: 'normal',
                      otomatikSiparisOneri: 0,
                      budgetKodu: ''
                    });
                  }}
                  className="w-full md:w-auto px-4 md:px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl md:rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 text-sm md:text-base"
                  data-testid="cancel-button"
                >
                  ❌ Abbrechen
                </button>
                <button
                  onClick={editingOrder ? handleUpdateOrder : handleAddOrder}
                  disabled={!newOrder.produktName || !newOrder.kategorie || newOrder.menge <= 0}
                  className="w-full md:w-auto px-4 md:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl md:rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 disabled:transform-none text-sm md:text-base"
                  data-testid="save-button"
                >
                  {editingOrder ? '💾 Aktualisieren' : '📦 Intelligente Bestellung erstellen'}
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