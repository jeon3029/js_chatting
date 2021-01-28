var socket = io()

/* 접속 되었을 때 실행 */
socket.on('connect',  function () {
  /* 이름을 입력받고 */
//  var name;
//  = prompt('반갑습니다!\n닉네임을 설정해 주세요', '')
  showPrompt('반갑습니다!<br>닉네임을 설정해 주세요<br>(입력하지 않을 경우 익명)',
    async function( answer ){
      this.name = await answer;

      if(this.name=='') {
        this.name = '익명'
      }
      console.log(this.name)
      socket.emit('newUser', this.name)

      return answer
    });
  /* 이름이 빈칸인 경우 */
  
//  console.log(this.name)
  /* 서버에 새로운 유저가 왔다고 알림 */
})

/* 서버로부터 데이터 받은 경우 */
socket.on('update', function(data) {
  var chat = document.getElementById('chat')

  var message = document.createElement('div')
  var node = document.createTextNode(`${data.name}: ${data.message}`)
  var className = ''

  // 타입에 따라 적용할 클래스를 다르게 지정
  switch(data.type) {
    case 'message':
      className = 'other'
      break

    case 'connect':
      className = 'connect'
      break

    case 'disconnect':
      className = 'disconnect'
      break
    case 'lastword_start':
      lastword_start();
      className='connect'
      break;  
    case 'lastword_end':
      lastword_end();
      className='connect'
      break;
  }
  message.classList.add(className)
  message.appendChild(node)
  chat.appendChild(message)
  chat.scrollTop = chat.scrollHeight;
})

const TIME_LIMIT = 20;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
const FULL_DASH_ARRAY=283;
// Warning occurs at 10s
const WARNING_THRESHOLD = 10;
// Alert occurs at 5s
const ALERT_THRESHOLD = 5;
const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};
let remainingPathColor = COLOR_CODES.info.color;
function startTimer() {
  timerInterval = setInterval(() => {
    // The amount of time passed increments by one
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    // The time left label is updated
    document.getElementById("base-timer-label").innerHTML = formatTimeLeft(timeLeft);
    setCircleDasharray();
    setRemainingPathColor(timeLeft);
  }, 1000);
}

function lastword_start(){
  console.log('last start')
  var last = document.getElementById('lastword')
  var sec = document.getElementById('seconds')
  var loser = document.getElementById('loser')
  //show element
  last.style.visibility="visible"
  last.style.opacity=1
  
  //set timer  
  document.getElementById("app").innerHTML = `
  <div class="base-timer">
    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g class="base-timer__circle">
        <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
          <path
            id="base-timer-path-remaining"
            stroke-dasharray="283"
            class="base-timer__path-remaining ${remainingPathColor}"
            d="
              M 50, 50
              m -45, 0
              a 45,45 0 1,0 90,0
              a 45,45 0 1,0 -90,0
            "
          ></path>
      </g>
    </svg>
    <span id="base-timer-label" class="base-timer__label">
    </span>
  </div>
  `
  startTimer();
}

function formatTimeLeft(time) {
  // The largest round integer less than or equal to the result of time divided being by 60.
  if (time<0){
    time=0;
  }
  const minutes = Math.floor(time / 60);
  // Seconds are the remainder of the time divided by 60 (modulus operator)
  let seconds = time % 60;
  // If the value of seconds is less than 10, then display seconds with a leading zero
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  // The output in MM:SS format
  return `${minutes}:${seconds}`;
}
function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}
// Update the dasharray value as time passes, starting with 283
function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}
function setRemainingPathColor(timeLeft) {
  console.log("set remain")
  const { alert, warning, info } = COLOR_CODES;
  // If the remaining time is less than or equal to 5, remove the "warning" class and apply the "alert" class.
  if (timeLeft <= alert.threshold) {
//    console.log('warning');
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);

  // If the remaining time is less than or equal to 10, remove the base color and apply the "warning" class.
  } else if (timeLeft <= warning.threshold) {
//    console.log('alert');
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }
}
function lastword_end(){
  console.log('last start')
}
/* 메시지 전송 함수 */
function send() {
  // 입력되어있는 데이터 가져오기
  var message = document.getElementById('test').value
  
  // 가져왔으니 데이터 빈칸으로 변경
  document.getElementById('test').value = ''
  
  var chat = document.getElementById('chat')
  var msg = document.createElement('div')
  
  if(message=='/lastword'){
    message = "끝말잇기가 시작되었습니다."
    
    // print message
    msg.classList.add('lastword')
    var node = document.createTextNode(message)
    msg.appendChild(node)
    chat.appendChild(msg)
    chat.scrollTop = chat.scrollHeight;
    lastword_start();
    // emit to socket mode changed
    socket.emit('message', {type: 'lastword_start', message: message}) 
  }
  else{
    // 내가 전송할 메시지 클라이언트에게 표시
    msg.classList.add('me')
    var node = document.createTextNode(message)
    msg.appendChild(node)
    chat.appendChild(msg)
    chat.scrollTop = chat.scrollHeight;
    // 서버로 message 이벤트 전달 + 데이터와 함께
    socket.emit('message', {type: 'message', message: message})  
  }
}
window.onload=function(){
  var input = document.getElementById('test')
  test.addEventListener("keyup",function(event){
    if(event.keyCode==13){
      send();
    }
  })
}
