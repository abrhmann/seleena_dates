# Seleena Dates - Premium Dates E-Commerce Website

A beautiful, bilingual (English/Arabic) e-commerce website for selling premium dates with a full-featured admin panel.

## 🌟 Features

### Customer-Facing Features
- **Bilingual Support**: Full English and Arabic language support with RTL layout
- **Modern UI**: Premium design with smooth animations and glassmorphism effects
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Product Showcase**: Beautiful product displays with detailed information
- **Easy Navigation**: Intuitive navigation with language switcher

### Admin Panel Features
- **Secure Authentication**: Login system to protect admin access
- **Dashboard Overview**: Quick stats on sales, orders, and products
- **Product Management**: 
  - Add new products with bilingual names
  - Edit existing products
  - Delete products
  - Track stock levels
- **Order Management**: View and track customer orders
- **Protected Routes**: Secure admin area accessible only after login

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/abrhmann/seleena-dates.git
cd seleena-dates
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔐 Admin Access

To access the admin panel:

1. Navigate to `/admin/login`
2. Use the following credentials:
   - **Username**: `admin`
   - **Password**: `seleena2024`

**Note**: In production, replace this with a proper authentication system with secure password hashing.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Internationalization**: i18next
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with CSS Variables

## 📁 Project Structure

```
seleena-dates/
├── src/
│   ├── components/       # Reusable components (Navbar, Footer, etc.)
│   ├── pages/           # Page components (Home, Shop, Admin, etc.)
│   ├── context/         # React Context for state management
│   ├── assets/          # Images and static assets
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Entry point
│   ├── i18n.js          # Internationalization configuration
│   └── index.css        # Global styles
├── public/              # Public assets
└── package.json         # Dependencies and scripts
```

## 🌐 Available Routes

- `/` - Home page
- `/shop` - Products shop page
- `/about` - About page (coming soon)
- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard (protected)

## 🎨 Customization

### Colors
The color scheme can be customized in `src/index.css` using CSS variables:

```css
--color-primary: #c59764;  /* Gold/Bronze */
--color-secondary: #8b4513; /* Brown */
--color-bg: #faf8f5;       /* Light cream */
--color-text: #2c1810;     /* Dark brown */
```

### Languages
Add or modify translations in `src/i18n.js`

## 📝 Future Enhancements

- [ ] Shopping cart functionality
- [ ] Payment gateway integration
- [ ] Customer accounts and order history
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Advanced search and filtering
- [ ] Backend API integration
- [ ] Database for persistent data storage

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Seleena Dates Team**

---

Made with ❤️ for premium date lovers worldwide 🌴
