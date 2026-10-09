(function(root){
'use strict';
const make=(names)=>({students:names.map((name,i)=>({id:'s'+i,name,present:true})),events:[],selected:null});
const counts=(s,id)=>{const events=s.events.filter(e=>e.id===id);return{offered:events.length,shared:events.filter(e=>e.outcome==='shared').length}};
function candidates(s){let pool=s.students.filter(p=>p.present);if(pool.length>1&&s.events.length)pool=pool.filter(p=>p.id!==s.events[s.events.length-1].id);if(!pool.length)return[];const min=Math.min(...pool.map(p=>counts(s,p.id).offered));return pool.filter(p=>counts(s,p.id).offered===min)}
function draw(s,random=Math.random){if(s.selected)throw Error('Resolve current invitation first');const pool=candidates(s);if(!pool.length)throw Error('No students present');const choice=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];s.selected=choice.id;return choice}
function resolve(s,outcome){if(!['shared','pass'].includes(outcome))throw Error('Invalid outcome');if(!s.selected)throw Error('No active invitation');const event={id:s.selected,outcome,time:new Date().toISOString()};s.events.push(event);s.selected=null;return event}
function undo(s){if(s.selected)throw Error('Resolve current invitation first');return s.events.pop()||null}
function valid(s){if(!s||!Array.isArray(s.students)||s.students.length<1||s.students.length>60||!Array.isArray(s.events)||s.events.length>20000)return false;const ids=new Set();for(const p of s.students){if(!p||typeof p.id!=='string'||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>40||typeof p.present!=='boolean')return false;ids.add(p.id)}return (s.selected===null||ids.has(s.selected))&&s.events.every(e=>e&&ids.has(e.id)&&['shared','pass'].includes(e.outcome)&&typeof e.time==='string')}
root.FairTurnCore={make,counts,candidates,draw,resolve,undo,valid};
})(typeof window==='undefined'?globalThis:window);
