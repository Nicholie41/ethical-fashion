# User Testing Session Guide - Ethical Fashion Platform

## **Figure G.28: User Testing Session Documentation**

### **Testing Session Overview**
- **Platform**: Ethical Fashion E-commerce Platform
- **Testing Type**: Usability Testing with Real Users
- **Duration**: 45-60 minutes per session
- **Participants**: 5-8 users (mix of demographics)

---

## **Pre-Testing Setup**

### **Environment Preparation**
```bash
# Start the application
cd backend && npm run dev
cd frontend && npm start

# Ensure both servers are running:
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

### **Test Accounts Setup**
```javascript
// Admin Account
Username: admin
Password: admin123
Role: Administrator

// Customer Account  
Username: testuser
Password: password123
Role: Customer

// Supplier Account
Username: supplier
Password: supplier123
Role: Supplier
```

---

## **User Testing Scenarios**

### **Scenario 1: New User Registration & Onboarding**
**Task**: Complete registration and explore the platform
**Duration**: 10 minutes

**Instructions for Participant**:
1. "You're a new user interested in ethical fashion. Please register for an account."
2. "After registration, explore the homepage and tell us what catches your attention."
3. "Try to find information about what makes a product 'ethical'."

**Observation Points**:
- [ ] Registration process completion time
- [ ] Any confusion during signup
- [ ] First impressions of homepage
- [ ] Understanding of ethical fashion concept
- [ ] Navigation ease

**Expected Screenshots**:
- Registration form completion
- Welcome message and onboarding
- Homepage exploration
- Sustainability information discovery

---

### **Scenario 2: Product Discovery & Filtering**
**Task**: Find and filter sustainable products
**Duration**: 15 minutes

**Instructions for Participant**:
1. "You want to buy a sustainable t-shirt. Find one that meets your criteria."
2. "Use the filters to narrow down your search."
3. "Compare different products based on their sustainability scores."

**Observation Points**:
- [ ] Filter usage effectiveness
- [ ] Understanding of sustainability scores
- [ ] Product comparison behavior
- [ ] Decision-making process
- [ ] Price vs. sustainability trade-offs

**Expected Screenshots**:
- Product listing page with filters
- Sustainability score comparison
- Product detail page
- Filter application process

---

### **Scenario 3: Gamification & Engagement**
**Task**: Interact with gamification features
**Duration**: 10 minutes

**Instructions for Participant**:
1. "Explore your user profile and see your sustainability points."
2. "Complete some activities to earn points."
3. "Check the leaderboard and see how you rank."

**Observation Points**:
- [ ] Understanding of points system
- [ ] Engagement with gamification features
- [ ] Motivation to earn points
- [ ] Social comparison behavior
- [ ] Feature discovery

**Expected Screenshots**:
- User profile with points display
- Gamification dashboard
- Leaderboard interaction
- Achievement badges

---

### **Scenario 4: Purchase Process**
**Task**: Complete a purchase with sustainability focus
**Duration**: 15 minutes

**Instructions for Participant**:
1. "Add a sustainable product to your cart."
2. "Review the product's ethical credentials."
3. "Complete the checkout process."
4. "Check your carbon savings."

**Observation Points**:
- [ ] Cart addition process
- [ ] Sustainability information review
- [ ] Checkout flow completion
- [ ] Understanding of carbon savings
- [ ] Post-purchase satisfaction

**Expected Screenshots**:
- Shopping cart with sustainability info
- Checkout process
- Order confirmation
- Carbon savings calculation

---

### **Scenario 5: Brand & Supplier Interaction**
**Task**: Explore brand information and supplier features
**Duration**: 10 minutes

**Instructions for Participant**:
1. "Learn about a specific ethical brand."
2. "If you were a supplier, try adding a product."
3. "Explore the supplier dashboard features."

**Observation Points**:
- [ ] Brand information comprehension
- [ ] Supplier feature understanding
- [ ] Interface usability for different roles
- [ ] Information transparency
- [ ] Trust building elements

**Expected Screenshots**:
- Brand detail page
- Supplier dashboard
- Product addition process
- Brand transparency features

---

## **Testing Session Script**

### **Introduction (5 minutes)**
```
"Welcome to our user testing session for the Ethical Fashion Platform. 
Today, we'll be exploring a new e-commerce platform focused on sustainable fashion.

