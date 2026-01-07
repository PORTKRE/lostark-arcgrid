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

// 젬 조합 관련 변수
let gemCombinations = [];
let recommendedCombinations = [];

// 젬 조합 생성기 (4개 젬으로 가능한 모든 조합)
function generateGemCombinations() {
  if (!currentCore.faction) {
    alert("먼저 계열을 선택하세요!");
    return;
  }
  
  const availableGems = Object.keys(gemTypes).filter(gemType => 
    gemTypes[gemType].faction === currentCore.faction
  );
  
  
  // 4개 젬으로 가능한 모든 조합 생성
  gemCombinations = [];
  const combinations = getCombinations(availableGems, 4);
  
  combinations.forEach(combination => {
    const combinationData = calculateCombinationStats(combination);
    gemCombinations.push({
      gems: combination,
      stats: combinationData,
      score: calculateCombinationScore(combinationData)
    });
  });
  
  // 점수순으로 정렬
  gemCombinations.sort((a, b) => b.score - a.score);
  recommendedCombinations = gemCombinations.slice(0, 10); // 상위 10개 추천
  
  console.log("젬 조합 생성 완료:", gemCombinations.length, "개 조합");
}

// 조합 생성 헬퍼 함수
function getCombinations(arr, k) {
  if (k === 1) return arr.map(item => [item]);
  if (k === arr.length) return [arr];
  
  const combinations = [];
  for (let i = 0; i <= arr.length - k; i++) {
    const head = arr[i];
    const tailCombinations = getCombinations(arr.slice(i + 1), k - 1);
    tailCombinations.forEach(tail => {
      combinations.push([head, ...tail]);
    });
  }
  return combinations;
}

// 조합 통계 계산
function calculateCombinationStats(combination) {
  let totalWill = 0;
  let totalPoints = 0;
  let effects = {};
  
  combination.forEach(gemType => {
    const gem = gemTypes[gemType];
    totalWill += gem.willMin; // 최소 의지력으로 계산
    totalPoints += 1; // 기본 포인트
    
    // 효과별 최대 레벨 계산
    gem.effects.forEach(effect => {
      if (!effects[effect]) effects[effect] = 0;
      effects[effect] = Math.max(effects[effect], 5); // 최대 레벨 5
    });
  });
  
  return {
    totalWill,
    totalPoints,
    effects,
    effectCount: Object.keys(effects).length
  };
}

// 조합 점수 계산
function calculateCombinationScore(stats) {
  let score = 0;
  
  // 1순위: 코어 활성화 (최우선)
  const coreActivation = checkCoreActivation(stats.totalPoints);
  if (coreActivation) {
    score += 1000; // 코어 활성화 시 큰 점수 부여
  }
  
  // 2순위: 역할별 효과 (딜러/서포터)
  if (currentRole === '딜러') {
    // 딜러용 효과: 공격력, 추가 피해, 보스 피해
    const dealerEffects = ['공격력', '추가 피해', '보스 피해'];
    dealerEffects.forEach(effect => {
      if (stats.effects[effect]) {
        score += stats.effects[effect] * 20; // 딜러 효과 높은 점수
      }
    });
  } else if (currentRole === '서포터') {
    // 서포터용 효과: 낙인력, 아군 피해 강화, 아군 공격 강화
    const supporterEffects = ['낙인력', '아군 피해 강화', '아군 공격 강화'];
    supporterEffects.forEach(effect => {
      if (stats.effects[effect]) {
        score += stats.effects[effect] * 20; // 서포터 효과 높은 점수
      }
    });
  }
  
  // 3순위: 의지력/포인트 효율성
  score += stats.totalWill * 5;
  score += stats.totalPoints * 3;
  
  // 4순위: 효과 다양성
  score += stats.effectCount * 10;
  
  return score;
}

// 코어 활성화 확인
function checkCoreActivation(totalPoints) {
  if (!currentCore.name) return false;
  
  const requiredPoints = {
    '영웅': 10,
    '전설': 10,
    '유물': 10,
    '고대': 10
  };
  
  return totalPoints >= (requiredPoints[currentCore.name] || 10);
}


