import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { RestaurantDashboardScreen } from '../src/screens/RestaurantDashboardScreen';

test('dump', async () => {
  let r: any = null;
  await ReactTestRenderer.act(async () => {
    r = ReactTestRenderer.create(<RestaurantDashboardScreen restaurantId="rest1" onLogout={jest.fn()} />);
  });
  console.log(JSON.stringify(r.toJSON(), null, 1).slice(0, 3000));
});
