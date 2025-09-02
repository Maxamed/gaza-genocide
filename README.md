# Gaza Genocide Memorial - Human Scale

> "Numbers become human through names and relatable context."

A bilingual memorial and data project that records, humanizes, and contextualizes the lives lost in Gaza. Every name is shown with dignity in Arabic and English. Every number is given human scale through comparisons to schools, buses, families, and cities.

## 🌟 Project Overview

Gaza Genocide Memorial - Human Scale transforms raw casualty statistics into something human and relatable. Behind every number, there is a name. Behind every name, there is a life. This project exists to ensure that silence and distance never erase memory.

### Key Features

- **Bilingual Support**: Full Arabic and English language support with RTL/LTR layout
- **Memorial Wall**: Searchable and filterable roll of names honoring every life lost
- **Press Memorial**: Dedicated section for journalists and media workers killed
- **Human Scale Context**: Relatable comparisons that make statistics meaningful
- **Data Transparency**: All data sourced from verified, open datasets
- **Ethical Design**: Respectful, neutral design focused on dignity and remembrance

## 🚀 Live Site

**URL**: [https://maxamed.github.io/gaza-genocide/](https://maxamed.github.io/gaza-genocide/)

## 📁 Project Structure

```
gaza-genocide/
├── index.html              # Homepage with statistics and comparisons
├── memorial.html           # Memorial wall with names and filters
├── journalists.html        # Press memorial for journalists
├── about.html              # About page with project information
├── css/
│   └── theme.css          # Main stylesheet with design system
├── js/
│   ├── logic/
│   │   ├── languageManager.js    # Language persistence system
│   │   ├── extractors.js         # Data extraction utilities
│   │   ├── pressContext.js       # Context generation engine
│   │   ├── journalistsMemorial.js # Main journalists controller
│   │   ├── memorial_context.js   # Memorial context logic
│   │   ├── calculations.js       # Statistical calculations
│   │   ├── formatters.js         # Data formatting utilities
│   │   └── relatability.js       # Human scale comparisons
│   ├── components/
│   │   ├── pressCard.js          # Journalist card component
│   │   ├── pressFilters.js       # Filter system component
│   │   ├── pressRoll.js          # Scrolling credits component
│   │   ├── memorial.js           # Memorial wall component
│   │   └── counters.js           # Statistics counter component
│   └── types/
│       └── press.js              # TypeScript/JSDoc type definitions
├── data/
│   ├── press_killed_in_gaza.json # Journalists casualty data
│   ├── press_rules.json          # Context generation rules
│   ├── benchmarks.json           # Human scale comparison data
│   ├── casualties_daily.json     # Daily casualty statistics
│   └── summary.json              # Summary statistics
├── robots.txt                     # Search engine crawling rules
├── sitemap.xml                   # Site structure for search engines
└── README.md                     # This file
```

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with CSS Custom Properties (variables)
- **Typography**: Google Fonts (Playfair Display, Inter, Amiri, Noto Sans Arabic)
- **Data**: JSON datasets with real-time processing
- **Deployment**: GitHub Pages
- **Language**: Bilingual Arabic/English with RTL support

## 🔧 Key Components

### Language Manager
- Persistent language preferences using localStorage
- Cross-page language consistency
- Automatic RTL/LTR layout switching
- Event-driven language change notifications

### Data Processing
- Real-time data normalization and extraction
- Context generation using rule-based engine
- Human scale comparisons and benchmarks
- Filtering and search capabilities

### Memorial System
- Paginated display of names and details
- Advanced filtering by multiple criteria
- Search functionality across all fields
- Responsive design for all devices

## 📊 Data Sources

All information comes from **[Tech for Palestine's](https://techforpalestine.org/)** open datasets, compiling verified reports from:
- Ministries and government agencies
- Humanitarian organizations
- Press freedom groups
- International monitoring bodies

We maintain complete transparency and do not alter any numbers. Where information is missing, it remains blank.

## 🎨 Design Philosophy

- **Respect**: No victim images, only names and factual contexts
- **Neutral Design**: White background, calm typography, no sensational visuals
- **Transparency**: All benchmarks and mappings documented and openly available
- **Accessibility**: Bilingual support designed for clarity and inclusion
- **Human Scale**: Making abstract numbers relatable through everyday comparisons

## 🌐 Language Support

### English
- Primary interface language
- Left-to-right (LTR) layout
- Western typography conventions

### Arabic
- Full Arabic language support
- Right-to-left (RTL) layout
- Arabic typography and fonts
- Cultural and linguistic sensitivity

## 📱 Responsive Design

- **Desktop**: Full-featured interface with multi-column layouts
- **Tablet**: Optimized for touch interaction
- **Mobile**: Single-column layout with touch-friendly controls
- **Accessibility**: Screen reader support and keyboard navigation

## 🚀 Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- No build tools or dependencies required

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/maxamed/gaza-genocide.git
   cd gaza-genocide
   ```

2. Open `index.html` in your browser
3. Or use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

### Deployment
- **GitHub Pages**: Automatically deployed from main branch
- **Custom Domain**: Can be configured in repository settings
- **CDN**: Static files can be served from any CDN

## 🤝 Contributing

This is an independent initiative created as a personal act of remembrance and resistance against forgetting. While contributions are welcome, please respect the solemn nature of this memorial project.

### Guidelines
- Maintain respectful, dignified tone
- Ensure accuracy of all information
- Test bilingual functionality
- Follow existing code style and patterns

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Tech for Palestine** for providing verified, open datasets
- **Human rights organizations** for their tireless documentation work
- **Open source community** for tools and inspiration
- **Volunteers and contributors** who help maintain accuracy

## 📞 Contact

- **GitHub**: [github.com/maxamed/gaza-genocide](https://github.com/maxamed/gaza-genocide)
- **Live Site**: [https://maxamed.github.io/gaza-genocide/](https://maxamed.github.io/gaza-genocide/)

---

> "If you have the ability to witness, you have the responsibility to show."

*This site was created as an independent initiative to turn raw statistics into something human and relatable. It is not affiliated with any government or organization. It is a personal act of remembrance and resistance against forgetting.* 