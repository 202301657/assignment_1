let port; // 시리얼 통신 포트 객체
let connectBtn; // 아두이노와 연결하는 버튼
// let redSlider, yellowSlider, greenSlider, brightnessSlider;
// 신호등 색상 지속 시간 및 밝기 조절 슬라이더
let mode = "NORMAL"; // 현재 신호등 모드 (기본값 "NORMAL")
let brightness = 255; // LED 밝기 (0~255, 기본값 255)
let redTime = 2000, yellowTime = 500, greenTime = 2000;
// 각 신호등 색의 지속 시간 (기본값 빨간색 2초, 노란색 0.5초, 초록색 2초)
let currentColor = "r";  // 현재 LED 색상 상태 (기본값 "r" → 빨간색)
let brightBtn;
let redTimeBtn;
let yellowTimeBtn;
let greenTimeBtn;
let textMODE = "NORMAL";
// UI에서 값을 표시하는 버튼

// 과제 업그레이드---
let handPose;  // ml5.handPose()를 통해 손 모양을 추적하는 객체
let video;     // 웹캠 비디오 스트림을 받을 변수
let hands = [];  // 추적된 손 데이터를 저장하는 배열
let Lhand = 0;   // 왼손을 구별하기 위한 변수 (현재 사용되지 않음)
let Rhand = 0;   // 오른손을 구별하기 위한 변수 (현재 사용되지 않음)
let keypoints = [];  // 손의 주요 지점을 저장하는 배열 (현재 사용되지 않음)
let fingersUp;      // 손가락이 올라간 상태를 나타내는 변수 (현재 사용되지 않음)
let prevFingersUp = -1; // 이전에 몇 개의 손가락이 올라갔는지 저장하는 변수

// 페이지 로드 시 ml5 모델을 미리 불러옴
function preload() {
  handPose = ml5.handPose();  // handPose 모델을 불러옴
}

// 손 추적 결과를 받는 함수
function gotHands(results) {
  hands = results;  // 추적된 손 데이터를 hands 배열에 저장
}

// 양방향 화살표를 그리는 함수
function drawdirectionalArrow(x, y, len) {
  // 화살표의 선 그리기
  stroke(0);  // 선의 색상을 검정색으로 설정
  line(x, y, x, y + len);  // 주어진 x, y 좌표에서 세로로 선을 그림

  // 위쪽 화살촉
  let arrowSize = 10;  // 화살촉 크기 설정
  beginShape();  // 도형 시작
  vertex(x - arrowSize, y + arrowSize);  // 왼쪽 화살촉
  vertex(x, y);  // 화살표 끝
  vertex(x + arrowSize, y + arrowSize);  // 오른쪽 화살촉
  endShape(CLOSE);  // 도형 끝

  // 아래쪽 화살촉
  beginShape();  // 도형 시작
  vertex(x - arrowSize, y + len - arrowSize);  // 왼쪽 화살촉
  vertex(x, y + len);  // 화살표 끝
  vertex(x + arrowSize, y + len - arrowSize);  // 오른쪽 화살촉
  endShape(CLOSE);  // 도형 끝
}
//------------------

