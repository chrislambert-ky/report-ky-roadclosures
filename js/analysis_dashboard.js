const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dashboardCharts = {
  year: echarts.init(document.getElementById('yearChart')),
  month: echarts.init(document.getElementById('monthChart')),
  district: echarts.init(document.getElementById('districtChart')),
  county: echarts.init(document.getElementById('countyChart'))
};
const controls = {
  measure: document.getElementById('measureSelect'),
  year: document.getElementById('yearFilter'),
  month: document.getElementById('monthFilter'),
  district: document.getElementById('districtFilter'),
  county: document.getElementById('countyFilter'),
  countyLimit: document.getElementById('countyLimit'),
  sortOrder: document.getElementById('sortOrder'),
  showLabels: document.getElementById('showLabels')
};

let rawData = [];
let selected = { year: null, month: null, district: null, county: null };
let districtEntries = [];
const districtsByCounty = new Map();
let resizeObserver;

const initialMeasure = new URLSearchParams(window.location.search).get('measure');
if (initialMeasure === 'count' || initialMeasure === 'duration') {
  controls.measure.value = initialMeasure;
}

function dateParts(value) {
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(value ?? ''));
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1 };
}

function durationHours(value) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
}

function districtValue(closure) {
  if (closure.District_Number === undefined || closure.District_Number === null || closure.District_Number === '') {
    return 'Unknown';
  }
  const number = Number(closure.District_Number);
  return Number.isFinite(number) ? number : 'Unknown';
}

function countyValue(closure) {
  return closure.County_Name || 'Unknown';
}

function measureValue(closure) {
  return controls.measure.value === 'duration' ? durationHours(closure.Duration_Hours) : 1;
}

function formatValue(value, compact = false) {
  const number = Number(value) || 0;
  if (controls.measure.value === 'count') {
    return Math.round(number).toLocaleString();
  }
  if (compact && Math.abs(number) >= 1000) {
    const scaled = number / 1000;
    return `${scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(1)}K`;
  }
  return number.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function normalizeDistrictFilter(value) {
  if (value === 'Unknown') return 'Unknown';
  return value === null || value === '' ? null : Number(value);
}

function filteredData(excludeDimension = null) {
  return rawData.filter(closure => {
    const parts = dateParts(closure.Reported_On);
    if (excludeDimension !== 'year' && selected.year !== null && parts?.year !== selected.year) return false;
    if (excludeDimension !== 'month' && selected.month !== null && parts?.month !== selected.month) return false;
    if (excludeDimension !== 'district' && selected.district !== null && districtValue(closure) !== selected.district) return false;
    if (excludeDimension !== 'county' && selected.county !== null && countyValue(closure) !== selected.county) return false;
    return true;
  });
}

function populateSelect(select, values, placeholder, format = value => String(value)) {
  const selectedValue = select.value;
  select.replaceChildren(new Option(placeholder, ''));
  values.forEach(value => select.add(new Option(format(value), String(value))));
  if ([...select.options].some(option => option.value === selectedValue)) {
    select.value = selectedValue;
  }
}

function initializeFilters() {
  const years = new Set();
  const districts = new Set();
  districtsByCounty.clear();
  rawData.forEach(closure => {
    const parts = dateParts(closure.Reported_On);
    if (parts) years.add(parts.year);
    const district = districtValue(closure);
    const county = countyValue(closure);
    districts.add(district);
    if (!districtsByCounty.has(county)) districtsByCounty.set(county, new Set());
    districtsByCounty.get(county).add(district);
  });

  populateSelect(controls.year, [...years].sort((a, b) => b - a), 'All years');
  populateSelect(controls.month, monthNames.map((name, month) => month), 'All months', month => monthNames[month]);
  populateSelect(controls.district, [...districts].sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return a - b;
  }), 'All districts', value => value === 'Unknown' ? value : `District ${value}`);
  syncFilterControls();
}

function countiesForSelectedDistrict() {
  return [...districtsByCounty.entries()]
    .filter(([, districts]) => selected.district === null || districts.has(selected.district))
    .map(([county]) => county)
    .sort((a, b) => a.localeCompare(b));
}

function syncFilterControls() {
  const countyOptions = countiesForSelectedDistrict();
  if (selected.county !== null && !countyOptions.includes(selected.county)) {
    selected.county = null;
  }
  controls.year.value = selected.year === null ? '' : String(selected.year);
  controls.month.value = selected.month === null ? '' : String(selected.month);
  controls.district.value = selected.district === null ? '' : String(selected.district);
  const countyPlaceholder = selected.district === null
    ? 'All counties'
    : selected.district === 'Unknown'
      ? 'All counties with unknown district'
      : `All counties in District ${selected.district}`;
  populateSelect(controls.county, countyOptions, countyPlaceholder);
  controls.county.value = selected.county ?? '';
}