// 조합 적용
function applyCombination(index) {
  const combination = recommendedCombinations[index];
  if (!combination) return;
  
  // 기존 젬들 모두 제거
  clearAllGems();
  
  // 추천 조합의 젬들 추가
  combination.gems.forEach((gemType, gemIndex) => {
    addGem();
    const latestGem = gemCount;
    
    // 젬 타입 설정
    const typeSelect = document.getElementById(`gem${latestGem}Type`);
    if (typeSelect) {
      typeSelect.value = gemType;
      updateGemOptions(latestGem);
    }
    
    // 기본 의지력 설정 (최소값)
    const willInput = document.getElementById(`gem${latestGem}Will`);
    if (willInput) {
      willInput.value = gemTypes[gemType].willMin;
    }
    
    // 기본 포인트 설정
    const pointInput = document.getElementById(`gem${latestGem}Point`);
    if (pointInput) {
      pointInput.value = 1;
    }
  });
  
  alert(`추천 조합이 적용되었습니다!\n젬: ${combination.gems.join(', ')}`);
}

// 모든 젬 제거
function clearAllGems() {
  const gemsContainer = document.getElementById('gemsContainer');
  gemsContainer.innerHTML = '';
  gemCount = 0;
}

// 음성인식 관련 변수
let recognition = null;
let isListening = false;
let voiceTimeout = null; // 음성인식 타임아웃 관리

// 음성인식 토글
function toggleVoiceRecognition(){
  if(!currentCore.faction){
    alert("먼저 계열을 선택하세요!");
    return;
  }
  
  if(!isListening){
    isListening = true;
    startVoiceRecognition();
  } else {
    isListening = false;
    stopVoiceRecognition();
  }
}

// 음성인식 시작
function startVoiceRecognition(){
  if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
    alert('이 브라우저는 음성인식을 지원하지 않습니다.');
    return;
  }
  
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'ko-KR';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  
  // 음성인식 설정 (더 오래 기다리도록)
  if(recognition.serviceURI) {
    recognition.serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up';
  }
  
  // 음성인식 타임아웃 설정 (더 길게)
  if(recognition.grammars) {
    recognition.grammars = new SpeechGrammarList();
  }
  
  recognition.onstart = function(){
    document.getElementById('voiceBtn').textContent = '🛑 음성중지';
    document.getElementById('voiceBtn').style.background = 'linear-gradient(135deg, #ff4757, #ff6b6b)';
    console.log('음성인식 시작됨');
    
    // 음성인식 결과 표시 영역 보이기
    document.getElementById('voiceInputDisplay').style.display = 'block';
    document.getElementById('voiceResultText').textContent = '음성인식 중... 말씀해주세요.';
  };
  
  recognition.onresult = function(event){
    let finalTranscript = '';
    let interimTranscript = '';
    
    for(let i = event.resultIndex; i < event.results.length; i++){
      if(event.results[i].isFinal){
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    
    // 중간 결과도 화면에 표시
    if(interimTranscript){
      console.log('중간 결과:', interimTranscript);
      document.getElementById('voiceResultText').textContent = `인식 중: ${interimTranscript}`;
      
      // 중간 결과가 나올 때마다 타임아웃 연장
      if(voiceTimeout) {
        clearTimeout(voiceTimeout);
        console.log('중간 결과 감지, 타임아웃 연장');
      }
    }
    
    // 최종 결과가 있을 때만 처리 (더 긴 문장을 기다림)
    if(finalTranscript){
      console.log('최종 결과:', finalTranscript);
      document.getElementById('voiceResultText').textContent = `인식 완료: ${finalTranscript}`;
      
      // 젬 관련 키워드가 포함되어 있는지 확인 (더 넓은 범위)
      if(finalTranscript.includes('젬') || finalTranscript.includes('의지력') || finalTranscript.includes('포인트') || 
         finalTranscript.includes('안정') || finalTranscript.includes('견고') || finalTranscript.includes('불변') ||
         finalTranscript.includes('침식') || finalTranscript.includes('왜곡') || finalTranscript.includes('붕괴') ||
         finalTranscript.includes('공격력') || finalTranscript.includes('추피') || finalTranscript.includes('보피') ||
         finalTranscript.includes('낙인력') || finalTranscript.includes('아피강') || finalTranscript.includes('아공강')){
        processVoiceCommand(finalTranscript);
      } else {
        console.log('젬 관련 명령이 아님, 무시:', finalTranscript);
        document.getElementById('voiceResultText').textContent = `인식 완료: ${finalTranscript} (젬 관련 명령이 아님)`;
      }
    }
  };
  
  recognition.onerror = function(event){
    console.error('음성인식 오류:', event.error);
    alert('음성인식 중 오류가 발생했습니다: ' + event.error);
  };
  
  recognition.onend = function(){
    console.log('음성인식 세션 종료');
    
    // 음성인식이 끝나면 자동으로 다시 시작 (연속 인식)
    if(isListening){
      document.getElementById('voiceResultText').textContent = '음성인식 대기 중... 천천히 말씀해주세요.';
      
      // 기존 타임아웃이 있으면 취소
      if(voiceTimeout) {
        clearTimeout(voiceTimeout);
      }
      
      // 새로운 타임아웃 설정 (15초)
      voiceTimeout = setTimeout(() => {
        if(isListening){
          console.log('음성인식 재시작 (타임아웃)');
          startVoiceRecognition();
        }
      }, 15000); // 15초 대기 (끊어 말하기 지원)
    }
  };
  
  recognition.start();
}

// 음성인식 중지
function stopVoiceRecognition(){
  if(recognition){
    recognition.stop();
    recognition = null;
  }
  
  // 타임아웃 정리
  if(voiceTimeout) {
    clearTimeout(voiceTimeout);
    voiceTimeout = null;
  }
  
  document.getElementById('voiceBtn').textContent = '🎤 음성입력';
  document.getElementById('voiceBtn').style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e8e)';
  
  // 음성인식 결과 표시 영역 숨기기
  document.getElementById('voiceInputDisplay').style.display = 'none';
  
  console.log('음성인식 중지됨');
}

