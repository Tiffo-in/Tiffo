const { performance } = require('perf_hooks');

const generateData = () => {
  const analyticsRecords = [];
  const dailyData = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  // Create 1000 records of visits from last 7 days to simulate high traffic volume
  // Make the date match towards the END of the array to make `find()` worst case O(N)
  for (let i = 0; i < 5000; i++) {
    const d = new Date(sevenDaysAgo);
    // Put dates far in the future so they don't match, until the very end
    d.setFullYear(d.getFullYear() + 10);
    analyticsRecords.push({
      date: d,
      visits: Math.floor(Math.random() * 100)
    });
  }

  // Append 7 valid records at the end
  for (let i = 0; i <= 6; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    analyticsRecords.push({
      date: d,
      visits: Math.floor(Math.random() * 100)
    });

    dailyData.push({
      _id: d.toISOString().split('T')[0],
      subscriptions: Math.floor(Math.random() * 10)
    });
  }

  return { analyticsRecords, dailyData, sevenDaysAgo };
};

const runBenchmarkOriginal = (iterations) => {
  const { analyticsRecords, dailyData, sevenDaysAgo } = generateData();

  const start = performance.now();

  for (let iter = 0; iter < iterations; iter++) {
    // The existing code doesn't filter future dates, just >= sevenDaysAgo
    const last7DaysVisits = analyticsRecords.filter((record) => record.date >= sevenDaysAgo);

    const chartData = [];
    for (let i = 0; i <= 6; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const visitRecord = last7DaysVisits.find(
        (r) => r.date.toISOString().split('T')[0] === dateStr,
      );
      const subRecord = dailyData.find((r) => r._id === dateStr);

      chartData.push({
        date: dateStr,
        visits: visitRecord ? visitRecord.visits : 0,
        subscriptions: subRecord ? subRecord.subscriptions : 0,
      });
    }
  }

  const end = performance.now();
  console.log(`Original approach time for ${iterations} iterations: ${(end - start).toFixed(2)} ms`);
};

const runBenchmarkOptimized = (iterations) => {
  const { analyticsRecords, dailyData, sevenDaysAgo } = generateData();

  const start = performance.now();

  for (let iter = 0; iter < iterations; iter++) {
    const last7DaysVisits = analyticsRecords.filter((record) => record.date >= sevenDaysAgo);

    const subLookup = {};
    for (let j = 0; j < dailyData.length; j++) {
      subLookup[dailyData[j]._id] = dailyData[j];
    }

    const visitLookup = {};
    for (let j = 0; j < last7DaysVisits.length; j++) {
      const dateStr = last7DaysVisits[j].date.toISOString().split('T')[0];
      if (visitLookup[dateStr] === undefined) {
         visitLookup[dateStr] = last7DaysVisits[j];
      }
    }

    const chartData = [];
    for (let i = 0; i <= 6; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];

      const visitRecord = visitLookup[dateStr];
      const subRecord = subLookup[dateStr];

      chartData.push({
        date: dateStr,
        visits: visitRecord ? visitRecord.visits : 0,
        subscriptions: subRecord ? subRecord.subscriptions : 0,
      });
    }
  }

  const end = performance.now();
  console.log(`Optimized approach time for ${iterations} iterations: ${(end - start).toFixed(2)} ms`);
};

runBenchmarkOriginal(100);
runBenchmarkOptimized(100);
