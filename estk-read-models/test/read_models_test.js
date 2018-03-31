import { describe, it } from 'mocha';
import OnDemandModel from '../src/on_demand_model';
import { expect } from 'chai';

describe('on-demand read models', () => {
  const Sandwich = OnDemandModel({
    eventFilter: id => ({
      sandwich: { id }
    }),

    reducer: {
      sandwich: {
        make: (_, {targetId, data}) => ( {
          id: targetId,
          meat: data.meat,
          bread: data. bread,
          hit_points: 4
        }),
        bite: (sandwich) => {
          if (sandwich.hit_points === 1) {
            return null;
          }
          return Object.assign({}, sandwich, {
            hit_points: sandwich.hit_points - 1
          });
        }
      }
    }
  });

  it('builds the event query', async () => {
    const store = exampleEventStore([ ]);
    await Sandwich(store).get('42');

    expect(store.lastFilter()).to.eql({
      sandwich: { id: '42' }
    });
  });

  it('returns null if no events and no initial state', async () => {
    const store = exampleEventStore([ ]);
    const sandwich = await Sandwich(store).get('42');

    expect(sandwich).to.eq(null);
  });

  it('reduces state from events', async () => {
    const store = exampleEventStore([
      { targetType: 'sandwich', action: 'make', data: {meat:'roast beast', bread: 'rye'}},
      { targetType: 'sandwich', action: 'sell', data: {}},
      { targetType: 'sandwich', action: 'bite' },
    ]);

    const sandwich = await Sandwich(store).get('42');

    expect(sandwich.meat).to.eq('roast beast');
    expect(sandwich.bread).to.eq('rye');
    expect(sandwich.hit_points).to.eq(3);
  });
});

function exampleEventStore(events) {
  let lastFilter;

  return {
    getEventStream,
    lastFilter: () => lastFilter
  };

  function getEventStream(filter): any {
    let e = events.slice();
    lastFilter = filter;

    return {
      next: () => Promise.resolve(e.shift()),
    }
  }
}
