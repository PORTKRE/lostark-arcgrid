// 젬 타입별 데이터 정의 (의지력 범위 포함)
const gemTypes = {
  "질서-안정": { 
    willMin:3, willMax:8, 
    effects:["공격력","추가 피해","낙인력","아군 피해 강화"],
    faction: "질서"
  },
  "질서-견고": { 
    willMin:4, willMax:9, 
    effects:["공격력","보스 피해","아군 피해 강화","아군 공격 강화"],
    faction: "질서"
  },
  "질서-불변": { 
    willMin:5, willMax:10, 
    effects:["추가 피해","보스 피해","낙인력","아군 공격 강화"],
    faction: "질서"
  },
  "혼돈-침식": { 
    willMin:3, willMax:8, 
    effects:["공격력","추가 피해","낙인력","아군 피해 강화"],
    faction: "혼돈"
  },
  "혼돈-왜곡": { 
    willMin:4, willMax:9, 
    effects:["공격력","보스 피해","아군 피해 강화","아군 공격 강화"],
    faction: "혼돈"
  },
  "혼돈-붕괴": { 
    willMin:5, willMax:10, 
    effects:["추가 피해","보스 피해","낙인력","아군 공격 강화"],
    faction: "혼돈"
  }
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
  
  // 각 선택 상태를 실시간으로 표시
  const coreText = currentCore.name || "미선택";
  const factionText = currentCore.faction || "미선택";
  const roleText = currentRole || "미선택";
  
  summary.innerText = `${coreText} / ${factionText} / ${roleText}`;
  summary.style.display = "block";
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
                  style="width:60px; font-size:14px; padding:2px 4px; color:#999; font-style:italic;"
                  placeholder="젬 타입을 먼저 선택하세요"
                  onchange="validateGemWill(${gemCount})">
      포인트 <input type="number" class="big-input" id="gem${gemCount}Point" 
                  min="1" max="5" value="1" 
                  style="width:60px; font-size:14px; padding:2px 4px;"
                  onchange="validateGemPoint(${gemCount})">
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

// 체크박스 토글 시 숫자 입력 표시/숨김
function toggleEffect(num, idx){
  const checkbox = document.getElementById(`gem${num}Eff${idx}`);
  const input = document.getElementById(`gem${num}EffVal${idx}`);
  
  if(checkbox.checked){
    input.style.display = "inline-block";
    input.value = ""; // 빈 값으로 설정
  } else {
    input.style.display = "none";
    input.value = "";
  }
}

// 드롭다운 → 숫자 입력 동기화
function syncInputs(num, idx){
  const select = document.getElementById(`gem${num}EffVal${idx}`);
  const input = document.getElementById(`gem${num}EffInput${idx}`);
  if(select && input){
    input.value = select.value;
  }
}

// 숫자 입력 → 드롭다운 동기화
function syncSelects(num, idx){
  const input = document.getElementById(`gem${num}EffInput${idx}`);
  const select = document.getElementById(`gem${num}EffVal${idx}`);
  if(input && select){
    select.value = input.value;
  }
}

// 효과 선택 제한 (최대 2개)
function limitEffects(num, event){
  const effectsDiv = document.getElementById(`gem${num}Effects`);
  const checkboxes = effectsDiv.querySelectorAll("input[type=checkbox]");
  const checked = [...checkboxes].filter(c=>c.checked);
  if(checked.length > 2){
    alert("효과는 최대 2개까지만 선택 가능합니다.");
    // 가장 마지막에 체크된 것을 자동으로 해제
    const lastChecked = [...checkboxes].filter(c=>c.checked).pop();
    if(lastChecked){
      lastChecked.checked = false;
      const input = document.getElementById(`gem${num}EffVal${lastChecked.id.replace('Eff', 'EffVal')}`);
      if(input) input.style.display = "none";
    }
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
    willInput.style.color = "#666";
    willInput.style.fontStyle = "italic";
    
    // 기본값을 빈 값으로 설정
    willInput.value = ""; // 빈 값으로 설정
    const pointInput = document.getElementById(`gem${num}Point`);
    pointInput.value = ""; // 빈 값으로 설정

    effectsDiv.innerHTML = "";
    gem.effects.forEach((eff, idx)=>{
      effectsDiv.innerHTML += `
        <div style="margin:4px 0;">
          <label style="display:inline-block; margin-right:8px;">
            <input type="checkbox" id="gem${num}Eff${idx}" onchange="toggleEffect(${num}, ${idx}); limitEffects(${num}, event)">
            ${eff} 값:
          </label>
          <input type="number" id="gem${num}EffVal${idx}" min="1" max="5" value="" 
                 placeholder="1-5"
                 style="width:60px; font-size:14px; padding:2px 4px; display:none;">
        </div>
      `;
    });
  } else {
    willInput.value = "";
    willInput.placeholder = "젬 타입을 먼저 선택하세요";
    willInput.style.color = "#999";
    willInput.style.fontStyle = "italic";
    effectsDiv.innerHTML = "";
  }
}

// 젬 포인트 유효성 검사 (코어 활성화 포인트)
function validateGemPoint(num){
  const pointInput = document.getElementById(`gem${num}Point`);
  const point = parseInt(pointInput.value) || 0;
  
  if(point < 1 || point > 5){
    alert(`젬${num} 포인트는 1~5 사이의 값이어야 합니다.`);
    pointInput.value = Math.max(1, Math.min(5, point));
    return false;
  }
  return true;
}

// 젬 의지력 유효성 검사
function validateGemWill(num){
  const type = document.getElementById(`gem${num}Type`).value;
  const willInput = document.getElementById(`gem${num}Will`);
  const will = parseInt(willInput.value) || 0;
  
  if(type && gemTypes[type]){
    const gem = gemTypes[type];
    if(will < gem.willMin || will > gem.willMax){
      alert(`젬${num} 의지력은 ${gem.willMin}~${gem.willMax} 사이의 값이어야 합니다.`);
      willInput.value = Math.max(gem.willMin, Math.min(gem.willMax, will));
      return false;
    }
    // 유효한 값 입력 시 스타일 정상화
    willInput.style.color = "#000";
    willInput.style.fontStyle = "normal";
  }
  return true;
}

// 페이지 로드 시 기본 젬 1개 + 요약 바 생성
window.onload = function(){
  ensureSummaryBar();
  addGem();
};

// 공격형/지원형 분류
const atkEffects = ["공격력","추가 피해","보스 피해"];
const supEffects = ["낙인력","아군 피해 강화","아군 공격 강화"];

// 젬 평가 및 추천 함수
function evaluateGems(gems, currentRole){
  return gems.map((gem, index) => {
    let roleScore = 0;
    let roleSuitability = "낮음";
    
    if(currentRole === "딜러"){
      roleScore = gem.dealerScore;
      if(roleScore >= 4) roleSuitability = "높음";
      else if(roleScore >= 2) roleSuitability = "중간";
    } else if(currentRole === "서포터"){
      roleScore = gem.supporterScore;
      if(roleScore >= 4) roleSuitability = "높음";
      else if(roleScore >= 2) roleSuitability = "중간";
    }
    
    return {
      ...gem,
      index: index + 1,
      roleScore,
      roleSuitability
    };
  });
}

// 젬 최적화 추천 함수 (우선순위: 코어 활성화 > 역할별 효과)
function getOptimalGemCombination(gems, currentCore, currentRole){
  const validGems = gems.filter(g => g.type && g.will > 0 && g.point > 0);
  
  // 의지력 제한 내에서 가능한 모든 조합 찾기
  const combinations = [];
  
  function findCombinations(remainingGems, currentCombination, currentWill, currentPoint){
    if(currentWill > currentCore.will) return; // 의지력 초과
    
    // 현재 조합이 유효한지 확인
    if(currentCombination.length > 0){
      // 1순위: 코어 활성화 확인
      const canActivate = currentCore.points.some(point => currentPoint >= point);
      
      // 2순위: 역할별 점수 계산
      const roleScore = currentCombination.reduce((sum, g) => 
        currentRole === "딜러" ? sum + g.dealerScore : sum + g.supporterScore, 0);
      
      combinations.push({
        gems: [...currentCombination],
        totalWill: currentWill,
        totalPoint: currentPoint,
        canActivate: canActivate,
        roleScore: roleScore,
        // 우선순위 점수: 활성화 가능하면 높은 점수, 그 다음 역할 점수
        priorityScore: canActivate ? 1000 + roleScore : roleScore
      });
    }
    
    // 다음 젬 추가 시도
    for(let i = 0; i < remainingGems.length; i++){
      const gem = remainingGems[i];
      const newWill = currentWill + gem.will;
      const newPoint = currentPoint + gem.point;
      
      if(newWill <= currentCore.will){
        findCombinations(
          remainingGems.slice(i + 1),
          [...currentCombination, gem],
          newWill,
          newPoint
        );
      }
    }
  }
  
  findCombinations(validGems, [], 0, 0);
  
  // 우선순위 점수 순으로 정렬 (활성화 가능한 것 우선, 그 다음 역할 점수)
  return combinations.sort((a, b) => b.priorityScore - a.priorityScore);
}

// 젬 추천 순위 계산 (활성화 우선 + 역할 점수)
function getGemRecommendations(gems, currentCore, currentRole){
  const validGems = gems.filter(g => g.type && g.will > 0 && g.point > 0);
  
  // 모든 가능한 젬 조합 찾기 (의지력 제한 내에서)
  const combinations = [];
  
  function findCombinations(remainingGems, currentCombination, currentWill, currentPoint){
    if(currentWill > currentCore.will) return; // 의지력 초과
    
    // 현재 조합이 유효한지 확인
    if(currentCombination.length > 0){
      // 활성화 가능 여부
      const canActivate = currentCore.points.some(point => currentPoint >= point);
      
      // 역할 점수 계산
      const roleScore = currentCombination.reduce((sum, g) => 
        currentRole === "딜러" ? sum + g.dealerScore : sum + g.supporterScore, 0);
      
      combinations.push({
        gems: [...currentCombination],
        gemNumbers: currentCombination.map(g => g.index), // 젬 번호 추가
        totalWill: currentWill,
        totalPoint: currentPoint,
        canActivate: canActivate,
        roleScore: roleScore,
        // 우선순위: 활성화 > 역할 점수
        priorityScore: (canActivate ? 100000 : 0) + roleScore
      });
    }
    
    // 다음 젬 추가 시도
    for(let i = 0; i < remainingGems.length; i++){
      const gem = remainingGems[i];
      const newWill = currentWill + gem.will;
      const newPoint = currentPoint + gem.point;
      
      if(newWill <= currentCore.will){
        findCombinations(
          remainingGems.slice(i + 1),
          [...currentCombination, gem],
          newWill,
          newPoint
        );
      }
    }
  }
  
  findCombinations(validGems, [], 0, 0);
  
  // 우선순위 점수 순으로 정렬 (활성화 > 역할 점수)
  return combinations.sort((a, b) => b.priorityScore - a.priorityScore);
}

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

    gems.push({type, will, point, effects, dealerScore, supporterScore, index: parseInt(num)});
  });

  // 화면 표시용 (젬 조합 추천만)
  let displayText = `[젬 조합 추천 (${currentRole} 역할 기준)]\n`;
  const recommendations = getGemRecommendations(gems, currentCore, currentRole);
  recommendations.slice(0, 5).forEach((combo, idx) => {
    displayText += `${idx + 1}. 젬${combo.gemNumbers.join(", ")} 조합 - `;
    displayText += `활성화: ${combo.canActivate ? "O" : "X"} / ${currentRole} 점수: ${combo.roleScore} / `;
    displayText += `의지력: ${combo.totalWill}/${currentCore.will} / 포인트: ${combo.totalPoint}\n`;
  });

  // 저장용 (젬 정보만)
  let saveText = `[젬 정보]\n`;
  gems.forEach((g,i)=>{
    saveText += `[젬${i+1}]\n`;
    saveText += `종류: ${g.type || "-"}\n`;
    saveText += `의지력: ${g.will}\n`;
    saveText += `포인트: ${g.point}\n`;
    saveText += `부여효과: ${g.effects.join(", ") || "없음"}\n\n`;
  });

  document.getElementById("result").innerText = displayText;
  document.getElementById("saveText").value = saveText;
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

