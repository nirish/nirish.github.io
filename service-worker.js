// --- 1. Paste the entire DrinkTracker.jsx code here ---

const { useState, useEffect, useMemo, useCallback } = React;
const { Wine, CalendarCheck, Zap, Goal, Flame, Calculator, ChevronDown, ChevronUp, Trash2, Minus, Plus, LogOut, User } = lucide;
// We use global firebase object from index.html

// --- Global Constants & Firebase Setup ---
// NOTE: Config is handled in index.html, we just use the global instances
const db = firebase.firestore();
const auth = firebase.auth();
// Use the App ID from your config or hardcode it if needed, but the logic below uses the auth user ID primarily.
const appId = "dram-50c7c"; 

// The base constants for your tracking goals
const DAYS_IN_SABBATICAL = 107; 
const TOTAL_TRACKING_WEEKS = 37;
const SABBATICAL_END_WEEK = 15; // Approx. 107 / 7
const DRINK_VOLUME_ML = 45; 
const BOTTLE_VOLUME_ML = 750;
const DEFAULT_GOAL = 1.8;
const BINGE_THRESHOLD = 4; // 4+ drinks is a binge

// ... (ALL THE HELPER FUNCTIONS AND COMPONENTS GO HERE) ...
// I will provide the full block below for copy-pasting.

const round = (num) => Math.round(num * 100) / 100;

const getDayOfYear = (date) => {
  const dateUTC = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const startOfYear = new Date(Date.UTC(dateUTC.getUTCFullYear(), 0, 1));
  const diff = dateUTC.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1;
};

const getCalendarWeek = (date) => {
    const doy = getDayOfYear(date);
    return Math.min(Math.floor((doy - 1) / 7) + 1, 53); 
};

const getElapsedTrackingWeeks = (date) => {
  const doy = getDayOfYear(date);
  if (doy <= DAYS_IN_SABBATICAL) return 0; 
  const currentWeek = getCalendarWeek(date);
  const elapsedWeeks = currentWeek - SABBATICAL_END_WEEK;
  return Math.max(1, Math.min(elapsedWeeks, TOTAL_TRACKING_WEEKS));
};

const isSabbatical = (date) => getDayOfYear(date) <= DAYS_IN_SABBATICAL;

const formatDate = (date) => date.toISOString().split('T')[0];

const BackgroundLiquid = ({ percent }) => {
    const fillHeight = Math.min(Math.max(percent, 0), 100);
    const WaveSvg = ({fillClass}) => (
        <svg viewBox="0 0 500 150" preserveAspectRatio="none" className={`h-full w-full ${fillClass}`}>
            <path d="M0.00,49.98 C150.00,80.00 350.00,20.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"></path>
        </svg>
    );
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gray-50">
            <div className="absolute bottom-0 left-0 right-0 transition-all duration-[2000ms] ease-in-out" style={{ height: `${fillHeight}%` }}>
                <div className="absolute inset-0 top-6 bg-amber-500/40"></div>
                <div className="absolute top-0 left-0 w-[200%] h-24 -mt-12 opacity-40 animate-wave-slow flex">
                     <WaveSvg fillClass="fill-amber-600" />
                     <WaveSvg fillClass="fill-amber-600" />
                </div>
                <div className="absolute top-0 left-0 w-[200%] h-20 -mt-8 opacity-50 animate-wave flex">
                     <WaveSvg fillClass="fill-amber-500" />
                     <WaveSvg fillClass="fill-amber-500" />
                </div>
            </div>
            <style>{`
                @keyframes wave { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                @keyframes wave-slow { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
                .animate-wave { animation: wave 12s linear infinite; }
                .animate-wave-slow { animation: wave-slow 18s linear infinite; }
            `}</style>
        </div>
    );
};

