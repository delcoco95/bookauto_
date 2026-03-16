import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, Loader2, Calendar, Clock, CheckCircle } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);
const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DAYS_FR_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_EN = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_SCHEDULE = {
  monday:    { isOpen: true,  start: '08:00', end: '18:00' },
  tuesday:   { isOpen: true,  start: '08:00', end: '18:00' },
  wednesday: { isOpen: true,  start: '08:00', end: '18:00' },
  thursday:  { isOpen: true,  start: '08:00', end: '18:00' },
  friday:    { isOpen: true,  start: '08:00', end: '18:00' },
  saturday:  { isOpen: false, start: '09:00', end: '13:00' },
  sunday:    { isOpen: false, start: '09:00', end: '13:00' },
};

const STATUS_COLORS = {
  pending:   'bg-yellow-200 border-yellow-400 text-yellow-900',
  accepted:  'bg-blue-200 border-blue-400 text-blue-900',
  completed: 'bg-green-200 border-green-400 text-green-900',
  cancelled: 'bg-red-100 border-red-300 text-red-800',
  refused:   'bg-gray-100 border-gray-300 text-gray-600',
};

const STATUS_LABELS = { pending: 'En attente', accepted: 'Accepté', completed: 'Terminé', cancelled: 'Annulé', refused: 'Refusé' };

function getWeekDates(refDate) {
  const d = new Date(refDate);
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(mon);
    dd.setDate(mon.getDate() + i);
    return dd;
  });
}

