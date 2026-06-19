import {load,save,loadTarget,saveTarget,loadUnit,saveUnit} from './storage.js';
import {compileRegex,highlight,escapeHtml} from './search.js';
import {
	titleRegex,durationRegex,dateRegex,tagRegex,duplicateRegex,getValidationErrors
} from './validators.js';
import {
	toCanonicalMinutes,fromCanonicalMinutes,unitAbbrev,unitWord,formatDuration
} from './units.js';

let tasks=load();

let editingId=null;

let currentUnit=loadUnit();

let targetMinutes=loadTarget();

const table=document.getElementById('taskTable');
const form=document.getElementById('taskForm');
const statusEl=document.getElementById('status');
const searchErrorEl=document.getElementById('searchError');
const searchResultsEl=document.getElementById('searchResultsStatus');
const targetInput=document.getElementById('targetHours');
const unitSelect=document.getElementById('unitSelect');
const durationInput=document.getElementById('duration');

function setStatus(message){
	statusEl.textContent=message;
}

function formatTimestamp(iso){
	const d=new Date(iso);
	if(isNaN(d)) return '-';
	return d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
}

function updateUnitLabels(){
	const word=unitWord(currentUnit);

	document.getElementById('durationLabel').textContent=`Duration (${word})`;
	document.getElementById('durationHeader').textContent=`Duration (${unitAbbrev(currentUnit)})`;
	document.getElementById('targetLabel').textContent=`Weekly Target (${word})`;

	if(currentUnit==='hours'){
		durationInput.step='0.1';
		durationInput.placeholder='e.g. 2.5';
		targetInput.step='0.5';
		targetInput.placeholder='e.g. 10';
	}else{
		durationInput.step='1';
		durationInput.placeholder='e.g. 90';
		targetInput.step='1';
		targetInput.placeholder='e.g. 600';
	}
}

function refreshTargetInputDisplay(){
	targetInput.value=targetMinutes?fromCanonicalMinutes(targetMinutes,currentUnit):'';
}

function render(){
	let list=[...tasks];

	const rawSearch=document.getElementById('search').value.trim();
	const caseSensitive=document.getElementById('caseToggle').checked;
	let regex=null;
	let tagFilter=null;

	const tagCommand=rawSearch.match(/^@tag:(\w+)/i);

	if(tagCommand){
		tagFilter=tagCommand[1].toLowerCase();
		searchErrorEl.textContent='';
	}else if(rawSearch){
		regex=compileRegex(rawSearch,caseSensitive?'':'i');
		searchErrorEl.textContent=regex?'':'Invalid regex pattern.';
	}else{
		searchErrorEl.textContent='';
	}

	const totalBeforeFilter=list.length;
	if(tagFilter){
		list=list.filter(t=>t.tag.toLowerCase()===tagFilter);
	}else if(regex){
		list=list.filter(t=>regex.test(t.title)||regex.test(t.tag));
	}

	searchResultsEl.textContent=(tagFilter||regex)
		?`${list.length} of ${totalBeforeFilter} task(s) match.`
		:'';

	const sortBy=document.getElementById('sort').value;
	switch(sortBy){
		case 'title-asc': list.sort((a,b)=>a.title.localeCompare(b.title)); break;
		case 'title-desc': list.sort((a,b)=>b.title.localeCompare(a.title)); break;
		case 'date-asc': list.sort((a,b)=>new Date(a.dueDate)-new Date(b.dueDate)); break;
		case 'date-desc': list.sort((a,b)=>new Date(b.dueDate)-new Date(a.dueDate)); break;
		case 'duration-asc': list.sort((a,b)=>a.duration-b.duration); break;
		case 'duration-desc': list.sort((a,b)=>b.duration-a.duration); break;
		default: break;
	}

	table.innerHTML=list.map(t=>{
		let titleHtml=escapeHtml(t.title);
		let tagHtml=escapeHtml(t.tag);
		if(regex){
			titleHtml=highlight(titleHtml,regex);
			tagHtml=highlight(tagHtml,regex);
		}

		return `<tr role="row">
			<td role="cell" data-label="Title">${titleHtml}</td>
			<td role="cell" data-label="Due Date">${escapeHtml(t.dueDate)}</td>
			<td role="cell" data-label="Duration">${escapeHtml(formatDuration(t.duration,currentUnit))}</td>
			<td role="cell" data-label="Tag">${tagHtml}</td>
			<td role="cell" data-label="Created">${escapeHtml(formatTimestamp(t.createdAt))}</td>
			<td role="cell" data-label="Updated">${escapeHtml(formatTimestamp(t.updatedAt))}</td>
			<td role="cell" data-label="Actions" class="actionsCell">
				<button type="button" class="editBtn" data-id="${t.id}" aria-label="Edit ${escapeHtml(t.title)}">Edit</button>
				<button type="button" class="deleteBtn" data-id="${t.id}" aria-label="Delete ${escapeHtml(t.title)}">Delete</button>
			</td>
		</tr>`;
	}).join('');

	updateStats();
	save(tasks);
}

