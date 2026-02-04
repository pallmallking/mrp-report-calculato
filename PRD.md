# Planning Guide

A Material Requirements Planning (MRP) calculator that automatically computes production schedules, inventory requirements, and purchase orders based on product demand and bill of materials.

**Experience Qualities**: 
1. **Precise** - The application provides accurate, detailed calculations with clear numerical outputs that manufacturing teams can trust for planning
2. **Efficient** - Users can quickly input data and generate comprehensive MRP reports without navigating complex workflows
3. **Organized** - Complex manufacturing data is presented in clean, scannable tables with clear hierarchies and relationships

**Complexity Level**: Light Application (multiple features with basic state)
This is an MRP calculator with data input forms, calculation logic, and report generation - multiple interconnected features but focused on a specific manufacturing planning workflow.

## Essential Features

### Bill of Materials (BOM) Management
- **Functionality**: Create and manage hierarchical bill of materials with components, quantities, and lead times
- **Purpose**: Define product structures needed for MRP calculations
- **Trigger**: User clicks "Add Product" or "Manage BOM"
- **Progression**: Click Add Product → Enter product name and components → Specify quantities per unit → Set lead times → Save BOM
- **Success criteria**: BOM data persists and displays in organized table format with parent-child relationships

### Inventory Input
- **Functionality**: Track current on-hand inventory and scheduled receipts for all components with detailed receipt tracking
- **Purpose**: Provide baseline inventory data and planned incoming stock for accurate net requirements calculation
- **Trigger**: User navigates to Inventory tab, clicks "Add Item", or edits inventory inline
- **Progression**: View inventory table → Click Add/Edit Item → Update on-hand quantity → Add scheduled receipts with quantities and due dates → Save changes → View in table
- **Success criteria**: Inventory values update immediately, scheduled receipts display with dates, and all data reflects accurately in MRP calculations

### Demand Scheduling
- **Functionality**: Input master production schedule with quantities and due dates
- **Purpose**: Drive the MRP calculation based on customer orders or forecasts
- **Trigger**: User clicks "Add Demand" or creates new schedule entry
- **Progression**: Select product → Enter quantity needed → Set due date → Add to schedule → View in timeline
- **Success criteria**: Multiple demand entries can be added and MRP recalculates automatically

### MRP Calculation Engine
- **Functionality**: Automatically compute planned order releases, net requirements, and timing based on BOM, inventory, and demand
- **Purpose**: Generate actionable production and purchasing plans
- **Trigger**: Automatic on data change or manual "Calculate MRP" button
- **Progression**: Input demand → System explodes BOM → Calculates net requirements → Time-phases with lead times → Displays planned orders
- **Success criteria**: Report shows period-by-period requirements, receipts, on-hand balance, and planned order releases

### Report Export & Visualization
- **Functionality**: Display MRP results in organized tables with time buckets and export capabilities
- **Purpose**: Provide clear visibility into material plans for decision-making
- **Trigger**: MRP calculation completes or user views Report tab
- **Progression**: Calculation runs → Results populate tables → User reviews by component → Can filter/sort → Export to download
- **Success criteria**: Tables are readable, sortable, and data is accurate per MRP logic

## Edge Case Handling

- **Missing BOM Data**: Display warning message prompting user to complete bill of materials before running calculations
- **Negative Inventory**: Highlight negative projected on-hand values in red to indicate shortage conditions
- **Zero Lead Time**: Default to 1 period lead time if not specified to prevent calculation errors
- **Circular BOM References**: Detect and prevent circular dependencies with validation message
- **Empty Demand Schedule**: Show placeholder state with call-to-action to add first demand entry
- **Large Data Sets**: Implement pagination for tables with 50+ items to maintain performance

## Design Direction

The design should evoke precision, clarity, and industrial efficiency - reflecting the manufacturing domain while maintaining modern web aesthetics. It should feel like a professional planning tool that inspires confidence through clear data presentation and logical workflows.

## Color Selection

An industrial color scheme with strong blues and grays that communicate reliability and technical precision, with accent colors for status indicators.

