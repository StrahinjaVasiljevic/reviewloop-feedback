module.exports = function(workspaceId) {
  // Dummy data za demo
  return {
    workspaceId,
    themes: [
      { name: 'FeatureRequest', count: 8 },
      { name: 'BugReport', count: 3 },
      { name: 'ChurnSignal', count: 1 }
    ],
    weeklyChange: '+2%'
  };
};