function summarize(dimension, rows) {
  const totals = new Map();
  rows.forEach(closure => {
    let key;
    if (dimension === 'year') {
      key = dateParts(closure.Reported_On)?.year;
    } else if (dimension === 'month') {
      key = dateParts(closure.Reported_On)?.month;
    } else if (dimension === 'district') {
      key = districtValue(closure);
    } else {
      key = countyValue(closure);
    }
    if (key === undefined) return;
    totals.set(key, (totals.get(key) || 0) + measureValue(closure));
  });
  return [...totals.entries()].map(([key, value]) => ({ key, value }));
}

function sortEntries(entries) {
  if (controls.sortOrder.value === 'name') {
    return entries.sort((a, b) => String(a.key).localeCompare(String(b.key), undefined, { numeric: true }));
  }
  return entries.sort((a, b) => b.value - a.value || String(a.key).localeCompare(String(b.key)));
}

function chartLabel(dimension, value) {
  if (dimension === 'month') return monthNames[value];
  if (dimension === 'district' && value !== 'Unknown') return `District ${value}`;
  return String(value);
}

function isSelected(dimension, key) {
  if (dimension === 'district') return selected.district === key;
  return selected[dimension] === key;
}

function chartOption(dimension, entries) {
  const horizontal = dimension !== 'year';
  const labels = entries.map(entry => chartLabel(dimension, entry.key));
  const values = entries.map(entry => Number(entry.value.toFixed(1)));
  const valueAxis = {
    type: 'value',
    axisLabel: { formatter: value => formatValue(value, true) },
    splitLine: { lineStyle: { color: '#edf1f4' } }
  };
  if (controls.measure.value === 'duration') valueAxis.name = 'Hours';

  return {
    animationDuration: 250,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: value => controls.measure.value === 'duration'
        ? `${formatValue(value)} hours`
        : `${formatValue(value)} closures`
    },
    grid: horizontal
      ? { left: '5%', right: '12%', bottom: '5%', top: '5%', containLabel: true }
      : { left: '5%', right: '5%', bottom: '8%', top: '5%', containLabel: true },
    xAxis: horizontal
      ? { ...valueAxis, type: 'value' }
      : {
        type: 'category',
        data: labels,
        axisTick: { alignWithLabel: true },
        axisLabel: dimension === 'year' ? { hideOverlap: true } : { interval: 0 }
      },
    yAxis: horizontal
      ? { type: 'category', data: labels, axisTick: { alignWithLabel: true }, inverse: true }
      : valueAxis,
    series: [{
      name: controls.measure.value === 'duration' ? 'Total duration' : 'Closures',
      type: 'bar',
      barMaxWidth: dimension === 'year' ? 54 : 26,
      data: values.map((value, index) => ({
        value,
        itemStyle: {
          color: isSelected(dimension, entries[index].key) ? '#5EB3E4' : '#5470C6',
          borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
        }
      })),
      label: {
        show: controls.showLabels.checked,
        position: horizontal ? 'right' : 'top',
        color: '#34495a',
        formatter: params => formatValue(params.value, true),
        fontSize: 10
      }
    }]
  };
}

function updateChart(dimension) {
  const rows = filteredData(dimension);
  let entries = summarize(dimension, rows);
  if (dimension === 'year') {
    entries.sort((a, b) => a.key - b.key);
  } else if (dimension === 'month') {
    const monthValues = new Map(entries.map(entry => [entry.key, entry.value]));
    entries = monthNames.map((_, month) => ({ key: month, value: monthValues.get(month) || 0 }));
  } else if (dimension === 'county') {
    entries.sort((a, b) => b.value - a.value || String(a.key).localeCompare(String(b.key)));
    const limit = Number(controls.countyLimit.value);
    const selectedEntry = selected.county === null ? null : entries.find(entry => entry.key === selected.county);
    entries = entries.slice(0, limit);
    if (selectedEntry && !entries.some(entry => entry.key === selectedEntry.key)) {
      entries = [...entries.slice(0, limit - 1), selectedEntry];
    }
    sortEntries(entries);
  } else {
    entries = sortEntries(entries);
  }

  if (dimension === 'district') districtEntries = entries;
  dashboardCharts[dimension].setOption(chartOption(dimension, entries), true);
}