const useTrackerMetrics = (dailyLog, goalDrinksPerWeek) => { 
    const today = useMemo(() => {
        const now = new Date();
        return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    }, []);
    
    const lastLogDateString = useMemo(() => {
        const loggedDates = Object.keys(dailyLog).sort();
        let latestDate = null;
        for (const dateStr of loggedDates.reverse()) {
            const date = new Date(dateStr + 'T00:00:00Z');
            if (!isSabbatical(date)) { latestDate = dateStr; break; }
        }
        return latestDate;
    }, [dailyLog]);
    
    const pacingReferenceDate = useMemo(() => {
        if (lastLogDateString) return new Date(lastLogDateString + 'T00:00:00Z'); 
        return today; 
    }, [lastLogDateString, today]);
    
    const elapsedTrackingWeeks = useMemo(() => getElapsedTrackingWeeks(pacingReferenceDate), [pacingReferenceDate]);

    const metrics = useMemo(() => {
        let totalDrinksConsumed = 0;
        let sabbaticalExceptions = 0;
        let trackingPeriodDrinks = 0;
        
        const totalGoalDrinks = Math.round(goalDrinksPerWeek * TOTAL_TRACKING_WEEKS);
        const totalGoalBottles = round((totalGoalDrinks * DRINK_VOLUME_ML) / BOTTLE_VOLUME_ML);
        
        Object.values(dailyLog).forEach(entry => {
            totalDrinksConsumed += entry.drinks;
            const date = new Date(entry.date + 'T00:00:00Z'); 
            if (isSabbatical(date)) {
                if (entry.drinks > 0) sabbaticalExceptions += entry.drinks;
            } else {
                trackingPeriodDrinks += entry.drinks;
            }
        });
        
        let pacingAvgPerWeek = 0;
        let totalProjectedDrinks = 0;
        let bottlesProjected = 0;

        if (elapsedTrackingWeeks > 0) {
            pacingAvgPerWeek = round(trackingPeriodDrinks / elapsedTrackingWeeks);
            totalProjectedDrinks = pacingAvgPerWeek * TOTAL_TRACKING_WEEKS;
            bottlesProjected = round((totalProjectedDrinks * DRINK_VOLUME_ML) / BOTTLE_VOLUME_ML);
        }

        const percentOfGoal = totalGoalDrinks > 0 ? (trackingPeriodDrinks / totalGoalDrinks) * 100 : (trackingPeriodDrinks > 0 ? 100 : 0); 
        const drinksReserve = totalGoalDrinks - trackingPeriodDrinks - sabbaticalExceptions;
        
        return {
            totalGoalDrinks,
            totalGoalBottles,
            totalDrinksConsumed,
            elapsedTrackingWeeks,
            pacingAvgPerWeek,
            bottlesProjected,
            percentOfGoal, 
            drinksOnReserve: Math.round(drinksReserve),
            projectedAnnualDrinks: Math.round(totalProjectedDrinks),
            sabbaticalExceptions,
            trackingPeriodDrinks,
        };
    }, [dailyLog, elapsedTrackingWeeks, goalDrinksPerWeek, lastLogDateString]); 
    
    return metrics;
};

const calculateWeeklyPacing = (weeklyData, goalDrinksPerWeek) => {
    const sortedWeekKeys = Object.keys(weeklyData).sort();
    let cumulativeTrackingDrinks = 0;
    let elapsedTrackingWeeks = 0;
    const pacedWeeklyData = { ...weeklyData };

    for (const weekKey of sortedWeekKeys) {
        const week = pacedWeeklyData[weekKey];
        let isBingeWeek = false;
        for (const dayDrinks of Object.values(week.days)) {
            if (dayDrinks >= BINGE_THRESHOLD) { isBingeWeek = true; break; }
        }
        week.isBingeWeek = isBingeWeek;

        if (week.isSabbatical) {
            week.status = 'Exception'; week.color = 'amber'; continue;
        }

        elapsedTrackingWeeks++;
        cumulativeTrackingDrinks += week.totalDrinks;
        const cumulativeGoal = elapsedTrackingWeeks * goalDrinksPerWeek;
        const weeklyReserve = cumulativeGoal - cumulativeTrackingDrinks;
        
        if (weeklyReserve < 0) { week.status = 'Ease Up'; week.color = 'red'; } 
        else if (weeklyReserve <= 5) { week.status = 'On Track'; week.color = 'amber'; } 
        else { week.status = 'Extra Sober'; week.color = 'green'; }
    }
    return pacedWeeklyData;
};