function setup() { // 초기 설정(처음 한 번만 실행)
  createCanvas(500, 700); // 500x700 크기의 캔버스를 생성 (p5.js에서 그래픽 요소를 그릴 공간)
  
  // 과제 업그레이드----
  // 웹캠 캡처를 생성하여 비디오 스트림을 받음
  video = createCapture(VIDEO, {flipped: true});  // 웹캠 비디오 캡처, 'flipped: true'로 비디오 화면을 좌우 반전시킴
  video.size(500, 350);  // 비디오 크기를 500x350으로 설정
  video.hide();  // 비디오 요소를 화면에 표시하지 않음 (캔버스에 그려지지 않도록 숨김)

  // handPose.detectStart() 메서드를 사용하여 손 추적을 시작
  handPose.detectStart(video, gotHands);  // 손 추적을 시작하고, 결과를 gotHands 함수로 전달
  //------------------
  
  port = createSerial(); // 시리얼 포트 객체를 생성

  let usedPorts = usedSerialPorts(); // 사용 가능한 시리얼 포트 목록 가져오기
  if (usedPorts.length > 0) { // 포트가 존재하면 
    // 첫 번째 포트를 9600 baud rate로 열기
    port.open(usedPorts[0], 9600);
  }

  connectBtn = createButton("Connect to Arduino"); // "Connect to Arduino" 버튼 생성
  connectBtn.position(350, 680); // 버튼 위치 설정
  connectBtn.mousePressed(connectBtnClick); // 버튼 클릭 시 connectBtnClick() 실행
  
  
  // 신호등 원 그리기
  fill(100); // 어두운 회색 
  circle(100, 420, 100);  // 빨간색 원 그리기
  circle(250, 420, 100);  // 노란색 원 그리기
  circle(400, 420, 100);  // 초록색 원 그리기
  
  // 텍스트 표시 (모든 경우 동일)
  fill(0); // 검은색  
  textSize(20); // 글자 크기 설정 
  textAlign(CENTER, CENTER); // 중앙 정렬 
  text("R", 100, 420); 
  text("Y", 250, 420);
  text("G", 400, 420);
  // 각 원에 "R", "Y", "G"텍스트 추가 
  
  fill(0); 
  textSize(16); 
  text("redTime: ", 100, 530);
  text("yellowTime: ", 100, 580);
  text("greenTime: ", 100, 630);
  text("Brightness: ", 100, 490);
  // 지속 시간 및 밝기 레이블 표시
  
  // 밝기 및 신호등 지속 시간을 표시하는 버튼 생성
  // 밝기 값 표시
  brightBtn = createButton(str(brightness));
  brightBtn.position(150, 480);
  // Time 값 표시
  redTimeBtn = createButton(str(redTime));
  redTimeBtn.position(140, 520);
  yellowTimeBtn = createButton(str(yellowTime));
  yellowTimeBtn.position(150, 570);
  greenTimeBtn = createButton(str(greenTime));
  greenTimeBtn.position(150, 620);
  
  // Change 버튼을 생성하고 changeBtnClick() 함수와 연결
  changeBtn = createButton("Change");
  changeBtn.position(380, 570);
  changeBtn.mousePressed(changeBtnClick);

  // 위아래 화살촉이 있는 세로 화살표 그리기
  drawdirectionalArrow(400, 10, 200);
  
  frameRate(60);  // 초당 60프레임으로 설정
}