- **Primary Color**: Deep Industrial Blue `oklch(0.45 0.12 250)` - Communicates trust, precision, and manufacturing professionalism
- **Secondary Colors**: 
  - Slate Gray `oklch(0.55 0.015 250)` for secondary actions and muted elements
  - Cool Gray `oklch(0.92 0.005 250)` for backgrounds and containers
- **Accent Color**: Bright Cyan `oklch(0.70 0.15 210)` - Highlights active calculations, CTAs, and important data points
- **Foreground/Background Pairings**: 
  - Primary (Deep Industrial Blue `oklch(0.45 0.12 250)`): White text `oklch(0.99 0 0)` - Ratio 7.2:1 ✓
  - Accent (Bright Cyan `oklch(0.70 0.15 210)`): Dark text `oklch(0.20 0.02 250)` - Ratio 8.5:1 ✓
  - Background (Cool Gray `oklch(0.92 0.005 250)`): Dark text `oklch(0.20 0.02 250)` - Ratio 13.8:1 ✓
  - Success Green `oklch(0.65 0.15 145)`: White text `oklch(0.99 0 0)` - Ratio 5.1:1 ✓
  - Destructive Red `oklch(0.60 0.20 25)`: White text `oklch(0.99 0 0)` - Ratio 4.9:1 ✓

## Font Selection

Typefaces should communicate technical precision while remaining highly readable for data-heavy tables and numerical content.

- **Typographic Hierarchy**: 
  - H1 (App Title): IBM Plex Sans SemiBold/32px/tight letter spacing
  - H2 (Section Headers): IBM Plex Sans Medium/24px/normal letter spacing  
  - H3 (Table Headers): IBM Plex Sans Medium/16px/wide letter spacing/uppercase
  - Body (Data/Labels): IBM Plex Sans Regular/14px/relaxed line height
  - Numerical Data: IBM Plex Mono Regular/14px/tabular numbers for alignment

## Animations

Animations should support the workflow without distraction - subtle state changes for feedback and smooth transitions between calculation states. Use purposeful micro-interactions: gentle highlight on table row hover (100ms), smooth slide-in for calculation results (250ms), and pulsing indicator during active calculations (1.5s loop). Avoid animations on data input to maintain precision feeling.

## Component Selection

- **Components**: 
  - Tabs component for switching between BOM/Inventory/Demand/Report views
  - Table component for displaying all data grids with sorting capabilities
  - Dialog for adding/editing BOM entries and products
  - Input and Label for all form fields with clear validation states
  - Button with primary/secondary variants for actions
  - Card to group related data sections
  - Badge for status indicators (In Stock, Low Stock, Shortage)
  - Select dropdown for product/component selection
  - Skeleton for loading states during calculations
  - Tooltip for explaining MRP terminology and calculations
  
- **Customizations**: 
  - Custom table cells with colored backgrounds for status (green for positive inventory, red for negative)
  - Numerical input components with increment/decrement controls
  - Time-phased grid layout for period-based MRP display
  
- **States**: 
  - Buttons: Primary (solid blue), Secondary (outline gray), Disabled (reduced opacity)
  - Inputs: Default (gray border), Focus (blue border + subtle glow), Error (red border + error text), Success (green border)
  - Table rows: Default, Hover (light blue background), Selected (medium blue background)
  
- **Icon Selection**: 
  - Plus icon for adding entries
  - Calculator icon for MRP calculation trigger
  - Table icon for BOM management
  - Package icon for inventory
  - Calendar icon for demand scheduling  
  - Download icon for export functionality
  - Warning icon for validation messages
  
- **Spacing**: 
  - Container padding: p-6 for main sections
  - Card padding: p-4 for data cards
  - Table cell padding: px-4 py-2 for readability
  - Form gaps: gap-4 between inputs, gap-6 between sections
  - Button spacing: px-4 py-2 for standard, px-6 py-3 for primary actions
  
- **Mobile**: 
  - Tables switch to stacked card layout on mobile (< 768px)
  - Tabs become scrollable horizontal navigation
  - Dialogs expand to near-full-screen on mobile
  - Form inputs stack vertically with full width
  - Reduce padding to p-4 on containers for more screen real estate
  - Primary action buttons fixed to bottom on mobile for easy access
