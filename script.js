// 젬 타입별 데이터 정의 (의지력 범위 포함)
const gemTypes = {
  "질서-안정": { willMin:3, willMax:8, effects:["공격력","추가 피해","낙인력","아군 피해 강화"] },
  "질서-견고": { willMin:4, willMax:9, effects:["공격력","보스 피해","아군 피해 강화","아군 공격 강화"] },
  "질서-불변": { willMin:5, willMax:10, effects:["추가 피해","보스 피해","낙인력","아군 공격 강화"] },
  "혼돈-침식": { willMin:3, willMax:8, effects:["공격력","추가 피해","낙인력","아군 피해 강화"] },
  "혼돈-왜곡": { willMin:4, willMax:9, effects:["공격력","보스 피해","아군 피해 강화","아군 공격 강화"] },
  "혼돈-붕괴": { willMin:5, willMax:10, effects:["추가 피해","보스 피해","낙인력","아군 공격 강화"] }
};

let currentCore = { name:null, will:0, points:[], faction:null };
let currentRole = null;
let gemCount = 0;

// 요약 바 동적 생성
function ensureSummaryBar(){
  let summary = document.getElementById("selectionSummary");
  if(!summary){
    const gc = document.getElementById("gemsContainer");
    if(gc){
      summary = document.createElement("div");
      summary.id = "selectionSummary";
      summary.style.display = "none";
      summary.style.margin = "8px 0";
      summary.style.padding = "6px 8px";
      summary.style.background = "#f4f7ff";
      summary.style.border = "1px solid #ccd6ff";
      summary.style.fontWeight = "600";
      gc.parentNode.insertBefore(summary, gc);
    }
  }
  return summary;
}

function updateSummary(){
  const summary = ensureSummaryBar();
  if(!summary) return;
  if(currentCore.name && currentCore.faction && currentRole){
    summary.innerText = `${currentCore.name} / ${currentCore.faction} / ${currentRole}`;
    summary.style.display = "block";
  } else {
    summary.innerText = "";
    summary.style.display = "none";
  }
}

// 코어 선택
function selectCore(btn){
  currentCore.name = btn.dataset.name;
  currentCore.will = parseInt(btn.dataset.will);
  currentCore.points = btn.dataset.points.split(",").map(Number);
  currentCore.faction = null;

  const coreBtns = document.getElementById("coreButtons");
  if(coreBtns) coreBtns.style.display = "none";

  updateSummary();

  document.getElementById("gemsContainer").innerHTML = "";
  gemCount = 0;
  addGem();
}

// 계열 선택
function selectFaction(faction){
  if(!currentCore.name){
    alert("먼저 코어를 선택하세요!");
    return;
  }
  currentCore.faction = faction;

  const facBtns = document.getElementById("factionButtons");
  if(facBtns) facBtns.style.display = "none";

  updateSummary();

  for(let i=1;i<=gemCount;i++){
    const sel = document.getElementById(`gem${i}Type`);
    if(sel){
      sel.innerHTML = "<option value=''>선택</option>";
      Object.keys(gemTypes).forEach(type=>{
        if(type.startsWith(faction)){
          const o = document.createElement("option");
          o.value = type;
          o.text = type;
          sel.add(o);
        }
      });
    }
  }
}

// 역할 선택
function setRole(role){
  currentRole = role;
  const roleBox = document.querySelector(".role-buttons");
  if(roleBox) roleBox.style.display = "none";
  updateSummary();
}

// 젬 추가
function addGem(){
  gemCount++;
  const container = document.getElementById("gemsContainer");
  const div = document.createElement("div");
  div.className = "gem-block";
  div.id = `gemBlock${gemCount}`;
  div.style.border = "1px solid #ccc";
  div.style.padding = "6px";
  div.style.margin = "6px 0";

  div.innerHTML = `
    <div style="margin-bottom:4px;">
      <label>젬${gemCount} 타입:
        <select id="gem${gemCount}Type" onchange="updateGemOptions(${gemCount})" 
                style="min-width:140px; font-size:14px; padding:2px 4px;">
          <option value="">선택</option>
        </select>
      </label>
      의지력 <input type="number" class="big-input" id="gem${gemCount}Will" 
                  style="width:60px; font-size:14px; padding:2px 4px;">
      포인트 <input type="number" class="big-input" id="gem${gemCount}Point" 
                  min="1" max="9" value="1" 
                  style="width:60px; font-size:14px; padding:2px 4px;">
      <button onclick="removeGem(${gemCount})" 
              style="margin-left:8px; padding:2px 6px;">삭제</button>
    </div>
    <div id="gem${gemCount}Effects" style="margin-left:8px;"></div>
  `;
  container.appendChild(div);

  if(currentCore.faction){
    const sel = document.getElementById(`gem${gemCount}Type`);
    Object.keys(gemTypes).forEach(type=>{
      if(type.startsWith(currentCore.faction)){
        const o = document.createElement("option");
        o.value = type;
        o.text = type;
        sel.add(o);
      }
    });
  }
}

