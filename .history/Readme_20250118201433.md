# Project Prototype and Development Plan

I currently have a prototype, but it’s entirely on the frontend for now. Honestly, I didn’t anticipate how complex this project would become. Initially, I planned to use TypeScript and MySQL, but due to the challenges, I decided to simplify things and focus on building an MVP first before refactoring into TypeScript and MySQL later.

---

## Challenges and Complexity

### Large Dataset Handling
- Each ticker and timeframe contains extensive datasets (e.g., 10,000+ candles).  
- Managing this efficiently, especially syncing across timeframes, adds significant complexity.  
- For example, I need to track “what candle the user is viewing now” and ensure data consistency across different views and timeframes.

### Performance Optimization
- Handling large datasets on the frontend without optimization causes performance issues, particularly when navigating charts or simulating candle progression.  
- Redis caching is crucial to reduce database load, but integrating it carefully to avoid inconsistencies requires attention.

### Advanced Features
- Features like loading data from random dates, simulating candles one by one, and adding tools for annotations, notes, and drawings demand advanced frontend logic and seamless backend synchronization to save and retrieve data efficiently.

### Real-Time Functionality (Future Scope)
- Real-time features are planned for later, depending on affordable API availability.  
- Even a simple real-time crypto market feed would add architectural challenges, as both frontend and backend must handle updates consistently.

---

## MVP First, Then Improvements

Right now, I aim to deliver a simple MVP with core features like chart viewing, note-taking, and trade tracking. After that, I plan to:  
1. Refactor the codebase into TypeScript for better maintainability.  
2. Transition to MySQL for structured data handling.  
3. Gradually add advanced features and improve scalability.

---

## Why This Project?

I chose this project because it’s something I’m building for myself first and foremost. I’m passionate about financial trading and analysis, and this tool addresses real challenges I face. Beyond its practical use, I genuinely enjoy working on it, which keeps me motivated despite the complexity.  

---

# MVP Plan

### 1. Idea Description
Develop the foundational version of a financial trade analysis web application where users can:  
- Load historical candlestick chart data for a default timeframe and ticker.  
- Save pre-session analysis notes and tags for tickers.  
- Store and filter trade results based on tags or notes.

### 2. Data Structure

#### Entities and Relationships
- **Ticker Data**: Stores historical candlestick data (OHLC) by ticker and timeframe.  
- **Analysis**: Tracks user notes and tags for a specific ticker (linked via ticker field).  
- **Trades**: Stores trade results with tags, notes, and performance metrics (linked via ticker field).  

**Relationships**:  
- `Ticker → Analysis (One-to-Many)`  
- `Ticker → Trades (One-to-Many)`  

#### Database Justification
- **MongoDB**: Flexible schema for dynamic data like candlestick charts, notes, and trades.

### 3. Technologies

#### Backend
- **Node.js + Express**: Build the REST API.  
- **MongoDB**: Database to store entities.  
- **JWT**: For user authentication.  
- **Helmet**: Enhances security.  

#### Frontend
- **React (JS)**: Build a responsive user interface.  
- **Lightweight Charts**: Render candlestick charts.  

#### Others
- **Redis**: Cache default chart data for fast loading.

### 4. Feature List

#### Core Features
- **Chart Display**:  
  - Load historical candlestick chart data for default ticker and timeframe.  

- **Random Date Chart Navigation**:  
  - Jump to specific dates and load candlesticks incrementally.  
  - Simulate candlestick progression one by one for selected dates.  

- **Pre-Session Analysis**:  
  - Save user notes and tags for tickers.  
  - Retrieve saved notes and tags.  

- **Trade Results**:  
  - Record user trade results with tags and notes.  
  - Filter trade results based on tags or notes.  

- **Authentication**:  
  - User login and registration using JWT.  

- **Data Uploading**:  
  - Admin uploads historical candlestick data.  

### 5. API Design

#### Key Endpoints
- **Ticker Data**:  
  - `GET /api/tickers/:ticker/data?timeframe=M1`: Fetch historical candlestick data.  

- **Analysis**:  
  - `POST /api/analysis`: Save notes and tags for a ticker.  
  - `GET /api/analysis/:ticker`: Retrieve notes and tags.  

- **Trade Results**:  
  - `POST /api/trades`: Save trade results.  
  - `GET /api/trades?tags[]=tag1`: Filter trades by tags or notes.  

- **Authentication**:  
  - `POST /api/register`: User registration.  
  - `POST /api/login`: User authentication.  

- **Admin Upload**:  
  - `POST /api/tickers/upload`: Admin uploads candlestick data.

### 6. Timeline

#### Week 1: Backend Development
- **Day 1**: Set up Node.js, Express, and MongoDB. Create schemas for Ticker, Analysis, and Trades.  
- **Day 2**: Build API endpoints for ticker data and analysis.  
- **Day 3**: Add JWT-based authentication and basic validations.  
- **Day 4**: Implement admin data upload endpoint. Test all APIs using Postman.  

#### Week 2: Frontend Development
- **Day 1**: Set up React and build chart display using fetched data.  
- **Day 2**: Create forms for analysis notes and trade result input. Add API integrations.  
- **Day 3**: Add authentication (login and registration forms).  
- **Day 4**: Final testing, deploy backend, and document APIs.  

---

# Plan After MVP

### 1. New Features
- **Chart Drawing Tools**:  
  - Add features for users to draw lines, annotations, and zones on the chart.  
  - Save drawings in the database linked to the ticker and user.  

- **Socket.IO Implementation**:  
  - Add real-time tickers.  

- **TypeScript Refactoring**:  
  - Convert the codebase (backend and frontend) from JavaScript to TypeScript for better type safety and maintainability.

### 2. Timeline for Post-MVP

#### Week 1: Incremental Features
- **Day 1**: Implement candle-by-candle chart progression.  
- **Day 2**: Build basic drawing tools.  
- **Day 3**: Save drawings and annotations in MongoDB.  

#### Week 2: Advanced Features
- **Day 1**: Integrate Socket.IO for real-time tickers (cost tons but will see).  
- **Day 2**: Enhance caching with Redis for frequent chart requests.  
- **Day 3**: Refactor backend codebase to TypeScript.  
- **Day 4**: Refactor frontend components to TypeScript.  

### 3. Long-Term Features
- **Collaborative Features**:  
  - Shared trade plans or group annotations.  

- **Advanced Analytics**:  
  - Add statistical analysis or performance tracking tools.  

- **Mobile Optimization**:  
  - Ensure the application is mobile-friendly.  
