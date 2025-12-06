# **App Name**: MoneyGraph

## Core Features:

- Authentication via 3-Word Passkey: Securely authenticate users using a unique 3-word phrase as a passkey, stored locally for data encryption and Firestore access.
- Homepage Graph (Force-Directed): Visualize financial data as a dynamic force-directed graph. Toggle between 'Current Wallet Balance' and 'Total Monthly Spending' as the central node, with categories as orbiting nodes.
- Semantic Zoom & Drill-Down: Enable interactive exploration by zooming into categories to reveal sub-nodes (merchants, debtors), using spring forces and visual edges drawn with Jetpack Compose Canvas.
- Smart Input Bar (GenAI): Parse natural language input using Vertex AI to automatically categorize and record transactions, update the graph in real-time, and handle split transactions between multiple parties. Uses the Gemini LLM to tool the extraction.
- Transaction & Debt Tracking: Automatically track personal debts related to each financial transactions.
- Graph Engine Composable: Use a custom Jetpack Compose function `ForceDirectedGraph(nodes: List<Node>)` to calculate x/y coordinates for each node using physics principles.
- Vertex AI Transaction Parser: Implement a suspend function `parseTransaction(input: String): ParsedTransaction` that sends the user input to Gemini via Vertex AI and returns structured JSON representing the parsed transaction details. System instruction: 'You are a financial parser. Extract: Amount, Category, Merchant, and People involved. If multiple people are mentioned, calculate the split. Return JSON only.'

## Style Guidelines:

- Primary color: Green (#00FF00) for inflow, reflecting growth and financial gain.
- Secondary color: Red (#FF0000) for outflow, representing expenses.
- Background color: True AMOLED Black (#000000) for maximum contrast and energy savings on AMOLED screens.
- Font: 'Inter' (sans-serif) for both body and headline text, ensuring readability and a modern look.
- Input Bar: Floating at the bottom with `RoundedCornerShape(50)`, dark gray background, and white text.
- Use subtle animations for node interactions and graph updates.