// Static legal / corporate content for the customer app.
//
// The audit listed Terms, About, Careers and Partner Guidelines as four
// separate missing screens. They are content, not engineering: one renderer
// (ContentScreen) plus this map covers all of them, and adding a page is a
// data change rather than a new screen.
//
// NOTE: this is placeholder copy pending the legal team's final wording. The
// authoritative text lives on the website (frontend/src/pages/Terms.jsx etc.);
// these summaries must be reviewed and replaced before release, and the
// contact addresses confirmed.

export type ContentPageKey = 'terms' | 'about' | 'careers' | 'partnerGuidelines';

export interface ContentSection {
  heading: string;
  body: string[];
}

export interface ContentPage {
  title: string;
  intro?: string;
  sections: ContentSection[];
  contactEmail?: string;
  lastUpdated: string;
}

export const CONTENT_PAGES: Record<ContentPageKey, ContentPage> = {
  terms: {
    title: 'Terms of Service',
    intro:
      'These terms govern your use of Tiffo. By placing an order or subscribing to a meal plan, you agree to them.',
    sections: [
      {
        heading: 'Using Tiffo',
        body: [
          'Tiffo connects you with independent local kitchens ("partners") who prepare and deliver meals. Tiffo facilitates discovery, ordering, and payment; the partner is responsible for preparing your food.',
          'You must provide accurate delivery and contact details. Repeatedly refusing accepted deliveries may result in account restrictions.',
        ],
      },
      {
        heading: 'Subscriptions and billing',
        body: [
          'Meal plans are billed in advance for the selected period. Prices shown at checkout include any active partner discount.',
          'You can pause or cancel a subscription from the Subscriptions tab. Cancellations apply to future deliveries; meals already prepared for the current cycle may not be refundable.',
        ],
      },
      {
        heading: 'Refunds',
        body: [
          'If a delivery is missed, incorrect, or unsafe to eat, report it through Help & Support or the report form within 24 hours so we can investigate with the partner.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'Do not misuse the service, attempt to access other users accounts, or submit false reports. Accounts found doing so may be suspended.',
        ],
      },
    ],
    contactEmail: 'support@tiffo.in',
    lastUpdated: 'July 2026',
  },

  about: {
    title: 'About Tiffo',
    intro:
      'Tiffo is a meal subscription platform connecting people with home-style tiffin kitchens in their neighbourhood.',
    sections: [
      {
        heading: 'What we do',
        body: [
          'Good home-style food is usually cooked a few streets away, not in a large commercial kitchen. Tiffo helps you find those local providers, subscribe to a plan that fits your week, and get meals delivered on a schedule.',
        ],
      },
      {
        heading: 'For our partners',
        body: [
          'Every kitchen on Tiffo is independently run. We handle discovery, subscriptions, payments, and payouts so partners can focus on cooking.',
        ],
      },
    ],
    contactEmail: 'hello@tiffo.in',
    lastUpdated: 'July 2026',
  },

  careers: {
    title: 'Careers',
    intro: 'We are a small team building the infrastructure for neighbourhood food.',
    sections: [
      {
        heading: 'Working here',
        body: [
          'We hire for ownership over specialisation. Teams are small, the feedback loop with partners and customers is short, and the work spans product, operations, and engineering.',
        ],
      },
      {
        heading: 'Open roles',
        body: [
          'Roles are posted on our website as they open. If nothing listed fits but you think you should be here, send us a note describing what you would want to work on.',
        ],
      },
    ],
    contactEmail: 'careers@tiffo.in',
    lastUpdated: 'July 2026',
  },

  partnerGuidelines: {
    title: 'Partner Guidelines',
    intro:
      'These guidelines apply to every kitchen listed on Tiffo. They exist to keep food safe and customers confident.',
    sections: [
      {
        heading: 'Food safety',
        body: [
          'Maintain a valid FSSAI registration and keep it current in your partner profile.',
          'Prepare meals on the day of delivery. Maintain hygienic storage and transport, and keep vegetarian and non-vegetarian preparation separate.',
        ],
      },
      {
        heading: 'Accurate listings',
        body: [
          'List dishes you actually serve. Photos should be of your own food. Mark vegetarian, vegan, and allergen information correctly — customers rely on it to make safe choices.',
        ],
      },
      {
        heading: 'Reliability',
        body: [
          'Deliver within your stated window. If you cannot serve a day, pause the tiffin in the app in advance rather than missing deliveries.',
        ],
      },
      {
        heading: 'Enforcement',
        body: [
          'Reports of hygiene issues, misrepresented listings, or repeated missed deliveries are investigated by our trust and safety team and can result in delisting.',
        ],
      },
    ],
    contactEmail: 'partners@tiffo.in',
    lastUpdated: 'July 2026',
  },
};