function draw() {   // 반복 실행됨 
  // 과제 업그레이드---
  // 비디오 캡처를 화면에 그리기 (캔버스의 왼쪽 상단(0, 0) 위치에 비디오를 맞추고, 화면 크기에 맞게 크기를 설정)
  image(video, 0, 0, width, height / 2);  // 비디오를 캔버스에 표시, 화면의 윗부분 절반만 비디오로 채움

  // 손에 대한 반복문
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];  // hands 배열에서 각 손을 가져옴
    keypoints = hand.keypoints;  // 손의 주요 키포인트(관절 위치) 정보 저장

    // 손의 키포인트마다 반복
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];  // 각 손의 키포인트를 가져옴
      
      // 화면 상단 절반에만 점을 표시 (y 좌표가 화면 절반보다 작을 때만 처리)
      if (keypoint.y < height / 2 - 10) {
        fill(255, 0, 0);  // 빨간색으로 점을 채움
        noStroke();  // 점 주위의 선을 없앰
        circle(500 - keypoint.x, keypoint.y, 10);  // 점을 그리는데 x는 좌우 반전되어 그려짐
      }
    }
    
    // 손 제스처 분석 함수 호출
    Left_Right();  // 손이 왼손인지 오른손인지 구분하는 함수 호출

    // 왼손만 인식된 경우 (Lhand가 1이고 Rhand가 0일 때)
    if (Lhand == 1 && Rhand == 0){ 
      detectGestureL(hand, keypoints);  // 왼손 제스처를 감지하는 함수 호출
    }

    // 오른손만 인식된 경우 (Lhand가 0이고 Rhand가 1일 때)
    if (Lhand == 0 && Rhand == 1){
      detectGestureR(hand, keypoints);  // 오른손 제스처를 감지하는 함수 호출
    }
  }
  //------------------
  
  if (port.available()) { // 새로운 시리얼 데이터가 있는지 확인
    let str = port.readUntil("\n").trim(); // 한 줄("\n"기준) 읽고 trim()으로 공백 제거
    // print("str:",str,"\n"); // 시리얼 모니터에 출력

    if (str.startsWith("BRIGHTNESS:")) {
      brightness = int(str.substring(11));  // "BRIGHTNESS:120"에서 숫자 부분 추출
    }
    else if(str.startsWith("MODE:")){
      let motion = str.substring(5);
      textMODE = motion;
      print("Mode changed to:", motion); // 바뀐 모드를 콘솔에 출력 
    }
    currentColor = str;
  }

  drawIndicators();  // Mode 텍스트 업데이트
  drawColorCircle(); // 신호등 색깔 업데이트
  drawBrightnessGauge();
  
  // 과제 업그레이드---
  drawBidirectionalArrow(400, 10, 200); // 화면에 주기 조정 범위를 나타내는 화살표
  //------------------
}

// 과제 업그레이드---
// 손가락 개수를 세어 특정 제스처를 감지하는 함수
function detectGestureL(hand, keypoints) {
  fingersUp = countFingers(hand);  // 현재 손가락 개수 측정

  // 손가락 개수가 이전과 동일하면 아무 작업도 수행하지 않음 (중복 감지 방지)
  if (fingersUp === prevFingersUp) {
    return;
  }
  prevFingersUp = fingersUp; // 현재 손가락 개수를 이전 상태로 저장
  print("L fingersUp:", fingersUp, "\n"); // 현재 손가락 개수 출력

  // 손가락 개수에 따라 모드 변경
  if (fingersUp == 0) { // 주먹을 쥐었을 때
    mode = "EMERGENCY"; // EMERGENCY 모드로 변경
  } 
  else if (fingersUp == 1) { // 검지 손가락 하나만 펼쳤을 때
    mode = "BLINK_ALL";
  } 
  else if (fingersUp == 2) { // V 모양(검지+중지)일 때
    mode = "OFF";
  } 
  else if (fingersUp == 4) { // 엄지를 제외한 모든 손가락을 펼쳤을 때
    mode = "NORMAL"; // NORMAL 모드로 복귀
  }
    
  // 현재 모드를 아두이노로 전송
  if (port.opened()) {
      let motion = `MODE:${mode}\n`; 
      port.write(motion);
      console.log("Sent to Arduino:", motion); // 전송된 데이터 로그 출력
  }
}

// 오른손으로 특정 손가락 개수에 따라 신호 변경하는 함수
function detectGestureR(hand, keypoints) {
    fingersUp = countFingers(hand);
    print("R fingersUp:", fingersUp, "\n"); // 손가락 개수 출력

    // 검지만 펴져 있을 때: 빨간불 지속 시간 변경
    if (fingersUp === 1 && isIndexFingerExtended(keypoints)) {
      redTime = Math.floor(1 / keypoints[8].y * 10000 + 10 / keypoints[8].y * 8000);
    }
    // V 모양(검지+중지)일 때: 노란불 지속 시간 변경
    if (fingersUp === 2 && isVSign(keypoints)) {
      yellowTime = Math.floor(1 / keypoints[8].y * 10000 + 10 / keypoints[8].y * 8000);
    }
    // 손가락 3개(검지+중지+약지) 펴졌을 때: 초록불 지속 시간 변경
    if (fingersUp === 3 && isThreeSign(keypoints)) {
      greenTime = Math.floor(1 / keypoints[8].y * 10000 + 10 / keypoints[8].y * 8000);
    }
}