// 젬 삭제
function removeGem(num){
  const block = document.getElementById(`gemBlock${num}`);
  if(block) block.remove();
}

// 효과 선택 제한 (최대 2개)
function limitEffects(num, event){
  const effectsDiv = document.getElementById(`gem${num}Effects`);
  const checks = effectsDiv.querySelectorAll("input[type=checkbox]");
  const checked = [...checks].filter(c=>c.checked);
  if(checked.length > 2){
    alert("효과는 최대 2개까지만 선택 가능합니다.");
    event.target.checked = false;
  }
}

// 젬 타입 선택 시 효과 옵션 표시
function updateGemOptions(num){
  const type = document.getElementById(`gem${num}Type`).value;
  const willInput = document.getElementById(`gem${num}Will`);
  const effectsDiv = document.getElementById(`gem${num}Effects`);

  if(type && gemTypes[type]){
    const gem = gemTypes[type];
    willInput.min = gem.willMin;
    willInput.max = gem.willMax;
    willInput.placeholder = `${gem.willMin}~${gem.willMax}`;

    effectsDiv.innerHTML = "";
    gem.effects.forEach((eff, idx)=>{
      effectsDiv.innerHTML += `
        <label style="display:inline-block; margin:4px 8px 4px 0;">
          <input type="checkbox" id="gem${num}Eff${idx}" onchange="limitEffects(${num}, event)">
          ${eff} 값:
          <input type="number" class="big-input" id="gem${num}EffVal${idx}" value="1" min="1" max="5" 
                 style="width:60px; font-size:14px; padding:2px 4px;">
        </label>
      `;
    });
  } else {
    willInput.value = "";
    effectsDiv.innerHTML = "";
  }
}

// 페이지 로드 시 기본 젬 1개 + 요약 바 생성
window.onload = function(){
  ensureSummaryBar();
  addGem();
};

// 공격형/지원형 분류
const atkEffects = ["공격력","추가 피해","보스 피해"];
const supEffects = ["낙인력","아군 피해 강화","아군 공격 강화"];

// 계산하기
function calculate(){
  if(!currentCore.name || !currentCore.faction || !currentRole){
    alert("코어, 계열, 역할을 모두 선택하세요!");
    return;
  }

  const gemBlocks = document.querySelectorAll(".gem-block");
  const gems = [];

  gemBlocks.forEach(block=>{
    const num = block.id.replace("gemBlock","");
    const type = document.getElementById(`gem${num}Type`).value;

    let will = +document.getElementById(`gem${num}Will`).value || 0;
    let point = +document.getElementById(`gem${num}Point`).value || 0;

    let effects = [];
    let dealerScore = 0;
    let supporterScore = 0;

    const effectsDiv = document.getElementById(`gem${num}Effects`);
    if(type && effectsDiv){
      [...effectsDiv.querySelectorAll("input[type=checkbox]")].forEach((chk, idx)=>{
        if(chk.checked){
          const effName = gemTypes[type].effects[idx];
          const val = parseInt(document.getElementById(`gem${num}EffVal${idx}`).value) || 0;
          if(val < 1 || val > 5){
            alert(`젬${num} 효과 ${effName} 잘못된 입력입니다.`);
          } else {
            effects.push(`${effName} Lv${val}`);
            if(atkEffects.includes(effName)) dealerScore += val;
            if(supEffects.includes(effName)) supporterScore += val;
          }
        }
      });
    }

    gems.push({type, will, point, effects, dealerScore, supporterScore});
  });

  const sumWill = gems.reduce((a,g)=>a+g.will,0);
  const sumPoint = gems.reduce((a,g)=>a+g.point,0);

  let canEquip = sumWill <= currentCore.will;
  let activeZones = currentCore.points.map(p => `${p}P: ${sumPoint>=p?"O":"X"}`).join(" / ");

  let text = `[코어] ${currentCore.name} (의지력 ${currentCore.will}, 계열 ${currentCore.faction}) / 역할 ${currentRole}\n`;
  gems.forEach((g,i)=>{
    text += `[젬${i+1}] ${g.type || "-"} (의지력 ${g.will}, 포인트 ${g.point})\n`;
    text += `효과: ${g.effects.join(", ")}\n`;
    text += `→ 딜러 점수: ${g.dealerScore} / 서포터 점수: ${g.supporterScore}\n`;
    if(currentRole === "딜러") text += `★ 내 점수(딜러): ${g.dealerScore}\n`;
    if(currentRole === "서포터") text += `★ 내 점수(서포터): ${g.supporterScore}\n`;
  });
  text += `[결과]\n총합 의지력: ${sumWill}\n총합 포인트: ${sumPoint}\n`
        + `코어 장착 가능: ${canEquip?"O":"X"}\n활성화 구간: ${activeZones}`;

  document.getElementById("result").innerText = text;
  document.getElementById("saveText").value = text;
}

