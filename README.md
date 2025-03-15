
# 📌 임베디드통신시스템 과제1

---

## 📖 소개

[임베디드통신시스템]강의의 첫 과제로 Arduino와 p5.js를 이용하여 신호등을 제어하는 시스템을 만들어보았습니다. Arduino코드를 짤 때는 vs code에 platformIO를 설치하여 코드를 작성하였습니다.

## 과제 설명

## 

[](https://github.com/user-attachments/assets/392a5fa0-2b37-493c-b5de-a289b4c1ea2c)

[](https://github.com/user-attachments/assets/6c9b41d3-d517-4d35-875e-9e275f2d796b)

## 동작 시연 영상

아래 사진을 클릭하면 동작이 시연되는 것을 확인해볼 수 있습니다.

![](https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg)

---

### vs code에 platformIO를 설치하는 방법

[](https://github.com/user-attachments/assets/abc0ae34-1de2-4ab3-81f5-cc7d7b5016e3)

1. vs code의 좌측에 5번째 항목에 해당하는 확장(extension)을 클릭
2. platformIO를 검색
3. 설치
    
    [](https://github.com/user-attachments/assets/3c2e9460-be3b-4b8f-97e6-183563600337)
    
4. 좌측에 개미모양 아이콘이 생기면 클릭
5. new project를 클릭
    
    [](https://github.com/user-attachments/assets/2687df0f-6cf9-4dab-a043-19fd618e2e5c)
    
6. 프로젝트 이름을 원하는 이름으로 설정
7. 사용할 보드 선택 (저는 Arduino Uno를 사용했습니다.)
    
    [](https://github.com/user-attachments/assets/00ec2917-1bbc-42d3-8e31-4952632e92e1)
    

### 라이브러리에서 프로젝트에 추가

[](https://github.com/user-attachments/assets/81fbb2fd-6c8e-4cfe-a930-267888be8af5)

add project하여 추가하고 싶은 프로젝트를 선택

- TaskScheduler by Anatoli Arkhipenko
- PinChangeInterruptHandler by Andreas Rohner

---

## 하드웨어

### 회로도

직접 연결한 회로도

[](https://github.com/user-attachments/assets/c7c4392d-e8c8-4615-acf0-60cb81d8f60a)

틴커캐드로 정리한 회로도 사진

[](https://github.com/user-attachments/assets/96350202-cc45-4dfd-a3f0-9f57ff66f602)

---

## 소프트웨어

- 자세한 코드는 코드에 포함되어 있는 주석 참고

### Arduino

1️⃣ 아두이노 부팅 시 setup() 실행  
2️⃣ 각 버튼에 대해 인터럽트 설정 (attachPCINT)  
3️⃣ loop()에서 runner.execute() 실행 (TaskScheduler가 모든 동작 관리)  
4️⃣ 버튼을 누르면 모드가 변경되고, setMode()에서 해당 모드의 Task를 실행  
5️⃣ 가변저항을 통해 LED 밝기 조절 가능  
6️⃣ p5.js에서 시리얼 통신으로 신호등 시간 조정 가능  

### p5.js

아두이노와의 시리얼 통신을 통해 신호등 시스템을 웹 UI로 제어할 수 있도록 설계하였습니다.
사용자는 연결 버튼을 눌러 아두이노와 연결하고, 슬라이더를 이용해 신호등의 점등 시간과 밝기를 조절할 수 있습니다.
실제 신호등 상태는 UI에서 실시간으로 반영되며, 설정한 값은 아두이노에 전송됩니다.  
1️⃣ 시리얼 포트 연결 관리   
2️⃣ 신호등 상태 표시 (drawColorCircle())  
3️⃣ 슬라이더 및 버튼을 이용한 값 조정  
4️⃣ 모드 및 밝기 UI 업데이트 (drawIndicators(), drawBrightnessGauge())  
5️⃣ 화면 UI 요소 초기화 (setup())  
