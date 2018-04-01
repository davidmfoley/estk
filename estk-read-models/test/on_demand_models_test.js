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

    expect(store.lastLookup().filter).to.eql({
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

  it('can update an existing model state with new events', async () => {
    const existing = {
      id: '42',
      meat: ' chicken',
      bread: ' wheat',
      hit_points: 2
    };

    const store = exampleEventStore([
      { targetType: 'sandwich', action: 'bite' },
    ]);

    const exampleBookmark = '12345';

    const sandwich = await Sandwich(store).update({
      id: '42',
      state: existing,
      bookmark: exampleBookmark
    });

    expect(sandwich.hit_points).to.eq(1);
    expect(store.lastLookup().bookmark).to.eq(exampleBookmark);
  });
});

function exampleEventStore(events) {
  let lastLookup;

  return {
    getEventStream,
    lastLookup: () => lastLookup,
  };

  function getEventStream({filter, bookmark}: EventLookup): any {
    let e = events.slice();
    lastLookup = { filter, bookmark};

    return {
      next: () => Promise.resolve(e.shift()),
    }
  }
}
