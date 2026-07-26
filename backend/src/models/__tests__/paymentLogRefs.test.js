const mongoose = require('mongoose');

const PaymentLog = require('../PaymentLog');
const Subscription = require('../Subscription');
// Required for their side effect: each module registers its model on the shared
// mongoose instance, which is what makes the ref names below resolvable.
const User = require('../User');
const Partner = require('../Partner');

// `partnerId` was declared `ref: 'User'` while every write stored a Partner id,
// so `.populate('partnerId', ...)` silently resolved to null and the customer's
// payment history never showed which kitchen a transaction belonged to. These
// assertions pin the ref to the collection the ids actually come from.
describe('PaymentLog reference integrity', () => {
  const refOf = (model, path) => model.schema.path(path).options.ref;

  it('points partnerId at the same model as Subscription.partner', () => {
    // The writes copy `Subscription.partner` straight into `partnerId`, so the
    // two paths must name the same model or the populate cannot resolve.
    expect(refOf(PaymentLog, 'partnerId')).toBe(refOf(Subscription, 'partner'));
    expect(refOf(PaymentLog, 'partnerId')).toBe('Partner');
  });

  it('points userId at the same model as Subscription.user', () => {
    expect(refOf(PaymentLog, 'userId')).toBe(refOf(Subscription, 'user'));
    expect(refOf(PaymentLog, 'userId')).toBe('User');
  });

  it('names only registered models, so every populate has a collection to hit', () => {
    const registered = mongoose.modelNames();
    expect(registered).toEqual(expect.arrayContaining([User.modelName, Partner.modelName]));
    for (const path of ['userId', 'partnerId', 'subscriptionId']) {
      expect(registered).toContain(refOf(PaymentLog, path));
    }
  });

  it('exposes businessName on the Partner schema and not name/email', () => {
    // Guards the field selection used by fetchPaymentHistory's populate.
    expect(Partner.schema.path('businessName')).toBeDefined();
    expect(Partner.schema.path('contact.email')).toBeDefined();
    expect(Partner.schema.path('name')).toBeUndefined();
    expect(Partner.schema.path('email')).toBeUndefined();
  });
});
