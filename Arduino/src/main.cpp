#include <Arduino.h> // 아두이노 기본 라이브러리, 입출력 함수 제공(pinMode, analogRead, digitalWrite, Serial 등)
#include <TaskScheduler.h>  // 여러 작업(Task)을 일정한 간격으로 실행할 수 있게 해주는 라이브러리.
#include <PinChangeInterrupt.h>  // 특정 핀에서 신호가 변화할 때 인터럽트를 걸 수 있도록 해주는 라이브러리.

// LED 및 버튼 핀 정의
const int LED_R = 6; // 빨간색 LED
const int LED_Y = 3; // 노란색 LED
const int LED_G = 5; // 초록색 LED

const int BUTTON1 = 7; // 버튼 1: EMERGENCY모드
const int BUTTON2 = 8; // 버튼 2: BLINK모드
const int BUTTON3 = 9; // 버튼 3: ON/OFF모드
const int POT_PIN = A0; // 가변저항 입력 핀.

// 시스템 모드 정의
enum Mode { NORMAL, EMERGENCY, BLINK_ALL, OFF }; // 신호등의 4가지 동작 모드 정의
Mode currentMode = NORMAL; // 현재 LED의 동작 모드를 저장하는 변수 

// 밝기 및 신호등 타이머 변수
int redTime = 2000, yellowTime = 500, greenTime = 2000; // 빨간색, 노란색, 초록색 불이 켜지는 시간(단위: ms)
int brightness = 255; // 가변저항으로 설정할 LED밝기
int greenBlinkCount = 0; // 초록색 불이 깜빡이는 횟수(최대 3회)

// 함수 선언
void setMode();
void updateRed();
void updateYellow();
void updateGreen();
void updateGreenBlinkOn();
void updateGreenBlinkOff();
void updateEmergencyMode();
void updateBlinkAllMode();
void updateOffMode();
void readBrightness();
void parseSerialInput(String input);
void buttonPressed1();
void buttonPressed2();
void buttonPressed3();
void updateTime();

// TaskScheduler 설정
Scheduler runner; // TaskScheduler 객체: 여러 작업을 관리 
// Task 태스크이름(시간(이 시간 간격으로 실행), 어떤식으로 실행할지(TASK_ONCE: 한 번만 실행/TASK_FOREVER: 계속 실행), 함수, 스케줄러, 활성화여부)
Task tRed(redTime, TASK_ONCE, &updateRed, &runner, true);
Task tYellow(yellowTime, TASK_ONCE, &updateYellow, &runner, false);
Task tGreen(greenTime, TASK_ONCE, &updateGreen, &runner, false);
Task tGreenBlinkOn(166, TASK_ONCE, &updateGreenBlinkOn, &runner, false);
Task tGreenBlinkOff(166, TASK_ONCE, &updateGreenBlinkOff, &runner, false);
Task tEmergency(100, TASK_FOREVER, &updateEmergencyMode, &runner, false);
Task tBlinkAll(1000, TASK_FOREVER, &updateBlinkAllMode, &runner, false);
Task tOff(100, TASK_FOREVER, &updateOffMode, &runner, false);
Task tBrightness(100, TASK_FOREVER, &readBrightness, &runner, true);
Task tupdateTime(1000, TASK_FOREVER, &updateTime, &runner, true);

void setup() {
    Serial.begin(9600); // 시리얼 통신을 9600bps로 시작
    pinMode(LED_G, OUTPUT);
    pinMode(LED_R, OUTPUT);
    pinMode(LED_Y, OUTPUT); // LED핀을 출력으로 설정 
    pinMode(BUTTON1, INPUT_PULLUP); 
    pinMode(BUTTON2, INPUT_PULLUP); 
    pinMode(BUTTON3, INPUT_PULLUP); // 버튼 핀을 내부 풀업 저항이 활성화된 입력으로 설정
    pinMode(POT_PIN, INPUT); // 가변저항 핀을 입력으로 설정 

    attachPCINT(digitalPinToPCINT(BUTTON1), buttonPressed1, FALLING);
    attachPCINT(digitalPinToPCINT(BUTTON2), buttonPressed2, FALLING);
    attachPCINT(digitalPinToPCINT(BUTTON3), buttonPressed3, FALLING);
    // 버튼이 눌릴 때(FALLING, HIGH -> LOW) 인터럽트 호출하도록 설정
}

