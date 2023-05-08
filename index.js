"use strict";
let reservations = [];

// reserveBox 생성
const createReserveBox = (reservation, status) => {
  const reserveBox = document.createElement("div");
  reserveBox.classList.add("reserveBox");
  reserveBox.dataset.id = reservation.id;
  reserveBox.addEventListener("click", showDetail);

  // statusDiv
  const statusDiv = document.createElement("div");
  statusDiv.classList.add("statusDiv");

  // 예약 시간
  const timeSpan = document.createElement("span");
  timeSpan.classList.add("time");
  const timeReserved = new Date(reservation.timeReserved);
  timeSpan.textContent =
    timeReserved.getHours() +
    ":" +
    timeReserved.getMinutes().toString().padStart(2, "0");

  // 예약 상태
  const statusSpan = document.createElement("span");
  statusSpan.classList.add("status");
  if (status === "reserved") {
    statusSpan.textContent = "예약";
    statusSpan.classList.add("reserved");
  } else {
    statusSpan.textContent = "착석 중";
    statusSpan.classList.add("seated");
  }

  statusDiv.appendChild(timeSpan);
  statusDiv.appendChild(statusSpan);

  // customerDiv
  const customer = reservation.customer;
  const menu = reservation.menus;
  const table = reservation.tables;
  const customerDiv = document.createElement("div");
  customerDiv.classList.add("customerDiv");

  const nameTableSpan = document.createElement("span");
  const tableName =
    table[0].name +
    (table.length > 1
      ? " [" +
        table
          .slice(1)
          .map((r) => r.name)
          .join(", ") +
        "]"
      : "");
  nameTableSpan.textContent = `${customer.name}-${tableName}`;

  const adultChildSpan = document.createElement("span");
  adultChildSpan.textContent = `성인 ${customer.adult} 아이 ${customer.child}`;

  const menuSpan = document.createElement("span");
  const menuName =
    `${menu[0].name}(${menu[0].qty})` +
    (menu.length > 1
      ? " [" +
        menu
          .slice(1)
          .map((r) => `${r.name}(${r.qty})`)
          .join(" ,") +
        "]"
      : "");
  menuSpan.textContent = menuName;

  customerDiv.appendChild(nameTableSpan);
  customerDiv.appendChild(adultChildSpan);
  customerDiv.appendChild(menuSpan);

  // buttonDiv
  const buttonDiv = document.createElement("div");
  buttonDiv.classList.add("buttonDiv");

  const reserveButton = document.createElement("button");
  if (status === "reserved") {
    reserveButton.textContent = "착석";
  } else {
    reserveButton.textContent = "퇴석";
  }
  reserveButton.addEventListener("click", (event) => {
    event.stopPropagation(); //이벤트 전파 방지
    const status = event.target.textContent;
    if (status === "퇴석") {
      if (confirm("퇴석 처리하시겠습니까?")) {
        // 데이터 변경 코드 (요청사항 없으므로 주석처리)
        /* const reserveBox = event.target.closest(".reserveBox");
        const newRsvData = reservations.filter(
          (r) => r.id !== reserveBox.dataset.id
        );
        reservations = newRsvData;
        */

        // element 삭제
        event.target.closest(".reserveBox").remove();
      }
    } else {
      if (confirm("착석 처리하시겠습니까?")) {
        // 예약 목록의 상태 문구 변경 (요청사항 없으므로 주석처리)
        /* const reserveBox = event.target.closest(".reserveBox");
        const targetData = reservations.find(
          (r) => r.id === reserveBox.dataset.id
        );
        targetData.status = "seated";
        reserveBox.querySelector(".status").textContent = "착석 중";
        reserveBox.querySelector(".status").classList = "seated";
        */

        // 버튼 문구 변경
        event.target.textContent = "퇴석";
      }
    }
    // 예약정보 초기화
    clearDetailWrap();
  });
  buttonDiv.appendChild(reserveButton);

  reserveBox.appendChild(statusDiv);
  reserveBox.appendChild(customerDiv);
  reserveBox.appendChild(buttonDiv);

  return reserveBox;
};
let test;
// 예약 리스트에 reserveBox 추가
const addReserveBoxes = () => {
  const reserveDiv = document.querySelector(".reserveDiv");
  reservations.forEach((reservation) => {
    const status = reservation.status;
    if (status === "done") return; // status done일 경우 미표시
    const reserveBox = createReserveBox(reservation, status);
    reserveDiv.appendChild(reserveBox);
  });
};

const showDetail = (event) => {
  if (document.querySelector(".detailWrap").classList.contains("detailClose")) {
    // 배경 blur 이벤트와 겹치는 현상 방지를 위하여
    return;
  }
  const targetId =
    event.target.dataset.id || event.target.closest(".reserveBox").dataset.id;
  const target = reservations.find((r) => r.id === targetId);
  const detailSpan = document.getElementsByClassName("detailSpan");
  for (let i = 0; i < detailSpan.length; i++) {
    const key = detailSpan[i].id.split(".");
    let data;
    if (key.length > 1) {
      data = target[key[0]][key[1]];
    } else {
      if (key[0] === "status") {
        data = target[key[0]] === "seated" ? "착석 중" : "예약";
      } else {
        data = target[key[0]];
      }
    }
    detailSpan[i].innerText = data;
  }

  document.querySelector(".detailWrap").classList.add("detailOpen");
  document.querySelector(".shadow").style.display = "block";
  document.querySelector(".blur").style.display = "block";

  // 닫기버튼, dim 영역 터치시 팝업 종료
  document
    .querySelector(".detailCloseBtn")
    .addEventListener("click", closeDetailWrap);
  document.querySelector(".blur").addEventListener("click", closeDetailWrap);
};

const clearDetailWrap = () => {
  const detailSpan = document.getElementsByClassName("detailSpan");
  for (let i = 0; i < detailSpan.length; i++) {
    detailSpan[i].innerText = "";
  }
};
const closeDetailWrap = () => {
  document.querySelector(".detailWrap").classList.add("detailClose");
  document.querySelector(".shadow").style.display = "none";
  document.querySelector(".blur").style.display = "none";
  setTimeout(() => {
    document.querySelector(".detailWrap").classList.remove("detailClose");
    document.querySelector(".detailWrap").classList.remove("detailOpen");
  }, 500);
};
// 서버에서 데이터 받아온 후 예약 리스트에 reserveBox 추가
fetch("https://frontend.tabling.co.kr/v1/store/9533/reservations")
  .then((response) => response.json())
  .then((data) => {
    reservations = data.reservations;
    addReserveBoxes();
  })
  .catch((error) => console.error(error));
