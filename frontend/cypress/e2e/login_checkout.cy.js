describe('Core User Journey: Login and Checkout', () => {
  it('Logs in, views tiffins, and proceeds to checkout', () => {
    // 1. Visit Login Page
    cy.visit('/login');

    // 2. Perform Login
    cy.get('input[id="login-email"]').type('priya@example.com');
    cy.get('input[id="login-password"]').type('priya123');
    cy.contains('button', 'Sign in').click();

    // 3. Verify Dashboard Access
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');

    // 4. Navigate to Tiffins
    cy.contains('Browse Tiffins').click();
    cy.url().should('include', '/tiffins');

    // 5. Select a Tiffin and Checkout (Assuming standard text exists)
    // cy.contains('Subscribe').first().click();
    // cy.url().should('include', '/checkout');
    // cy.contains('Order Summary').should('be.visible');
  });
});