function updateStats(){
	const total=tasks.length;
	const totalDurationMinutes=tasks.reduce((sum,t)=>sum+Number(t.duration),0);

	const tagCounts={};
	tasks.forEach(t=>{ tagCounts[t.tag]=(tagCounts[t.tag]||0)+1; });
	let topTag='-';
	let highestCount=0;
	for(const tag in tagCounts){
		if(tagCounts[tag]>highestCount){
			highestCount=tagCounts[tag];
			topTag=tag;
		}
	}

	document.getElementById('totalTasks').textContent=total;
	document.getElementById('totalHours').textContent=formatDuration(totalDurationMinutes,currentUnit);
	document.getElementById('topTag').textContent=topTag;

	renderTrend();
	checkTarget(totalDurationMinutes);
}

function renderTrend(){
	const container=document.getElementById('trendChart');
	const today=new Date();
	let html='';
	const summaryParts=[];

	for(let i=6;i>=0;i--){
		const day=new Date(today);
		day.setDate(day.getDate()-i);
		const dayStr=day.toISOString().slice(0,10);

		const count=tasks.filter(t=>t.dueDate===dayStr).length;
		const barHeight=Math.max(count*16,2);

		html+=`<div class="trendBar" style="height:${barHeight}px" title="${dayStr}: ${count} task(s)"></div>`;
		summaryParts.push(`${dayStr}: ${count}`);
	}

	container.innerHTML=html;
	container.setAttribute('aria-label',`Tasks due in the last 7 days. ${summaryParts.join(', ')}.`);
}

function checkTarget(totalDurationMinutes){
	const msg=document.getElementById('targetMessage');

	if(!targetMinutes||targetMinutes<=0){
		msg.textContent='';
		return;
	}

	const remainingMinutes=targetMinutes-totalDurationMinutes;
	if(remainingMinutes>=0){
		msg.setAttribute('aria-live','polite');
		msg.textContent=`On track: ${formatDuration(remainingMinutes,currentUnit)} remaining toward your ${formatDuration(targetMinutes,currentUnit)} target.`;
	}else{
		msg.setAttribute('aria-live','assertive');
		msg.textContent=`Target exceeded by ${formatDuration(Math.abs(remainingMinutes),currentUnit)}!`;
	}
}

table.addEventListener('click',e=>{
	const id=e.target.dataset.id;
	if(!id) return;

	if(e.target.classList.contains('deleteBtn')){
		deleteTask(id);
	}else if(e.target.classList.contains('editBtn')){
		startEdit(id);
	}
});

function deleteTask(id){
	const task=tasks.find(t=>t.id===id);
	if(!task) return;

	const confirmed=confirm(`Delete "${task.title}"?`);
	if(confirmed){
		tasks=tasks.filter(t=>t.id!==id);
		setStatus(`Deleted "${task.title}".`);
		if(editingId===id) cancelEdit();
		render();
	}
}

function startEdit(id){
	const task=tasks.find(t=>t.id===id);
	if(!task) return;

	editingId=id;
	document.getElementById('title').value=task.title;
	document.getElementById('dueDate').value=task.dueDate;
	durationInput.value=fromCanonicalMinutes(task.duration,currentUnit);
	document.getElementById('tag').value=task.tag;

	document.getElementById('formHeading').textContent='Edit Task';
	document.getElementById('saveBtn').textContent='Update Task';
	document.getElementById('cancelEditBtn').hidden=false;

	document.getElementById('title').focus();
}

function cancelEdit(){
	editingId=null;
	form.reset();
	document.getElementById('formHeading').textContent='Add Task';
	document.getElementById('saveBtn').textContent='Save Task';
	document.getElementById('cancelEditBtn').hidden=true;
}

