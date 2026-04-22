import React, { useState, useEffect, useRef } from 'react';
import {
  Check, Circle, Plus, Trash, Calendar, List, Tag,
  X, ChevronDown, ChevronUp, Palette, AlertCircle,
  Send, Clock, ChevronLeft, ChevronRight, LogOut, Settings, User
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, onAuthStateChanged, updateProfile, updateEmail, updatePassword,
  setPersistence, browserLocalPersistence 
} from 'firebase/auth';
import {
  getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc
} from 'firebase/firestore';

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBXO7p0Mx2ApGxhJ6SEBbQJ1C4eNaxqVxE",
  authDomain: "flow-9e70c.firebaseapp.com",
  projectId: "flow-9e70c",
  storageBucket: "flow-9e70c.firebasestorage.app",
  messagingSenderId: "477448412331",
  appId: "1:477448412331:web:e652b99377a64d68276bee",
  measurementId: "G-N886HYXHBJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- COULEURS ---
const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', 
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', 
  '#D946EF', '#EC4899', 
];

const hexToRgba = (hex, alpha) => {
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.slice(0, 2), 16) || 0;
  const g = parseInt(c.slice(2, 4), 16) || 0;
  const b = parseInt(c.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const EmethHead = ({ className }) => (
  <svg viewBox="0 0 140 140" className={className}>
    <circle cx="70" cy="70" r="70" fill="#E9D5FF" />
    <g transform="translate(20, 20)">
      <rect x="2" y="50" width="10" height="22" rx="5" fill="#7C3AED" />
      <rect x="88" y="50" width="10" height="22" rx="5" fill="#7C3AED" />
      <path d="M40 32 L60 32" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" />
      <path d="M50 32 L50 12" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" />
      <circle cx="50" cy="9" r="7" fill="#FFB86C" />
      <rect x="12" y="32" width="76" height="58" rx="20" fill="#8B5CF6" />
      <rect x="21" y="42" width="58" height="32" rx="10" fill="#1E293B" />
      <path d="M 24 48 Q 50 42 76 48" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.2" fill="none" strokeLinecap="round" />
      <path d="M33 57 Q 38 50 43 57" stroke="#34D399" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M57 57 Q 62 50 67 57" stroke="#34D399" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="28" cy="65" r="4" fill="#FFB86C" fillOpacity="0.6" />
      <circle cx="72" cy="65" r="4" fill="#FFB86C" fillOpacity="0.6" />
    </g>
  </svg>
);

const RoboticArm = ({ className }) => (
  <svg viewBox="0 0 160 160" className={className}>
    <path d="M 55 150 L 105 150 L 95 135 L 65 135 Z" fill="#CBD5E1" />
    <circle cx="80" cy="135" r="18" fill="#7C3AED" />
    <circle cx="80" cy="135" r="8" fill="#1E293B" fillOpacity="0.3" />
    <g style={{ transformOrigin: '80px 135px' }} className="arm-animate">
      <rect x="62" y="75" width="36" height="60" rx="18" fill="#8B5CF6" />
      <circle cx="80" cy="120" r="4" fill="#E9D5FF" />
      <g style={{ transformOrigin: '80px 75px' }} className="forearm-animate">
        <g style={{ transformOrigin: '72px 38px' }} className="pincer-left">
          <path d="M 72 38 Q 62 20 72 10" fill="none" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
          <circle cx="72" cy="10" r="5" fill="#CBD5E1" />
        </g>
        <g style={{ transformOrigin: '88px 38px' }} className="pincer-right">
          <path d="M 88 38 Q 98 20 88 10" fill="none" stroke="#1E293B" strokeWidth="10" strokeLinecap="round" />
          <circle cx="88" cy="10" r="5" fill="#CBD5E1" />
        </g>
        <rect x="65" y="35" width="30" height="40" rx="15" fill="#E9D5FF" />
        <circle cx="80" cy="75" r="16" fill="#7C3AED" />
        <circle cx="80" cy="75" r="6" fill="#FFB86C" />
      </g>
    </g>
  </svg>
);

const isTaskOverdue = (dateStr, timeStr) => {
  if (!dateStr) return false; 
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  if (dateStr < todayStr) return true; 
  if (dateStr === todayStr && timeStr) {
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    if (timeStr < currentTimeStr) return true; 
  }
  return false;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userName, setUserName] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');
  
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  
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

  // MESSAGES INTRODUCTIFS D'EMETH HORS-LIGNE
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Coucou ! 👋 Je suis Emeth. Je suis maintenant équipé d'un moteur d'analyse ultra-rapide 100% hors-ligne." },
    { role: 'assistant', text: "Dites-moi par exemple : 'Planifie un footing demain à 18h30 dans la catégorie Sport' !" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (categories.find(c => c.id === currentFilter)) {
      setNewTaskCategoryId(currentFilter);
    } else {
      setNewTaskCategoryId('');
    }
  }, [currentFilter, categories]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserName(currentUser.displayName || '');
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: email.split('@')[0] });
        setUserName(email.split('@')[0]);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setAuthError("Erreur : Vérifiez vos identifiants ou le format du mot de passe (6 caractères min).");
    }
  };

  const openSettings = () => {
    setSettingsName(user.displayName || '');
    setSettingsEmail(user.email || '');
    setSettingsPassword('');
    setSettingsMessage('');
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsMessage('');
    try {
      if (settingsName !== user.displayName) {
        await updateProfile(user, { displayName: settingsName });
        setUserName(settingsName);
      }
      if (settingsEmail && settingsEmail !== user.email) {
        await updateEmail(user, settingsEmail);
      }
      if (settingsPassword) {
        await updatePassword(user, settingsPassword);
      }
      setSettingsMessage("✅ Réglages sauvegardés avec succès !");
      setTimeout(() => setIsSettingsOpen(false), 1500);
    } catch (err) {
      setSettingsMessage("❌ Erreur de sauvegarde. Déconnectez-vous et réessayez.");
    }
  };

  useEffect(() => {
    if (!user) return;
    const categoriesRef = collection(db, 'users', user.uid, 'categories');
    const unsubCategories = onSnapshot(categoriesRef, (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Erreur categories:", err));

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const unsubTasks = onSnapshot(tasksRef, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => console.error("Erreur tasks:", err));

    return () => { unsubCategories(); unsubTasks(); };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !user) return;
    
    const catName = newCategoryName.trim();
    const catColor = newCategoryColor;

    setIsCategoryModalOpen(false); 
    setNewCategoryName('');
    setNewCategoryColor(CATEGORY_COLORS[0]);

    try {
      await addDoc(collection(db, 'users', user.uid, 'categories'), {
        name: catName,
        color: catColor,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      alert("❌ Impossible de créer la catégorie.\nErreur technique : " + err.message);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'categories', categoryId));
    if (currentFilter === categoryId) setCurrentFilter('all');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    const title = newTaskTitle.trim();
    const date = newTaskDate;
    const time = newTaskTime;
    const catId = newTaskCategoryId;

    setNewTaskTitle(''); 
    setNewTaskDate(''); 
    setNewTaskTime(''); 
    if (!categories.find(c => c.id === currentFilter)) {
      setNewTaskCategoryId('');
    }

    try {
      await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        title: title,
        date: date || null,
        time: time || null,
        categoryId: catId || null,
        completed: false,
        subtasks: [],
        createdAt: new Date().toISOString()
      });
    } catch(err) {
      alert("❌ Impossible de créer la tâche.\nErreur technique : " + err.message);
    }
  };

  const toggleTaskCompletion = async (task) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), { completed: !task.completed });
  };

  const updateTaskCategory = async (taskId, newCategoryId) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), { categoryId: newCategoryId || null });
  };

  const deleteTask = async (taskId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'tasks', taskId));
  };

  const handleAddSubtask = async (taskId, subtaskTitle) => {
    if (!subtaskTitle.trim() || !user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), {
      subtasks: [...(task.subtasks || []), { id: crypto.randomUUID(), title: subtaskTitle.trim(), completed: false }]
    });
  };

  const toggleSubtaskCompletion = async (taskId, subtaskId) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedSubtasks = task.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);

    await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), { 
      subtasks: updatedSubtasks,
      ...(allCompleted && { completed: true }) 
    });
  };

  const deleteSubtask = async (taskId, subtaskId) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await updateDoc(doc(db, 'users', user.uid, 'tasks', taskId), {
      subtasks: task.subtasks.filter(st => st.id !== subtaskId)
    });
  };

  const toggleExpandTask = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleTimeChange = (e) => {
    let val = e.target.value.replace(/[^0-9:]/g, '');
    if (val.length > 5) val = val.substring(0, 5);
    setNewTaskTime(val);
  };

  const formatTimeOnBlur = () => {
    if (!newTaskTime) return;
    let digits = newTaskTime.replace(/[^0-9]/g, ''); 
    if (digits.length === 1 || digits.length === 2) {
      let h = parseInt(digits, 10);
      if (h >= 0 && h <= 23) {
        setNewTaskTime(String(h).padStart(2, '0') + ':00');
      } else {
        setNewTaskTime(''); 
      }
    } else if (digits.length === 3) {
      let h = parseInt(digits.substring(0, 1), 10);
      let m = parseInt(digits.substring(1, 3), 10);
      if (m > 59) m = 59;
      setNewTaskTime('0' + h + ':' + String(m).padStart(2, '0'));
    } else if (digits.length >= 4) {
      let h = parseInt(digits.substring(0, 2), 10);
      let m = parseInt(digits.substring(2, 4), 10);
      if (h > 23) h = 23;
      if (m > 59) m = 59;
      setNewTaskTime(String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'));
    }
  };

  // --- LE NOUVEAU PARSER LOCAL (ZÉRO IA, ZÉRO BUG) ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const userText = inputMessage.trim();
    setInputMessage('');
    
    // Ajout du message utilisateur
    setMessages(prev => [...prev, { role: 'user', text: userText }]);

    // Variables pour capturer les données
    let detectedDate = null;
    let detectedTime = null;
    let detectedCatId = null;
    let cleanTitle = userText;
    const textLower = userText.toLowerCase();

    // 1. Parsing de la Date
    const today = new Date();
    if (textLower.includes("aujourd'hui") || textLower.includes("auj")) {
      detectedDate = today.toISOString().split('T')[0];
      cleanTitle = cleanTitle.replace(/aujourd'hui|auj/gi, '');
    } else if (textLower.includes("demain")) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      detectedDate = tomorrow.toISOString().split('T')[0];
      cleanTitle = cleanTitle.replace(/demain/gi, '');
    }

    // 2. Parsing de l'Heure (ex: 14h30, 14:30, 14h, midi)
    const timeRegex = /(?:à\s)?(\d{1,2})h(\d{2})?|(\d{1,2}):(\d{2})/i;
    const timeMatch = cleanTitle.match(timeRegex);
    if (timeMatch) {
      let h = timeMatch[1] || timeMatch[3];
      let m = timeMatch[2] || timeMatch[4] || '00';
      detectedTime = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
      cleanTitle = cleanTitle.replace(timeMatch[0], ''); // Retire l'heure du titre
    } else if (textLower.includes("midi")) {
      detectedTime = "12:00";
      cleanTitle = cleanTitle.replace(/midi/gi, '');
    } else if (textLower.includes("minuit")) {
      detectedTime = "00:00";
      cleanTitle = cleanTitle.replace(/minuit/gi, '');
    }

    // 3. Parsing de la Catégorie
    categories.forEach(cat => {
      // On cherche si le nom de la catégorie est dans le texte
      if (textLower.includes(cat.name.toLowerCase())) {
        detectedCatId = cat.id;
        // On retire le nom de la catégorie ou "dans (catégorie)" du titre
        const catRegex = new RegExp(`(?:dans la catégorie |dans )?${cat.name}`, 'gi');
        cleanTitle = cleanTitle.replace(catRegex, '');
      }
    });

    // 4. Nettoyage du titre final
    // Retire les mots d'ordre inutiles
    cleanTitle = cleanTitle.replace(/^(planifie|ajoute|crée|créer|rappelle-moi de|nouveau|nouvelle)\s(un|une|des)?\s?/i, '');
    // Retire la ponctuation parasite et les espaces en trop
    cleanTitle = cleanTitle.replace(/^[\s,:-]+|[\s,:-]+$/g, '').trim();
    
    // Majuscule au début
    if (cleanTitle.length > 0) {
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    } else {
      cleanTitle = "Nouvelle tâche";
    }

    // 5. Création de la tâche dans Firebase
    try {
      await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        title: cleanTitle,
        date: detectedDate,
        time: detectedTime,
        categoryId: detectedCatId,
        completed: false,
        subtasks: [],
        createdAt: new Date().toISOString()
      });

      // Réponse de succès d'Emeth
      let reply = `C'est noté ! J'ai ajouté "${cleanTitle}"`;
      if (detectedDate || detectedTime) {
        reply += ` pour ${detectedDate ? (detectedDate === today.toISOString().split('T')[0] ? "aujourd'hui" : "demain") : ""} ${detectedTime ? 'à '+detectedTime : ''}`;
      }
      reply += " 🚀";
      
      setMessages(prev => [...prev, { role: 'assistant', text: reply.replace(/\s+/g, ' ') }]);

    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Oups, je n'ai pas réussi à l'enregistrer dans votre base de données. 😕" }]);
    }
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    const today = new Date().toISOString().split('T')[0];
    
    if (currentFilter === 'today') filtered = filtered.filter(t => t.date === today);
    else if (currentFilter === 'upcoming') filtered = filtered.filter(t => t.date && t.date > today);
    else if (currentFilter !== 'all' && currentFilter !== 'calendar') filtered = filtered.filter(t => t.categoryId === currentFilter);

    filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const dateA = a.date || "9999-12-31";
      const dateB = b.date || "9999-12-31";
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      const timeA = a.time || "23:59";
      const timeB = b.time || "23:59";
      if (timeA !== timeB) return timeA.localeCompare(timeB);
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
    
    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const getCategoryColor = (categoryId) => categories.find(c => c.id === categoryId)?.color || '#CBD5E1'; 
  const activeColor = ['all', 'today', 'upcoming', 'calendar'].includes(currentFilter) ? '#c7d2fe' : getCategoryColor(currentFilter);

  if (loadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
      {/* On utilise un SVG direct au lieu du Loader lucide qui tournait mal parfois */}
      <svg className="animate-spin h-12 w-12 text-[#8B5CF6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm w-full text-center border border-white">
          <EmethHead className="w-20 h-20 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">Flow</h2>
          <p className="text-slate-500 mb-6 text-sm font-medium">Connectez-vous pour synchroniser vos tâches partout.</p>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" placeholder="Votre Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF] transition-all" required />
            <input type="password" placeholder="Mot de passe (6 carac. min)" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF] transition-all" required />
            
            {authError && <p className="text-red-500 text-xs font-bold mt-2">{authError}</p>}
            <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all shadow-md mt-4">
              {isRegistering ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>
          <button onClick={() => {setIsRegistering(!isRegistering); setAuthError('');}} className="mt-5 text-xs font-bold text-slate-400 hover:text-[#8B5CF6] transition-colors">
            {isRegistering ? "Déjà un compte ? Connectez-vous" : "Pas de compte ? Créez-en un"}
          </button>
        </div>
      </div>
    );
  }

  const renderMiniCalendar = () => {
    const year = pickerMonth.getFullYear(); const month = pickerMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return (
      <div className="w-full sm:w-[250px]">
        <div className="flex justify-between items-center mb-4 px-1">
          <button type="button" onClick={(e) => {e.stopPropagation(); setPickerMonth(new Date(year, month - 1, 1))}} className="p-2 hover:bg-[#E9D5FF]/40 active:scale-95 text-slate-500 rounded-xl transition-transform"><ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4"/></button>
          <span className="font-black text-slate-800 capitalize text-base sm:text-sm">{monthNames[month]} {year}</span>
          <button type="button" onClick={(e) => {e.stopPropagation(); setPickerMonth(new Date(year, month + 1, 1))}} className="p-2 hover:bg-[#E9D5FF]/40 active:scale-95 text-slate-500 rounded-xl transition-transform"><ChevronRight className="w-5 h-5 sm:w-4 sm:h-4"/></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-[10px] uppercase font-black text-slate-400 mb-2">
          {['L','M','M','J','V','S','D'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="h-10 sm:h-8" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = dateStr === newTaskDate;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            return (
              <button key={day} type="button" onClick={(e) => { e.stopPropagation(); setNewTaskDate(dateStr); setIsDatePickerOpen(false); }} className={`h-10 sm:h-8 w-full flex items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-95 ${isSelected ? 'bg-[#8B5CF6] text-white shadow-md scale-105' : isToday ? 'bg-[#E9D5FF]/60 text-[#8B5CF6]' : 'text-slate-600 hover:bg-[#E9D5FF]/40'}`}>
                {day}
              </button>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={(e) => {e.stopPropagation(); setNewTaskDate(''); setIsDatePickerOpen(false)}} className="flex-1 text-sm sm:text-xs font-bold text-slate-400 py-2.5 sm:py-2 bg-slate-50 rounded-xl hover:bg-[#E9D5FF]/40 active:scale-95 transition-all">Effacer</button>
          <button type="button" onClick={(e) => {e.stopPropagation(); setNewTaskDate(new Date().toISOString().split('T')[0]); setIsDatePickerOpen(false)}} className="flex-1 text-sm sm:text-xs font-bold text-[#8B5CF6] py-2.5 sm:py-2 bg-[#E9D5FF]/30 rounded-xl hover:bg-[#E9D5FF]/60 active:scale-95 transition-all">Aujourd'hui</button>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear(); const month = calendarMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-4 sm:p-6 shadow-xl shadow-indigo-100/50 border border-white max-w-6xl mx-auto flex flex-col h-[75vh]">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 capitalize">{monthNames[month]} {year}</h3>
          <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="p-2 bg-white rounded-xl shadow-sm text-slate-600 hover:bg-[#E9D5FF]/40 active:scale-95 transition-all"><ChevronLeft className="w-5 h-5"/></button>
            <button onClick={() => setCalendarMonth(new Date())} className="px-4 py-2 flex-1 sm:flex-none bg-white rounded-xl shadow-sm text-sm font-bold text-slate-600 hover:bg-[#E9D5FF]/40 active:scale-95 transition-all">Aujourd'hui</button>
            <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="p-2 bg-white rounded-xl shadow-sm text-slate-600 hover:bg-[#E9D5FF]/40 active:scale-95 transition-all"><ChevronRight className="w-5 h-5"/></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-center font-bold text-slate-400 text-[10px] sm:text-sm py-1 sm:py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1 overflow-y-auto no-scrollbar pb-4">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="bg-white/30 rounded-xl sm:rounded-2xl min-h-[60px] sm:min-h-[100px]" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.date === dateStr).sort((a,b) => (a.time || '24:00').localeCompare(b.time || '24:00'));
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <div key={day} className={`bg-white rounded-xl sm:rounded-2xl p-1 sm:p-2 min-h-[60px] sm:min-h-[100px] flex flex-col border-2 transition-all ${isToday ? 'border-[#8B5CF6] shadow-md' : 'border-transparent hover:border-[#E9D5FF]'}`}>
                <span className={`text-[10px] sm:text-sm font-bold w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full mb-1 sm:mb-2 ${isToday ? 'bg-[#8B5CF6] text-white' : 'text-slate-600'}`}>{day}</span>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1">
                  {dayTasks.map(t => {
                    const catColor = getCategoryColor(t.categoryId);
                    return (
                      <div key={t.id} className={`text-[8px] sm:text-[11px] px-1 sm:px-2 py-0.5 sm:py-1 rounded font-bold truncate ${t.completed ? 'opacity-40 line-through' : ''}`} style={{ backgroundColor: catColor + '33', color: catColor === '#CBD5E1' ? '#475569' : catColor }}>
                        {t.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen font-sans flex flex-col overflow-hidden selection:bg-[#E9D5FF] transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: '#ffffff', backgroundImage: `linear-gradient(135deg, #ffffff 0%, ${hexToRgba(activeColor, 0.20)} 100%)` }}
    >
      <style>{`
        @keyframes hoverBot { 0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); } 25% { transform: translateY(-12px) translateX(-6px) rotate(-3deg); } 50% { transform: translateY(-4px) translateX(-16px) rotate(2deg); } 75% { transform: translateY(-16px) translateX(-4px) rotate(-2deg); } }
        @keyframes armWave { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        @keyframes forearmWave { 0%, 100% { transform: rotate(-25deg); } 50% { transform: rotate(25deg); } }
        @keyframes pincerLeftOpen { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-25deg); } }
        @keyframes pincerRightOpen { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(25deg); } }
        
        /* EFFET DE FLOTTEMENT DOUX POUR LE RETARD */
        @keyframes gentleFloat { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-3px); } }
        .animate-gentle-float { animation: gentleFloat 3.5s ease-in-out infinite; }
        
        .bot-animate { animation: hoverBot 6s ease-in-out infinite; }
        .arm-animate { animation: armWave 2.5s ease-in-out infinite; }
        .forearm-animate { animation: forearmWave 2.5s ease-in-out infinite; }
        .pincer-left { animation: pincerLeftOpen 2.5s ease-in-out infinite; }
        .pincer-right { animation: pincerRightOpen 2.5s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- HEADER --- */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 bg-white/40 backdrop-blur-md z-10 relative">
        <div className="flex items-center gap-2 sm:gap-3 text-[#8B5CF6]">
          <div className="flex items-center justify-center rounded-full drop-shadow-sm">
            <EmethHead className="w-10 h-10 sm:w-14 sm:h-14" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 hidden sm:block">Flow</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <h2 className="text-lg sm:text-2xl font-black text-slate-800">
              {currentFilter === 'all' && 'Toutes les tâches'}
              {currentFilter === 'today' && "Aujourd'hui"}
              {currentFilter === 'upcoming' && 'À venir'}
              {currentFilter === 'calendar' && 'Calendrier'}
              {categories.find(c => c.id === currentFilter)?.name}
            </h2>
            {currentFilter !== 'calendar' && (
              <p className="text-xs sm:text-sm text-slate-500 font-bold">
                {filteredTasks.filter(t => !t.completed).length} tâche(s) restante(s)
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => openSettings()} className="w-10 h-10 bg-white hover:bg-[#E9D5FF]/40 border border-slate-200 text-slate-400 hover:text-[#8B5CF6] active:scale-95 rounded-full flex items-center justify-center transition-all shadow-sm" title="Réglages">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={() => signOut(auth)} className="w-10 h-10 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-500 active:scale-95 rounded-full flex items-center justify-center transition-all shadow-sm" title="Se déconnecter">
              <LogOut className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* --- NAVIGATION --- */}
      <nav className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 overflow-x-auto no-scrollbar bg-white/30 backdrop-blur-md border-b border-white/50 shadow-sm shrink-0 relative z-10">
        <button onClick={() => setCurrentFilter('all')} className={`px-4 py-2 sm:py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-2 shrink-0 ${currentFilter === 'all' ? 'bg-slate-800 text-white shadow-lg scale-105' : 'bg-white/80 text-slate-600 hover:bg-white hover:shadow-sm'}`}>
          <List className="w-4 h-4"/> Toutes
        </button>

        {categories.map(cat => (
          <div key={cat.id} className="relative group shrink-0">
            <button onClick={() => setCurrentFilter(cat.id)} style={{ backgroundColor: currentFilter === cat.id ? cat.color : `${cat.color}15`, color: currentFilter === cat.id ? '#ffffff' : cat.color, borderColor: currentFilter === cat.id ? 'transparent' : cat.color }} className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-sm border-2 whitespace-nowrap transition-all active:scale-95 duration-300 flex items-center gap-2 ${currentFilter === cat.id ? 'shadow-xl scale-105' : 'hover:scale-105'}`}>
              {cat.name}
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10 hover:bg-red-600 active:scale-95"><Trash className="w-3.5 h-3.5" /></button>
          </div>
        ))}

        <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 sm:py-2.5 rounded-2xl text-sm font-bold border-2 border-dashed border-slate-300 text-slate-400 hover:text-[#8B5CF6] hover:border-[#E9D5FF] hover:bg-[#E9D5FF]/20 active:scale-95 shrink-0 flex items-center gap-2 transition-all"><Plus className="w-4 h-4" /> Catégorie</button>
        <div className="w-px h-8 bg-slate-300/50 mx-1 sm:mx-2 shrink-0" />
        
        <button onClick={() => setCurrentFilter('today')} className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${currentFilter === 'today' ? 'bg-[#8B5CF6] text-white shadow-md scale-105' : 'bg-white/60 text-slate-500 hover:bg-white'}`}><Clock className="w-3.5 h-3.5"/> Aujourd'hui</button>
        <button onClick={() => setCurrentFilter('upcoming')} className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${currentFilter === 'upcoming' ? 'bg-[#7C3AED] text-white shadow-md scale-105' : 'bg-white/60 text-slate-500 hover:bg-white'}`}><Calendar className="w-3.5 h-3.5"/> À venir</button>
        <button onClick={() => setCurrentFilter('calendar')} className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 shrink-0 ${currentFilter === 'calendar' ? 'bg-[#8B5CF6] text-white shadow-md scale-105' : 'bg-white/60 text-slate-500 hover:bg-white'}`}><Calendar className="w-3.5 h-3.5"/> Calendrier</button>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-32 space-y-4 sm:space-y-6 relative z-0">
        {currentFilter === 'calendar' ? (
          renderCalendar()
        ) : (
          <>
            <form onSubmit={handleCreateTask} className="bg-white/90 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-2 shadow-xl shadow-indigo-100/50 border border-white flex flex-col sm:flex-row items-center gap-2 max-w-5xl mx-auto relative z-20">
              <input 
                type="text" 
                placeholder="Que voulez-vous accomplir ?" 
                className="flex-1 w-full sm:w-auto bg-transparent border-none outline-none px-4 py-2 sm:py-3 text-slate-700 placeholder:text-slate-400 font-bold text-base sm:text-lg min-w-[120px]"
                value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              
              <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
                <div className="relative shrink-0 flex-1 sm:flex-none">
                  <button type="button" onClick={() => setIsDatePickerOpen(true)} className="flex items-center justify-center sm:justify-between bg-slate-50/80 hover:bg-[#E9D5FF]/40 border border-slate-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF] rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2.5 w-full sm:w-[130px] transition-all active:scale-95">
                    <div className="flex items-center overflow-hidden">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0 sm:mr-2" />
                      <span className={`text-xs sm:text-sm font-bold truncate hidden sm:block ${newTaskDate ? 'text-slate-700' : 'text-slate-400'}`}>
                        {newTaskDate && !isNaN(new Date(newTaskDate).getTime()) ? new Date(newTaskDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'Date'}
                      </span>
                    </div>
                  </button>
                  {isDatePickerOpen && (
                    <>
                      <div className="fixed inset-0 z-[60]" onClick={() => setIsDatePickerOpen(false)} />
                      <div className="absolute top-full mt-3 left-0 sm:left-1/2 sm:-translate-x-1/2 p-4 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[70] w-[280px]">
                        {renderMiniCalendar()}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-1 sm:flex-none items-center justify-center sm:justify-start bg-slate-50/80 hover:bg-[#E9D5FF]/40 border border-slate-200 rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2.5 w-full sm:w-[120px] shrink-0 focus-within:ring-2 focus-within:ring-[#E9D5FF] focus-within:border-[#8B5CF6] transition-all">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 sm:mr-2" />
                  <input 
                    type="text" inputMode="numeric" placeholder="12:00" maxLength="5"
                    className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-bold text-slate-600 outline-none text-center sm:text-left hidden sm:block"
                    value={newTaskTime} 
                    onChange={handleTimeChange}
                    onBlur={formatTimeOnBlur} 
                  />
                </div>

                <select className="flex-1 sm:flex-none bg-slate-50/80 hover:bg-[#E9D5FF]/40 border border-slate-200 rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2.5 text-xs sm:text-sm font-bold outline-none w-full sm:w-[130px] shrink-0 truncate cursor-pointer transition-all focus:ring-2 focus:ring-[#E9D5FF] focus:border-[#8B5CF6]" value={newTaskCategoryId} onChange={(e) => setNewTaskCategoryId(e.target.value)} style={{ color: newTaskCategoryId ? getCategoryColor(newTaskCategoryId) : '#64748B' }}>
                  <option value="" style={{color: '#64748B'}}>Général</option>
                  {categories.map(c => <option key={c.id} value={c.id} style={{color: c.color}}>{c.name}</option>)}
                </select>

                <button type="submit" disabled={!newTaskTitle.trim()} className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-full shadow-md disabled:opacity-50 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="space-y-3 sm:space-y-4 max-w-5xl mx-auto relative z-10 mt-6">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-16 sm:py-20 text-slate-400">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-4 drop-shadow-md">
                    <RoboticArm className="w-full h-full text-[#8B5CF6]" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-slate-500 mb-1">C'est bien calme par ici.</p>
                  <p className="text-xs sm:text-sm">Ajoutez une tâche pour commencer !</p>
                </div>
              ) : (
                filteredTasks.map(task => {
                  const totalSubtasks = (task.subtasks || []).length;
                  const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length;
                  let progressPercent = 0;
                  if (totalSubtasks > 0) {
                    progressPercent = Math.round((completedSubtasks / totalSubtasks) * 100);
                  } else if (task.completed) {
                    progressPercent = 100;
                  }

                  const isOverdue = !task.completed && isTaskOverdue(task.date, task.time);

                  // DESIGN OPAQUE POUR LE RETARD
                  let cardStyle = 'bg-white/90 border-white shadow-slate-200/50 hover:shadow-xl';
                  if (task.completed) {
                    cardStyle = 'opacity-60 shadow-none bg-white/90 border-transparent';
                  } else if (isOverdue) {
                    cardStyle = '!bg-white border-red-500 border-2 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-gentle-float z-20 relative';
                  }

                  return (
                    <div key={task.id} className={`rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-300 overflow-hidden ${cardStyle}`}>
                      <div className="w-full h-1.5 bg-slate-100">
                        <div className={`h-full transition-all duration-500 ease-out ${isOverdue ? 'bg-gradient-to-r from-red-500 to-rose-500' : 'bg-gradient-to-r from-[#8B5CF6] to-[#D946EF]'}`} style={{ width: `${progressPercent}%` }} />
                      </div>

                      <div className="p-4 flex items-start gap-3 sm:gap-4">
                        <button onClick={() => toggleTaskCompletion(task)} className={`mt-0.5 sm:mt-1 rounded-full flex-shrink-0 transition-all active:scale-95 ${task.completed ? 'text-green-500' : (isOverdue ? 'text-red-400 hover:text-red-600' : 'text-slate-300 hover:text-[#8B5CF6]')}`}>
                          {task.completed ? <Check className="w-6 h-6 sm:w-7 sm:h-7" /> : <Circle className="w-6 h-6 sm:w-7 sm:h-7" />}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                            <h3 className={`text-base sm:text-lg font-bold truncate transition-all flex items-center gap-2 ${task.completed ? 'text-slate-400 line-through' : (isOverdue ? 'text-red-600' : 'text-slate-800')}`}>
                              {task.title}
                              {isOverdue && <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" title="Tâche en retard" />}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
                              {task.date && !isNaN(new Date(task.date).getTime()) && (
                                <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-colors ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                  <Calendar className="w-3 h-3" />
                                  {new Date(task.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                  {task.time && <span className={`ml-1 border-l pl-1 ${isOverdue ? 'text-red-500 border-red-300' : 'text-[#8B5CF6] border-slate-300'}`}>{task.time.includes(':') ? task.time : task.time.replace(/^(\d{2})(\d{2})$/, '$1:$2')}</span>}
                                </span>
                              )}
                              <div className="relative flex items-center group/cat hover:scale-105 transition-transform shrink-0">
                                <Tag className={`w-3 h-3 absolute left-2 pointer-events-none z-10 ${task.categoryId ? 'text-white' : 'text-slate-500'}`} />
                                <select value={task.categoryId || ""} onChange={(e) => updateTaskCategory(task.id, e.target.value)} className={`appearance-none pl-6 pr-6 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold w-[90px] sm:w-[110px] truncate transition-all cursor-pointer outline-none focus:ring-2 focus:ring-[#E9D5FF] focus:border-[#8B5CF6] ${task.categoryId ? 'text-white' : 'text-slate-600 bg-slate-100 hover:bg-[#E9D5FF]/40'}`} style={task.categoryId ? { backgroundColor: getCategoryColor(task.categoryId) } : {}}>
                                  <option value="">Général</option>
                                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className={`w-3 h-3 absolute right-1.5 pointer-events-none z-10 opacity-0 group-hover/cat:opacity-100 transition-opacity ${task.categoryId ? 'text-white' : 'text-slate-400'}`} />
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2 sm:mt-3 flex items-center justify-between">
                            <button onClick={() => toggleExpandTask(task.id)} className={`flex items-center gap-1 text-xs sm:text-sm font-bold active:scale-95 transition-all px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl ${isOverdue ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-slate-400 hover:text-[#8B5CF6] bg-slate-50 hover:bg-[#E9D5FF]/40'}`}>
                              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              {(task.subtasks || []).length} sous-missions
                              {expandedTasks[task.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => deleteTask(task.id)} className={`p-1.5 rounded-full active:scale-95 transition-all ${isOverdue ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'}`}><Trash className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>

                      {expandedTasks[task.id] && (
                        <div className={`px-4 pb-4 pt-1 border-t ${isOverdue ? 'border-red-200 !bg-red-50' : 'border-slate-100/50 bg-slate-50/50'}`}>
                          <div className="space-y-2 mb-3 pl-9 sm:pl-11 mt-2 flex flex-col items-start">
                            {(task.subtasks || []).map(sub => (
                              <div key={sub.id} className="flex items-start gap-2 sm:gap-3 group w-full text-left">
                                <button onClick={() => toggleSubtaskCompletion(task.id, sub.id)} className={`mt-0.5 transition-all active:scale-95 flex-shrink-0 ${sub.completed ? 'text-green-500' : (isOverdue ? 'text-red-400 hover:text-red-500' : 'text-slate-300 hover:text-[#8B5CF6]')}`}>
                                  {sub.completed ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Circle className="w-4 h-4 sm:w-5 sm:h-5" />}
                                </button>
                                <span className={`text-xs sm:text-sm flex-1 ${sub.completed ? 'text-slate-400 line-through' : (isOverdue ? 'text-red-800 font-medium' : 'text-slate-700 font-medium')}`}>{sub.title}</span>
                                <button onClick={() => deleteSubtask(task.id, sub.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 active:scale-95 p-1.5 rounded-full hover:bg-red-50 transition-all flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            ))}
                          </div>
                          <div className="pl-9 sm:pl-11 flex items-center gap-2">
                            <Plus className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`} />
                            <input type="text" placeholder="Ajouter une étape..." className={`flex-1 border rounded-lg px-3 py-1.5 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 transition-all ${isOverdue ? 'bg-white border-red-200 text-red-900 placeholder:text-red-300 focus:ring-red-200 focus:border-red-400' : 'bg-white border-slate-200 text-slate-700 focus:ring-[#E9D5FF] focus:border-[#8B5CF6]'}`} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(task.id, e.target.value); e.target.value = ''; } }} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>

      {/* --- ROBOT FLOTTANT --- */}
      {(!isAssistantOpen) && (
        <button onClick={() => setIsAssistantOpen(true)} className="fixed bottom-6 right-4 sm:right-6 lg:bottom-10 lg:right-10 z-30 group bot-animate cursor-pointer focus:outline-none">
          <div className="relative">
            <div className="absolute bottom-full right-1/2 mb-3 bg-white text-slate-700 font-bold px-4 py-2 rounded-2xl rounded-br-sm shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none text-sm border border-slate-100">
              Je m'appelle Emeth, besoin d'aide ? 🤖
            </div>
            <svg width="70" height="70" viewBox="0 0 100 100" className="sm:w-[80px] sm:h-[80px] hover:scale-110 active:scale-95 transition-transform duration-300">
              <path d="M50 25 L50 10" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
              <circle cx="50" cy="8" r="6" fill="#FFB86C" className="animate-ping" style={{animationDuration: '2s', transformOrigin: 'center'}} />
              <circle cx="50" cy="8" r="6" fill="#FFB86C" />
              <rect x="20" y="25" width="60" height="45" rx="15" fill="#8B5CF6" />
              <rect x="28" y="33" width="44" height="25" rx="8" fill="#1E293B" />
              <path d="M36 45 Q40 40 44 45" stroke="#34D399" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M56 45 Q60 40 64 45" stroke="#34D399" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M35 75 L65 75 L60 95 L40 95 Z" fill="#7C3AED" />
              <path d="M15 50 Q5 60 15 75" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M85 50 Q95 60 85 75" stroke="#A78BFA" strokeWidth="6" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </button>
      )}

      {/* --- ASSISTANT SIDEBAR --- */}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] bg-white sm:bg-white/95 sm:backdrop-blur-3xl shadow-2xl transform transition-transform duration-500 flex flex-col ${isAssistantOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0">
              <EmethHead className="w-full h-full drop-shadow-sm" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg">Emeth</h3>
              <p className="text-[10px] sm:text-xs text-[#8B5CF6] font-bold">Votre assistant</p>
            </div>
          </div>
          <button onClick={() => setIsAssistantOpen(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 active:scale-95 shadow-sm transition-transform hover:scale-110"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 sm:p-4 rounded-2xl sm:rounded-3xl text-sm shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'}`}>
                {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">{line}</p>)}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-100 flex items-center gap-2"><Loader className="w-4 h-4 animate-spin text-[#8B5CF6]" /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 pb-safe">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-slate-100/80 p-1.5 sm:p-2 rounded-full border border-slate-200 focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#E9D5FF] focus-within:bg-white transition-all">
            <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Demandez-moi un conseil !" className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-slate-700" />
            <button type="submit" disabled={!inputMessage.trim() || isTyping} className="p-2 sm:p-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-95 text-white rounded-full disabled:opacity-50 transition-all shadow-sm"><Send className="w-4 h-4 ml-0.5" /></button>
          </form>
        </div>
      </div>

      {/* --- MODAL RÉGLAGES --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl transform transition-all">
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 active:scale-95 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600"><Settings className="w-5 h-5" /></div>
              <h2 className="text-xl font-black text-slate-800">Réglages</h2>
            </div>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Prénom (Pour Emeth)</label>
                <input type="text" placeholder="Comment vous appeler ?" value={settingsName} onChange={(e) => setSettingsName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Adresse Email</label>
                <input type="email" value={settingsEmail} onChange={(e) => setSettingsEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Nouveau mot de passe</label>
                <input type="password" placeholder="Laisser vide pour ne pas changer" value={settingsPassword} onChange={(e) => setSettingsPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#E9D5FF] transition-all" />
              </div>
              {settingsMessage && <p className={`text-xs font-bold mt-2 text-center ${settingsMessage.includes('❌') ? 'text-red-500' : 'text-green-500'}`}>{settingsMessage}</p>}
              <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold py-3.5 rounded-xl mt-4 transition-all shadow-lg">Sauvegarder</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}