'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const BatteryCalculator = () => {
  const [shippingCost, setShippingCost] = useState(0);
  const [currency, setCurrency] = useState('CHF');
  const [exchangeRates, setExchangeRates] = useState({
    EUR: 1,
    USD: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([
    { id: 1, type: 'lipo', cellType: 'P45B', quantity: 1, pricePerUnit: 0 }
  ]);

  const cellTypes = {
    'lipo': ['P45B', 'P50B'],
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
      
      const eurResponse = await fetch('https://api.frankfurter.app/latest?from=EUR&to=CHF');
      if (!eurResponse.ok) throw new Error('EUR Kurs konnte nicht abgerufen werden');
      const eurData = await eurResponse.json();
      
      const usdResponse = await fetch('https://api.frankfurter.app/latest?from=USD&to=CHF');
      if (!usdResponse.ok) throw new Error('USD Kurs konnte nicht abgerufen werden');
      const usdData = await usdResponse.json();
      
      setExchangeRates({
        EUR: eurData.rates.CHF,
        USD: usdData.rates.CHF
      });
      
      setLoading(false);
    } catch (err) {
      setError('Wechselkurse konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
      setLoading(false);
    }
  };

  const addOrder = () => {
    const newId = Math.max(...orders.map(o => o.id)) + 1;
    setOrders([...orders, { id: newId, type: 'lipo', cellType: 'P45B', quantity: 1, pricePerUnit: 0 }]);
  };

  const removeOrder = (id) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  const updateOrder = (id, field, value) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, [field]: value } : order
    ));
  };

  const convertToChf = (amount) => {
    switch(currency) {
      case 'EUR':
        return amount * exchangeRates.EUR;
      case 'USD':
        return amount * exchangeRates.USD;
      default:
        return amount;
    }
  };

  const calculateSubtotal = () => {
    return orders.reduce((sum, order) => 
      sum + (order.quantity * convertToChf(order.pricePerUnit)), 0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shippingInChf = convertToChf(shippingCost);
    const baseTotal = subtotal + shippingInChf;
    const customsDuty = baseTotal * 0.081;
    return baseTotal + customsDuty;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Lade Wechselkurse...</div>
      </div>
    );
  }

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
        <label className="block text-sm font-medium mb-2">
          Transportkosten ({currency})
        </label>
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
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={order.cellType}
                onChange={(e) => updateOrder(order.id, 'cellType', e.target.value)}
                className="w-full p-2 border rounded"
              >
                {cellTypes[order.type].map(cellType => (
                  <option key={cellType} value={cellType}>
                    {cellType}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <input
                type="number"
                min="1"
                value={order.quantity}
                onChange={(e) => updateOrder(order.id, 'quantity', Number(e.target.value))}
                placeholder="Stückzahl"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="flex-1">
              <input
                type="number"
                min="0"
                step="0.01"
                value={order.pricePerUnit}
                onChange={(e) => updateOrder(order.id, 'pricePerUnit', Number(e.target.value))}
                placeholder={`Preis pro Stück (${currency})`}
                className="w-full p-2 border rounded"
              />
            </div>

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
          <div className="flex justify-between">
            <span>Zwischensumme:</span>
            <span>{calculateSubtotal().toFixed(2)} CHF</span>
          </div>
          <div className="flex justify-between">
            <span>Transportkosten:</span>
            <span>{convertToChf(shippingCost).toFixed(2)} CHF</span>
          </div>
          <div className="flex justify-between">
            <span>Zoll (8.1%):</span>
            <span>{(calculateTotal() - calculateSubtotal() - convertToChf(shippingCost)).toFixed(2)} CHF</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Gesamtbetrag:</span>
            <span>{calculateTotal().toFixed(2)} CHF</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryCalculator;
