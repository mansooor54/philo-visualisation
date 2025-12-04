import React, { useState, useEffect, useRef } from 'react';

const STATES = {
  THINKING: 'thinking', EATING: 'eating', SLEEPING: 'sleeping', DEAD: 'dead',
  WAITING_LEFT: 'waiting_left', HAS_LEFT: 'has_left', HAS_BOTH: 'has_both'
};

const COLORS = {
  thinking: '#A855F7', eating: '#EAB308', sleeping: '#3B82F6', dead: '#EF4444',
  waiting_left: '#F97316', has_left: '#22C55E', has_both: '#10B981'
};

const EMOJIS = {
  thinking: '💭', eating: '🍝', sleeping: '😴', dead: '💀',
  waiting_left: '🤚', has_left: '🍴', has_both: '🍴'
};

const LABELS = {
  thinking: 'is thinking', eating: 'is eating', sleeping: 'is sleeping', dead: 'died',
  waiting_left: 'waiting fork', has_left: 'has 1 fork', has_both: 'has 2 forks'
};

const CODE = {
  philo_routine: {
    name: 'philo_routine.c',
    code: `void *philo_routine(void *arg)
{
    t_philo *philo;

    philo = (t_philo *)arg;
    wait_for_start(philo->data);
    if (philo->id % 2 == 0)
        ft_usleep(1, philo->data);
    while (!is_dead(philo->data))
    {
        eat_routine(philo);
        if (philo->data->num_philos == 1)
            break;
        if (is_dead(philo->data))
            break;
        print_status(philo, "is sleeping");
        ft_usleep(philo->data->time_to_sleep);
        if (is_dead(philo->data))
            break;
        think_routine(philo);
    }
    return (NULL);
}`
  },
  eat_routine: {
    name: 'eat_routine()',
    code: `void eat_routine(t_philo *philo)
{
    pthread_mutex_lock(philo->left_fork);
    print_status(philo, "has taken a fork");
    if (philo->data->num_philos == 1)
    {
        ft_usleep(philo->data->time_to_die);
        pthread_mutex_unlock(philo->left_fork);
        return;
    }
    pthread_mutex_lock(philo->right_fork);
    print_status(philo, "has taken a fork");
    pthread_mutex_lock(&philo->data->meal_lock);
    philo->last_meal_time = get_time();
    pthread_mutex_unlock(&philo->data->meal_lock);
    print_status(philo, "is eating");
    ft_usleep(philo->data->time_to_eat);
    pthread_mutex_lock(&philo->data->meal_lock);
    philo->eat_count++;
    pthread_mutex_unlock(&philo->data->meal_lock);
    pthread_mutex_unlock(philo->right_fork);
    pthread_mutex_unlock(philo->left_fork);
}`
  },
  think_routine: {
    name: 'think_routine()',
    code: `void think_routine(t_philo *philo)
{
    long long think_time;
    long long time_since_meal;

    print_status(philo, "is thinking");
    pthread_mutex_lock(&philo->data->meal_lock);
    time_since_meal = get_time() - philo->last_meal_time;
    pthread_mutex_unlock(&philo->data->meal_lock);
    think_time = (philo->data->time_to_die 
        - time_since_meal - philo->data->time_to_eat) / 2;
    if (think_time < 0)
        think_time = 0;
    if (think_time > 200)
        think_time = 200;
    if (think_time > 0)
        ft_usleep(think_time, philo->data);
}`
  },
  monitor: {
    name: 'monitor.c',
    code: `static int check_philo_death(t_data *data)
{
    int         i;
    long long   time;

    i = 0;
    while (i < data->num_philos)
    {
        pthread_mutex_lock(&data->meal_lock);
        time = get_time() - data->philos[i].last_meal_time;
        pthread_mutex_unlock(&data->meal_lock);
        if (time > data->time_to_die)
        {
            print_status(&data->philos[i], "died");
            set_dead(data);
            return (1);
        }
        i++;
    }
    return (0);
}`
  }
};

