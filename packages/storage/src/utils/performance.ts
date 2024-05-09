const getPerformance = () => window.performance;

export const startTimer = (id: string) => {
  getPerformance().clearMarks(id);
  getPerformance().mark(id);
};

export const stopTimer = (id: string) => {
  if (getPerformance().getEntriesByName(id, "mark").length) {
    getPerformance().measure(id, id);
    const data = getPerformance().getEntriesByName(id, "measure");
    data.forEach((x) => {
      console.log(`Performance: ${x.name} = ${Math.floor(x.duration)}ms`);
    });
    getPerformance().clearMeasures(id);
    getPerformance().clearMarks(id);
  }
};
