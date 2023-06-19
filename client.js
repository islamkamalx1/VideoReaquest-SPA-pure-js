const listOfVidsElm = document.getElementById("listOfRequests");
let sortBy = "newFirst";
let searchTerm = "";

function renderSingleVid(vidInfo, isPrepend = false) {
  const vidContainerElm = document.createElement("div");
  vidContainerElm.innerHTML = `
          <div class="card mb-3">
            <div class="card-body d-flex justify-content-between flex-row">
              <div class="d-flex flex-column">
                <h3>${vidInfo.topic_title}</h3>
                <p class="text-muted mb-2">${vidInfo.topic_details}</p>
                <p class="mb-0 text-muted">
                  ${
                    vidInfo.expected_result &&
                    `<strong>Expected results:</strong> ${vidInfo.expected_result}`
                  }
                </p>
              </div>
              <div class="d-flex flex-column text-center">
                <a id="votes_ups_${vidInfo._id}" class="btn btn-link">🔺</a>
                <h3 id="score_vote_${vidInfo._id}">${
    vidInfo.votes.ups - vidInfo.votes.downs
  }</h3>
                <a id="votes_downs_${vidInfo._id}" class="btn btn-link">🔻</a>
              </div>
            </div>
            <div class="card-footer d-flex flex-row justify-content-between">
              <div>
                <span class="text-info">${vidInfo.status.toUpperCase()}</span>
                &bullet; added by <strong>${vidInfo.author_name}</strong> on
                <strong>${new Date(
                  vidInfo.submit_date
                ).toLocaleDateString()}</strong>
              </div>
              <div
                class="d-flex justify-content-center flex-column 408ml-auto mr-2"
              >
                <div class="badge badge-success">${vidInfo.target_level}</div>
              </div>
            </div>
          </div>`;

  isPrepend
    ? listOfVidsElm.prepend(vidContainerElm)
    : listOfVidsElm.appendChild(vidContainerElm);

  const voteUpsElm = document.getElementById(`votes_ups_${vidInfo._id}`);
  const voteDownsElm = document.getElementById(`votes_downs_${vidInfo._id}`);
  const scoreVoteElm = document.getElementById(`score_vote_${vidInfo._id}`);

  voteUpsElm.addEventListener("click", (e) => {
    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: vidInfo._id, vote_type: "ups" }),
    })
      .then((bolb) => bolb.json())
      .then((data) => (scoreVoteElm.innerText = data.ups - data.downs));
  });

  voteDownsElm.addEventListener("click", (e) => {
    fetch("http://localhost:7777/video-request/vote", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: vidInfo._id, vote_type: "downs" }),
    })
      .then((bolb) => bolb.json())
      .then((data) => (scoreVoteElm.innerText = data.ups - data.downs));
  });
}

function loadAllVidsReq(sortBy = "newFirst", searchTerm = "") {
  fetch(
    `http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`
  )
    .then((res) => res.json())
    .then((data) => {
      listOfVidsElm.innerHTML = "";
      data.forEach((vidInfo) => {
        renderSingleVid(vidInfo);
      });
    });
}

// prevent sending request on typing every character
function debounce(fn, time) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, time);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const formVideoRequest = document.getElementById("form");
  const sortByElms = document.querySelectorAll("[id*=sort_by_]");
  const searchBox = document.getElementById("search_box");

  loadAllVidsReq();

  sortByElms.forEach((elm) => {
    elm.addEventListener("click", function (e) {
      e.preventDefault();

      sortBy = this.querySelector("input").value;

      this.classList.add("active");
      if (sortBy === "topVotedFirst") {
        document.getElementById("sort_by_new").classList.remove("active");
      } else {
        document.getElementById("sort_by_top").classList.remove("active");
      }

      loadAllVidsReq(sortBy, searchTerm);
    });
  });

  searchBox.addEventListener(
    "input",
    debounce((e) => {
      searchTerm = e.target.value;
      loadAllVidsReq(sortBy, searchTerm);
    }, 500)
  );

  formVideoRequest.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(formVideoRequest);
    fetch("http://localhost:7777/video-request", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => renderSingleVid(data, true));
  });
});