// 검지 손가락만 펴져 있는지 확인하는 함수
function isIndexFingerExtended(keypoints) {
  return countFingers(keypoints) === 1 && keypoints[8].y < keypoints[6].y;
}

// 브이(V) 표시인지 확인하는 함수
function isVSign(keypoints) {
  return countFingers(keypoints) === 2 &&
         keypoints[8].y < keypoints[6].y &&  // 검지가 손바닥보다 위에 있음
         keypoints[12].y < keypoints[10].y;  // 중지도 손바닥보다 위에 있음
}

// 3 손가락 표시인지 확인하는 함수
function isThreeSign(keypoints) {
  return countFingers(keypoints) === 3 &&
         keypoints[8].y < keypoints[6].y &&   // 검지가 손바닥보다 위에 있음
         keypoints[12].y < keypoints[10].y && // 중지가 손바닥보다 위에 있음
         keypoints[16].y < keypoints[14].y;   // 약지가 손바닥보다 위에 있음
}

// 왼손인지 오른손인지 판별하는 함수
function Left_Right() {
  let handSide = detectHandSide(hands[0]); // 첫 번째 손만 판별

  if (handSide === "LEFT") {
    Lhand = 1;
    Rhand = 0;
  } else if (handSide === "RIGHT") {
    Lhand = 0;
    Rhand = 1;
  } else {
    Lhand = 0;
    Rhand = 0;
  }
}

// 손이 왼손인지 오른손인지 판별하는 함수
function detectHandSide(hand) {
  keypoints = hand.keypoints;
  
  if (keypoints.length < 21) return "UNKNOWN"; // keypoints가 부족하면 판별 불가능

  let wristX = keypoints[0].x;   // 손목 (0번 keypoint)
  let thumbX = keypoints[4].x;   // 엄지손가락 끝 (4번 keypoint)
  let pinkyX = keypoints[20].x;  // 새끼손가락 끝 (20번 keypoint)

  if (thumbX < wristX && pinkyX > wristX) {
    return "LEFT";  // 왼손 (엄지가 손목 왼쪽, 새끼손가락이 오른쪽)
  } else if (thumbX > wristX && pinkyX < wristX) {
    return "RIGHT"; // 오른손 (엄지가 손목 오른쪽, 새끼손가락이 왼쪽)
  } else {
    return "UNKNOWN"; // 판별 실패
  }
}

// 손가락 개수를 판별하는 함수 (엄지는 별도로 처리)
function countFingers(hand) {
  let fingers = 0;

  // 손가락 끝(keypoints[8], [12], [16], [20])이 손바닥보다 위에 있으면 펼친 것으로 판단
  if (keypoints[8].y < keypoints[6].y) fingers++;  // 검지
  if (keypoints[12].y < keypoints[10].y) fingers++;  // 중지
  if (keypoints[16].y < keypoints[14].y) fingers++;  // 약지
  if (keypoints[20].y < keypoints[18].y) fingers++;  // 새끼손가락

  return fingers;
}
//------------------

// async 붙으면 비동기 함수 : 특정 코드가 끝날 때까지 코드의 실행을 멈추지 않고 다음 코드를 먼저 실행함. (병렬 작동)
// 버튼을 클릭하면 시리얼 포트와 연결/해제
async function connectBtnClick() {
  // try-catch문 : 오류 발생 시 예외 처리 
  try {
    if (!port.opened()) { // 현재 포트가 열려 있는지 확인
      await port.open(9600); // open()메서드는 비동기이므로 await 사
      console.log("Connected to Arduino"); // 연결이 성공하면 콘솔에 메시지 출력 
    } else { // 이미 포트가 열려 있다면 
      port.close();  // 닫기
      console.log("Disconnected"); // 연결 해제시 콘솔 메시지 출력 
    }
  } catch (error) { // 오류 발생시 
    console.error("Serial connection error:", error); // 콘솔에 오류 메시지 출력 
  }
}