// 음성 명령 처리
function processVoiceCommand(text){
  console.log('인식된 텍스트:', text);
  
  // 젬 타입 인식 (대체 표현 지원)
  const faction = currentCore.faction;
  let gemType = null;
  
  if(faction === '질서'){
    if(text.includes('안정') || text.includes('안전') || text.includes('안녕')) gemType = '질서-안정';
    else if(text.includes('견고') || text.includes('경고')) gemType = '질서-견고';
    else if(text.includes('불변')) gemType = '질서-불변';
  } else if(faction === '혼돈'){
    if(text.includes('침식')) gemType = '혼돈-침식';
    else if(text.includes('왜곡') || text.includes('외국')) gemType = '혼돈-왜곡';
    else if(text.includes('붕괴')) gemType = '혼돈-붕괴';
  }
  
  if(gemType){
    // 의지력이나 포인트가 포함되어 있을 때만 젬 추가
    // 의지력 인식 패턴 개선 (숫자 인식 강화)
    let willMatch = text.match(/(?:의지력|을지력|의지|을지)\s*(?:이|가|은|는)?\s*(\d+)/);
    let pointMatch = text.match(/포인트\s*(?:이|가|은|는)?\s*(\d+)/);
    
    // 추가 패턴: 의지력 뒤에 오는 숫자 찾기
    if(!willMatch) {
      willMatch = text.match(/(?:의지력|을지력|의지|을지)\s*[^\d]*(\d+)/);
    }
    
    // 한글 숫자 지원 (사, 삼, 사, 오 등)
    if(!willMatch) {
      const koreanNumbers = {'일': '1', '이': '2', '삼': '3', '사': '4', '오': '5'};
      const koreanMatch = text.match(/(?:의지력|을지력|의지|을지)\s*[^\d]*(일|이|삼|사|오)/);
      if(koreanMatch && koreanNumbers[koreanMatch[1]]) {
        willMatch = [koreanMatch[0], koreanNumbers[koreanMatch[1]]];
      }
    }
    
    // 특수 패턴: "의지력 사업" → "의지력 4"로 인식
    if(!willMatch) {
      const businessMatch = text.match(/(?:의지력|을지력|의지|을지)\s*사업/);
      if(businessMatch) {
        willMatch = [businessMatch[0], '4'];
        console.log('사업 → 4로 변환됨');
      }
    }
    
    // 추가 패턴: 포인트 뒤에 오는 숫자 찾기  
    if(!pointMatch) {
      pointMatch = text.match(/포인트\s*[^\d]*(\d+)/);
    }
    
    // 포인트 한글 숫자 지원
    if(!pointMatch) {
      const koreanNumbers = {'일': '1', '이': '2', '삼': '3', '사': '4', '오': '5'};
      const koreanMatch = text.match(/포인트\s*[^\d]*(일|이|삼|사|오)/);
      if(koreanMatch && koreanNumbers[koreanMatch[1]]) {
        pointMatch = [koreanMatch[0], koreanNumbers[koreanMatch[1]]];
      }
    }
    
    // 디버깅용 로그
    console.log('의지력 매칭 결과:', willMatch);
    console.log('포인트 매칭 결과:', pointMatch);
    console.log('원본 텍스트:', text);
    
    if(willMatch && pointMatch){
      // 젬 추가
      addGem();
      const latestGem = gemCount;
      
      // 젬 타입 설정
      const typeSelect = document.getElementById(`gem${latestGem}Type`);
      if(typeSelect){
        typeSelect.value = gemType;
        updateGemOptions(latestGem);
      }
      
      if(willMatch){
        const willInput = document.getElementById(`gem${latestGem}Will`);
        if(willInput) willInput.value = willMatch[1];
      }
      
      if(pointMatch){
        const pointInput = document.getElementById(`gem${latestGem}Point`);
        if(pointInput) pointInput.value = pointMatch[1];
      }
      
      // 효과 설정
      setTimeout(() => {
        console.log('효과 설정 시작:', text);
        setGemEffects(latestGem, text);
      }, 500); // 젬 옵션이 업데이트된 후 실행
      
      alert(`젬이 추가되었습니다: ${gemType}`);
    } else {
      console.log('젬 타입은 인식되었지만 의지력과 포인트 정보가 모두 필요:', gemType);
      document.getElementById('voiceResultText').textContent = `인식 완료: ${finalTranscript} (의지력과 포인트 정보 모두 필요)`;
    }
  } else {
    alert('젬 타입을 인식할 수 없습니다. 다시 말해주세요.');
  }
}

