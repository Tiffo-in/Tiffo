const mongoose = require('mongoose');
const slugify = require('slugify');

const tiffinSchema = new mongoose.Schema(
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Tiffin title is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      daily: {
        type: Number,
        required: true,
      },
      weekly: Number,
      monthly: Number,
    },
    // Discount configuration set by the partner
    discount: {
      weekly: {
        type: Number,
        min: 0,
        max: 70,
        default: 0, // percentage off for weekly plan
      },
      monthly: {
        type: Number,
        min: 0,
        max: 70,
        default: 0, // percentage off for monthly plan
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      label: {
        type: String,
        default: '', // e.g. "Summer Sale", "Festival Offer"
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snacks'],
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
    },
    dietary: {
      type: [String],
      enum: ['vegetarian', 'vegan', 'non-vegetarian', 'jain', 'gluten-free'],
    },
    images: [String],
    ingredients: [String],
    nutritionInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
    availability: {
      days: [String],
      maxOrders: {
        type: Number,
        default: 50,
      },
      currentOrders: {
        type: Number,
        default: 0,
      },
    },
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    // Menu items: list of dishes included in this tiffin
    menuItems: [
      {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        image: { type: String, default: '' }, // uploaded dish image URL
        category: {
          type: String,
          enum: [
            'main',
            'side',
            'bread',
            'rice',
            'dal',
            'vegetable',
            'pickle',
            'sweet',
            'beverage',
            'other',
          ],
          default: 'main',
        },
        tags: [{ type: String }],
      },
    ],
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
tiffinSchema.index({ isActive: 1, 'rating.average': -1 }); // main browse query
tiffinSchema.index({ partner: 1 }); // partner's own tiffins
tiffinSchema.index({ mealType: 1, isActive: 1 }); // meal type filter
tiffinSchema.index({ title: 'text', description: 'text' }); // future full-text search

// ── Virtual: effective prices after discount ──────────────────────────────────
tiffinSchema.virtual('effectivePrice').get(function () {
  const dailyPrice = this.price.daily;
  const discountActive =
    this.discount &&
    this.discount.isActive &&
    (!this.discount.expiresAt || new Date() < this.discount.expiresAt);

  const weeklyDiscount = discountActive ? this.discount.weekly || 0 : 0;
  const monthlyDiscount = discountActive ? this.discount.monthly || 0 : 0;

  return {
    daily: dailyPrice,
    weekly: Math.round(dailyPrice * 7 * (1 - weeklyDiscount / 100)),
    monthly: Math.round(dailyPrice * 30 * (1 - monthlyDiscount / 100)),
    weeklyOriginal: Math.round(dailyPrice * 7),
    monthlyOriginal: Math.round(dailyPrice * 30),
    weeklyDiscountPercent: weeklyDiscount,
    monthlyDiscountPercent: monthlyDiscount,
  };
});

// ── Virtual: check if tiffin is vegetarian/vegan ─────────────────────────────
tiffinSchema.virtual('isVeg').get(function () {
  return !!(
    this.dietary &&
    (this.dietary.includes('vegetarian') || this.dietary.includes('vegan'))
  );
});

tiffinSchema.set('toJSON', { virtuals: true });
tiffinSchema.set('toObject', { virtuals: true });

// Generate unique slug from title before saving
tiffinSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    let generatedSlug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    const Tiffin = mongoose.model('Tiffin');
    let uniqueSlug = generatedSlug;
    let count = 0;
    let isUnique = false;
    while (!isUnique) {
      const existing = await Tiffin.findOne({ slug: uniqueSlug, _id: { $ne: this._id } });
      if (!existing) {
        isUnique = true;
      } else {
        count++;
        uniqueSlug = `${generatedSlug}-${count}`;
      }
    }
    this.slug = uniqueSlug;
  }
  next();
});

module.exports = mongoose.model('Tiffin', tiffinSchema);