// 입력값 초기화
function resetInputs(){
  currentCore = {name:null, will:0, points:[], faction:null};
  currentRole = null;
  gemCount = 0;

  const coreBtns = document.getElementById("coreButtons");
  const facBtns = document.getElementById("factionButtons");
  const roleBox = document.querySelector(".role-buttons");

  if(coreBtns) coreBtns.style.display = "block";
  if(facBtns) facBtns.style.display = "block";
  if(roleBox) roleBox.style.display = "block";

  const summary = document.getElementById("selectionSummary");
  if(summary){ summary.style.display = "none"; summary.innerText = ""; }

  document.getElementById("gemsContainer").innerHTML = "";
  document.getElementById("result").innerText = "";
  document.getElementById("saveText").value = "";

  addGem();
}

// 결과 복사
function copyResult(){
  const text = document.getElementById("saveText").value;
  if(!text){ alert("복사할 결과가 없습니다."); return; }
  navigator.clipboard.writeText(text).then(()=>alert("결과가 복사되었습니다!"));
}

// 결과 저장 (txt 파일 다운로드)
function saveToFile(){
  const text = document.getElementById("saveText").value;
  if(!text){ alert("저장할 결과가 없습니다."); return; }
  const blob = new Blob([text], {type:"text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "arcgrid_result.txt";
  a.click();
  URL.revokeObjectURL(url);
}

// 불러오기 (붙여넣은 텍스트 파싱 → 젬 자동 생성/입력, 잘못된 값은 무시)
function loadFromText(){
  const text = document.getElementById("saveText").value;
  if(!text){ alert("불러올 텍스트가 없습니다."); return; }

  const lines = text.split("\n");
  const coreLine = lines[0];
  const coreMatch = coreLine.match(/\[코어\] (\S+) \(의지력 (\d+), 계열 (\S+)\) \/ 역할 (\S+)/);
  if(coreMatch){
    currentCore.name = coreMatch[1];
    currentCore.will = parseInt(coreMatch[2]);
    currentCore.faction = coreMatch[3];
    currentRole = coreMatch[4];

    const coreBtns = document.getElementById("coreButtons");
    const facBtns = document.getElementById("factionButtons");
    const roleBox = document.querySelector(".role-buttons");
    if(coreBtns) coreBtns.style.display = "none";
    if(facBtns) facBtns.style.display = "none";
    if(roleBox) roleBox.style.display = "none";
    updateSummary();
  }

  document.getElementById("gemsContainer").innerHTML = "";
  gemCount = 0;
  let currentGemIdx = 0;

  lines.forEach(line=>{
    const gemMatch = line.match(/\[젬(\d+)\] (\S+) \(의지력 (\d+), 포인트 (\d+)\)/);
    if(gemMatch){
      currentGemIdx = parseInt(gemMatch[1]);
      const type = gemMatch[2];
      const will = parseInt(gemMatch[3]);
      const point = parseInt(gemMatch[4]);

      addGem();

      const sel = document.getElementById(`gem${currentGemIdx}Type`);
      sel.innerHTML = `<option value="${type}">${type}</option>`;
      sel.value = type;
      updateGemOptions(currentGemIdx);

      const gem = gemTypes[type];
      if(will < gem.willMin || will > gem.willMax){
        alert(`젬${currentGemIdx} 의지력 잘못된 입력입니다.`);
      } else {
        document.getElementById(`gem${currentGemIdx}Will`).value = will;
      }

      if(point < 1 || point > 9){
        alert(`젬${currentGemIdx} 포인트 잘못된 입력입니다.`);
      } else {
        document.getElementById(`gem${currentGemIdx}Point`).value = point;
      }
    }

    if(line.startsWith("효과:")){
      const effects = line.replace("효과: ","").split(",");
      let applied = 0;
      for(const eff of effects){
        if(applied >= 2) break;
        const m = eff.trim().match(/(.+?) Lv(\d+)/);
        if(m){
          const effName = m[1];
          const val = parseInt(m[2]);
          if(val < 1 || val > 5){
            alert(`효과 ${effName} 잘못된 입력입니다.`);
            continue;
          }
          const gem = gemTypes[document.getElementById(`gem${currentGemIdx}Type`).value];
          if(gem){
            const idx = gem.effects.indexOf(effName);
            if(idx>=0){
              const cb = document.getElementById(`gem${currentGemIdx}Eff${idx}`);
              const lv = document.getElementById(`gem${currentGemIdx}EffVal${idx}`);
              if(cb && lv){
                if(!cb.checked){
                  cb.checked = true;
                  applied++;
                }
                lv.value = val;
              }
            }
          }
        }
      }
    }
  });

  alert("불러오기 완료!");
}