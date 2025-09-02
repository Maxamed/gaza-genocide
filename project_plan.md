# Gaza War Memorial & Tracker — Project Plan & Decisions

## 📋 Project Overview

**Goal**: Create a comprehensive, respectful memorial website that tracks casualties and events during the ongoing Gaza conflict, with the aim of spreading awareness through quality design and functionality.

**Strategy**: Build something genuinely excellent that naturally attracts attention and brings more eyes to the important message and data.

## 🎯 Core Objectives

1. **Memorial**: Honor individual victims through names, stories, and data
2. **Education**: Present comprehensive statistics and daily tracking
3. **Impact**: Use quality design to amplify the message and reach more people
4. **Accessibility**: Ensure the data is accessible across all devices and languages
5. **Shareability**: Make EVERYTHING shareable for maximum viral spread
6. **Award-Winning Quality**: Every element, interaction, and detail must be exceptional

## 🎨 Design Strategy

### **Color Scheme**
- **Primary Background**: Clean white (#FFFFFF) for readability and respect
- **Primary Text**: Deep black (#000000) for text and key elements
- **Accent**: Strategic red (#DC2626) for critical numbers and highlights
- **Secondary**: Various grays (#6B7280, #E5E7EB) for subtle depth
- **Theme Flexibility**: Light/dark theme toggle available

### **Design Principles**
- **Respectful & Solemn**: Appropriate for memorial content
- **Human-Centered**: Names, ages, individual stories foregrounded
- **Minimalist**: Clean typography and purposeful motion over clutter
- **Professional Quality**: Excellence that naturally attracts attention and sharing
- **Everything Shareable**: Every element designed to be shared and spread
- **Award-Winning Quality**: Every detail crafted to exceptional standards

### **Typography**
- **English**: Inter or Roboto (clean, readable)
- **Arabic**: Cairo or Tajawal (beautiful, legible)
- **Fallbacks**: System fonts for performance
- **Hierarchy**: Clear distinction between different content types

## 🏗️ Technical Architecture

### **Platform & Hosting**
- **Static Site**: HTML/CSS/JS for GitHub Pages compatibility
- **Performance**: Fast loading, especially important for large JSON datasets
- **Responsive**: Mobile-first design that scales to all devices

### **Data Strategy**
- **JSON Endpoints**: Direct loading of data files
- **Caching**: Client-side caching with localStorage/sessionStorage
- **Progressive Loading**: Lazy load large datasets for performance
- **Updates**: Manual updates when new data becomes available

### **Performance Approach**
- **Mobile First**: Optimized for mobile performance
- **Progressive Enhancement**: Basic functionality enhanced for desktop
- **Lazy Loading**: Heavy features loaded on-demand
- **Caching**: Minimize data re-parsing and API calls

## 📱 User Experience Design

### **Layout Priority**
1. Hero Counters (Homepage top)
2. Timeline (Daily Casualties)
3. Memorial Wall (Killed in Gaza)
4. Fact Cards (Did You Know?)
5. Demographics Breakdown
6. Region Comparison

### **Key Features**
- **Hero Counters**: Days since war began, total killed, children killed, women killed, journalists killed
- **Timeline**: Interactive charts showing daily casualties with Gaza vs West Bank toggle
- **Memorial Wall**: Infinite scroll of names with search and filtering
- **Journalists Memorial**: Grid of press casualties with details
- **Fact Cards**: Rotating statistics and insights
- **Generational Breakdown**: Demographics visualization
- **Dual Region Dashboard**: Side-by-side Gaza vs West Bank comparison

### **Interactive Elements**
- **Search**: Type + search button approach for performance
- **Filtering**: Children, women, elderly categories
- **Theme Toggle**: Light/dark mode switching
- **Language Toggle**: Arabic/English with RTL/LTR support
- **Responsive Charts**: Interactive visualizations that work on all devices

## 🔄 Progressive Enhancement Strategy

### **Phase 1: Core Foundation**
- HTML structure with semantic markup
- CSS with custom properties for theming
- Basic JavaScript for data loading and navigation
- Mobile-optimized performance

### **Phase 2: Enhanced Interactions**
- Theme toggle (light/dark)
- Smooth page transitions
- Basic animations for counters and charts
- Search and filtering functionality

### **Phase 3: Cinematic Experience (Desktop)**
- GSAP animations for hero sections
- Parallax effects for memorial wall
- Advanced chart interactions
- Enhanced visual effects

### **Phase 4: Performance & Polish**
- Lazy loading optimization
- Reduced motion support
- Cross-browser compatibility
- Performance monitoring

## 📊 Data Structure & Sources

### **Available Data Files**
- **summary.json**: High-level totals and demographics
- **casualties_daily.json**: Daily Gaza casualties (697 days)
- **west_bank_daily.json**: Daily West Bank casualties
- **press_killed_in_gaza.json**: 246 journalists with details
- **killed-in-gaza.min.json**: ~60,000 individual records

### **Data Categories**
- **Gaza**: 63,633 killed (19,000 children, 12,500 women), 160,914 injured
- **West Bank**: 978 killed (198 children), 8,878 injured
- **Press**: 246 journalists killed
- **Special**: Famine deaths, aid seeker deaths, medical personnel

### **Data Coverage**
- **Timeline**: October 7, 2023 to September 2, 2025
- **Quality**: Comprehensive daily tracking with minimal gaps
- **Verification**: UN OCHA verified data for West Bank

## 🚀 Sharing & Distribution Strategy

### **Core Principle: EVERYTHING Must Be Shareable**
Every single element, statistic, comparison, and interaction must be designed to be shared and spread virally.

### **Shareable Elements - Complete Coverage**
- **Hero Counters**: Every number with benchmark comparison
- **Benchmark Comparisons**: Each comparison as shareable card
- **Daily Updates**: Shareable "Today's Impact" cards
- **Timeline Peaks**: Shareable "Worst Day" snapshots
- **Memorial Wall**: Individual names and group tributes
- **Fact Cards**: Every statistic and insight
- **Demographics**: Breakdown visualizations
- **Search Results**: Shareable "Found" cards
- **Random Facts**: Shareable "Did You Know?" cards

### **Sharing Features - Maximum Distribution**
- **Social Media**: Optimized cards for Twitter, Facebook, Instagram, LinkedIn
- **Download**: High-quality PNG/JPG for all content
- **Copy Link**: Direct links to specific views and comparisons
- **Embed Code**: Website/blog integration snippets
- **Print**: Print-friendly versions of all key data
- **QR Codes**: Quick sharing for physical materials

### **Distribution Goals**
- **Design Communities**: Quality attracts attention and sharing
- **Media Coverage**: Professional quality increases credibility
- **Social Sharing**: Easy sharing increases reach
- **Educational Use**: Data accessible for research and education
- **Viral Spread**: Every interaction creates shareable content

## 🎯 Relatability Benchmarks System

### **Core Concept**
Transform abstract numbers into relatable human experiences using everyday comparisons and historical events.

### **Data Sources**
- **Casualty Data**: Dynamic from Tech for Palestine APIs (daily updates, cumulative totals)
- **Benchmarks Database**: Static JSON with 180+ relatable comparisons

### **Technical Implementation**
- **Formula**: `equivalent = casualty_number / benchmark.value`
- **Filtering**: Only show comparisons where `equivalent >= 1`
- **Rounding**: Nearest whole number or 1 decimal for large numbers

### **Benchmark Categories**
- **Education**: School buses (50), classrooms (25-40), schools (500-1000)
- **Transport**: Planes (180-850), trains (750-1323), buses (50-80)
- **Venues**: Stadiums (20K-99K), theaters (1.2K-5.7K)
- **Cities**: Villages (5K), towns (10K-50K), cities (145K-9M)
- **Historic Events**: 9/11 (2,977), Hiroshima (70K), Holocaust daily (5,500)
- **Natural Disasters**: Earthquakes, tsunamis, cyclones
- **Recent Conflicts**: Syria, Ukraine, Iraq, Afghanistan

### **Smart Selection Logic**
- **Random Pick**: Keeps homepage content fresh
- **Best-Fit Match**: Finds benchmarks with neat integer ratios
- **Category-Aware**: Daily deaths (small scale) vs. cumulative totals (large scale)

### **Dynamic Display Examples**
- **Hero Counters**: "63,633 killed = the population of Cambridge, UK"
- **Daily Updates**: "Today: 412 killed = 8 school buses full of children"
- **Timeline Peaks**: "Worst day: 402 killed = 2 Boeing 777s"
- **Fact Cards**: "19,000 children killed = 380 school buses full of children"

### **Implementation Benefits**
- **Immediate Understanding**: Numbers become relatable stories
- **Natural Sharing**: People want to share powerful analogies
- **Fresh Content**: Every page load shows new comparisons
- **Cultural Relevance**: Adapts to different scales and contexts
- **Viral Potential**: Every comparison becomes shareable content
- **Maximum Impact**: Quality design naturally spreads the message

### **Main Page Display Strategy**
- **Single Main Comparison**: One powerful benchmark at a time for maximum impact
- **User-Controlled Refresh**: No auto-refresh, users choose when to see new content
- **Mobile-First Gestures**: Swipe left/right for new comparisons
- **Desktop Controls**: "See Another" button and arrow key navigation
- **Shareable Every Time**: Each comparison immediately shareable as a card

## 🎯 Success Metrics

### **Technical Performance**
- **Load Time**: Under 3 seconds on mobile
- **Performance Score**: 90+ on Lighthouse
- **Accessibility**: WCAG 2.1 AA compliance
- **Cross-Browser**: Works on all modern browsers

### **User Engagement**
- **Time on Site**: Meaningful engagement with content
- **Sharing Rate**: High social media sharing
- **Return Visits**: Users coming back for updates
- **Data Exploration**: Users engaging with interactive elements

### **Impact Goals**
- **Reach**: Number of people exposed to the data
- **Awareness**: Understanding of the human cost
- **Action**: Engagement with related causes
- **Education**: Use in educational and research contexts

## 🔧 Technical Implementation Details

### **Architecture Overview**
Clean separation of concerns with no file >300 lines for maintainability and Cursor autocomplete efficiency.

### **Project Structure**
```
/
├── /data/                    # Data Layer
│   ├── summary.json          # High-level statistics
│   ├── casualties_daily.json # Daily Gaza casualties
│   ├── west_bank_daily.json  # Daily West Bank casualties
│   ├── press_killed_in_gaza.json # Journalist data
│   ├── killed-in-gaza.min.json # Individual records
│   └── benchmarks.json       # Relatability benchmarks
├── /logic/                   # Logic Layer
│   ├── relatability.js       # Casualty + benchmarks → equivalents
│   ├── formatters.js         # Date, number, language helpers
│   └── calculations.js       # Days since war, averages, etc.
├── /js/components/           # UI Components (each <300 lines)
│   ├── counters.js           # Hero counters
│   ├── timeline.js           # Chart.js setup + annotations
│   ├── memorial.js           # Scroll wall of names
│   ├── journalists.js        # Press memorial grid
│   ├── factCards.js          # "Did you know?" cards
│   └── breakdown.js          # Demographics pie charts
├── /css/                     # Styles
│   ├── tailwind.css          # Compiled Tailwind
│   └── theme.css             # Custom overrides (fonts, palette)
└── *.html                    # Pages (index, memorial, press, about)
```

### **Frontend Framework**
- **Vanilla JavaScript**: No heavy frameworks for performance
- **CSS Custom Properties**: For theming and maintainability
- **Progressive Web App**: Offline capabilities and app-like experience

### **Charts & Visualizations**
- **Chart.js**: For performance and mobile compatibility
- **D3.js**: For advanced storytelling (desktop enhancement)
- **Responsive Design**: Charts that work on all screen sizes

### **Relatability Benchmarks Engine**
- **Dynamic Comparisons**: Real-time calculation of casualty equivalents
- **Smart Selection**: Category-aware benchmark matching
- **Performance Optimized**: Efficient JSON parsing and comparison logic
- **Caching Strategy**: Store processed comparisons for reuse

### **Performance Optimizations**
- **Image Optimization**: WebP format with fallbacks
- **Code Splitting**: Load only what's needed
- **Service Worker**: Caching and offline support
- **Lazy Loading**: Images and heavy content

### **Shareability Infrastructure**
- **Social Media API Integration**: Direct sharing to all platforms
- **Image Generation**: Server-side rendering for shareable cards
- **QR Code Generation**: Quick sharing for physical materials
- **Deep Linking**: Direct access to specific content and comparisons
- **Analytics Tracking**: Monitor sharing patterns and viral spread

### **Architecture Benefits**
- **Maintainability**: No file >300 lines, easy to understand and modify
- **Separation of Concerns**: Data → Logic → UI clear separation
- **Cursor Efficiency**: Easy autocomplete and context understanding
- **Scalability**: Easy to add new components and features
- **Testing**: Logic layer can be tested independently
- **Updates**: Easy to swap benchmarks, adjust formulas, tweak visuals

### **Accessibility Features**
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Support for high contrast modes
- **Reduced Motion**: Respect user motion preferences

## 📅 Development Timeline

### **Week 1-2: Foundation & Architecture**
- Project structure setup (/data, /logic, /js/components, /css)
- Data layer implementation (JSON loading and caching)
- Logic layer core (relatability.js, formatters.js, calculations.js)
- Basic HTML/CSS framework with Tailwind

### **Week 3-4: Core Components**
- Hero counters component (counters.js)
- Relatability engine integration
- Basic fact cards (factCards.js)
- Timeline component foundation (timeline.js)

### **Week 5-6: Advanced Components**
- Memorial wall component (memorial.js)
- Journalists grid (journalists.js)
- Demographics breakdown (breakdown.js)
- Shareability infrastructure

### **Week 7-8: Polish & Launch**
- Performance optimization and testing
- Cross-browser compatibility
- Launch preparation and deployment

## 🎨 Design Inspiration & References

### **Memorial Sites**
- Respectful, dignified presentation
- Focus on individual stories
- Appropriate visual language

### **Data Journalism**
- Clear, engaging data presentation
- Professional credibility
- Accessible information design

### **News & Media**
- Clean, trustworthy design
- Professional quality
- Easy navigation and reading

## 🔍 Key Decisions Made

1. **Static Site Approach**: HTML/CSS/JS for GitHub Pages hosting
2. **White Background**: Clean, readable design with red/black accents
3. **Multi-Page Structure**: Separate pages for different sections due to data size
4. **Progressive Enhancement**: Mobile-first with desktop enhancements
5. **Performance Priority**: Fast loading and smooth interactions
6. **Theme Flexibility**: Light/dark mode toggle
7. **Sharing Strategy**: EVERYTHING shareable for maximum viral spread
8. **Quality Focus**: Award-winning excellence that naturally attracts attention
9. **Benchmark Engine Core**: Relatability system drives the entire experience
10. **User-Controlled Display**: No auto-refresh, users choose when to see new content
11. **Mobile-First Gestures**: Swipe controls for intuitive mobile experience
12. **Maximum Shareability**: Every element designed to be shared and spread

## 🚀 Next Steps

1. **Project Structure**: Set up /data, /logic, /js/components, /css folders
2. **Data Layer**: Implement JSON loading and caching system
3. **Logic Layer**: Build relatability.js, formatters.js, calculations.js
4. **Core Components**: Start with counters.js and factCards.js
5. **Iterative Development**: Build, test, and refine each component progressively

---

*This document captures our complete understanding and approach for building a memorial website that honors victims while using quality design to amplify the important message and reach more people.* 