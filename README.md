# homeNest
 

## The AI-powered family assistant for modern Indian homes

**Live App: [https://homenest.vercel.app](https://homenest.vercel.app)**

---

## 🏠 About homeNest

homeNest transforms how Indian families manage their households by bringing AI intelligence to meal planning, schedule coordination, and household tasks. Our platform reduces the mental load of running a home so families can focus on what matters most: spending quality time together.

![image](https://github.com/user-attachments/assets/a2e4d1ce-cd5f-4d23-ad65-93b91d7e073e)


## ✨ Key Features

- **AI-Powered Meal Planning:** Generate customized weekly meal plans considering dietary preferences, regional cuisines, and family needs
- **Intelligent Shopping Lists:** Automatically extract and organize ingredients from meal plans into shopping categories
- **Family Management:** Create and manage family profiles with invite codes for seamless onboarding
- **Shared Household Access:** Equal access for all family members with real-time synchronization

## 🛠️ Built With

- **Frontend:** Next.js 15 (App Router)
- **Backend:** Next.js API Routes
- **Database:** MongoDB with Prisma ORM
- **Styling:** Tailwind CSS with ShadCN UI Components
- **AI Integration:** Google Gemini API
- **Authentication:** Clerk
- **Deployment:** Vercel

 

<table>
  <tr>
    <td><img src="https://example.com/meal-planner.png" alt="Meal Planner" width="100%"></td>
    <td><img src="https://example.com/shopping-list.png" alt="Shopping List" width="100%"></td>
    <td><img src="https://example.com/family-management.png" alt="Family Management" width="100%"></td>
  </tr>
</table>

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- MongoDB instance or MongoDB Atlas account
- Google AI API key (for Gemini)
- Clerk account for authentication

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/homenest.git
   cd homenest
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   
   Then fill in your environment variables in `.env.local`

4. Set up the database
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🌐 Deployment

The application is deployed on Vercel at https://home-nest-lhk5.vercel.app/dashboard

To deploy your own instance:

1. Fork this repository
2. Create a new project on Vercel
3. Link your forked repository
4. Configure the environment variables
5. Deploy!

## 📘 Usage Guidelines

### Creating a Family

1. Sign up with your email or Google account
2. Create a new household and set preferences
3. Generate an invite code to add family members

### Meal Planning

1. Navigate to the Meal Planning section
2. Set dietary preferences and restrictions
3. Click "Generate Weekly Plan"
4. Review and customize as needed

### Shopping List

1. Access your auto-generated shopping list
2. Items are categorized by type (produce, dairy, etc.)
3. Check off items as you shop
4. Add custom items as needed

## 🔮 Upcoming Features

- Specialized role access controls for children and staff members
- WhatsApp integration for notifications and reminders
- Voice command support for hands-free operation
- BigBasket & Amazon Fresh integration for direct grocery ordering
- Family health hub for medication and appointment tracking

 
- [Vercel](https://vercel.com/) for hosting and deployment
- [ShadCN UI](https://ui.shadcn.com/) for the component library
- All our beta testers who provided invaluable feedback

---

**homeNest** | Built with ❤️ for Indian families
