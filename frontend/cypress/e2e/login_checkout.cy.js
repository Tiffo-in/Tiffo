/**
 * Core user journey, hermetic: every API call is stubbed with cy.intercept
 * so this runs against the Vite dev server alone — no backend, no seed data.
 * Run with: npm run cy:run (dev server must be up on :3000).
 */
const user = {
  id: 'u1',
  name: 'Priya Test',
  email: 'priya@example.com',
  role: 'user',
};

const tiffin = {
  _id: 't1',
  title: 'South Indian Lunch Combo',
  description: 'Sambar rice, rasam, 2 vegetable curries, papad, pickle and curd.',
  price: { daily: 120, weekly: 780, monthly: 3100 },
  mealType: 'Lunch',
  cuisine: 'South Indian',
  dietary: ['veg'],
  images: [],
  rating: { average: 4.9, count: 120 },
  isActive: true,
  slug: 'south-indian-lunch-combo',
  partner: {
    _id: 'p1',
    businessName: 'Madras Kitchen',
    rating: { average: 4.8, count: 200 },
    verified: true,
  },
};

describe('Core User Journey: Login and Browse (stubbed API)', () => {
  beforeEach(() => {
    // Session restore: unauthenticated on first load, authenticated after login
    cy.intercept('GET', '**/api/auth/me', {
      statusCode: 401,
      body: { success: false },
    }).as('me');

    cy.intercept('GET', '**/api/tiffins*', {
      statusCode: 200,
      body: {
        success: true,
        data: [tiffin],
        pagination: { page: 1, pages: 1, total: 1 },
        locationFilter: { enabled: false },
      },
    }).as('tiffins');

    cy.intercept('GET', '**/api/banners*', {
      statusCode: 200,
      body: { success: true, data: [] },
    });
  });

  it('logs in with stubbed credentials and lands on the dashboard', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 200,
      body: { success: true, token: 'test-jwt', user },
    }).as('login');
    // After login the app re-checks the session
    cy.intercept('GET', '**/api/subscriptions*', {
      statusCode: 200,
      body: { success: true, data: [] },
    });

    cy.visit('/login');
    cy.get('#login-email').type(user.email);
    cy.get('#login-password').type('priya-test-password');
    cy.contains('button', 'Sign In').click();

    cy.wait('@login');
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  it('browses tiffin listings without authentication', () => {
    cy.visit('/tiffins');
    cy.wait('@tiffins');
    cy.contains('South Indian Lunch Combo', { timeout: 10000 }).should('be.visible');
    cy.contains('Madras Kitchen').should('exist');
  });

  it('renders the four key public pages without errors', () => {
    for (const path of ['/', '/tiffins', '/login', '/register']) {
      cy.visit(path);
      cy.get('body').should('not.be.empty');
    }
  });
});