function updateSummary() {
  const rows = filteredData();
  const totalHours = rows.reduce((total, closure) => total + durationHours(closure.Duration_Hours), 0);
  const metric = controls.measure.value === 'duration' ? 'Total Duration' : 'Closure Count';
  document.getElementById('yearChartTitle').textContent = `${metric} by Year`;
  document.getElementById('monthChartTitle').textContent = `${metric} by Month`;
  document.getElementById('districtChartTitle').textContent = `${metric} by District`;
  document.getElementById('countyChartTitle').textContent = `${metric} by County`;
  document.getElementById('closureTotal').textContent = rows.length.toLocaleString();
  document.getElementById('durationTotal').textContent =
    `${totalHours.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} hours`;
  document.getElementById('selectionSummary').textContent =
    `Showing ${rows.length.toLocaleString()} of ${rawData.length.toLocaleString()} closures across the selected filters.`;
}

function renderDashboard() {
  syncFilterControls();
  ['year', 'month', 'district', 'county'].forEach(updateChart);
  updateSummary();
}

function handleChartSelection(dimension, value) {
  if (dimension === 'district') {
    setDistrictFilter(selected.district === value ? null : value);
  } else if (dimension === 'county') {
    setCountyFilter(selected.county === value ? null : value);
  } else {
    selected[dimension] = selected[dimension] === value ? null : value;
  }
  renderDashboard();
}

function setDistrictFilter(value) {
  selected.district = value;
  if (selected.county !== null && !districtsByCounty.get(selected.county)?.has(value)) {
    selected.county = null;
  }
}

function setCountyFilter(value) {
  selected.county = value;
  if (value === null) return;
  const districts = districtsByCounty.get(value);
  if (districts?.size === 1) {
    selected.district = districts.values().next().value;
  }
}

dashboardCharts.year.on('click', params => {
  if (params.componentType === 'series') handleChartSelection('year', Number(params.name));
});
dashboardCharts.month.on('click', params => {
  if (params.componentType === 'series') handleChartSelection('month', params.dataIndex);
});
dashboardCharts.district.on('click', params => {
  if (params.componentType === 'series') {
    const entry = districtEntries[params.dataIndex];
    if (entry) handleChartSelection('district', entry.key);
  }
});
dashboardCharts.county.on('click', params => {
  if (params.componentType === 'series') handleChartSelection('county', params.name);
});

controls.measure.addEventListener('change', renderDashboard);
controls.year.addEventListener('change', () => {
  selected.year = controls.year.value ? Number(controls.year.value) : null;
  renderDashboard();
});
controls.month.addEventListener('change', () => {
  selected.month = controls.month.value === '' ? null : Number(controls.month.value);
  renderDashboard();
});
controls.district.addEventListener('change', () => {
  setDistrictFilter(normalizeDistrictFilter(controls.district.value));
  renderDashboard();
});
controls.county.addEventListener('change', () => {
  setCountyFilter(controls.county.value || null);
  renderDashboard();
});
[controls.countyLimit, controls.sortOrder, controls.showLabels].forEach(control => {
  control.addEventListener('change', renderDashboard);
});

document.getElementById('resetDashboard').addEventListener('click', () => {
  selected = { year: null, month: null, district: null, county: null };
  controls.measure.value = 'count';
  controls.countyLimit.value = '15';
  controls.sortOrder.value = 'value';
  controls.showLabels.checked = true;
  renderDashboard();
});

window.addEventListener('resize', () => {
  Object.values(dashboardCharts).forEach(chart => chart.resize());
});

if ('ResizeObserver' in window) {
  resizeObserver = new ResizeObserver(() => {
    Object.values(dashboardCharts).forEach(chart => chart.resize());
  });
  resizeObserver.observe(document.querySelector('.dashboard-layout'));
}

loadData({
  onStatusUpdate: status => {
    document.getElementById('dataStatus').textContent = status.message || 'Loading report data...';
  },
  onDataReady: data => {
    if (!Array.isArray(data)) throw new TypeError('The road-closure dataset must be an array.');
    rawData = data;
    initializeFilters();
    renderDashboard();
  }
}).catch(error => {
  console.error('Failed to load dashboard data', error);
  document.getElementById('dataStatus').textContent = `Unable to load report data: ${error.message || error}`;
  document.getElementById('selectionSummary').textContent = 'The dashboard could not load its road-closure dataset.';
});