void loop() {
    runner.execute(); // TaskScheduler에서 설정한 작업을 실행
}

// 버튼 1누르면 EMERGENCY모드로 변경
void buttonPressed1() {
    // 현재 모드가 이미 EMERGENCY모드라면 NORMAL모드로 돌아감.
    if(currentMode == EMERGENCY){ 
        currentMode = NORMAL;
    }
    else{
        currentMode = EMERGENCY;
    }
    setMode();
}

void buttonPressed2() {
    // 현재 모드가 이미 BLINK_ALL모드라면 NORMAL모드로 돌아감.
    if(currentMode == BLINK_ALL){
        currentMode = NORMAL;
    }
    else{
        currentMode = BLINK_ALL;
    }
    setMode();
}

void buttonPressed3() {
    // 현재 모드가 이미 OFF모드라면 NORMAL모드(ON)로 돌아감.
    if(currentMode == OFF){
        currentMode = NORMAL;
    }
    else{
        currentMode = OFF;
    }
    setMode(); // setMode()호출 
}

void setMode() {
    // 모든 작업(Task) 비활성화 
    tRed.disable();
    tYellow.disable();
    tGreen.disable();
    tGreenBlinkOn.disable();
    tGreenBlinkOff.disable();
    tEmergency.disable();
    tBlinkAll.disable();
    tOff.disable();

    // 현재 모드에 맞는 Task실행 
    // Serial.print("MODE:"); // 시리얼 모니터에 출력하여 p5.js에 값을 보냄 
    switch (currentMode) {
        case NORMAL:
            tRed.restart();
            Serial.println("MODE:NORMAL\n");
            break;
        case EMERGENCY:
            tEmergency.enable();
            Serial.println("MODE:EMERGENCY\n");
            break;
        case BLINK_ALL:
            tBlinkAll.enable();
            Serial.println("MODE:BLINK_ALL\n");
            break;
        case OFF:
            tOff.enable();
            Serial.println("MODE:OFF\n");
            break;
    }
}

// 가변 저항을 읽어 LED밝기를 조절 
void readBrightness() {
    int potValue = analogRead(POT_PIN); // 가변 저항에서 아날로그 값을 읽음(0~1023)
    brightness = map(potValue, 0, 1023, 0, 255); // 읽은 값을 0~255 범위로 변환하여 brightness 변수에 저장 
    Serial.println("BRIGHTNESS:" + String(brightness)); // 현재 밝기를 Serial Monitor에 출력
}

// 빨간불
void updateRed() {
    greenBlinkCount = 0; // 초록불 깜빡임 횟수를 초기화 
    analogWrite(LED_R, brightness); // 현재 밝기 크기만큼 빨간색 LED만 켬
    analogWrite(LED_Y, 0);
    analogWrite(LED_G, 0);
    Serial.println("r"); // 시리얼 모니터에 r출력
    tYellow.restartDelayed(redTime); // redTime(빨간불 지속시간)이 지나면 노란불로 전환 
}

// 노란불 
void updateYellow() {
    analogWrite(LED_R, 0);
    analogWrite(LED_Y, brightness); // 현재 밝기 크기만큼 노란색 LED만 켬
    analogWrite(LED_G, 0);
    Serial.println("y"); // 시리얼 모니터에 y출력
    // 노란 불 켜고 green 상태로 전환
    if (greenBlinkCount <= 3) {
        // 초록불이 깜빡이기 전이면(greenBlinkCount <= 3) 초록불(updateGreen())로 전환
        tGreen.restartDelayed(yellowTime);
    } else { 
        // 초록불이 깜빡인 후라면 다시 빨간불(updateRed())로 전환 
        tRed.restartDelayed(yellowTime);
    }
}

// 초록불 
void updateGreen() {
    analogWrite(LED_R, 0);
    analogWrite(LED_Y, 0);
    analogWrite(LED_G, brightness);  // 현재 밝기 크기만큼 초록색 LED만 켬
    Serial.println("g"); // 시리얼 모니터에 g출력 
    // 초록 불 켜고 green 깜빡임 시작
    // greenBlinkCount = 0; // 초록불 깜빡임 횟수를 초기화 여기서 하는 게 아니라 updateRed에서 해야 함
    tGreenBlinkOff.restartDelayed(greenTime);
}