const ProSchedule = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useUI();

  // Editable schedule
  const [schedule, setSchedule] = useState(() => {
    const base = { ...DEFAULT_SCHEDULE };
    const saved = user?.defaultSchedule;
    if (saved) {
      DAYS_EN.forEach(day => {
        if (saved[day]) base[day] = { ...base[day], ...saved[day] };
      });
    }
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  // Calendar
  const [refDate, setRefDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);

  const weekDates = getWeekDates(refDate);

  useEffect(() => {
    const load = async () => {
      setLoadingAppts(true);
      try {
        const res = await apiRequest.get('/api/appointments');
        setAppointments(res.data.appointments || []);
      } catch {}
      setLoadingAppts(false);
    };
    load();
  }, []);

  const toggleDay = (dayKey) => {
    setSchedule(prev => ({ ...prev, [dayKey]: { ...prev[dayKey], isOpen: !prev[dayKey].isOpen } }));
  };

  const updateTime = (dayKey, field, value) => {
    setSchedule(prev => ({ ...prev, [dayKey]: { ...prev[dayKey], [field]: value } }));
  };

  const saveSchedule = async () => {
    setSaving(true);
    setSavedOk(false);
    try {
      await apiRequest.patch('/api/users/me/schedule', { defaultSchedule: schedule });
      if (typeof updateUser === 'function') updateUser({ defaultSchedule: schedule });
      showToast('Horaires enregistrés', 'success');
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error');
    }
    setSaving(false);
  };

  const prevWeek = () => { const d = new Date(refDate); d.setDate(d.getDate() - 7); setRefDate(d); };
  const nextWeek = () => { const d = new Date(refDate); d.setDate(d.getDate() + 7); setRefDate(d); };
  const goToday = () => setRefDate(new Date());

  const getApptForSlot = (date, hour) =>
    appointments.filter(a => {
      const aDate = new Date(a.scheduledDate);
      if (aDate.getFullYear() !== date.getFullYear() || aDate.getMonth() !== date.getMonth() || aDate.getDate() !== date.getDate()) return false;
      if (!a.startTime) return false;
      const startH = parseInt(a.startTime.split(':')[0]);
      const endH = a.endTime ? parseInt(a.endTime.split(':')[0]) : startH + 1;
      return startH === hour || (startH < hour && endH > hour);
    });

  const today = new Date();
  const isToday = (date) => date.toDateString() === today.toDateString();
  const weekLabel = `${weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${weekDates[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Section 1: Editable schedule ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-600" /> Mes horaires d'ouverture
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Définissez vos disponibilités hebdomadaires</p>
            </div>
            <button onClick={saveSchedule} disabled={saving}
              className={`btn ${savedOk ? 'btn-outline text-emerald-600 border-emerald-300' : 'btn-primary'} flex items-center gap-2`}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : savedOk ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Sauvegarde…' : savedOk ? 'Sauvegardé !' : 'Enregistrer'}
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {DAYS_EN.map((dayKey, i) => {
                const day = schedule[dayKey];
                return (
                  <div key={dayKey}
                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${day.isOpen ? 'bg-primary-50/40 border-primary-100' : 'bg-gray-50 border-gray-100 opacity-70'}`}>
                    {/* Toggle */}
                    <button type="button" onClick={() => toggleDay(dayKey)}
                      className="flex items-center gap-2 min-w-[110px] flex-shrink-0">
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-5 rounded-full transition-colors ${day.isOpen ? 'bg-primary-600' : 'bg-gray-300'}`} />
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${day.isOpen ? 'translate-x-5' : ''}`} />
                      </div>
                      <span className={`text-sm font-semibold ${day.isOpen ? 'text-gray-900' : 'text-gray-400'}`}>
                        {DAYS_FR[i]}
                      </span>
                    </button>

                    {/* Times */}
                    {day.isOpen ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="time" value={day.start} onChange={e => updateTime(dayKey, 'start', e.target.value)}
                          className="input py-1.5 text-sm w-28" />
                        <span className="text-gray-400 text-sm">→</span>
                        <input type="time" value={day.end} onChange={e => updateTime(dayKey, 'end', e.target.value)}
                          className="input py-1.5 text-sm w-28" />
                        <span className="text-xs text-gray-400 ml-2">
                          {(() => {
                            const [sh, sm] = day.start.split(':').map(Number);
                            const [eh, em] = day.end.split(':').map(Number);
                            const diff = (eh * 60 + em) - (sh * 60 + sm);
                            return diff > 0 ? `${Math.floor(diff / 60)}h${diff % 60 ? (diff % 60) + 'min' : ''}` : '';
                          })()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Fermé</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Section 2: Weekly calendar ── */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" /> Planning de la semaine
              </h2>
              <p className="text-sm text-gray-500">{weekLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goToday} className="btn btn-outline text-sm py-1.5">Aujourd'hui</button>
              <button onClick={prevWeek} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={nextWeek} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50">
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-8 border-b border-gray-200">
                <div className="p-3 text-xs text-gray-400 border-r border-gray-100" />
                {weekDates.map((date, i) => {
                  const dayKey = DAYS_EN[i];
                  const open = schedule[dayKey]?.isOpen;
                  return (
                    <div key={i} className={`p-3 text-center border-r border-gray-100 last:border-r-0 ${isToday(date) ? 'bg-primary-50' : ''} ${!open ? 'bg-gray-50' : ''}`}>
                      <p className="text-xs font-medium text-gray-500 uppercase">{DAYS_FR_SHORT[i]}</p>
                      <p className={`text-lg font-bold ${isToday(date) ? 'text-primary-600' : 'text-gray-900'}`}>{date.getDate()}</p>
                      {!open
                        ? <p className="text-xs text-gray-400 mt-0.5">Fermé</p>
                        : <p className="text-xs text-gray-400 mt-0.5">{schedule[dayKey].start}–{schedule[dayKey].end}</p>
                      }
                    </div>
                  );
                })}
              </div>

              {/* Hour rows */}
              {loadingAppts ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
                </div>
              ) : HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0" style={{ minHeight: '60px' }}>
                  <div className="p-2 text-xs text-gray-400 border-r border-gray-100 pt-2 flex-shrink-0">{hour}:00</div>
                  {weekDates.map((date, i) => {
                    const closed = !schedule[DAYS_EN[i]]?.isOpen;
                    const appts = getApptForSlot(date, hour);
                    return (
                      <div key={i} className={`border-r border-gray-100 last:border-r-0 p-1 relative ${isToday(date) ? 'bg-primary-50/30' : ''} ${closed ? 'bg-gray-50' : ''}`}>
                        {appts.map(a => {
                          const startH = parseInt((a.startTime || '0:0').split(':')[0]);
                          if (startH !== hour) return null;
                          const endH = a.endTime ? parseInt(a.endTime.split(':')[0]) : startH + 1;
                          const endM = a.endTime ? parseInt(a.endTime.split(':')[1]) : 0;
                          const durationH = (endH - startH) + (endM / 60);
                          return (
                            <div key={a._id}
                              className={`absolute left-1 right-1 rounded-lg border text-xs p-1.5 overflow-hidden z-10 ${STATUS_COLORS[a.status] || STATUS_COLORS.pending}`}
                              style={{ top: 2, minHeight: `${Math.max(durationH * 60, 50)}px` }}>
                              <p className="font-semibold truncate">{a.serviceId?.name || 'Service'}</p>
                              <p className="truncate opacity-80">{a.clientId?.firstName} {a.clientId?.lastName?.charAt(0)}.</p>
                              <p className="opacity-70">{a.startTime}–{a.endTime}</p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded border ${STATUS_COLORS[key]}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProSchedule;
