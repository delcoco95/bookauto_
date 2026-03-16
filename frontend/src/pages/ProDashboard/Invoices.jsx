import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Euro } from 'lucide-react';
import { apiRequest } from '../../services/api';

const Invoices = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest.get('/api/invoices/pro')
      .then(res => setAppointments(res.data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const downloadInvoice = async (appointmentId) => {
    try {
      const res = await apiRequest.get(`/api/invoices/generate/${appointmentId}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${appointmentId}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Invoice download error:', err);
      alert('Erreur lors du téléchargement de la facture.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes factures</h1>
        <p className="text-gray-500 mt-1">Téléchargez vos factures pour les rendez-vous terminés.</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-40" />
          <p className="text-lg">Aucune facture disponible</p>
          <p className="text-sm mt-2">Les factures apparaissent après chaque rendez-vous terminé.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt._id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {apt.clientId?.firstName} {apt.clientId?.lastName}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(apt.scheduledDate).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Euro className="w-3 h-3" />
                      {apt.finalPrice?.toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => downloadInvoice(apt._id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Invoices;
