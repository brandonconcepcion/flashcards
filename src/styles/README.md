# CSS Architecture

This directory contains the modular CSS structure for the flashcard app. The styles are organized by component and functionality for better maintainability.

## File Structure

```
src/styles/
├── index.css          # Main import file
├── variables.css      # Design tokens and CSS variables
├── base.css          # Base styles and reset
├── header.css        # Header and navigation styles
├── buttons.css       # Button styles and variants
├── forms.css         # Form styles and form components
├── analytics.css     # Analytics tab specific styles
├── code-practice.css # Code practice tab specific styles
├── responsive.css    # Responsive design rules
└── README.md         # This file
```

## Import Order

The CSS files are imported in a specific order to ensure proper cascading:

1. **variables.css** - Design tokens and variables
2. **base.css** - Base styles and reset
3. **header.css** - Header and navigation
4. **buttons.css** - Button styles
5. **forms.css** - Form styles
6. **analytics.css** - Analytics tab styles
7. **code-practice.css** - Code practice tab styles
8. **responsive.css** - Responsive design (last to override)

## Design Tokens

The `variables.css` file contains all design tokens:

- **Colors**: Primary, secondary, text, background colors
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, 2xl)
- **Typography**: Font sizes and weights
- **Border Radius**: Consistent border radius values
- **Shadows**: Box shadow variants
- **Transitions**: Animation timing functions

## Component-Specific Styles

Each component has its own CSS file:

- **Header**: App header, navigation, stats display
- **Buttons**: All button variants and states
- **Forms**: Form inputs, labels, validation states
- **Analytics**: Charts, metrics, data visualization
- **Code Practice**: Code editor, execution results, exercises

## Responsive Design

The `responsive.css` file contains all media queries organized by breakpoint:

- **1024px**: Large screen adjustments
- **768px**: Medium screen adjustments
- **480px**: Small screen adjustments

## Adding New Styles

When adding new styles:

1. **Use existing variables** from `variables.css` when possible
2. **Add to appropriate component file** or create a new one
3. **Update this README** if adding new files
4. **Import in index.css** in the correct order

## Best Practices

- Use CSS variables for consistent values
- Follow the existing naming conventions
- Keep component styles in their respective files
- Use semantic class names
- Test responsive behavior across breakpoints