function App() {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dailyLog, setDailyLog] = useState({});
    const [goalDrinksPerWeek, setGoalDrinksPerWeek] = useState(DEFAULT_GOAL); 
    const [tempGoalInput, setTempGoalInput] = useState(DEFAULT_GOAL); 
    const [isGoalCollapsed, setIsGoalCollapsed] = useState(true); 
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [currentDrinks, setCurrentDrinks] = useState(0);

    const googleProvider = useMemo(() => new firebase.auth.GoogleAuthProvider(), []);
    const metrics = useTrackerMetrics(dailyLog, goalDrinksPerWeek); 

    const getWeeklyData = useCallback(() => {
        const weeks = {};
        const dates = Object.keys(dailyLog).sort();
        dates.forEach(dateStr => {
            const date = new Date(dateStr + 'T00:00:00Z'); 
            const weekKey = formatDate(new Date(date.getTime() - ((date.getUTCDay() <= 4 ? date.getUTCDay() + 2 : date.getUTCDay() - 5) * 86400000)));
            if (!weeks[weekKey]) {
                weeks[weekKey] = { startDate: new Date(weekKey + 'T00:00:00Z'), totalDrinks: 0, days: {}, calendarWeekNumber: getCalendarWeek(date), isSabbatical: isSabbatical(date) };
            }
            weeks[weekKey].totalDrinks += dailyLog[dateStr].drinks;
            weeks[weekKey].days[dateStr] = dailyLog[dateStr].drinks;
        });
        return weeks;
    }, [dailyLog]);
    
    const weeklyData = useMemo(() => getWeeklyData(), [dailyLog]);
    const pacedWeeklyData = useMemo(() => calculateWeeklyPacing(weeklyData, goalDrinksPerWeek), [weeklyData, goalDrinksPerWeek]);
    const sortedWeeks = useMemo(() => Object.keys(pacedWeeklyData).sort().reverse(), [pacedWeeklyData]);

    const handleGoogleSignIn = useCallback(async () => {
        try { await auth.signInWithPopup(googleProvider); } 
        catch (error) { console.error("Google Sign-In Failed:", error); }
    }, [googleProvider]);

    const handleSignOut = useCallback(async () => {
        try { await auth.signOut(); } catch (error) { console.error("Sign Out Failed:", error); }
    }, []);

    const handleDateChange = (e) => setSelectedDate(e.target.value);
    const handleIncrement = () => setCurrentDrinks(prev => prev + 1);
    const handleDecrement = () => setCurrentDrinks(prev => Math.max(0, prev - 1));

    const handleSaveLog = useCallback(async () => {
        if (!userId) return;
        const docRef = db.collection(`artifacts/${appId}/users/${userId}/drink_tracker`).doc(selectedDate);
        try { await docRef.set({ date: selectedDate, drinks: currentDrinks, timestamp: new Date() }, { merge: true }); } 
        catch (e) { console.error(e); }
    }, [userId, selectedDate, currentDrinks]);

    const handleSaveGoal = useCallback(async () => {
        if (!userId) return;
        const newGoal = parseFloat(tempGoalInput);
        if (isNaN(newGoal) || newGoal < 0) return;
        const goalDocRef = db.collection(`artifacts/${appId}/users/${userId}/settings`).doc('goals');
        try { await goalDocRef.set({ goalDrinksPerWeek: round(newGoal), lastUpdated: new Date() }, { merge: true }); setIsGoalCollapsed(true); } 
        catch (e) { console.error(e); }
    }, [userId, tempGoalInput]);
    
    const handleResetData = useCallback(async () => {
        if (!userId) return;
        if (!confirm("Are you sure? This wipes all data.")) return;
        const logCollectionRef = db.collection(`artifacts/${appId}/users/${userId}/drink_tracker`);
        try {
            const snapshot = await logCollectionRef.get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        } catch (e) { console.error(e); }
        const goalDocRef = db.collection(`artifacts/${appId}/users/${userId}/settings`).doc('goals');
        try { await goalDocRef.set({ goalDrinksPerWeek: DEFAULT_GOAL, lastUpdated: new Date() }); } 
        catch (e) { console.error(e); }
    }, [userId]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) { setUserId(user.uid); setLoading(false); } 
            else { setUserId(null); setLoading(false); }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId) return;
        const goalDocRef = db.collection(`artifacts/${appId}/users/${userId}/settings`).doc('goals');
        const unsubscribe = goalDocRef.onSnapshot((docSnapshot) => {
            if (docSnapshot.exists) {
                const data = docSnapshot.data();
                const newGoal = parseFloat(data.goalDrinksPerWeek) || DEFAULT_GOAL; 
                setGoalDrinksPerWeek(newGoal);
                setTempGoalInput(newGoal);
            } else {
                setGoalDrinksPerWeek(DEFAULT_GOAL);
                setTempGoalInput(DEFAULT_GOAL);
            }
        });
        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        const logCollectionRef = db.collection(`artifacts/${appId}/users/${userId}/drink_tracker`);
        const unsubscribe = logCollectionRef.onSnapshot((snapshot) => {
            const newLog = {};
            snapshot.forEach((doc) => { const data = doc.data(); newLog[data.date] = data; });
            setDailyLog(newLog);
        });
        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        const logEntry = dailyLog[selectedDate];
        setCurrentDrinks(logEntry ? logEntry.drinks : 0);
    }, [selectedDate, dailyLog]);
    
    useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
    }, [loading, isGoalCollapsed, metrics]);

    if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-50 text-emerald-800">Loading...</div>;

    if (!userId) {
        return (
            <div className="min-h-screen font-sans relative flex items-center justify-center p-8">
                <BackgroundLiquid percent={0} />
                <div className="relative z-10 p-6 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl max-w-sm text-center">
                    <Flame className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-emerald-900 mb-4">Sober*ish Tracker</h2>
                    <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center bg-emerald-600 text-white py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-emerald-700">
                        Sign in with Google
                    </button>
                </div>
            </div>
        );
    }
    
    // --- RENDER ---
    const MetricCard = ({ title, value, unit, icon, colorClass = 'bg-white/60' }) => (
        <div className={`p-3 rounded-xl shadow-lg flex flex-col items-center justify-center ${colorClass} backdrop-blur-md text-gray-800 border border-opacity-40 border-white`}>
            <div className="flex items-center space-x-1 mb-1">
                <i data-lucide={icon} className="w-4 h-4 text-emerald-800 opacity-90"></i>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">{title}</h3>
            </div>
            <p className="text-xl font-extrabold text-emerald-900">{value}</p>
            {unit && <span className="text-[10px] font-medium text-gray-600 mt-0.5">{unit}</span>}
        </div>
    );

    const ReservePill = ({ value, unit }) => {
        const colorClass = value < 0 ? 'bg-red-700/70' : 'bg-emerald-600/70';
        return (
            <div className={`p-4 rounded-xl flex flex-col items-center justify-center h-full w-full shadow-xl backdrop-blur-sm ${colorClass} text-white`}>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider opacity-90 mb-0.5">Reserve</h3>
                <p className="text-3xl font-extrabold">{value > 0 ? '+' : ''}{value}</p>
                <span className="text-[10px] font-medium opacity-90">{unit}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen font-sans relative">
            <BackgroundLiquid percent={metrics.percentOfGoal} />
            <div className="relative z-10 p-4 max-w-lg mx-auto">
                <header className="py-4 mb-6 border-b border-amber-300/50 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-emerald-900 flex items-center drop-shadow-sm">
                        <Flame className="w-8 h-8 mr-2 text-amber-600" /> Sober*ish
                    </h1>
                    <div className="text-right flex flex-col items-end">
                        <button onClick={handleSignOut} className="text-xs text-red-500 hover:text-red-700 mb-2 flex items-center p-1 rounded-full bg-white/50 backdrop-blur-sm shadow-sm"><LogOut className="w-3 h-3 mr-1" /> Sign Out</button>
                        <p className="text-xs text-emerald-900 font-semibold">{goalDrinksPerWeek.toFixed(2)} <span className="text-gray-700 font-normal">drinks/week</span></p>
                        <p className="text-xs text-emerald-900 font-semibold">{metrics.totalGoalDrinks} <span className="text-gray-700 font-normal">annual drinks</span></p>
                        <p className="text-xs text-emerald-900 font-semibold">{Math.round(metrics.totalGoalBottles)} <span className="text-gray-700 font-normal">annual bottles</span></p>
                    </div>
                </header>

                <section className="mb-8 p-4 bg-white/70 backdrop-blur-md rounded-xl shadow-xl border border-emerald-100">
                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsGoalCollapsed(!isGoalCollapsed)}>
                        <h2 className="text-lg font-bold text-emerald-800 flex items-center"><Goal className="w-5 h-5 mr-2 text-emerald-600" /> Annual Goal Setting</h2>
                        {isGoalCollapsed ? <ChevronDown className="w-5 h-5 text-emerald-600" /> : <ChevronUp className="w-5 h-5 text-emerald-600" />}
                    </div>
                    {!isGoalCollapsed && (
                        <div className="mt-4 pt-3 border-t border-emerald-200">
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <MetricCard title="Goal / Week" value={goalDrinksPerWeek.toFixed(2)} icon="calculator" />
                                <MetricCard title="Annual Drinks" value={metrics.totalGoalDrinks} icon="goal" />
                                <MetricCard title="Annual Bottles" value={metrics.totalGoalBottles.toFixed(2)} icon="wine" />
                            </div>
                            <div className="grid grid-cols-3 gap-4 items-end">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-emerald-700 mb-1">Drinks Goal / Week</label>
                                    <input type="number" value={tempGoalInput} onChange={(e) => setTempGoalInput(e.target.value)} step="0.1" className="w-full p-2 border border-emerald-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white/50" />
                                </div>
                                <button onClick={handleSaveGoal} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold text-sm shadow-md hover:bg-emerald-700 transition duration-150">Update Goal</button>
                            </div>
                             <div className="mt-6">
                                <button onClick={handleResetData} className="w-full flex items-center justify-center bg-gray-200 text-red-600 py-2 rounded-lg font-semibold text-sm shadow-md hover:bg-gray-300 transition duration-150"><Trash2 className="w-4 h-4 mr-2" /> Reset All Data</button>
                            </div>
                        </div>
                    )}
                </section>

                <section className="mb-8 p-4 bg-white/70 backdrop-blur-md rounded-xl shadow-xl border border-emerald-100">
                    <h2 className="text-lg font-bold mb-4 text-emerald-800">Log Daily Consumption</h2>
                    <div className="flex gap-4">
                        <div className="w-2/3 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                                <input type="date" value={selectedDate} onChange={handleDateChange} className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white/60" max={formatDate(new Date())} />
                            </div>
                            <div className="text-center">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Drams/Drinks Consumed</label>
                                <div className="flex justify-between items-center space-x-2">
                                    <button onClick={handleDecrement} disabled={currentDrinks <= 0} className="p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full shadow-md"><Minus className="w-5 h-5" /></button>
                                    <span className="text-4xl font-extrabold text-emerald-800 tabular-nums">{currentDrinks}</span>
                                    <button onClick={handleIncrement} className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-md"><Plus className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                        <div className="w-1/3 flex items-stretch justify-center"><ReservePill value={metrics.drinksOnReserve} unit="Drinks" /></div>
                    </div>
                    <button onClick={handleSaveLog} className="mt-5 w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:bg-emerald-700">Save</button>
                </section>
                
                <section className="mb-8">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <MetricCard title="Avg / Week" value={metrics.pacingAvgPerWeek.toFixed(2)} unit={`vs ${goalDrinksPerWeek.toFixed(1)}`} icon="calculator" />
                        <MetricCard title="Bottle Pace" value={metrics.bottlesProjected.toFixed(2)} unit="Annual Pacing" icon="wine" colorClass={metrics.bottlesProjected > metrics.totalGoalBottles ? 'bg-red-100/70' : 'bg-emerald-100/70'} />
                        <MetricCard title="Total Consumed" value={metrics.totalDrinksConsumed} unit="" icon="calendar-check" />
                    </div>
                </section>
                
                <section className="mb-20">
                    <h2 className="text-xl font-bold mb-4 text-emerald-900 drop-shadow-sm">Weekly Log</h2>
                    <div className="overflow-x-auto bg-white/70 backdrop-blur-md rounded-xl shadow-xl border border-emerald-100">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/50">
                                <tr><th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Week</th><th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th><th className="px-3 py-3 text-right text-xs font-numeric text-gray-500 uppercase">Drinks</th><th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Status</th></tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-gray-200">
                                {sortedWeeks.map((weekKey) => {
                                    const week = pacedWeeklyData[weekKey];
                                    const endDate = new Date(week.startDate); endDate.setUTCDate(week.startDate.getUTCDate() + 6);
                                    const bingeEmoji = week.isBingeWeek ? '🔥 ' : '';
                                    return (
                                        <tr key={weekKey}>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">{week.isSabbatical ? `Sabbatical Wk ${week.calendarWeekNumber}` : `Wk ${week.calendarWeekNumber}`}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500">{weekKey.slice(5)} - {formatDate(endDate).slice(5)}</td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-right"><span className={`font-bold ${week.color === 'red' ? 'text-red-600' : 'text-emerald-600'}`}>{week.totalDrinks}</span></td>
                                            <td className="px-3 py-3 whitespace-nowrap text-sm text-right"><span className={`text-xs font-medium px-2 py-1 rounded-full bg-${week.color}-100 text-${week.color}-800`}>{bingeEmoji}{week.status}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}

// Mount app
window.App = App;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
