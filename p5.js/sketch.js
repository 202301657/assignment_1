let port; // 시리얼 통신 포트 객체
let connectBtn; // 아두이노와 연결하는 버튼
let redSlider, yellowSlider, greenSlider, brightnessSlider;
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
// UI에서 값을 표시하는 버튼

function setup() { // 초기 설정(처음 한 번만 실행)
  createCanvas(800, 600); // 800x600 크기의 캔버스를 생성 (p5.js에서 그래픽 요소를 그릴 공간)
  port = createSerial(); // 시리얼 포트 객체를 생성

  let usedPorts = usedSerialPorts(); // 사용 가능한 시리얼 포트 목록 가져오기
  if (usedPorts.length > 0) { // 포트가 존재하면 
    // 첫 번째 포트를 9600 baud rate로 열기
    port.open(usedPorts[0], 9600);
  }

  connectBtn = createButton("Connect to Arduino"); // "Connect to Arduino" 버튼 생성
  connectBtn.position(350, 400); // 버튼 위치 설정
  connectBtn.mousePressed(connectBtnClick); // 버튼 클릭 시 connectBtnClick() 실행
  
  
  // 신호등 원 그리기
  fill(100); // 어두운 회색 
  circle(100, 100, 100);  // 빨간색 원 그리기
  circle(250, 100, 100);  // 노란색 원 그리기
  circle(400, 100, 100);  // 초록색 원 그리기
  
  // 텍스트 표시 (모든 경우 동일)
  fill(0); // 검은색  
  textSize(20); // 글자 크기 설정 
  textAlign(CENTER, CENTER); // 중앙 정렬 
  text("R", 100, 100); 
  text("Y", 250, 100);
  text("G", 400, 100);
  // 각 원에 "R", "Y", "G"텍스트 추가 
  
  fill(0); 
  textSize(16); 
  text("redTime: ", 240, 260);
  text("yellowTime: ", 240, 310);
  text("greenTime: ", 240, 360);
  text("Brightness: ", 100, 180);
  // 지속 시간 및 밝기 레이블 표시
  
  // 밝기 및 신호등 지속 시간을 표시하는 버튼 생성
  // 밝기 값 표시
  brightBtn = createButton(str(brightness));
  brightBtn.position(150, 170);
  // Time 값 표시
  redTimeBtn = createButton(str(redTime));
  redTimeBtn.position(280, 250);
  yellowTimeBtn = createButton(str(yellowTime));
  yellowTimeBtn.position(290, 300);
  greenTimeBtn = createButton(str(greenTime));
  greenTimeBtn.position(290, 350);
  
  // Change 버튼을 생성하고 changeBtnClick() 함수와 연결
  changeBtn = createButton("Change");
  changeBtn.position(380, 300);
  changeBtn.mousePressed(changeBtnClick);

  // 슬라이더 추가 
  // createSlider(최소값, 최대값, 초기값, 스텝)
  redSlider = createSlider(500, 5000, redTime, 500);
  redSlider.position(50, 250); // 슬라이더 위치 설정 

  yellowSlider = createSlider(500, 5000, yellowTime, 500);
  yellowSlider.position(50, 300);

  greenSlider = createSlider(500, 5000, greenTime, 500);
  greenSlider.position(50, 350);
  
  frameRate(60);  // 초당 60프레임으로 설정
}

function draw() {   // 반복 실행됨 
  if (port.available()) { // 새로운 시리얼 데이터가 있는지 확인
    let str = port.readUntil("\n").trim(); // 한 줄("\n"기준) 읽고 trim()으로 공백 제거
    print("str:",str,"\n"); // 시리얼 모니터에 출력

    if (str.startsWith("MODE:")) { // str에 "MODE:" 포함 시 mode 값 변경
      mode = str.substring(5); // "MODE:" 이후의 값 저장
      print("Mode changed to:", mode); // 바뀐 모드를 콘솔에 출력 
      // print("str:", str, "\n"); : str이 제대로 입력되었는지 알 수 있도록 출력해봄
    } else if (str.startsWith("BRIGHTNESS:")) {
      brightness = int(str.substring(11));  // "BRIGHTNESS:120"에서 숫자 부분 추출
    }
    currentColor = str;
  }

  redTime = redSlider.value();
  yellowTime = yellowSlider.value();
  greenTime = greenSlider.value();

  drawIndicators();  // Mode 텍스트 업데이트
  drawColorCircle(); // 신호등 색깔 업데이트
  drawBrightnessGauge();
}

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
  rect(20, 380, 200, 30);  // 이전 텍스트(Mode:______)가 있던 위치를 지움

  fill(0);  // 글씨 색상 (검은색)
  textSize(16);
  text("Mode: " + mode, 100, 400); // 현재 모드 출력 

  brightBtn.html(str(brightness)); // 밝기 버튼의 텍스트를 현재 밝기 값으로 업데이트 
  
  // 각 LED 지속 시간 Time 값 표시
  redTimeBtn.html(str(redTime));
  yellowTimeBtn.html(str(yellowTime));
  greenTimeBtn.html(str(greenTime));
}

function drawBrightnessGauge() {
  fill(200);  // 밝기 게이지 배경 색상
  rect(50, 200, 300, 30);  // 게이지 바 배경

  let gaugeWidth = map(brightness, 0, 255, 0, 300);  // 밝기에 따라 게이지 크기 조절
  fill(255, 255, 200);  // 아이보리색 막대
  rect(50, 200, gaugeWidth, 30); // 밝기에 따라 변경되는 게이지 막대
}

// 현재 신호등 상태에 맞게 원을 색칠하여 신호등을 표시 
function drawColorCircle() {
  
  if(currentColor == "All") { // 모든 LED가 켜진 경우 
    fill("red");
    circle(100, 100, 100);  
    
    fill("yellow");
    circle(250, 100, 100); 
    
    fill("green");
    circle(400, 100, 100); 
  }
//   else if(currentColor == ""){
    
//   }
  else if(currentColor == "r"){ // 빨간불일 때 
    fill("red");
    circle(100, 100, 100); // 빨간불 위치에 빨간색 원 표시
    
    fill(100);
    circle(250, 100, 100);  // 노란불 위치에 회색원 그리기
    circle(400, 100, 100);  // 초록불 위치에 회색원 그리기
  }
  else if(currentColor == "y"){ // 노란불일 때
    fill("yellow");
    circle(250, 100, 100); // 노란불 위치에 노란색 원 표시 
    
    fill(100);
    circle(100, 100, 100);  // 빨간불 위치에 회색원 그리기
    circle(400, 100, 100);  // 초록불 위치에 회색원 그리기
  }
  else if(currentColor == "g" || currentColor == "on"){
    fill("green");
    circle(400, 100, 100); // 초록불 위치에 초록색 원 표시 
    
    fill(100);
    circle(100, 100, 100);  // 빨간불 위치에 회색원 그리기
    circle(250, 100, 100);  // 노란불 위치에 회색원 그리기
  }
  else if(currentColor == "off" || currentColor == "OFF"){ // LED 전체가 꺼진 상태 
    fill(100);
    circle(100, 100, 100);  
    circle(250, 100, 100);  
    circle(400, 100, 100);   // 모든 원을 회색으로 표시 
  }
  
  // 텍스트 표시 (모든 경우 동일)
  // 각 신호등 원에 "R", "Y", "G" 텍스트 추가 
  fill(0);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("R", 100, 100);
  text("Y", 250, 100);
  text("G", 400, 100);
}
