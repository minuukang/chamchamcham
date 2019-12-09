# 참참참!

![참참참 시연](./.github/example.png)

시연영상 : https://youtu.be/6rrOmDgrmoQ

사이트주소 : https://chamchamcham.minukang.now.sh



숭실대학교 미디어경영학과 제1회 디지털 컨텐츠 경진대회 출품 작품

https://fun.ssu.ac.kr/ko/program/all/view/1304/description

## 팀원

팀명: (前)디앤디랩

* 강민우 (https://github.com/MinuKang) - Front-End Develop
* 노준혁 (https://github.com/njhyuk) - UI/UX Design

## 기술스택

* React (only use hook)
* Typescript
* Styled-Components
* Faceapi-js (Tensorflow)
* Localforage (IndexedDB)

## 기능구현

* `navigator.mediaDevices.getUserMedia` 를 사용한 카메라 접근
* faceapi-js 를 사용하여 카메라의 데이터에서 얼굴 인식
* React hook의 state와 ref를 적절히 혼용하여 훅으로 실시간 얼굴 인식 상태 디스패치
* 사운드 컨텍스트를 구현하여 언제든지 Speak(말하기), Play(재생), Stop(정지)을 할 수 있도록 구현
* 메인페이지
  * 얼굴이 인식되지 않을 경우 시작버튼 비활성화
  * 가장 인식이 잘되는 얼굴로 게임 시작
* 얼굴인식 페이지
  * IndexedDB에 학습된 얼굴 데이터가 없을 경우 진행되는 페이지
  * 얼굴과 코의 위치를 기준하여 왼쪽과 오른쪽 얼굴을 학습
  * 이를 통해 고개를 돌려도 자연스럽게 같은 인물임을 인식할 수 있게됨
  * 학습된 얼굴 데이터는 IndexedDB에 저장하여 게임을 시작할 때 마다 사용
* 게임진행 페이지
  * 3초 이상 고개를 돌리지 않을 경우 안내 메세지 출력
  * 플레이어가 고개를 돌린 방향을 인식하여 컴퓨터는 랜덤으로 방향을 결정
  * 첫판에는 95% 확률로 플레이어 승리, 이후 5% 씩 깎이며 10번째 판부터는 50%의 확률을 유지
  * 이기면 점수 업데이트와 함께 실기간으로 랭킹을 업데이트하여 어느 정도 이기면 순위권에 들 수 있는지 빠르게 확인가능
  * 플레이어가 이길 때 8가지의 랜덤한 응원 소리 출력
* 게임종료 페이지
  * 랭킹과 함께 자신의 랭킹을 자연스럽게 보여주는 애니메이션 구현
  * 메달권에 들 경우 응원의 소리 출력, 아닐 경우 비웃는 소리 출력
* 랭킹 페이지
  * IndexedDB에 저장된 플레이어들의 순위를 출력
  * 게임시작 당시의 화면의 얼굴 부분만 썸네일로 사용하여 프로필 사진으로 지정
  * 프로필 사진을 faceapi-js로 분석하여 나이, 표정, 성별을 판단하고 적절한 이름을 부여
