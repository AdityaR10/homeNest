import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Keep the same interfaces for compatibility
export interface MealPlanRequest {
  cuisine: string[]
  dietaryRestrictions: string[]
  numberOfPeople: number
  numberOfDays: number
  availableIngredients?: string[]
  excludeIngredients?: string[]
}

export interface GeneratedMeal {
  title: string
  description: string
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  ingredients: string[]
  instructions: string
  calories: number
  cuisine: string
  date: Date
}

 
// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Configuration for meal plan generation
const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

export async function generateMealPlan(request: MealPlanRequest): Promise<GeneratedMeal[]> {
  console.log('[GEMINI] Generating meal plan with request:', request)
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('[GEMINI] Gemini API key not found')
    throw new Error('Gemini API key not configured')
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig,
    safetySettings,
  })

  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  const prompt = `
    Generate a ${request.numberOfDays}-day meal plan for ${request.numberOfPeople} people.
    
    Requirements:
    - Cuisines: ${request.cuisine.join(', ')}
    - Dietary restrictions: ${request.dietaryRestrictions.join(', ') || 'None'}
    - Available ingredients: ${request.availableIngredients?.join(', ') || 'None specified'}
    - Exclude ingredients: ${request.excludeIngredients?.join(', ') || 'None'}
    
    Generate exactly ${request.numberOfDays * 3} meals (breakfast, lunch, dinner for each day).
    
    Return ONLY a valid JSON array with this exact structure:
    [
      {
        "title": "Meal Name",
        "description": "Brief description",
        "mealType": "BREAKFAST|LUNCH|DINNER",
        "ingredients": ["ingredient1", "ingredient2"],
        "instructions": "Step by step cooking instructions",
        "calories": 400,
        "cuisine": "Primary cuisine type",
        "date": "YYYY-MM-DD"
      }
    ]
    
    Ensure the response is valid JSON that can be parsed directly.
    The date should be in YYYY-MM-DD format, starting from today.
  `

  try {
    console.log('[GEMINI] Sending request to Gemini...')
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()
    
    console.log('[GEMINI] Raw response:', content)
    
    if (!content) {
      console.error('[GEMINI] No response content from Gemini')
      throw new Error('No response from Gemini')
    }

    // Clean up the response to ensure it's valid JSON
    let cleanedContent = content.trim()
    
    // Remove any markdown code blocks
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    try {
      const meals = JSON.parse(cleanedContent) as GeneratedMeal[]
      console.log('[GEMINI] Successfully parsed meals:', meals.length)
      
      if (!Array.isArray(meals) || meals.length === 0) {
        console.error('[GEMINI] Invalid meals format or empty array')
        throw new Error('Invalid meal plan format received')
      }

      // Validate each meal has required fields and convert date strings to Date objects
      for (let i = 0; i < meals.length; i++) {
        const meal = meals[i]
        if (!meal.title || !meal.mealType || !meal.ingredients || !meal.date) {
          console.error('[GEMINI] Invalid meal at index', i, meal)
          throw new Error(`Invalid meal data at index ${i}`)
        }
        meal.date = new Date(meal.date)
      }

      return meals
    } catch (parseError) {
      console.error('[GEMINI] Failed to parse JSON response:', parseError)
      console.error('[GEMINI] Content that failed to parse:', cleanedContent)
      throw new Error('Failed to parse meal plan response')
    }

  } catch (error) {
    console.error('[GEMINI] Error generating meal plan:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to generate meal plan')
  }
}

// Add this to your existing gemini.ts file

export interface ShoppingListRequest {
  mealPlans: Array<{
    title: string
    mealType: string
    ingredients: string[]
  }>
  weekStart: string
  familySize: number
}

export interface ShoppingListItem {
  name: string
  quantity: string
  category: string
  isPurchased: boolean
}
// Add this to your existing gemini.ts file

export interface ShoppingListRequest {
  mealPlans: Array<{
    title: string
    mealType: string
    ingredients: string[]
  }>
  weekStart: string
  familySize: number
}

export interface ShoppingListItem {
  name: string
  quantity: string
  category: string
  isPurchased: boolean
}

export async function generateShoppingListWithGemini(request: ShoppingListRequest): Promise<ShoppingListItem[]> {
  console.log('[GEMINI] Generating shopping list with request:', request)
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('[GEMINI] Gemini API key not found')
    throw new Error('Gemini API key not configured')
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })

  const mealSummary = request.mealPlans.map(meal => 
    `${meal.mealType}: ${meal.title} (Ingredients: ${meal.ingredients.join(', ')})`
  ).join('\n')

  const prompt = `
    Create a comprehensive shopping list for a family of ${request.familySize} people based on the following weekly meal plan:

    ${mealSummary}

    Instructions:
    1. Consolidate duplicate ingredients and calculate appropriate quantities for ${request.familySize} people
    2. Organize items by grocery store categories (Vegetables, Fruits, Meat, Dairy, Grains, Pantry, Other)
    3. Include realistic quantities (e.g., "2 lbs", "1 bunch", "3 pieces", "500g")
    4. Consider staple items that might be needed (cooking oil, basic spices)
    5. Avoid items that are typically already available at home (water, common seasonings like salt)
    6. For ingredients mentioned multiple times, consolidate into appropriate total quantities

    Return ONLY a valid JSON array with this exact structure:
    [
      {
        "name": "Item name",
        "quantity": "Amount needed for ${request.familySize} people",
        "category": "Category name",
        "isPurchased": false
      }
    ]

    Categories must be one of: Vegetables, Fruits, Meat, Dairy, Grains, Pantry, Other
  `

  try {
    console.log('[GEMINI] Sending request to Gemini...')
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()
    
    console.log('[GEMINI] Raw response:', content)
    
    if (!content) {
      console.error('[GEMINI] No response content from Gemini')
      throw new Error('No response from Gemini')
    }

    // Clean up the response to ensure it's valid JSON
    let cleanedContent = content.trim()
    
    // Remove any markdown code blocks
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    try {
      const shoppingList = JSON.parse(cleanedContent) as ShoppingListItem[]
      console.log('[GEMINI] Successfully parsed shopping list:', shoppingList.length, 'items')
      
      if (!Array.isArray(shoppingList) || shoppingList.length === 0) {
        console.error('[GEMINI] Invalid shopping list format or empty array')
        throw new Error('Invalid shopping list format received')
      }

      // Validate each item has required fields
      for (let i = 0; i < shoppingList.length; i++) {
        const item = shoppingList[i]
        if (!item.name || !item.category) {
          console.error('[GEMINI] Invalid shopping item at index', i, item)
          throw new Error(`Invalid shopping item data at index ${i}`)
        }
        
        // Ensure quantity is set
        if (!item.quantity) {
          item.quantity = '1'
        }
        
        // Ensure isPurchased is boolean
        item.isPurchased = false
      }

      return shoppingList
    } catch (parseError) {
      console.error('[GEMINI] Failed to parse JSON response:', parseError)
      console.error('[GEMINI] Content that failed to parse:', cleanedContent)
      throw new Error('Failed to parse shopping list response')
    }

  } catch (error) {
    console.error('[GEMINI] Error generating shopping list:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to generate shopping list')
  }
}