// 불러오기 (젬 정보 파싱해서 젬 생성)
function loadFromText(){
  const text = document.getElementById("saveText").value;
  if(!text){ alert("불러올 텍스트가 없습니다."); return; }

  const lines = text.split("\n");
  
  // 젬 정보 파싱
  let currentGemIdx = 0;
  let currentGemData = null;

  document.getElementById("gemsContainer").innerHTML = "";
  gemCount = 0;

  lines.forEach((line, idx)=>{
    // 젬 정보 파싱
    if(line.startsWith("[젬")){
      const gemMatch = line.match(/\[젬(\d+)\]/);
      if(gemMatch){
        currentGemIdx = parseInt(gemMatch[1]);
        currentGemData = {};
      }
    }

    if(currentGemData){
      if(line.startsWith("종류:")){
        currentGemData.type = line.replace("종류: ", "").trim();
      } else if(line.startsWith("의지력:")){
        currentGemData.will = parseInt(line.replace("의지력: ", "").trim());
      } else if(line.startsWith("포인트:")){
        currentGemData.point = parseInt(line.replace("포인트: ", "").trim());
      } else if(line.startsWith("부여효과:")){
        currentGemData.effects = line.replace("부여효과: ", "").trim();
        
        // 젬 생성 및 데이터 입력
        if(currentGemData.type && currentGemData.will && currentGemData.point){
          addGem();
          
          const sel = document.getElementById(`gem${currentGemIdx}Type`);
          if(sel){
            sel.innerHTML = `<option value="${currentGemData.type}">${currentGemData.type}</option>`;
            sel.value = currentGemData.type;
            updateGemOptions(currentGemIdx);
          }

          const willInput = document.getElementById(`gem${currentGemIdx}Will`);
          const pointInput = document.getElementById(`gem${currentGemIdx}Point`);
          if(willInput) willInput.value = currentGemData.will;
          if(pointInput) pointInput.value = currentGemData.point;

          // 효과 설정
          if(currentGemData.effects && currentGemData.effects !== "없음"){
            const effects = currentGemData.effects.split(",");
            let applied = 0;
            for(const eff of effects){
              if(applied >= 2) break;
              const m = eff.trim().match(/(.+?) Lv(\d+)/);
              if(m){
                const effName = m[1].trim();
                const val = parseInt(m[2]);
                if(val >= 1 && val <= 5){
                  const gem = gemTypes[currentGemData.type];
                  if(gem){
                    const effIdx = gem.effects.indexOf(effName);
                    if(effIdx >= 0){
                      const cb = document.getElementById(`gem${currentGemIdx}Eff${effIdx}`);
                      const lv = document.getElementById(`gem${currentGemIdx}EffVal${effIdx}`);
                      if(cb && lv){
                        cb.checked = true;
                        lv.value = val;
                        applied++;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        currentGemData = null;
      }
    }
  });

  alert("불러오기 완료!");
}


// 설명서 새창으로 열기
function toggleHelp(){
  const helpContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>아크 그리드 계산기 설명서</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f8f9fa; }
        .help-content { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h2 { color: #2c3e50; font-size: 28px; margin-bottom: 20px; text-align: center; }
        h5 { color: #4a90e2; margin: 20px 0 12px 0; font-size: 20px; font-weight: 700; border-bottom: 2px solid #e9ecef; padding-bottom: 6px; }
        p { margin: 12px 0; font-size: 18px; line-height: 1.6; color: #2c3e50; }
        strong { color: #4a90e2; font-weight: 700; font-size: 19px; }
        .controls { text-align: center; margin: 20px 0; }
        .font-controls { text-align: center; margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 8px; }
        button { background: #4a90e2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 0 5px; }
        button:hover { background: #357abd; }
        .font-btn { background: #6c757d; padding: 6px 12px; font-size: 14px; }
        .font-btn:hover { background: #5a6268; }
      </style>
    </head>
    <body>
      <div class="help-content">
        <h2>📖 아크 그리드 계산기 설명서</h2>
        
        <div class="font-controls">
          <span style="margin-right: 10px; font-weight: bold;">글자 크기:</span>
          <button onclick="adjustFontSize(-0.1)" class="font-btn" title="글자 크기 줄이기">A-</button>
          <button onclick="adjustFontSize(0.1)" class="font-btn" title="글자 크기 키우기">A+</button>
          <button onclick="resetFontSize()" class="font-btn" title="기본 크기로">초기화</button>
        </div>
        
        <h5>🎯 사용법</h5>
        <p><strong>1. 코어 선택:</strong> 영웅, 전설, 유물, 고대 중 선택</p>
        <p><strong>2. 젬 설정:</strong> 젬 타입, 의지력, 포인트, 효과 선택</p>
        <p><strong>3. 계산:</strong> 자동으로 최적 조합 계산 및 추천</p>
        <p><strong>4. 저장:</strong> 계산 결과를 복사하거나 파일로 저장 가능</p>
        <p><strong>5. 불러오기:</strong> 저장된 텍스트를 불러와서 젬 설정 복원 가능</p>
        
        
        <h5>⚔️ 효과 분류</h5>
        <p><strong>딜러용:</strong> 공격력, 추가 피해, 보스 피해</p>
        <p><strong>서포터용:</strong> 낙인력, 아군 피해 강화, 아군 공격 강화</p>
        
        <h5>🔧 코어 활성화</h5>
        <p>젬 포인트 합계가 코어 요구 포인트 이상이면 활성화</p>
        <p>영웅: 10포인트, 전설: 10/14포인트, 유물/고대: 10/14/17/18/19/20포인트</p>
        
        <h5>💾 저장/불러오기</h5>
        <p>계산 후 젬 정보를 복사하거나 파일로 저장 가능</p>
        <p>저장된 텍스트를 불러와서 젬 설정 복원 가능</p>
        
        <h5>🎮 게임 팁</h5>
        <p><strong>젬 조합 전략:</strong> 코어 활성화를 우선으로 하되, 역할에 맞는 효과를 선택하세요</p>
        <p><strong>의지력 관리:</strong> 코어의 의지력 한계 내에서 최대한 많은 젬을 장착하세요</p>
        <p><strong>효과 선택:</strong> 딜러는 공격력/추가피해/보스피해, 서포터는 낙인력/아군강화 효과를 우선하세요</p>
        
        <h5>⚠️ 주의사항</h5>
        <p>젬 타입은 계열(질서/혼돈)에 따라 제한됩니다</p>
        <p>효과는 젬당 최대 2개까지만 선택 가능합니다</p>
        <p>의지력과 포인트는 젬 타입별로 정해진 범위 내에서만 설정 가능합니다</p>
        
        <h5>🔍 계산기 기능</h5>
        <p><strong>자동 추천:</strong> 입력한 젬들로 가능한 모든 조합을 계산하여 최적의 조합을 추천합니다</p>
        <p><strong>활성화 확인:</strong> 코어 활성화 가능 여부를 자동으로 확인합니다</p>
        <p><strong>역할별 점수:</strong> 딜러/서포터 역할에 맞는 효과 점수를 계산합니다</p>
        
        <div class="controls">
          <button onclick="window.close()">닫기</button>
        </div>
      </div>
      
      <script>
        let currentFontScale = 1.0; // 기본 배율
        
        function adjustFontSize(delta) {
          currentFontScale += delta;
          currentFontScale = Math.max(0.5, Math.min(2.0, currentFontScale)); // 0.5배 ~ 2배 제한
          
          // 모든 텍스트 요소에 배율 적용
          const elements = document.querySelectorAll('h2, h5, p, strong');
          elements.forEach(element => {
            const currentSize = parseFloat(getComputedStyle(element).fontSize);
            const baseSize = currentSize / (currentFontScale - delta);
            element.style.fontSize = (baseSize * currentFontScale) + 'px';
          });
        }
        
        function resetFontSize() {
          currentFontScale = 1.0;
          // 모든 텍스트 요소를 기본 크기로 복원
          const elements = document.querySelectorAll('h2, h5, p, strong');
          elements.forEach(element => {
            element.style.fontSize = '';
          });
        }
      </script>
    </body>
    </html>
  `;
  
  const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  newWindow.document.write(helpContent);
  newWindow.document.close();
}
