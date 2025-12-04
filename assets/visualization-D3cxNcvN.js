import{r as n,j as t,c as Ee,R as Se}from"./index-ZVkWC--9.js";const r={THINKING:"thinking",EATING:"eating",SLEEPING:"sleeping",DEAD:"dead",WAITING_LEFT:"waiting_left",HAS_LEFT:"has_left",HAS_BOTH:"has_both"},x={thinking:"#A855F7",eating:"#EAB308",sleeping:"#3B82F6",dead:"#EF4444",waiting_left:"#F97316",has_left:"#22C55E",has_both:"#10B981"},z={thinking:"💭",eating:"🍝",sleeping:"😴",dead:"💀",waiting_left:"🤚",has_left:"🍴",has_both:"🍴"},ie={thinking:"is thinking",eating:"is eating",sleeping:"is sleeping",dead:"died",waiting_left:"waiting fork",has_left:"has 1 fork",has_both:"has 2 forks"},le={philo_routine:{name:"philo_routine.c",code:`void *philo_routine(void *arg)
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
}`},eat_routine:{name:"eat_routine()",code:`void eat_routine(t_philo *philo)
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
}`},think_routine:{name:"think_routine()",code:`void think_routine(t_philo *philo)
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
}`},monitor:{name:"monitor.c",code:`static int check_philo_death(t_data *data)
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
}`}},ne={init:{sec:"philo_routine",ln:[5,6,7,8]},thinking:{sec:"think_routine",ln:[6,7,8,9]},eating:{sec:"eat_routine",ln:[13,14,15,16]},eating_done:{sec:"eat_routine",ln:[17,18,19,20,21,22]},sleeping:{sec:"philo_routine",ln:[15,16]},dead:{sec:"monitor",ln:[11,12,13,14,15]},has_left:{sec:"eat_routine",ln:[3,4]},has_both:{sec:"eat_routine",ln:[11,12]},waiting_left:{sec:"eat_routine",ln:[3]}};function we(){const[h,oe]=n.useState(5),[k,re]=n.useState(800),[I,de]=n.useState(200),[M,ce]=n.useState(200),[u,he]=n.useState(-1),[N,ue]=n.useState(1),[c,f]=n.useState(!1),[g,b]=n.useState(!1),[m,me]=n.useState(!0),[C,j]=n.useState([]),[pe,A]=n.useState([]),[v,F]=n.useState([]),[xe,P]=n.useState(!1),[W,$]=n.useState(""),[H,V]=n.useState([]),[p,y]=n.useState(-1),[L,D]=n.useState("philo_routine"),[J,U]=n.useState([]),[R,q]=n.useState(""),[_,G]=n.useState(null),[B,T]=n.useState(0),Q=n.useRef(null),E=n.useRef(null),d=n.useRef({philos:[],forks:[],dead:!1,simTime:0});n.useEffect(()=>{var e;(e=Q.current)==null||e.scrollIntoView({behavior:"smooth"})},[v]);const fe=()=>({philos:d.current.philos.map(e=>({...e})),forks:d.current.forks.map(e=>({...e})),logs:[...v],simTime:d.current.simTime,code:L,lines:[...J],action:R,active:_}),X=e=>{d.current.philos=e.philos.map(a=>({...a})),d.current.forks=e.forks.map(a=>({...a})),d.current.simTime=e.simTime,j([...d.current.philos]),A([...d.current.forks]),T(e.simTime),F(e.logs),D(e.code),U(e.lines),q(e.action),G(e.active)},O=(e,a)=>{const i=ne[e]||ne.init;D(i.sec),U(i.ln),q(a)},Y=(e,a,i,l)=>{const o=d.current.philos.find(s=>s.id===e);F(s=>[...s.slice(-100),{t:l,pid:e,sk:a,a:i,eat:(o==null?void 0:o.eatCount)||0}])},Z=()=>{const e=[],a=[];for(let i=0;i<h;i++){const l=i%2===0?i:(i+1)%h,o=i%2===0?(i+1)%h:i;e.push({id:i+1,state:r.THINKING,eatCount:0,lastMealTime:0,leftFork:l,rightFork:o,stateEndTime:i%2===0?1:0,forksHeld:0}),a.push({id:i,owner:null})}d.current={philos:e,forks:a,dead:!1,simTime:0},j(e),A(a),T(0),F([]),V([]),y(-1),P(!1),$(""),O("init","All philosophers initialized and thinking")},ge=()=>{Z(),f(!0),b(m),m||setTimeout(K,50)},be=()=>{f(!1),b(!1),d.current.dead=!0,clearTimeout(E.current)},_e=()=>{g?(b(!1),K()):(b(!0),clearTimeout(E.current))},ke=()=>{p>0&&(X(H[p-1]),y(e=>e-1))},Ne=()=>{p<H.length-1?(X(H[p+1]),y(e=>e+1)):ee()},ee=()=>{if(!c){Z(),f(!0),b(!0);return}const e=fe();V(a=>[...a,e]),y(a=>a+1),te(!0)},te=(e=!1)=>{const a=d.current;if(a.dead)return!1;const i=e?5:Math.max(5,20/N);a.simTime+=i;const l=a.simTime;for(let s of a.philos){if(s.state===r.DEAD)continue;const w=l-s.lastMealTime;if(w>k)return s.state=r.DEAD,a.dead=!0,Y(s.id,"dead",`💀 DIED! (${Math.round(w)}ms without food)`,l),O("dead",`P${s.id} starved after ${Math.round(w)}ms`),G(s.id),j([...a.philos]),T(l),P(!0),$(`💀 Philosopher ${s.id} died after ${Math.round(w)}ms!`),f(!1),!0}if(u>0&&a.philos.every(s=>s.eatCount>=u))return a.dead=!0,P(!0),$(`🎉 All philosophers ate ${u} times!`),f(!1),!0;let o=[];for(let s of a.philos)if(s.state!==r.DEAD)switch(s.state){case r.THINKING:l>=s.stateEndTime&&(a.forks[s.leftFork].owner===null?(a.forks[s.leftFork].owner=s.id,s.forksHeld=1,s.state=r.HAS_LEFT,o.push({id:s.id,act:`🍴 took left fork [${s.leftFork}]`,sk:"has_left"})):s.state=r.WAITING_LEFT);break;case r.WAITING_LEFT:a.forks[s.leftFork].owner===null&&(a.forks[s.leftFork].owner=s.id,s.forksHeld=1,s.state=r.HAS_LEFT,o.push({id:s.id,act:`🍴 took left fork [${s.leftFork}]`,sk:"has_left"}));break;case r.HAS_LEFT:if(h===1)break;a.forks[s.rightFork].owner===null&&(a.forks[s.rightFork].owner=s.id,s.forksHeld=2,s.state=r.HAS_BOTH,s.lastMealTime=l,s.stateEndTime=l+I,o.push({id:s.id,act:`🍴 took right fork [${s.rightFork}]`,sk:"has_both"}));break;case r.HAS_BOTH:s.state!==r.EATING&&(s.state=r.EATING,o.push({id:s.id,act:`🍝 EATING (until ${s.stateEndTime}ms)`,sk:"eating"}));break;case r.EATING:l>=s.stateEndTime&&(s.eatCount++,a.forks[s.leftFork].owner=null,a.forks[s.rightFork].owner=null,s.forksHeld=0,s.state=r.SLEEPING,s.stateEndTime=l+M,o.push({id:s.id,act:`😴 sleeping (meals: ${s.eatCount})`,sk:"sleeping"}));break;case r.SLEEPING:l>=s.stateEndTime&&(s.state=r.THINKING,s.stateEndTime=l,o.push({id:s.id,act:"💭 thinking",sk:"thinking"}));break}if(o.forEach(s=>Y(s.id,s.sk,s.act,l)),o.length>0){const s=o[o.length-1];O(s.sk,s.act),G(s.id)}return j([...a.philos]),A([...a.forks]),T(l),!1},K=()=>{d.current.dead||g||(te(!1),d.current.dead||(E.current=setTimeout(K,Math.max(16,30/N))))};n.useEffect(()=>()=>clearTimeout(E.current),[]);const je=(e,a,i)=>{const l=e*2*Math.PI/a-Math.PI/2;return{x:Math.cos(l)*i,y:Math.sin(l)*i}},ve=(e,a,i)=>{const l=(e+.5)*2*Math.PI/a-Math.PI/2;return{x:Math.cos(l)*i,y:Math.sin(l)*i,rot:l*180/Math.PI+90}},ye=()=>{const e=le[L];return e?t.jsxs("div",{className:"font-mono text-xs leading-tight",children:[t.jsx("div",{className:"text-amber-400 font-bold mb-1",children:e.name}),e.code.split(`
`).map((a,i)=>{const l=i+1,o=J.includes(l);return t.jsxs("div",{className:`flex ${o?"bg-yellow-500/40 border-l-2 border-yellow-400":""}`,children:[t.jsx("span",{className:`w-5 text-right pr-1 ${o?"text-yellow-400 font-bold":"text-gray-600"}`,children:l}),t.jsx("pre",{className:o?"text-yellow-100":"text-gray-500",children:a||" "})]},i)})]}):null},S=Math.min(80,55+h*4),se=S+42,Te=S-6,ae=(se+50)*2;return t.jsxs("div",{className:"min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-2",children:[t.jsx("h1",{className:"text-lg font-bold text-center mb-1 bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent",children:"🍝 Dining Philosophers - Debug Mode"}),t.jsxs("div",{className:"bg-slate-800/60 rounded-lg p-2 mb-2 border border-slate-700",children:[t.jsxs("div",{className:"grid grid-cols-7 gap-1 mb-2 text-xs",children:[t.jsxs("div",{children:[t.jsx("label",{className:"text-gray-400",children:"Philosophers"}),t.jsx("input",{type:"number",min:"1",max:"10",value:h,onChange:e=>oe(Math.min(10,Math.max(1,+e.target.value||1))),disabled:c,className:"w-full bg-slate-700 rounded px-1 py-1 disabled:opacity-50"})]}),t.jsxs("div",{children:[t.jsx("label",{className:"text-gray-400",children:"Time to Die"}),t.jsx("input",{type:"number",value:k,onChange:e=>re(+e.target.value||800),disabled:c,className:"w-full bg-slate-700 rounded px-1 py-1 disabled:opacity-50"})]}),t.jsxs("div",{children:[t.jsx("label",{className:"text-gray-400",children:"Time to Eat"}),t.jsx("input",{type:"number",value:I,onChange:e=>de(+e.target.value||200),disabled:c,className:"w-full bg-slate-700 rounded px-1 py-1 disabled:opacity-50"})]}),t.jsxs("div",{children:[t.jsx("label",{className:"text-gray-400",children:"Time to Sleep"}),t.jsx("input",{type:"number",value:M,onChange:e=>ce(+e.target.value||200),disabled:c,className:"w-full bg-slate-700 rounded px-1 py-1 disabled:opacity-50"})]}),t.jsxs("div",{children:[t.jsx("label",{className:"text-gray-400",children:"Must Eat"}),t.jsx("input",{type:"number",min:"-1",value:u,onChange:e=>he(+e.target.value||-1),disabled:c,className:"w-full bg-slate-700 rounded px-1 py-1 disabled:opacity-50"})]}),t.jsxs("div",{children:[t.jsxs("label",{className:"text-gray-400",children:["Speed: ",N,"x"]}),t.jsx("input",{type:"range",min:"0.5",max:"5",step:"0.5",value:N,onChange:e=>ue(+e.target.value),className:"w-full accent-purple-500"})]}),t.jsxs("div",{className:"flex items-end gap-1",children:[t.jsx("input",{type:"checkbox",id:"step",checked:m,onChange:e=>me(e.target.checked),disabled:c,className:"accent-purple-500"}),t.jsx("label",{htmlFor:"step",children:"Step Mode"})]})]}),t.jsxs("div",{className:"flex gap-1 justify-center flex-wrap text-xs",children:[c?t.jsx("button",{onClick:be,className:"px-3 py-1 bg-red-600 rounded font-bold hover:bg-red-700",children:"⏹ Stop"}):t.jsx("button",{onClick:ge,className:"px-3 py-1 bg-green-600 rounded font-bold hover:bg-green-700",children:"▶ Start"}),c&&!m&&t.jsx("button",{onClick:_e,className:`px-3 py-1 rounded font-bold ${g?"bg-green-600":"bg-yellow-600"}`,children:g?"▶ Resume":"⏸ Pause"}),(m||g)&&c&&t.jsxs(t.Fragment,{children:[t.jsx("button",{onClick:ke,disabled:p<=0,className:"px-3 py-1 bg-blue-600 rounded font-bold disabled:opacity-40",children:"⏮ Back"}),t.jsx("button",{onClick:Ne,className:"px-3 py-1 bg-purple-600 rounded font-bold",children:"Forward ⏭"})]}),!c&&m&&t.jsx("button",{onClick:ee,className:"px-3 py-1 bg-purple-600 rounded font-bold",children:"⏭ Step"})]})]}),t.jsx("div",{className:"mb-2 text-center text-xs",children:t.jsxs("span",{className:"bg-slate-800 px-3 py-1 rounded-full",children:["⏱ Time: ",t.jsxs("span",{className:"text-amber-400 font-bold",children:[B,"ms"]}),t.jsxs("span",{className:"text-gray-500 ml-2",children:["| Step #",p+1]})]})}),xe&&t.jsx("div",{className:`mb-2 p-2 rounded text-center font-bold text-sm ${W.includes("died")?"bg-red-500/30 text-red-300":"bg-green-500/30 text-green-300"}`,children:W}),R&&t.jsx("div",{className:"mb-2 p-1 bg-amber-500/20 rounded text-center text-xs",children:t.jsxs("span",{className:"text-amber-300 font-mono",children:[_&&t.jsxs("b",{children:["[P",_,"]"]})," ",R]})}),t.jsxs("div",{className:"grid grid-cols-3 gap-2",children:[t.jsxs("div",{className:"bg-slate-800/50 rounded-lg p-2 border border-slate-700",children:[t.jsx("div",{className:"text-xs text-gray-400 mb-1 text-center",children:"Table View"}),t.jsx("div",{className:"flex justify-center",children:t.jsxs("div",{className:"relative",style:{width:ae,height:ae},children:[t.jsx("div",{className:"absolute rounded-full bg-gradient-to-br from-amber-700 to-amber-900 border-2 border-amber-600",style:{width:S*2,height:S*2,left:"50%",top:"50%",transform:"translate(-50%,-50%)"}}),t.jsx("div",{className:"absolute text-lg",style:{left:"50%",top:"50%",transform:"translate(-50%,-50%)"},children:"🍝"}),pe.map((e,a)=>{const i=ve(a,h,Te);return t.jsx("div",{className:`absolute text-sm transition-all duration-150 ${e.owner?"opacity-20 scale-50":""}`,style:{left:`calc(50% + ${i.x}px)`,top:`calc(50% + ${i.y}px)`,transform:`translate(-50%,-50%) rotate(${i.rot}deg)`},children:"🍴"},a)}),C.map((e,a)=>{const i=je(a,h,se),l=_===e.id,o=Math.min(100,(B-e.lastMealTime)/k*100);return t.jsxs("div",{className:"absolute flex flex-col items-center",style:{left:`calc(50% + ${i.x}px)`,top:`calc(50% + ${i.y}px)`,transform:"translate(-50%,-50%)"},children:[t.jsx("div",{className:`w-9 h-9 rounded-full flex items-center justify-center text-base border-2 transition-all
                      ${e.state===r.DEAD?"animate-pulse":""}
                      ${e.state===r.EATING?"scale-110":""}
                      ${l?"ring-2 ring-white":""}`,style:{background:x[e.state]+"30",borderColor:x[e.state]},children:z[e.state]}),t.jsxs("div",{className:"text-xs font-bold",children:["P",e.id]}),t.jsxs("div",{className:"text-xs text-amber-400",children:["×",e.eatCount]}),t.jsx("div",{className:"w-7 h-1 bg-gray-700 rounded-full mt-0.5",children:t.jsx("div",{className:`h-full rounded-full transition-all ${o>80?"bg-red-500":o>50?"bg-yellow-500":"bg-green-500"}`,style:{width:`${o}%`}})})]},a)})]})}),t.jsx("div",{className:"mt-2 grid grid-cols-2 gap-0.5 text-xs",children:Object.keys(ie).map(e=>t.jsxs("div",{className:"flex items-center gap-0.5",children:[t.jsx("span",{children:z[e]}),t.jsx("div",{className:"w-1.5 h-1.5 rounded-full",style:{background:x[e]}}),t.jsx("span",{className:"text-gray-400 truncate",children:ie[e]})]},e))})]}),t.jsxs("div",{className:"bg-slate-800/50 rounded-lg p-2 border border-slate-700 flex flex-col",children:[t.jsx("div",{className:"flex gap-0.5 mb-1 text-xs flex-wrap",children:Object.keys(le).map(e=>t.jsx("button",{onClick:()=>D(e),className:`px-1.5 py-0.5 rounded ${L===e?"bg-purple-600":"bg-slate-700 hover:bg-slate-600"}`,children:e.split("_")[0]},e))}),t.jsx("div",{className:"flex-1 overflow-y-auto bg-black/40 rounded p-1 max-h-72",children:ye()})]}),t.jsxs("div",{className:"bg-slate-800/50 rounded-lg p-2 border border-slate-700 flex flex-col",children:[t.jsx("div",{className:"text-xs text-gray-400 mb-1",children:"Activity Log"}),t.jsxs("div",{className:"flex-1 overflow-y-auto bg-black/40 rounded p-1 max-h-72 font-mono text-xs",children:[v.length===0?t.jsx("div",{className:"text-gray-600 text-center py-4",children:"Click Start or Step..."}):v.map((e,a)=>t.jsxs("div",{className:"flex gap-0.5 border-b border-slate-800/50 py-0.5",style:{color:x[e.sk]||"#888"},children:[t.jsxs("span",{className:"text-gray-600 w-10 flex-shrink-0",children:[e.t,"ms"]}),t.jsxs("span",{className:"font-bold",children:["[P",e.pid,"]"]}),t.jsx("span",{className:"truncate",children:e.a})]},a)),t.jsx("div",{ref:Q})]})]})]}),C.length>0&&t.jsx("div",{className:"mt-2 grid grid-cols-5 gap-1 text-xs",children:C.map(e=>{const a=B-e.lastMealTime;return t.jsxs("div",{className:`p-1.5 rounded border text-center ${_===e.id?"ring-1 ring-white":""}`,style:{background:x[e.state]+"20",borderColor:x[e.state]+"60"},children:[t.jsxs("div",{className:"font-bold",children:[z[e.state]," P",e.id]}),t.jsx("div",{className:"text-gray-400 capitalize",children:e.state.replace("_"," ")}),t.jsxs("div",{children:[t.jsxs("span",{className:"text-amber-400",children:["🍝",e.eatCount]}),t.jsxs("span",{className:"text-gray-500 mx-1",children:["🍴",e.forksHeld]})]}),t.jsxs("div",{className:"text-gray-500",children:["hunger: ",a,"ms"]})]},e.id)})}),t.jsx("div",{className:"mt-2 text-center text-xs",children:t.jsxs("code",{className:"bg-slate-800 px-2 py-0.5 rounded text-gray-400",children:["./philo ",h," ",k," ",I," ",M," ",u>0?u:""]})})]})}Ee.createRoot(document.getElementById("root")).render(t.jsx(Se.StrictMode,{children:t.jsx(we,{})}));
