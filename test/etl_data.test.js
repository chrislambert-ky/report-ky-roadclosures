import test from 'node:test';
import assert from 'node:assert/strict';
import { deduplicateRows, filterRows, normalizeRouteInfo } from '../etl_data.js';

test('filterRows keeps the columns required for spatial enrichment', () => {
  const csv = [
    'latitude,longitude,Comments,Reported_On,End_Date,Duration_Hours,County',
    '37.1,-88.9,"Road, flooded",2022-04-12 08:56:00,2022-04-12 10:04:00,1.1333,Ballard'
  ].join('\n');

  assert.deepEqual(filterRows(csv), [{
    latitude: '37.1',
    longitude: '-88.9',
    Comments: 'Road, flooded',
    Reported_On: '2022-04-12 08:56:00',
    End_Date: '2022-04-12 10:04:00',
    Duration_Hours: '1.1333'
  }]);
});

test('deduplicateRows preserves the first row for an event key', () => {
  const row = {
    latitude: '37.1',
    longitude: '-88.9',
    Comments: 'Road flooded',
    Reported_On: '2022-04-12 08:56:00'
  };

  assert.deepEqual(deduplicateRows([row, { ...row, End_Date: 'later' }]), [row]);
});

test('normalizeRouteInfo preserves zero milepoints and false snap status', () => {
  const routeInfo = normalizeRouteInfo({
    Route_Info: [{
      District_Number: 1,
      County_Name: 'Ballard',
      Milepoint: 0,
      Road_Name: 'KY-123',
      Route: 'KY-123',
      Snap_Status: false
    }]
  });

  assert.equal(routeInfo.Milepoint, 0);
  assert.equal(routeInfo.Snap_Status, false);
});
