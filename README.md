# 1. Clone the project
git clone https://github.com/mtejas309/EduZap.git

# 2. Open the project folder
cd EduZap

# 3. Install all dependencies
npm install

# 4. Start the frontend
npm run dev

# 5. Open in browser
# Visit: http://localhost:5173


## **1. Handling 100,000+ Requests Efficiently with a Database**

When scaling to 100k+ requests, the main challenge is reducing database bottlenecks. Efficient handling requires a combination of server scaling and database optimization:

### **• Horizontal Scaling**

Run multiple Node.js instances behind a load balancer so incoming requests are distributed across all CPU cores. This increases concurrency and helps the system handle high RPS.

### **• Database Connection Pooling**

Instead of opening a new DB connection for each request, use a pooled set of persistent connections. This reduces latency and allows the server to process thousands of database operations concurrently.

### **• Proper Indexing**

Indexes prevent full-collection scans and ensure queries on fields like email, userId, or timestamps execute in milliseconds. Indexing is essential when handling large request volumes.



## **2. Choosing the Right Data Structures**

### **Fast Insertion and Fast Search → Hash Table**

Hash Tables provide average O(1) insertion and search, making them ideal for:

* Caching
* Session management
* Quick key–value lookups



### **Efficient Sorted Retrieval → B-Tree / B+Tree**

B-Trees and B+Trees provide O(log N) search and maintain data in sorted order. They power:

* Database indexes
* Range queries (>, <, between)
* Sorted lists and pagination

MongoDB, MySQL, and most databases rely on B-Tree-based index structures.



## **3. Real-Time Updates Using Socket.IO**

Real-time updates require a persistent, event-driven communication layer between client and server.

### **• Persistent WebSocket Connection**

Socket.IO maintains an always-open channel so the server can push updates instantly without polling.

### **• Rooms/Channels for Targeted Communication**

Users or data groups subscribe to specific channels. Only relevant clients receive updates, improving efficiency.

### **• Event-Based Architecture**

The server emits events (e.g., `messageReceived`, `orderUpdated`) and clients update their UI immediately.

### **• Database Change Streams (MongoDB)**

MongoDB can emit events when data changes. These events can be forwarded to connected clients through Socket.IO for real-time synchronization.


## **4. Best Cache Algorithm for Frequently Requested Data**

### **Use LRU (Least Recently Used)**

LRU is the most effective caching algorithm for modern web systems because:

### **• Matches Real User Behavior**

Most frequently accessed data is reused within short intervals. LRU keeps this "hot" data in memory.

### **• Predictable Memory Usage**

LRU evicts the least recently accessed items, keeping cache size fixed and efficient.

### **• Industry Standard**

Redis, browsers, and CDNs use LRU internally, proving its reliability.

### **• Prevents Cache Pollution**

Rarely accessed or one-time-use data gets removed automatically.