document.getElementById('cancelEditBtn').addEventListener('click',cancelEdit);

form.addEventListener('submit',e=>{
	e.preventDefault();

	const title=document.getElementById('title').value;
	const dueDate=document.getElementById('dueDate').value;
	const durationRaw=durationInput.value;
	const tag=document.getElementById('tag').value;

	if(!titleRegex.test(title)){
		setStatus('Error: title cannot be empty or have leading/trailing spaces.');
		return;
	}
	if(duplicateRegex.test(title)){
		setStatus('Error: title has a duplicated word (e.g. "the the").');
		return;
	}
	if(!durationRegex.test(durationRaw)){
		setStatus(`Error: duration must be a positive number of ${unitWord(currentUnit)}, e.g. ${currentUnit==='hours'?'2 or 2.5':'30 or 90'}.`);
		return;
	}
	if(!dateRegex.test(dueDate)){
		setStatus('Error: date must be a valid YYYY-MM-DD date.');
		return;
	}
	if(!tagRegex.test(tag)){
		setStatus('Error: tag may only contain letters, spaces and hyphens.');
		return;
	}

	const durationMinutes=toCanonicalMinutes(durationRaw,currentUnit);

	if(editingId){
		const task=tasks.find(t=>t.id===editingId);
		task.title=title;
		task.dueDate=dueDate;
		task.duration=durationMinutes;
		task.tag=tag;
		task.updatedAt=new Date().toISOString();

		setStatus(`Updated "${title}".`);
		cancelEdit();
	}else{
		const now=new Date().toISOString();
		tasks.push({
			id:'rec_'+Date.now(),
			title,dueDate,duration:durationMinutes,tag,
			createdAt:now,updatedAt:now
		});

		setStatus(`Added "${title}".`);
		form.reset();
	}

	render();
});

document.getElementById('search').addEventListener('input',render);
document.getElementById('sort').addEventListener('change',render);
document.getElementById('caseToggle').addEventListener('change',render);

unitSelect.value=currentUnit;
updateUnitLabels();
refreshTargetInputDisplay();

unitSelect.addEventListener('change',()=>{
	currentUnit=unitSelect.value;
	saveUnit(currentUnit);
	updateUnitLabels();
	refreshTargetInputDisplay();

	if(editingId){
		const task=tasks.find(t=>t.id===editingId);
		if(task) durationInput.value=fromCanonicalMinutes(task.duration,currentUnit);
	}

	render();
});

targetInput.addEventListener('input',()=>{
	targetMinutes=targetInput.value?toCanonicalMinutes(targetInput.value,currentUnit):0;
	saveTarget(targetMinutes);
	render();
});

document.getElementById('exportBtn').addEventListener('click',()=>{
	const blob=new Blob([JSON.stringify(tasks,null,2)],{type:'application/json'});
	const a=document.createElement('a');
	a.href=URL.createObjectURL(blob);
	a.download='planner-data.json';
	a.click();
	URL.revokeObjectURL(a.href);
	setStatus(`Exported ${tasks.length} task(s).`);
});

document.getElementById('importFile').addEventListener('change',e=>{
	const file=e.target.files[0];
	if(!file) return;

	const reader=new FileReader();
	reader.onload=()=>{
		try{
			const data=JSON.parse(reader.result);

			if(!Array.isArray(data)){
				throw new Error('the file must contain a JSON array of tasks.');
			}
			if(data.length===0){
				throw new Error('the file does not contain any tasks.');
			}

			const problems=[];
			data.forEach((rec,i)=>{
				const errs=getValidationErrors(rec);
				if(errs.length) problems.push(`Task #${i+1}: ${errs[0]}`);
			});

			if(problems.length){
				const preview=problems.slice(0,3).join(' | ');
				const more=problems.length>3?` (+${problems.length-3} more issue(s))`:'';
				throw new Error(`${problems.length} task(s) failed validation -- ${preview}${more}`);
			}

			tasks=data;
			setStatus(`Imported ${data.length} task(s) successfully.`);
			render();
		}catch(err){
			setStatus('Import failed: '+err.message);
		}
	};
	reader.onerror=()=>setStatus('Import failed: could not read the file.');
	reader.readAsText(file);

	e.target.value='';
});

render();
