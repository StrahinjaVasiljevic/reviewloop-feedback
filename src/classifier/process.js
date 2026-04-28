const rules = require('./rules');

function classify(text) {
  const lower = text.toLowerCase();
  for (let [label, keywords] of Object.entries(rules)) {
    if (keywords.some(k => lower.includes(k))) return label;
  }
  return 'Other';
}

module.exports = function (workspaceId, feedback) {
  const topic = classify(feedback);
  console.log(`[${workspaceId}] Classified feedback -> ${topic}: "${feedback}"`);

  // Ovu logiku možeš proširiti dalje – npr. slanje u inbox preko Redis ili DB
};