// 버튼을 클릭하면 시리얼 통신을 통해 값을 전송
async function changeBtnClick() {
 if (port.opened()) { // 시리얼 포트가 열려 있을 때만 실행 
    let message = `CHANGE:RED:${redTime}:YELLOW:${yellowTime}:GREEN:${greenTime}\n`; 
   // CHANGE 명령과 함께 빨간색, 노란색, 초록색 신호의 지속 시간을 문자열로 만듦
   // \n 추가하여 줄바꿈 (시리얼 통신에서 데이터 패킷 구분을 위해 필요)
    port.write(message); // 문자열을 시리얼 포트를 통해 전송
    console.log("Sent:", message); // 보낸 데이터를 콘솔에 출력
  }
}

// 모드, 밝기, 신호등 타이머 값을 화면에 업데이트
function drawIndicators() {
  fill(255);  // 흰색 배경
  noStroke();  // 테두리 제거
  rect(0, 660, 300, 100);  // 이전 텍스트(Mode:______)가 있던 위치를 지움

  fill(0);  // 글씨 색상 (검은색)
  textSize(16);
  text("Mode: " + textMODE, 100, 680); // 현재 모드 출력 

  brightBtn.html(str(brightness)); // 밝기 버튼의 텍스트를 현재 밝기 값으로 업데이트 
  
  // 각 LED 지속 시간 Time 값 표시
  redTimeBtn.html(str(redTime));
  yellowTimeBtn.html(str(yellowTime));
  greenTimeBtn.html(str(greenTime));
}

function drawBrightnessGauge() {
  fill(200);  // 밝기 게이지 배경 색상
  rect(200, 480, 300, 30);  // 게이지 바 배경

  let gaugeWidth = map(brightness, 0, 255, 0, 300);  // 밝기에 따라 게이지 크기 조절
  fill(255, 255, 200);  // 아이보리색 막대
  rect(200, 480, gaugeWidth, 30); // 밝기에 따라 변경되는 게이지 막대
}

// 현재 신호등 상태에 맞게 원을 색칠하여 신호등을 표시 
function drawColorCircle() {
  
  if(currentColor == "All") { // 모든 LED가 켜진 경우 
    fill("red");
    circle(100, 420, 100);  
    
    fill("yellow");
    circle(250, 420, 100); 
    
    fill("green");
    circle(400, 420, 100); 
  }
  else if(currentColor == "r"){ // 빨간불일 때 
    fill("red");
    circle(100, 420, 100); // 빨간불 위치에 빨간색 원 표시
    
    fill(100);
    circle(250, 420, 100);  // 노란불 위치에 회색원 그리기
    circle(400, 420, 100);  // 초록불 위치에 회색원 그리기
  }
  else if(currentColor == "y"){ // 노란불일 때
    fill("yellow");
    circle(250, 420, 100); // 노란불 위치에 노란색 원 표시 
    
    fill(100);
    circle(100, 420, 100);  // 빨간불 위치에 회색원 그리기
    circle(400, 420, 100);  // 초록불 위치에 회색원 그리기
  }
  else if(currentColor == "g" || currentColor == "on"){
    fill("green");
    circle(400, 420, 100); // 초록불 위치에 초록색 원 표시 
    
    fill(100);
    circle(100, 420, 100);  // 빨간불 위치에 회색원 그리기
    circle(250, 420, 100);  // 노란불 위치에 회색원 그리기
  }
  else if(currentColor == "off" || currentColor == "OFF"){ // LED 전체가 꺼진 상태 
    fill(100);
    circle(100, 420, 100);  
    circle(250, 420, 100);  
    circle(400, 420, 100);   // 모든 원을 회색으로 표시 
  }
  
  // 텍스트 표시 (모든 경우 동일)
  // 각 신호등 원에 "R", "Y", "G" 텍스트 추가 
  fill(0);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("R", 100, 420);
  text("Y", 250, 420);
  text("G", 400, 420);
}