// 초록불을 깜빡이도록 OFF하는 함수
void updateGreenBlinkOff() {
    analogWrite(LED_R, 0);
    analogWrite(LED_Y, 0);
    analogWrite(LED_G, 0);
    Serial.println("off"); // Serial Monitor에 off 출력.    
    tGreenBlinkOn.restartDelayed(166);
}

// 초록불을 다시 켜서 깜빡이게 하는 함수
void updateGreenBlinkOn() {
    analogWrite(LED_R, 0);
    analogWrite(LED_Y, 0);
    analogWrite(LED_G, brightness); // 현재 밝기 크기만큼 초록색 LED만 켬
    Serial.println("on");
    greenBlinkCount++;
    if (greenBlinkCount <= 3) {
        // 3번 깜빡이기 전이면 updateGreenBlinkOff() 실행 (계속 깜빡이게 함).
        tGreenBlinkOff.restartDelayed(166);
    } else {
        // 3번 깜빡였으면 updateYellow() 실행하여 노란불로 전환
        tYellow.restart();
    }
}

// EMERGENCY모드: 빨간불만 켬 
void updateEmergencyMode() {
    analogWrite(LED_R, brightness);
    analogWrite(LED_G, 0);
    analogWrite(LED_Y, 0);
    Serial.println("r");
}

// BLINK_ALL모드: 모든 LED가 깜빡거림
void updateBlinkAllMode() {
    // state 변수 사용하여 현재 LED 상태를 반전(Toggle) 
    static bool state = false;    
    state = !state;
    if (state) { // state가 true면 모든 LED를 현재 밝기로 켬
        analogWrite(LED_G, brightness);
        analogWrite(LED_R, brightness);
        analogWrite(LED_Y, brightness);
        Serial.println("All"); // Serial Monitor에 ALL 출력
    } else { // state가 false면 모든 LED를 끔
        analogWrite(LED_G, 0);
        analogWrite(LED_R, 0);
        analogWrite(LED_Y, 0);
        Serial.println("off"); // Serial Monitor에 OFF 출력
    }
}

// OFF모드: 모든 LED를 끔
void updateOffMode() {
    analogWrite(LED_G, 0);
    analogWrite(LED_R, 0);
    analogWrite(LED_Y, 0);
    Serial.println("OFF");
}


void updateTime(){
    if (Serial.available() > 0) { // 시리얼 입력(p5.js에서 받아오는 값)이 있으면 
        String input = Serial.readStringUntil('\n'); // 한 줄(\n기준)을 읽어옴
        input.trim(); // 공백 제거
        if (input.startsWith("CHANGE:")) { // CHANGE로 시작하는 형태의 문자열 처리
          // ex) "CHANGE:RED:2000:YELLOW:500:GREEN:3000"
          // indexOf()와 substring()을 이용해 숫자 값을 추출하여 toInt()로 변환
            int rIndex = input.indexOf("RED:") + 4;
            int yIndex = input.indexOf("YELLOW:") + 7;
            int gIndex = input.indexOf("GREEN:") + 6;
        
            int newredTime = input.substring(rIndex, yIndex - 7).toInt();
            int newyellowTime = input.substring(yIndex, gIndex - 6).toInt();
            int newgreenTime = input.substring(gIndex).toInt();
        
            // 변경된 값을 시리얼 모니터에 출력
            Serial.print("UPDATED_TIMES:");
            Serial.print(newredTime);
            Serial.print(",");
            Serial.print(newyellowTime);
            Serial.print(",");
            Serial.println(newgreenTime);
        
            // 변경된 시간 적용
            redTime = newredTime;
            yellowTime = newyellowTime;
            greenTime = newgreenTime;
        }
        // 과제 업그레이드
        if(input.startsWith("MODE:")){
            String motion = input.substring(5);
            if(motion == "EMERGENCY"){
                currentMode = EMERGENCY;
            }
            else if(motion == "BLINK_ALL"){
                currentMode = BLINK_ALL;
            }
            else if(motion == "OFF"){
                currentMode = OFF;
            }
            else if(motion == "NORMAL"){
                currentMode = NORMAL;
            }
            setMode();
        }
        //
    }
}
