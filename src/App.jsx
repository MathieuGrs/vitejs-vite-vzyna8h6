import React, { useState, useEffect, useRef } from 'react';
import {
  Check, Circle, Plus, Trash, Calendar, List, Tag,
  X, ChevronDown, ChevronUp, Palette,
  Send, Loader, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';

const CATEGORY_COLORS = ['#FF6B6B', '#FF8E53', '#FDCB6E', '#00B894', '#00CEC9', '#74B9FF', '#A29BFE', '#FD79A8', '#B2BEC3', '#2D3436'];
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const EmethHead = ({ className }) => (
  <svg viewBox="0 0 140 140" className={className}><circle cx="70" cy="70" r="70" fill="#E9D5FF" /><g transform="translate(20, 20)"><rect x="2" y="50" width="10" height="22" rx="5" fill="#7C3AED" /><rect x="88" y="50" width="10" height="22" rx="5" fill="#7C3AED" /><path d="M40 32 L60 32" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" /><path d="M50 32 L50 12" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" /><circle cx="50" cy="9" r="7" fill="#FFB86C" /><rect x="12" y="32" width="76" height="58" rx="20" fill="#8B5CF6" /><rect x="21" y="42" width="58" height="32" rx="10" fill="#1E293B" /><path d="M 24 48 Q 50 42 76 48" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.2" fill="none" strokeLinecap="round" /><path d="M33 57 Q 38 50 43 57" stroke="#34D399" strokeWidth="5" strokeLinecap="round" fill="none" /><path d="M57 57 Q 62 50 67 57" stroke="#34D399" strokeWidth="5" strokeLinecap="round" fill="none" /><circle cx="28" cy="65" r="4" fill="#FFB86C" fillOpacity="0.6" /><circle cx="72" cy="65" r="4" fill="#FFB86C" fillOpacity="0.6" /></g></svg>
);

const RoboticArm = ({ className }) => (
  <svg viewBox="0 0 160 160" className={className}><path d="M 55 150 L 105 150 L 95 135 L 65 135 Z" fill="#CBD5E1" /><circle cx="80" cy="135" r="18" fill="#7C3AED" /><circle cx="80" cy="135" r="8" fill="#1E293B" fillOpacity="0.3" /><g style={{ transformOrigin: '80px 135px' }} className="arm-animate"><rect x="62" y="75" width="36" height="60" rx="18" fill="#8B5CF6" /><circle cx="80" cy="120" r="4" fill="#E9D5FF" /><g style={{ transformOrigin: '80px 75px' }} className="forearm-animate"><g style={{ transformOrigin: '72px 38px' }} className="pincer-left"><path d="M 72 38 Q 62 20 72 10" fill="none" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" /><circle cx="72" cy="10" r="5" fill="#CBD5E1" /></g><g style={{ transformOrigin: '88px 38px' }} className="pincer-right"><path d="M 88 38 Q 98 20 88 10" fill="none" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" /><circle cx="88" cy="10" r="5" fill="#CBD5E1" /></g><rect x="65" y="35" width="30" height="40" rx="15" fill="#E9D5FF" /><circle cx="80" cy="75" r="16" fill="#7C3AED" /><circle cx="80" cy="75" r="6" fill="#FFB86C" /></g></g></svg>
);

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([{ id: '1', name: 'Général', color: '#7C3AED' }]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskCategoryId, setNewTaskCategoryId] = useState('');
  const [expandedTasks, setExpandedTasks] = useState({});
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date());
  const [messages, setMessages] = useState([{ role: 'assistant', text: "Coucou ! 👋 Je suis Emeth, votre assistant." }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategories(prev => [...prev, { id: generateId(), name: newCategoryName.trim(), color: newCategoryColor, createdAt: new Date().toISOString() }]);
    setIsCategoryModalOpen(false); setNewCategoryName(''); setNewCategoryColor(CATEGORY_COLORS[0]);
  };

  const handleDeleteCategory = (categoryId) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    if (currentFilter === categoryId) setCurrentFilter('all');
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks(prev => [...prev, { id: generateId(), title: newTaskTitle.trim(), date: newTaskDate || null, time: newTaskTime || null, categoryId: newTaskCategoryId || null, completed: false, subtasks: [], createdAt: new Date().toISOString() }]);
    setNewTaskTitle(''); setNewTaskDate(''); setNewTaskTime(''); setNewTaskCategoryId('');
  };

  const toggleTaskCompletion = (task) => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
  const updateTaskCategory = (taskId, newCategoryId) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, categoryId: newCategoryId || null } : t));
  const deleteTask = (taskId) => setTasks(prev => prev.filter(t => t.id !== taskId));
  const handleAddSubtask = (taskId, subtaskTitle) => {
    if (!subtaskTitle.trim()) return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), { id: generateId(), title: subtaskTitle.trim(), completed: false }] } : t));
  };
  const toggleSubtaskCompletion = (taskId, subtaskId) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st) } : t));
  const deleteSubtask = (taskId, subtaskId) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subtasks: t.subtasks.filter(st => st.id !== subtaskId) } : t));
  const toggleExpandTask = (taskId) => setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));

  const handleTimeChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length >= 2) { let hours = parseInt(val.substring(0, 2), 10); if (hours > 23) val = '23' + val.substring(2); }
    if (val.length >= 4) { let mins = parseInt(val.substring(2, 4), 10); if (mins > 59) val = val.substring(0, 2) + '59'; }
    if (val.length > 2) setNewTaskTime(val.substring(0, 2) + ':' + val.substring(2));
    else setNewTaskTime(val);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: inputMessage.trim() }]);
    setInputMessage(''); setIsTyping(true);
    setTimeout(() => { setMessages(prev => [...prev, { role: 'assistant', text: "C'est une excellente idée ! Je vous encourage à 100% ! 🤖" }]); setIsTyping(false); }, 1000);
  };

  const filteredTasks = [...tasks].filter(t => {
    const today = new Date().toISOString().split('T')[0];
    if (currentFilter === 'today') return t.date === today;
    if (currentFilter === 'upcoming') return t.date && t.date > today;
    if (currentFilter !== 'all' && currentFilter !== 'calendar') return t.categoryId === currentFilter;
    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.date && b.date && a.date !== b.date) return a.date.localeCompare(b.date);
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });

  const getCategoryColor = (id) => categories.find(c => c.id === id)?.color || '#CBD5E1';
  const activeColor = ['all', 'today', 'upcoming', 'calendar'].includes(currentFilter) ? '#c7d2fe' : getCategoryColor(currentFilter);

  const renderMiniCalendar = () => {
    const year = pickerMonth.getFullYear(), month = pickerMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return (
      <div className="w-full sm:w-[250px]">
        <div className="flex justify-between items-center mb-4 px-1">
          <button type="button" onClick={(e) => {e.stopPropagation(); setPickerMonth(new Date(year, month - 1, 1))}} className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl"><ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4"/></button>
          <span className="font-black text-slate-800 capitalize text-base sm:text-sm">{monthNames[month]} {year}</span>
          <button type="button" onClick={(e) => {e.stopPropagation(); setPickerMonth(new Date(year, month + 1, 1))}} className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl"><ChevronRight className="w-5 h-5 sm:w-4 sm:h-4"/></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase font-black text-slate-400 mb-2">{['L','M','M','J','V','S','D'].map(d => <div key={d}>{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="h-10 sm:h-8" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === newTaskDate, isToday = dateStr === new Date().toISOString().split('T')[0];
            return (
              <button key={day} type="button" onClick={(e) => { e.stopPropagation(); setNewTaskDate(dateStr); setIsDatePickerOpen(false); }} className={`h-10 sm:h-8 w-full flex items-center justify-center rounded-xl text-sm font-bold transition-all ${isSelected ? 'bg-purple-500 text-white scale-105' : isToday ? 'bg-purple-100 text-purple-600' : 'text-slate-600 hover:bg-slate-100'}`}>{day}</button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear(), month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const days = [...Array(startOffset).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 shadow-xl shadow-indigo-100/50 border border-white max-w-6xl mx-auto flex flex-col h-[75vh]">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
          <h3 className="text-xl font-black text-slate-800 capitalize">{monthNames[month]} {year}</h3>
          <div className="flex gap-2 w-full sm:w-auto justify-between"><button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="p-2 bg-white rounded-xl shadow-sm text-slate-600"><ChevronLeft className="w-5 h-5"/></button><button onClick={() => setCalendarMonth(new Date())} className="px-4 py-2 bg-white rounded-xl shadow-sm text-sm font-bold text-slate-600">Aujourd'hui</button><button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="p-2 bg-white rounded-xl shadow-sm text-slate-600"><ChevronRight className="w-5 h-5"/></button></div>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (<div key={i} className="text-center font-bold text-slate-400 text-xs py-1">{d}</div>))}</div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1 overflow-y-auto no-scrollbar pb-4">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="bg-white/30 rounded-xl sm:rounded-2xl min-h-[60px] sm:min-h-[100px]" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.date === dateStr).sort((a,b) => (a.time || '24:00').localeCompare(b.time || '24:00'));
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            return (
              <div key={day} className={`bg-white rounded-xl sm:rounded-2xl p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] flex flex-col border-2 ${isToday ? 'border-purple-400 shadow-md' : 'border-transparent'}`}>
                <span className={`text-[10px] sm:text-sm font-bold w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full mb-1 sm:mb-2 ${isToday ? 'bg-purple-500 text-white' : 'text-slate-600'}`}>{day}</span>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">{dayTasks.map(t => { const catColor = getCategoryColor(t.categoryId); return (<div key={t.id} className={`text-[8px] sm:text-[11px] px-1 sm:px-2 py-0.5 rounded font-bold truncate ${t.completed ? 'opacity-40 line-through' : ''}`} style={{ backgroundColor: catColor + '33', color: catColor === '#CBD5E1' ? '#475569' : catColor }}>{t.title}</div>); })}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans flex flex-col overflow-hidden selection:bg-purple-200 transition-all duration-1000 ease-in-out" style={{ background: `radial-gradient(circle at top left, rgba(255,255,255,0.95) 0%, ${activeColor}20 100%)`, backgroundColor: '#f8fafc' }}>
      <style>{`
        @keyframes hoverBot { 0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); } 25% { transform: translateY(-12px) translateX(-6px) rotate(-3deg); } 50% { transform: translateY(-4px) translateX(-16px) rotate(2deg); } 75% { transform: translateY(-16px) translateX(-4px) rotate(-2deg); } }
        @keyframes armWave { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes forearmWave { 0%, 100% { transform: rotate(-25deg); } 50% { transform: rotate(25deg); } }
        @keyframes pincerLeftOpen { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-25deg); } }
        @keyframes pincerRightOpen { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(25deg); } }
        .bot-animate { animation: hoverBot 6s ease-in-out infinite; }
        .arm-animate { animation: armWave 2.5s ease-in-out infinite; }
        .forearm-animate { animation: forearmWave 2.5s ease-in-out infinite; }
        .pincer-left { animation: pincerLeftOpen 2.5s ease-in-out infinite; }
        .pincer-right { animation: pincerRightOpen 2.5s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <header className="px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 bg-white/40 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-2 sm:gap-3 text-purple-600"><EmethHead className="w-10 h-10 sm:w-14 sm:h-14 drop-shadow-sm" /><h1 className="text-xl sm:text-2xl font-black tracking-tight hidden sm:block">Flow</h1></div>
        <div className="text-right">
          <h2 className="text-lg sm:text-2xl font-black text-slate-800">{currentFilter === 'all' && 'Toutes les tâches'}{currentFilter === 'today' && "Aujourd'hui"}{currentFilter === 'upcoming' && 'À venir'}{currentFilter === 'calendar' && 'Calendrier'}{categories.find(c => c.id === currentFilter)?.name}</h2>
          {currentFilter !== 'calendar' && <p className="text-xs sm:text-sm text-slate-500 font-bold">{filteredTasks.filter(t => !t.completed).length} tâche(s) restante(s)</p>}
        </div>
      </header>

      <nav className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 overflow-x-auto no-scrollbar bg-white/30 backdrop-blur-md border-b border-white/50 shadow-sm shrink-0 relative z-10">
        <button onClick={() => setCurrentFilter('all')} className={`px-4 py-2 sm:py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap flex items-center gap-2 shrink-0 ${currentFilter === 'all' ? 'bg-slate-800 text-white shadow-lg scale-105' : 'bg-white/80 text-slate-600 hover:bg-white hover:shadow-sm'}`}><List className="w-4 h-4"/> Toutes</button>
        {categories.map(cat => (
          <div key={cat.id} className="relative group shrink-0">
            <button onClick={() => setCurrentFilter(cat.id)} style={{ backgroundColor: currentFilter === cat.id ? cat.color : `${cat.color}15`, color: currentFilter === cat.id ? '#ffffff' : cat.color, borderColor: currentFilter === cat.id ? 'transparent' : cat.color }} className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-sm border-2 whitespace-nowrap flex items-center gap-2 ${currentFilter === cat.id ? 'shadow-xl scale-105' : 'hover:scale-105'}`}>{cat.name}</button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 shadow-md z-10 hover:bg-red-600 hover:scale-110"><Trash className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 sm:py-2.5 rounded-2xl text-sm font-bold border-2 border-dashed border-slate-300 text-slate-400 hover:text-purple-500 shrink-0 flex items-center gap-2"><Plus className="w-4 h-4" /> Catégorie</button>
        <div className="w-px h-8 bg-slate-300/50 mx-1 shrink-0" />
        <button onClick={() => setCurrentFilter('today')} className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 ${currentFilter === 'today' ? 'bg-blue-500 text-white shadow-md scale-105' : 'bg-white/60 text-slate-500 hover:bg-white'}`}><Clock className="w-3.5 h-3.5"/> Aujourd'hui</button>
        <button onClick={() => setCurrentFilter('upcoming')} className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 ${currentFilter === 'upcoming' ? 'bg-orange-500 text-white shadow-md scale-105' : 'bg-white/60 text-slate-500 hover:bg-white'}`}><Calendar className="w-3.5 h-3.5"/> À venir</button>
        <button onClick={() => setCurrentFilter('calendar')} className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 ${currentFilter === 'calendar' ? 'bg-purple-500 text-white shadow-md scale-105' : 'bg-white/60 text-slate-500 hover:bg-white'}`}><Calendar className="w-3.5 h-3.5"/> Calendrier</button>
      </nav>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pt-4 pb-32 space-y-4 relative z-0">
        {currentFilter === 'calendar' ? renderCalendar() : (
          <>
            <form onSubmit={handleCreateTask} className="bg-white/90 backdrop-blur-xl rounded-[1.5rem] lg:rounded-[2rem] p-2 shadow-xl shadow-indigo-100/50 border border-white flex flex-col md:flex-row items-center gap-2 max-w-5xl mx-auto relative z-20 box-border">
              <input type="text" placeholder="Que voulez-vous accomplir ?" className="flex-1 w-full bg-transparent border-none outline-none px-4 py-2 sm:py-3 text-slate-700 placeholder:text-slate-400 font-bold text-base sm:text-lg min-w-[50px]" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
              <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-1.5 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar">
                <div className="relative shrink-0">
                  <button type="button" onClick={() => setIsDatePickerOpen(true)} className="flex items-center justify-center bg-slate-50/80 hover:bg-white border border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 transition-all"><Calendar className="w-4 h-4 text-slate-400 shrink-0 sm:mr-2" /><span className={`text-xs sm:text-sm font-bold truncate hidden sm:block ${newTaskDate ? 'text-slate-700' : 'text-slate-400'}`}>{newTaskDate ? new Date(newTaskDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'Date'}</span></button>
                  {isDatePickerOpen && (<><div className="fixed inset-0 z-[60]" onClick={() => setIsDatePickerOpen(false)} /><div className="absolute top-full mt-3 right-0 sm:left-1/2 sm:-translate-x-1/2 p-4 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[70] w-auto">{renderMiniCalendar()}</div></>)}
                </div>
                <div className="flex items-center bg-slate-50/80 hover:bg-white border border-slate-200 rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2.5 w-[80px] sm:w-[100px] shrink-0 focus-within:ring-2 focus-within:ring-purple-400 transition-all"><Clock className="w-4 h-4 text-slate-400 shrink-0 mr-1 sm:mr-2" /><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="12:00" maxLength="5" className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-bold text-slate-600 outline-none text-center sm:text-left" value={newTaskTime} onChange={handleTimeChange} /></div>
                <select className="bg-slate-50/80 hover:bg-white border border-slate-200 rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-bold outline-none w-[90px] sm:w-[130px] shrink-0 truncate cursor-pointer transition-all" value={newTaskCategoryId} onChange={(e) => setNewTaskCategoryId(e.target.value)} style={{ color: newTaskCategoryId ? getCategoryColor(newTaskCategoryId) : '#64748B' }}><option value="" style={{color: '#64748B'}}>Général</option>{categories.map(c => <option key={c.id} value={c.id} style={{color: c.color}}>{c.name}</option>)}</select>
                <button type="submit" disabled={!newTaskTitle.trim()} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-full shadow-md disabled:opacity-50 flex items-center justify-center shrink-0 hover:scale-105 ml-1"><Plus className="w-5 h-5" /></button>
              </div>
            </form>

            <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto relative z-10 mt-6">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16 sm:py-20 text-slate-400"><div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 drop-shadow-md"><RoboticArm className="w-full h-full text-purple-400" /></div><p className="text-lg sm:text-xl font-bold text-slate-500 mb-1">C'est bien calme par ici.</p><p className="text-xs sm:text-sm">Ajoutez une tâche pour commencer !</p></div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} className={`bg-white/90 backdrop-blur-md rounded-[1.5rem] sm:rounded-[2rem] border border-white shadow-lg transition-all duration-300 ${task.completed ? 'opacity-60 shadow-none' : 'shadow-slate-200/50 hover:shadow-xl'}`}>
                    <div className="p-4 flex items-start gap-3 sm:gap-4">
                      <button onClick={() => toggleTaskCompletion(task)} className={`mt-0.5 sm:mt-1 rounded-full flex-shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-slate-300 hover:text-purple-400'}`}>{task.completed ? <Check className="w-6 h-6 sm:w-7 sm:h-7" /> : <Circle className="w-6 h-6 sm:w-7 sm:h-7" />}</button>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                          <h3 className={`text-base sm:text-lg font-bold truncate transition-all ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.title}</h3>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
                            {task.date && <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl"><Calendar className="w-3 h-3" />{new Date(task.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}{task.time && <span className="ml-1 text-purple-500 border-l border-slate-300 pl-1">{task.time}</span>}</span>}
                            <div className="relative flex items-center group/cat hover:scale-105 transition-transform shrink-0"><Tag className={`w-3 h-3 absolute left-2 pointer-events-none z-10 ${task.categoryId ? 'text-white' : 'text-slate-500'}`} /><select value={task.categoryId || ""} onChange={(e) => updateTaskCategory(task.id, e.target.value)} className={`appearance-none pl-6 pr-6 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold w-[90px] sm:w-[110px] truncate transition-all cursor-pointer outline-none focus:ring-2 focus:ring-purple-400 ${task.categoryId ? 'text-white' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`} style={task.categoryId ? { backgroundColor: getCategoryColor(task.categoryId) } : {}}><option value="">Général</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><ChevronDown className={`w-3 h-3 absolute right-1.5 pointer-events-none z-10 opacity-0 group-hover/cat:opacity-100 ${task.categoryId ? 'text-white' : 'text-slate-400'}`} /></div>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-3 flex items-center justify-between">
                          <button onClick={() => toggleExpandTask(task.id)} className="flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-400 hover:text-purple-500 transition-colors bg-slate-50 px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl"><List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{(task.subtasks || []).length} sous-missions{expandedTasks[task.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</button>
                          <button onClick={() => deleteTask(task.id)} className="text-slate-300 p-1.5 rounded-full hover:text-red-500 hover:bg-red-50 transition-colors"><Trash className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                    {expandedTasks[task.id] && (
                      <div className="px-4 pb-4 pt-1 border-t border-slate-100/50 bg-slate-50/50 rounded-b-[1.5rem] sm:rounded-b-[2rem]">
                        <div className="space-y-2 mb-3 pl-9 sm:pl-11 mt-2">
                          {(task.subtasks || []).map(sub => (
                            <div key={sub.id} className="flex items-center gap-2 sm:gap-3 group"><button onClick={() => toggleSubtaskCompletion(task.id, sub.id)} className={`transition-colors ${sub.completed ? 'text-green-500' : 'text-slate-300 hover:text-purple-400'}`}>{sub.completed ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Circle className="w-4 h-4 sm:w-5 sm:h-5" />}</button><span className={`text-xs sm:text-sm flex-1 ${sub.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>{sub.title}</span><button onClick={() => deleteSubtask(task.id, sub.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-all"><X className="w-3.5 h-3.5" /></button></div>
                          ))}
                        </div>
                        <div className="pl-9 sm:pl-11 flex items-center gap-2"><Plus className="w-3.5 h-3.5 text-slate-400" /><input type="text" placeholder="Ajouter une étape..." className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(task.id, e.target.value); e.target.value = ''; } }} /></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* --- ROBOT FLOTTANT & SIDEBAR --- */}
      {!isAssistantOpen && (
        <button onClick={() => setIsAssistantOpen(true)} className="fixed bottom-6 right-4 sm:right-6 lg:bottom-10 lg:right-10 z-30 group bot-animate cursor-pointer focus:outline-none"><div className="relative"><div className="absolute bottom-full right-1/2 mb-3 bg-white text-slate-700 font-bold px-4 py-2 rounded-2xl rounded-br-sm shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none text-sm border border-slate-100">Je m'appelle Emeth, besoin d'aide ? 🤖</div><EmethHead className="drop-shadow-2xl w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] hover:scale-110 transition-transform duration-300" /></div></button>
      )}

      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white sm:bg-white/95 sm:backdrop-blur-3xl shadow-2xl transform transition-transform duration-500 flex flex-col ${isAssistantOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50"><div className="flex items-center gap-3"><EmethHead className="w-9 h-9" /><div><h3 className="font-black text-slate-800 text-base sm:text-lg">Emeth</h3><p className="text-[10px] sm:text-xs text-purple-600 font-bold">Votre assistant</p></div></div><button onClick={() => setIsAssistantOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 shadow-sm transition-transform hover:scale-110"><X className="w-5 h-5" /></button></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => (<div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'}`}>{msg.text}</div></div>))}
          {isTyping && <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-100 flex items-center gap-2"><Loader className="w-4 h-4 animate-spin text-purple-400" /></div></div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 pb-safe">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-100/80 p-1.5 sm:p-2 rounded-full border border-slate-200 focus-within:border-purple-300 focus-within:bg-white transition-all"><input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Demandez-moi un conseil !" className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-slate-700" /><button type="submit" disabled={!inputMessage.trim() || isTyping} className="p-2 sm:p-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full disabled:opacity-50 transition-all shadow-sm"><Send className="w-4 h-4 ml-0.5" /></button></form>
        </div>
      </div>

      {/* --- MODAL CATEGORIE --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4"><div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)} /><div className="relative bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl transform transition-all"><button onClick={() => setIsCategoryModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button><div className="flex items-center gap-3 mb-6"><div className="bg-purple-100 p-2.5 rounded-xl text-purple-600"><Palette className="w-5 h-5" /></div><h2 className="text-xl font-black text-slate-800">Catégorie</h2></div><form onSubmit={handleCreateCategory} className="space-y-5"><div><label className="block text-sm font-bold text-slate-600 mb-2">Nom</label><input type="text" autoFocus placeholder="Ex: Perso, Pro..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} /></div><div><label className="block text-sm font-bold text-slate-600 mb-2">Couleur</label><div className="flex flex-wrap gap-2 sm:gap-3">{CATEGORY_COLORS.map(color => <button key={color} type="button" onClick={() => setNewCategoryColor(color)} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all shadow-sm ${newCategoryColor === color ? 'scale-125 ring-4 ring-offset-2 ring-purple-200' : 'hover:scale-110'}`} style={{ backgroundColor: color }} />)}</div></div><button type="submit" disabled={!newCategoryName.trim()} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl mt-2 transition-all disabled:opacity-50 shadow-lg">Créer</button></form></div></div>
      )}
    </div>
  );
}