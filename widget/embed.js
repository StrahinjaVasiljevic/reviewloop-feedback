(function () {
  const workspaceId = window.ReviewLoop?.workspaceId;

  const container = document.createElement('div');
  container.innerHTML = `
    <div id="reviewloop-widget" style="
      position:fixed;bottom:20px;right:20px;background:white;
      padding:15px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);display:none;">
      <p>Quick feedback?</p>
      <textarea id="reviewloop-input" rows="2" style="width:100%;padding:6px;"></textarea><br/>
      <button onclick="sendReview()">Submit</button>
    </div>`;

  document.body.appendChild(container);

  window.showReviewWidget = function () {
    document.getElementById('reviewloop-widget').style.display = 'block';
  };

  window.sendReview = function () {
    const feedback = document.getElementById('reviewloop-input').value;
    fetch("http://localhost:3000/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, feedback })
    }).then(() => {
      alert("Thanks!");
      document.getElementById('reviewloop-widget').style.display = 'none';
    });
  };
})();