// 젬 효과 설정
function setGemEffects(gemNum, text){
  const gemType = document.getElementById(`gem${gemNum}Type`).value;
  if(!gemType || !gemTypes[gemType]) {
    console.log('젬 타입이 없거나 유효하지 않음:', gemType);
    return;
  }
  
  console.log('젬 타입:', gemType);
  console.log('인식된 텍스트:', text);
  
  const effects = gemTypes[gemType].effects;
  let appliedEffects = 0;
  
  // 효과명과 대체 표현 매핑
  const effectAliases = {
    "공격력": ["공격력", "공격"],
    "추가 피해": ["추가 피해", "추가피해", "추피", "초피"],
    "보스 피해": ["보스 피해", "보스피해", "보피", "부피"],
    "낙인력": ["낙인력", "낙인역", "낙인", "라인력", "마진력"],
    "아군 피해 강화": ["아군 피해 강화", "아군피해강화", "아피강", "앞피강", "아피", "앞피", "앞이강", "아피 강사", "아피강사"],
    "아군 공격 강화": ["아군 공격 강화", "아군공격강화", "아공강"]
  };
  
  effects.forEach((effectName, idx) => {
    if(appliedEffects >= 2) return; // 최대 2개 효과만
    
    // 효과명과 대체 표현들로 확인
    let isMatched = false;
    if(effectAliases[effectName]){
      for(const alias of effectAliases[effectName]){
        if(text.includes(alias)){
          isMatched = true;
          break;
        }
      }
    } else {
      isMatched = text.includes(effectName);
    }
    
    if(isMatched){
      console.log(`효과 매칭 성공: ${effectName}`);
      const checkbox = document.getElementById(`gem${gemNum}Eff${idx}`);
      const input = document.getElementById(`gem${gemNum}EffVal${idx}`);
      
      if(checkbox && input){
        // 체크박스 체크
        checkbox.checked = true;
        console.log(`체크박스 체크됨: ${effectName}`);
        
        // 레벨 추출 (간단하고 확실한 방법)
        let level = 1; // 기본값
        
        console.log(`효과 ${effectName}의 레벨 추출 시도, 텍스트: ${text}`);
        
        // 1. 효과명 바로 뒤의 숫자 찾기
        const directPattern = new RegExp(`${effectName}\\s*(\\d+)`, 'i');
        const directMatch = text.match(directPattern);
        if(directMatch){
          level = parseInt(directMatch[1]);
          console.log(`직접 매칭 성공: ${effectName} = ${level}`);
        } else {
          // 2. 레벨 키워드와 함께 찾기
          const levelPattern = new RegExp(`${effectName}\\s*레벨\\s*(\\d+)`, 'i');
          const levelMatch = text.match(levelPattern);
          if(levelMatch){
            level = parseInt(levelMatch[1]);
            console.log(`레벨 매칭 성공: ${effectName} = ${level}`);
          } else {
            // 3. 텍스트에서 1-5 사이의 모든 숫자 찾기
            const allNumbers = text.match(/\b([1-5])\b/g);
            if(allNumbers && allNumbers.length > 0){
              // 젬 번호, 의지력, 포인트를 제외한 나머지 숫자 사용
              // 보통 젬 번호는 1, 의지력은 3-10, 포인트는 1-5, 효과 레벨은 1-5
              // 효과 레벨은 보통 마지막에 나오므로 마지막 숫자 사용
              level = parseInt(allNumbers[allNumbers.length - 1]);
              console.log(`숫자 추출 성공: ${level} (전체 숫자: ${allNumbers.join(', ')})`);
            }
          }
        }
        
        // 레벨 범위 확인
        if(level < 1 || level > 5){
          level = 1;
          console.log(`레벨 범위 초과, 기본값 1로 설정: ${level}`);
        }
        
        input.value = level;
        console.log(`최종 레벨 설정: ${effectName} = ${level}`);
        
        // toggleEffect 함수 호출하여 UI 업데이트
        toggleEffect(gemNum, idx);
        
        // 입력 필드가 제대로 표시되는지 확인
        setTimeout(() => {
          const finalInput = document.getElementById(`gem${gemNum}EffVal${idx}`);
          if(finalInput){
            console.log(`입력 필드 최종 값: ${finalInput.value}`);
            if(finalInput.value !== level.toString()){
              console.log(`입력 필드 값 불일치! 설정: ${level}, 실제: ${finalInput.value}`);
              finalInput.value = level;
            }
          }
        }, 100);
        
        appliedEffects++;
      }
    }
  });
}

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

  // 계열별 젬 타입 표시
  showVoiceGems();

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

