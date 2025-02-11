'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from "./ui/alert";

const BatteryCalculator = () => {
  const [shippingCost, setShippingCost] = useState(0);
  const [currency, setCurrency] = useState('CHF');
  const [exchangeRates, setExchangeRates] = useState({ EUR: 1, USD: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([
    { id: 1, type: 'lipo', cellType: 'P45B', quantity: 1, pricePerUnit: 0 }
  ]);

  const cellTypes: Record<string, string[]> = {
    lipo: ['P45B', 'P50B'],
    'li-ion-6s': ['P45B', 'P50B'],
    'li-ion-6s2p': ['P45B', 'P50B'],
    'li-ion-6s3p': ['P45B', 'P50B']
  };

  const batteryTypes = [
    { value: 'lipo', label: 'LiPo' },
    { value: 'li-ion-6s', label: 'Li-Ion 6S' },
    { value: 'li-ion-6s2p', label: 'Li-Ion 6S2P' },
    { value: 'li-ion-6s3p', label: 'Li-Ion 6S3P' }
  ];

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      setError('');
      const eurRes = await fetch('https://api.frankfurter.app/latest?from=EUR&to=CHF');
      const usdRes = await fetch('https://api.frankfurter.app/latest?from=USD&to=CHF');

      if (!eurRes.ok || !usdRes.ok) throw new Error('Fehler beim Abrufen der Wechselkurse');

      const eurData = await eurRes.json();
      const usdData = await usdRes.json();

      setExchangeRates({
        EUR: eurData.rates.CHF,
        USD: usdData.rates.CHF
      });
      setLoading(false);
    } catch {
      setError('Wechselkurse konnten nicht geladen werden.');
      setLoading(false);
    }
  };

  const addOrder = () => {
    const newId = orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    setOrders([...orders, { id: newId, type: 'lipo', cellType: 'P45B', quantity: 1, pricePerUnit: 0 }]);
  };

  const removeOrder = (id: number) => setOrders(orders.filter(order => order.id !== id));

  const updateOrder = (id: number, field: string, value: any) => {
    setOrders(orders.map(order => (order.id === id ? { ...order, [field]: value } : order)));
  };

  const convertToChf = (amount: number) => {
    return currency === 'EUR' ? amount * exchangeRates.EUR
         : currency === 'USD' ? amount * exchangeRates.USD
         : amount;
  };

  const calculateSubtotal = () => {
    return orders.reduce((sum, order) => sum + order.quantity * convertToChf(order.pricePerUnit), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingInChf = convertToChf(shippingCost);
    return subtotal + shippingInChf + (subtotal + shippingInChf) * 0.081;
  };

  if (loading) return <div className="max-w-4xl mx-auto p-6 text-center">Lade Wechselkurse...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Akku Bestellkalkulator</h1>
      
      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Währungsauswahl */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Währung</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="CHF">CHF</option>
              <option value="EUR">EUR (Kurs: {exchangeRates.EUR.toFixed(4)})</option>
              <option value="USD">USD (Kurs: {exchangeRates.USD.toFixed(4)})</option>
            </select>
          </div>
          <button
            onClick={fetchExchangeRates}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 mt-6"
          >
            Kurse aktualisieren
          </button>
        </div>
      </div>

      {/* Transportkosten */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Transportkosten ({currency})</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={shippingCost}
          onChange={(e) => setShippingCost(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Bestellpositionen */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">Bestellpositionen</h2>
        
        {orders.map((order) => (
          <div key={order.id} className="flex gap-4 items-start p-4 border rounded">
            <div className="flex-1 space-y-2">
              <select
                value={order.type}
                onChange={(e) => updateOrder(order.id, 'type', e.target.value)}
                className="w-full p-2 border rounded"
              >
                {batteryTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={order.cellType}
                onChange={(e) => updateOrder(order.id, 'cellType', e.target.value)}
                className="w-full p-2 border rounded"
              >
                {cellTypes[order.type]?.map(cellType => (
                  <option key={cellType} value={cellType}>{cellType}</option>
                ))}
              </select>
            </div>

            <input
              type="number"
              min="1"
              value={order.quantity}
              onChange={(e) => updateOrder(order.id, 'quantity', Number(e.target.value))}
              className="w-full p-2 border rounded"
            />

            <input
              type="number"
              min="0"
              step="0.01"
              value={order.pricePerUnit}
              onChange={(e) => updateOrder(order.id, 'pricePerUnit', Number(e.target.value))}
              className="w-full p-2 border rounded"
            />

            <button
              onClick={() => removeOrder(order.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}

        <button
          onClick={addOrder}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Plus size={20} />
          Position hinzufügen
        </button>
      </div>

      {/* Zusammenfassung */}
      <div className="bg-gray-50 p-4 rounded">
        <h2 className="text-xl font-semibold mb-4">Zusammenfassung</h2>
        <div className="space-y-2">
          <div className="flex justify-between"><span>Gesamtbetrag:</span><span>{calculateTotal().toFixed(2)} CHF</span></div>
        </div>
      </div>
    </div>
  );
};

export default BatteryCalculator;