const LINEMAP = {
  init: { sec: 'philo_routine', ln: [5, 6, 7, 8] },
  thinking: { sec: 'think_routine', ln: [6, 7, 8, 9] },
  eating: { sec: 'eat_routine', ln: [13, 14, 15, 16] },
  eating_done: { sec: 'eat_routine', ln: [17, 18, 19, 20, 21, 22] },
  sleeping: { sec: 'philo_routine', ln: [15, 16] },
  dead: { sec: 'monitor', ln: [11, 12, 13, 14, 15] },
  has_left: { sec: 'eat_routine', ln: [3, 4] },
  has_both: { sec: 'eat_routine', ln: [11, 12] },
  waiting_left: { sec: 'eat_routine', ln: [3] }
};

export default function App() {
  const [numPhilos, setNumPhilos] = useState(5);
  const [timeToDie, setTimeToDie] = useState(800);
  const [timeToEat, setTimeToEat] = useState(200);
  const [timeToSleep, setTimeToSleep] = useState(200);
  const [mustEatCount, setMustEatCount] = useState(-1);
  const [speed, setSpeed] = useState(1);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stepMode, setStepMode] = useState(true);
  const [philosophers, setPhilosophers] = useState([]);
  const [forks, setForks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [ended, setEnded] = useState(false);
  const [endMsg, setEndMsg] = useState('');

  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [curCode, setCurCode] = useState('philo_routine');
  const [hlLines, setHlLines] = useState([]);
  const [curAction, setCurAction] = useState('');
  const [activeP, setActiveP] = useState(null);
  const [simTime, setSimTime] = useState(0);

  const logsRef = useRef(null);
  const simRef = useRef(null);
  const stRef = useRef({ philos: [], forks: [], dead: false, simTime: 0 });

  useEffect(() => {
    logsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const saveSnap = () => ({
    philos: stRef.current.philos.map(p => ({ ...p })),
    forks: stRef.current.forks.map(f => ({ ...f })),
    logs: [...logs],
    simTime: stRef.current.simTime,
    code: curCode,
    lines: [...hlLines],
    action: curAction,
    active: activeP
  });

  const loadSnap = (s) => {
    stRef.current.philos = s.philos.map(p => ({ ...p }));
    stRef.current.forks = s.forks.map(f => ({ ...f }));
    stRef.current.simTime = s.simTime;
    setPhilosophers([...stRef.current.philos]);
    setForks([...stRef.current.forks]);
    setSimTime(s.simTime);
    setLogs(s.logs);
    setCurCode(s.code);
    setHlLines(s.lines);
    setCurAction(s.action);
    setActiveP(s.active);
  };

  const highlight = (k, a) => {
    const m = LINEMAP[k] || LINEMAP.init;
    setCurCode(m.sec);
    setHlLines(m.ln);
    setCurAction(a);
  };

  const addLog = (pid, sk, a, t) => {
    const p = stRef.current.philos.find(x => x.id === pid);
    setLogs(pr => [...pr.slice(-100), { t, pid, sk, a, eat: p?.eatCount || 0 }]);
  };

  const init = () => {
    const philos = [];
    const fks = [];
    for (let i = 0; i < numPhilos; i++) {
      // Fork assignment like in C code (even/odd)
      const leftFork = i % 2 === 0 ? i : (i + 1) % numPhilos;
      const rightFork = i % 2 === 0 ? (i + 1) % numPhilos : i;

      philos.push({
        id: i + 1,
        state: STATES.THINKING,
        eatCount: 0,
        lastMealTime: 0,
        leftFork,
        rightFork,
        stateEndTime: i % 2 === 0 ? 1 : 0, // Even philos start with small delay
        forksHeld: 0
      });
      fks.push({ id: i, owner: null });
    }
    stRef.current = { philos, forks: fks, dead: false, simTime: 0 };
    setPhilosophers(philos);
    setForks(fks);
    setSimTime(0);
    setLogs([]);
    setHistory([]);
    setHistIdx(-1);
    setEnded(false);
    setEndMsg('');
    highlight('init', 'All philosophers initialized and thinking');
  };

  const start = () => {
    init();
    setIsRunning(true);
    setIsPaused(stepMode);
    if (!stepMode) setTimeout(runLoop, 50);
  };

  const stop = () => {
    setIsRunning(false);
    setIsPaused(false);
    stRef.current.dead = true;
    clearTimeout(simRef.current);
  };

  const togglePause = () => {
    if (isPaused) { setIsPaused(false); runLoop(); }
    else { setIsPaused(true); clearTimeout(simRef.current); }
  };

  const stepBack = () => {
    if (histIdx > 0) { loadSnap(history[histIdx - 1]); setHistIdx(i => i - 1); }
  };

  const stepFwd = () => {
    if (histIdx < history.length - 1) { loadSnap(history[histIdx + 1]); setHistIdx(i => i + 1); }
    else { execStep(); }
  };

  const execStep = () => {
    if (!isRunning) { init(); setIsRunning(true); setIsPaused(true); return; }
    const s = saveSnap();
    setHistory(h => [...h, s]);
    setHistIdx(i => i + 1);
    runStep(true);
  };

  // Process ALL philosophers in parallel each tick
  const runStep = (manual = false) => {
    const st = stRef.current;
    if (st.dead) return false;

    const TIME_STEP = manual ? 5 : Math.max(5, 20 / speed);
    st.simTime += TIME_STEP;
    const t = st.simTime;

    // 1. Check death for ALL philosophers first
    for (let p of st.philos) {
      if (p.state === STATES.DEAD) continue;
      const since = t - p.lastMealTime;
      if (since > timeToDie) {
        p.state = STATES.DEAD;
        st.dead = true;
        addLog(p.id, 'dead', `💀 DIED! (${Math.round(since)}ms without food)`, t);
        highlight('dead', `P${p.id} starved after ${Math.round(since)}ms`);
        setActiveP(p.id);
        setPhilosophers([...st.philos]);
        setSimTime(t);
        setEnded(true);
        setEndMsg(`💀 Philosopher ${p.id} died after ${Math.round(since)}ms!`);
        setIsRunning(false);
        return true;
      }
    }

    // 2. Check if all ate enough
    if (mustEatCount > 0 && st.philos.every(p => p.eatCount >= mustEatCount)) {
      st.dead = true;
      setEnded(true);
      setEndMsg(`🎉 All philosophers ate ${mustEatCount} times!`);
      setIsRunning(false);
      return true;
    }

    // 3. Process ALL philosophers (parallel simulation)
    let actions = [];

    for (let p of st.philos) {
      if (p.state === STATES.DEAD) continue;

      switch (p.state) {
        case STATES.THINKING:
          // Try to get left fork
          if (t >= p.stateEndTime) {
            if (st.forks[p.leftFork].owner === null) {
              st.forks[p.leftFork].owner = p.id;
              p.forksHeld = 1;
              p.state = STATES.HAS_LEFT;
              actions.push({ id: p.id, act: `🍴 took left fork [${p.leftFork}]`, sk: 'has_left' });
            } else {
              p.state = STATES.WAITING_LEFT;
            }
          }
          break;

        case STATES.WAITING_LEFT:
          // Keep trying for left fork
          if (st.forks[p.leftFork].owner === null) {
            st.forks[p.leftFork].owner = p.id;
            p.forksHeld = 1;
            p.state = STATES.HAS_LEFT;
            actions.push({ id: p.id, act: `🍴 took left fork [${p.leftFork}]`, sk: 'has_left' });
          }
          break;

        case STATES.HAS_LEFT:
          // Single philosopher case
          if (numPhilos === 1) {
            // Will die waiting for second fork
            break;
          }
          // Try to get right fork
          if (st.forks[p.rightFork].owner === null) {
            st.forks[p.rightFork].owner = p.id;
            p.forksHeld = 2;
            p.state = STATES.HAS_BOTH;
            p.lastMealTime = t;
            p.stateEndTime = t + timeToEat;
            actions.push({ id: p.id, act: `🍴 took right fork [${p.rightFork}]`, sk: 'has_both' });
          }
          break;

        case STATES.HAS_BOTH:
          // Start eating immediately
          if (p.state !== STATES.EATING) {
            p.state = STATES.EATING;
            actions.push({ id: p.id, act: `🍝 EATING (until ${p.stateEndTime}ms)`, sk: 'eating' });
          }
          break;

        case STATES.EATING:
          if (t >= p.stateEndTime) {
            // Done eating
            p.eatCount++;
            st.forks[p.leftFork].owner = null;
            st.forks[p.rightFork].owner = null;
            p.forksHeld = 0;
            p.state = STATES.SLEEPING;
            p.stateEndTime = t + timeToSleep;
            actions.push({ id: p.id, act: `😴 sleeping (meals: ${p.eatCount})`, sk: 'sleeping' });
          }
          break;

        case STATES.SLEEPING:
          if (t >= p.stateEndTime) {
            p.state = STATES.THINKING;
            p.stateEndTime = t; // Can immediately try for forks
            actions.push({ id: p.id, act: `💭 thinking`, sk: 'thinking' });
          }
          break;
      }
    }

    // Log all actions
    actions.forEach(a => addLog(a.id, a.sk, a.act, t));

    // Update display with last action
    if (actions.length > 0) {
      const last = actions[actions.length - 1];
      highlight(last.sk, last.act);
      setActiveP(last.id);
    }

    setPhilosophers([...st.philos]);
    setForks([...st.forks]);
    setSimTime(t);
    return false;
  };

  const runLoop = () => {
    if (stRef.current.dead || isPaused) return;
    runStep(false);
    if (!stRef.current.dead) simRef.current = setTimeout(runLoop, Math.max(16, 30 / speed));
  };

  useEffect(() => () => clearTimeout(simRef.current), []);

  const getPos = (i, n, r) => {
    const a = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  };

  const getForkPos = (i, n, r) => {
    const a = ((i + 0.5) * 2 * Math.PI) / n - Math.PI / 2;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, rot: (a * 180) / Math.PI + 90 };
  };

  const renderCode = () => {
    const sec = CODE[curCode];
    if (!sec) return null;
    return (
      <div className="font-mono text-xs leading-tight">
        <div className="text-amber-400 font-bold mb-1">{sec.name}</div>
        {sec.code.split('\n').map((line, idx) => {
          const num = idx + 1;
          const hl = hlLines.includes(num);
          return (
            <div key={idx} className={`flex ${hl ? 'bg-yellow-500/40 border-l-2 border-yellow-400' : ''}`}>
              <span className={`w-5 text-right pr-1 ${hl ? 'text-yellow-400 font-bold' : 'text-gray-600'}`}>{num}</span>
              <pre className={hl ? 'text-yellow-100' : 'text-gray-500'}>{line || ' '}</pre>
            </div>
          );
        })}
      </div>
    );
  };

  const tR = Math.min(80, 55 + numPhilos * 4);
  const pR = tR + 42;
  const fR = tR - 6;
  const size = (pR + 50) * 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-2">
      <h1 className="text-lg font-bold text-center mb-1 bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
        🍝 Dining Philosophers - Debug Mode
      </h1>

      {/* Controls */}
      <div className="bg-slate-800/60 rounded-lg p-2 mb-2 border border-slate-700">
        <div className="grid grid-cols-7 gap-1 mb-2 text-xs">
          <div>
            <label className="text-gray-400">Philosophers</label>
            <input type="number" min="1" max="10" value={numPhilos}
              onChange={e => setNumPhilos(Math.min(10, Math.max(1, +e.target.value || 1)))}
              disabled={isRunning}
              className="w-full bg-slate-700 rounded px-1 py-1 disabled:opacity-50" />
          </div>
          <div>
            <label className="text-gray-400">Time to Die</label>
            <input type="number" value={timeToDie}
              onChange={e => setTimeToDie(+e.target.value || 800)}
              disabled={isRunning}
              className="w-full bg-slate-700 rounded px-1 py-1 disabled:opacity-50" />
          </div>
          <div>
            <label className="text-gray-400">Time to Eat</label>
            <input type="number" value={timeToEat}
              onChange={e => setTimeToEat(+e.target.value || 200)}
              disabled={isRunning}
              className="w-full bg-slate-700 rounded px-1 py-1 disabled:opacity-50" />
          </div>
          <div>
            <label className="text-gray-400">Time to Sleep</label>
            <input type="number" value={timeToSleep}
              onChange={e => setTimeToSleep(+e.target.value || 200)}
              disabled={isRunning}
              className="w-full bg-slate-700 rounded px-1 py-1 disabled:opacity-50" />
          </div>
          <div>
            <label className="text-gray-400">Must Eat</label>
            <input type="number" min="-1" value={mustEatCount}
              onChange={e => setMustEatCount(+e.target.value || -1)}
              disabled={isRunning}
              className="w-full bg-slate-700 rounded px-1 py-1 disabled:opacity-50" />
          </div>
          <div>
            <label className="text-gray-400">Speed: {speed}x</label>
            <input type="range" min="0.5" max="5" step="0.5" value={speed}
              onChange={e => setSpeed(+e.target.value)}
              className="w-full accent-purple-500" />
          </div>
          <div className="flex items-end gap-1">
            <input type="checkbox" id="step" checked={stepMode}
              onChange={e => setStepMode(e.target.checked)}
              disabled={isRunning}
              className="accent-purple-500" />
            <label htmlFor="step">Step Mode</label>
          </div>
        </div>

        <div className="flex gap-1 justify-center flex-wrap text-xs">
          {!isRunning ? (
            <button onClick={start} className="px-3 py-1 bg-green-600 rounded font-bold hover:bg-green-700">
              ▶ Start
            </button>
          ) : (
            <button onClick={stop} className="px-3 py-1 bg-red-600 rounded font-bold hover:bg-red-700">
              ⏹ Stop
            </button>
          )}
          {isRunning && !stepMode && (
            <button onClick={togglePause}
              className={`px-3 py-1 rounded font-bold ${isPaused ? 'bg-green-600' : 'bg-yellow-600'}`}>
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
          )}
          {(stepMode || isPaused) && isRunning && (
            <>
              <button onClick={stepBack} disabled={histIdx <= 0}
                className="px-3 py-1 bg-blue-600 rounded font-bold disabled:opacity-40">
                ⏮ Back
              </button>
              <button onClick={stepFwd}
                className="px-3 py-1 bg-purple-600 rounded font-bold">
                Forward ⏭
              </button>
            </>
          )}
          {!isRunning && stepMode && (
            <button onClick={execStep} className="px-3 py-1 bg-purple-600 rounded font-bold">
              ⏭ Step
            </button>
          )}
        </div>
      </div>

      {/* Time display */}
      <div className="mb-2 text-center text-xs">
        <span className="bg-slate-800 px-3 py-1 rounded-full">
          ⏱ Time: <span className="text-amber-400 font-bold">{simTime}ms</span>
          <span className="text-gray-500 ml-2">| Step #{histIdx + 1}</span>
        </span>
      </div>

      {ended && (
        <div className={`mb-2 p-2 rounded text-center font-bold text-sm ${endMsg.includes('died') ? 'bg-red-500/30 text-red-300' : 'bg-green-500/30 text-green-300'}`}>
          {endMsg}
        </div>
      )}

      {curAction && (
        <div className="mb-2 p-1 bg-amber-500/20 rounded text-center text-xs">
          <span className="text-amber-300 font-mono">
            {activeP && <b>[P{activeP}]</b>} {curAction}
          </span>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Table */}
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700">
          <div className="text-xs text-gray-400 mb-1 text-center">Table View</div>
          <div className="flex justify-center">
            <div className="relative" style={{ width: size, height: size }}>
              <div className="absolute rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-600"
                style={{ width: tR * 2, height: tR * 2, left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
              <div className="absolute text-lg" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>🍝</div>

              {forks.map((f, i) => {
                const p = getForkPos(i, numPhilos, fR);
                return (
                  <div key={i}
                    className={`absolute text-sm transition-all duration-150 ${f.owner ? 'opacity-20 scale-50' : ''}`}
                    style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)`, transform: `translate(-50%,-50%) rotate(${p.rot}deg)` }}>
                    🍴
                  </div>
                );
              })}

              {philosophers.map((ph, i) => {
                const pos = getPos(i, numPhilos, pR);
                const act = activeP === ph.id;
                const hunger = Math.min(100, ((simTime - ph.lastMealTime) / timeToDie) * 100);
                return (
                  <div key={i} className="absolute flex flex-col items-center"
                    style={{ left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)`, transform: 'translate(-50%,-50%)' }}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all
                      ${ph.state === STATES.DEAD ? 'animate-pulse' : ''}
                      ${ph.state === STATES.EATING ? 'scale-110' : ''}
                      ${act ? 'ring-2 ring-white' : ''}`}
                      style={{ background: COLORS[ph.state] + '30', borderColor: COLORS[ph.state] }}>
                      {EMOJIS[ph.state]}
                    </div>
                    <div className="text-xs font-bold">P{ph.id}</div>
                    <div className="text-xs text-amber-400">×{ph.eatCount}</div>
                    <div className="w-7 h-1 bg-gray-700 rounded-full mt-0.5">
                      <div className={`h-full rounded-full transition-all ${hunger > 80 ? 'bg-red-500' : hunger > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${hunger}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-0.5 text-xs">
            {Object.keys(LABELS).map(s => (
              <div key={s} className="flex items-center gap-0.5">
                <span>{EMOJIS[s]}</span>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[s] }} />
                <span className="text-gray-400 truncate">{LABELS[s]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code */}
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700 flex flex-col">
          <div className="flex gap-0.5 mb-1 text-xs flex-wrap">
            {Object.keys(CODE).map(k => (
              <button key={k} onClick={() => setCurCode(k)}
                className={`px-1.5 py-0.5 rounded ${curCode === k ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                {k.split('_')[0]}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto bg-black/40 rounded p-1 max-h-72">
            {renderCode()}
          </div>
        </div>

        {/* Log */}
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700 flex flex-col">
          <div className="text-xs text-gray-400 mb-1">Activity Log</div>
          <div className="flex-1 overflow-y-auto bg-black/40 rounded p-1 max-h-72 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-gray-600 text-center py-4">Click Start or Step...</div>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="flex gap-0.5 border-b border-slate-800/50 py-0.5"
                  style={{ color: COLORS[l.sk] || '#888' }}>
                  <span className="text-gray-600 w-10 flex-shrink-0">{l.t}ms</span>
                  <span className="font-bold">[P{l.pid}]</span>
                  <span className="truncate">{l.a}</span>
                </div>
              ))
            )}
            <div ref={logsRef} />
          </div>
        </div>
      </div>

      {/* Status cards */}
      {philosophers.length > 0 && (
        <div className="mt-2 grid grid-cols-5 gap-1 text-xs">
          {philosophers.map(ph => {
            const since = simTime - ph.lastMealTime;
            return (
              <div key={ph.id}
                className={`p-1.5 rounded border text-center ${activeP === ph.id ? 'ring-1 ring-white' : ''}`}
                style={{ background: COLORS[ph.state] + '20', borderColor: COLORS[ph.state] + '60' }}>
                <div className="font-bold">{EMOJIS[ph.state]} P{ph.id}</div>
                <div className="text-gray-400 capitalize">{ph.state.replace('_', ' ')}</div>
                <div>
                  <span className="text-amber-400">🍝{ph.eatCount}</span>
                  <span className="text-gray-500 mx-1">🍴{ph.forksHeld}</span>
                </div>
                <div className="text-gray-500">hunger: {since}ms</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-2 text-center text-xs">
        <code className="bg-slate-800 px-2 py-0.5 rounded text-gray-400">
          ./philo {numPhilos} {timeToDie} {timeToEat} {timeToSleep} {mustEatCount > 0 ? mustEatCount : ''}
        </code>
      </div>
    </div>
  );
}