// 계열별 젬 타입 표시
function showVoiceGems(){
  const availableGems = document.getElementById("availableGems");
  
  if(availableGems && currentCore.faction){
    let gemsList = "";
    Object.keys(gemTypes).forEach(type => {
      if(type.startsWith(currentCore.faction)){
        // "질서-안정" -> "안정" 형태로 변환
        const gemName = type.split('-')[1];
        gemsList += `${gemName}/ `;
      }
    });
    
    // 마지막 "/ " 제거
    gemsList = gemsList.slice(0, -2);
    availableGems.textContent = gemsList;
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
    if(currentCombination.length > 4) return; // 최대 4개 제한
    
    // 현재 조합이 유효한지 확인
    if(currentCombination.length > 0){
      // 활성화 가능 여부
      const canActivate = currentCore.points.some(point => currentPoint >= point);
      
      // 역할별 점수 계산
      const roleScore = currentCombination.reduce((sum, g) => 
        currentRole === "딜러" ? sum + g.dealerScore : sum + g.supporterScore, 0);
      
      // 4개 조합에 보너스 점수 부여 (최대한 4개를 맞추는 것이 좋으므로)
      const gemCountBonus = currentCombination.length === 4 ? 100 : 0;
      
      combinations.push({
        gems: [...currentCombination],
        totalWill: currentWill,
        totalPoint: currentPoint,
        canActivate: canActivate,
        roleScore: roleScore,
        // 우선순위 점수: 1순위 포인트 최대화(10000점 단위) > 2순위 역할 점수 > 3순위 4개 조합 보너스
        priorityScore: (currentPoint * 10000) + (roleScore * 100) + gemCountBonus
      });
    }
    
    // 다음 젬 추가 시도 (4개 미만일 때만)
    if(currentCombination.length < 4){
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
    if(currentCombination.length > 4) return; // 최대 4개 제한
    
    // 현재 조합이 유효한지 확인
    if(currentCombination.length > 0){
      // 활성화 가능 여부
      const canActivate = currentCore.points.some(point => currentPoint >= point);
      
      // 역할 점수 계산
      const roleScore = currentCombination.reduce((sum, g) => 
        currentRole === "딜러" ? sum + g.dealerScore : sum + g.supporterScore, 0);
      
      // 4개 조합에 보너스 점수 부여 (최대한 4개를 맞추는 것이 좋으므로)
      const gemCountBonus = currentCombination.length === 4 ? 100 : 0;
      
      combinations.push({
        gems: [...currentCombination],
        gemNumbers: currentCombination.map(g => g.index), // 젬 번호 추가
        totalWill: currentWill,
        totalPoint: currentPoint,
        canActivate: canActivate,
        roleScore: roleScore,
        // 우선순위: 1순위 포인트 최대화(10000점 단위) > 2순위 역할 점수 > 3순위 4개 조합 보너스
        priorityScore: (currentPoint * 10000) + (roleScore * 100) + gemCountBonus
      });
    }
    
    // 다음 젬 추가 시도 (4개 미만일 때만)
    if(currentCombination.length < 4){
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

  // 젬 조합 추천 생성
  generateGemCombinations();
  
  // 화면 표시용 (젬 조합 추천만)
  let displayText = `[젬 조합 추천 (${currentRole} 역할 기준, 최대 4개 조합)]\n`;
  let displayText2 = `우선순위: 1) 포인트 최대화 → 2) ${currentRole} 옵션\n\n`;
  const recommendations = getGemRecommendations(gems, currentCore, currentRole);
  recommendations.slice(0, 5).forEach((combo, idx) => {
    displayText2 += `${idx + 1}. 젬${combo.gemNumbers.join(", ")} 조합 (${combo.gems.length}개) - `;
    displayText2 += `포인트: ${combo.totalPoint} [${combo.canActivate ? "활성화 O" : "활성화 X"}] / `;
    displayText2 += `${currentRole} 점수: ${combo.roleScore} / `;
    displayText2 += `의지력: ${combo.totalWill}/${currentCore.will}`;
    if(combo.gems.length === 4) displayText2 += ` [4개 최대 조합!]`;
    displayText2 += `\n`;
  });
  displayText += displayText2;

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
        
        <h5>🎤 음성인식 사용법</h5>
        <p><strong>음성인식 버튼:</strong> 젬 입력 섹션의 "🎤 음성입력" 버튼 클릭</p>
        <p><strong>음성 명령 예시:</strong></p>
        <p>• "안정 젬 의지력 5 포인트 3"</p>
        <p>• "침식 젬 의지력 4 포인트 2"</p>
        <p>• "안정 젬 의지력 5 포인트 3 공격력 레벨 4"</p>
        <p>• "침식 젬 의지력 4 포인트 2 보스 피해 레벨 3 낙인력 레벨 2"</p>
        <p><strong>효과 입력:</strong> 공격력, 추가 피해, 보스 피해, 낙인력, 아군 피해 강화, 아군 공격 강화</p>
        <p><strong>줄임말 지원:</strong> 공격, 보피, 추피, 아피강, 낙인, 아공강 등</p>
        <p><strong>지원 언어:</strong> 한국어, 영어 (브라우저 설정에 따라 자동 감지)</p>
        <p><strong>음성인식 팁:</strong></p>
        <p>• 천천히 명확하게 말하세요</p>
        <p>• "젬", "의지력", "포인트" 키워드를 포함해서 말하세요</p>
        <p>• 끊어 말하기가 인식에 더 좋습니다 (15초 대기 시간 제공)</p>
        <p>• 예: "안정 젬 의지력 5 포인트 3 공격력 레벨 4"</p>
        <p><strong>주의사항:</strong> 마이크 권한 허용 필요, 조용한 환경에서 사용 권장</p>
        
        
        
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
        <p><strong>우선순위:</strong></p>
        <p>1. 코어 활성화 (최우선)</p>
        <p>2. 역할별 효과 (딜러: 공격관련, 서포터: 지원관련)</p>
        <p>3. 의지력/포인트 효율성</p>
        <p>4. 효과 다양성</p>
        
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