The session will take about 45-60 minutes. We're recording this session to 
help us improve the platform. Your feedback is invaluable to us.

Please think aloud as you use the platform - tell us what you're thinking, 
what you like, what confuses you, and any suggestions you have."
```

### **Background Questions (5 minutes)**
1. "How often do you shop for clothing online?"
2. "How important is sustainability when making clothing purchases?"
3. "What factors do you consider when buying clothes?"
4. "Have you heard of ethical fashion before?"

### **Main Testing Session (35 minutes)**
- Run through scenarios 1-5
- Allow natural exploration
- Note any issues or positive reactions
- Capture screenshots of key interactions

### **Post-Testing Interview (10 minutes)**
1. "What did you think of the platform overall?"
2. "What was the most confusing part?"
3. "What features did you find most useful?"
4. "Would you use this platform? Why or why not?"
5. "How does it compare to other shopping sites you've used?"

---

## **Observation Checklist**

### **Usability Metrics**
- [ ] Task completion rate
- [ ] Time to complete tasks
- [ ] Number of errors made
- [ ] User satisfaction ratings
- [ ] Feature discovery rate

### **User Experience Elements**
- [ ] Navigation clarity
- [ ] Information architecture
- [ ] Visual design appeal
- [ ] Mobile responsiveness
- [ ] Loading times

### **Sustainability Focus**
- [ ] Understanding of ethical fashion
- [ ] Trust in sustainability claims
- [ ] Willingness to pay premium
- [ ] Engagement with educational content
- [ ] Carbon savings comprehension

---

## **Screenshot Capture Guide**

### **Key Moments to Capture**
1. **Registration Process**
   - Registration form
   - Welcome message
   - Onboarding flow

2. **Product Discovery**
   - Product listing page
   - Filter application
   - Sustainability score display

3. **Gamification Features**
   - User profile with points
   - Achievement badges
   - Leaderboard

4. **Purchase Flow**
   - Shopping cart
   - Checkout process
   - Order confirmation

5. **Brand Information**
   - Brand detail pages
   - Sustainability credentials
   - Transparency features

### **Technical Setup for Screenshots**
```bash
# Use browser developer tools to capture:
# - Network tab for API calls
# - Console for any errors
# - Performance tab for loading times
# - Mobile device simulation for responsive testing
```

---

## **Data Collection Template**

### **Participant Information**
- **Participant ID**: P001
- **Age Group**: 25-34
- **Gender**: Female
- **Shopping Frequency**: Monthly
- **Sustainability Interest**: High

### **Task Performance**
| Task | Completion Time | Success Rate | Issues Encountered |
|------|----------------|--------------|-------------------|
| Registration | 2:30 | 100% | None |
| Product Search | 4:15 | 100% | Filter confusion |
| Purchase | 6:20 | 80% | Payment method unclear |
| Gamification | 3:45 | 90% | Points system unclear |

### **Qualitative Feedback**
- **Positive Comments**: "Love the sustainability focus"
- **Confusion Points**: "Not sure what the points mean"
- **Suggestions**: "Add more product images"
- **Overall Rating**: 8/10

---

## **Expected Testing Outcomes**

### **Success Metrics**
- 90%+ task completion rate
- Average session time: 45-60 minutes
- High user satisfaction scores
- Clear understanding of sustainability features

### **Key Insights to Capture**
1. User understanding of ethical fashion
2. Effectiveness of gamification
3. Trust in sustainability claims
4. Willingness to pay premium prices
5. Mobile vs desktop preferences

### **Improvement Opportunities**
- Interface simplification
- Better onboarding
- Enhanced sustainability education
- Improved mobile experience
- Streamlined checkout process

---

## **Post-Testing Analysis**

### **Quantitative Analysis**
- Task completion rates
- Time on task
- Error frequency
- Feature usage patterns

### **Qualitative Analysis**
- User feedback themes
- Pain point identification
- Feature request patterns
- Trust and credibility factors

### **Recommendations**
- Prioritize improvements based on user feedback
- Focus on high-impact usability issues
- Enhance sustainability education features
- Optimize mobile experience
- Streamline critical user journeys 