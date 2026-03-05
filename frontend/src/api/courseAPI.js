/**
 * Mock Course API Service
 * Simulates backend API calls for course content and exams
 */

// Course data (in real app, comes from backend)
const coursesData = [
  {
    _id: 'course-dsa-001',
    title: 'Data Structures and Algorithms (DSA)',
    description: 'Master fundamental data structures and algorithmic problem-solving techniques used in competitive programming and technical interviews.',
    level: 'Intermediate',
    duration: '40 hours',
    instructor: 'Prof. Algomaster',
    category: 'Computer Science',
    modules: [
      {
        _id: 'dsa-mod-1',
        title: 'Arrays and Strings',
        description: 'Learn about linear data structures and string manipulation',
        duration: 8,
        videoUrl: 'https://example.com/dsa-arrays',
        content: `Arrays and Strings are fundamental data structures in computer science.

**What is an Array?**
An array is a collection of elements stored at contiguous memory locations.

Key Concepts:
- Indexing: Access elements in O(1) time
- Insertion/Deletion: O(n) time complexity
- Searching: O(n) for linear, O(log n) for binary search

**String Manipulation:**
- Pattern matching
- String compression
- Palindrome checking
- Anagram detection

**Real-world Applications:**
- Database indexing
- Image processing
- Text processing`
      },
      {
        _id: 'dsa-mod-2',
        title: 'Linked Lists',
        description: 'Understand dynamic data structures and linked list operations',
        duration: 6,
        videoUrl: 'https://example.com/dsa-linkedlists',
        content: `Linked Lists: Dynamic Data Structures

**Types of Linked Lists:**
1. Singly Linked List - One direction
2. Doubly Linked List - Two directions
3. Circular Linked List - Last points to first

**Operations:**
- Insertion at beginning: O(1)
- Insertion at end: O(n)
- Deletion: O(n)
- Search: O(n)
- Reverse: O(n)

**Common Problems:**
- Reverse a linked list
- Detect cycle
- Find middle element
- Merge sorted lists
- Remove duplicates`
      },
      {
        _id: 'dsa-mod-3',
        title: 'Stacks and Queues',
        description: 'Master LIFO and FIFO data structures',
        duration: 6,
        videoUrl: 'https://example.com/dsa-stacks-queues',
        content: `Stacks and Queues: LIFO and FIFO Structures

**Stacks (LIFO):**
- Push: Add to top - O(1)
- Pop: Remove from top - O(1)
- Applications: Function calls, Undo/Redo, DFS

**Queues (FIFO):**
- Enqueue: Add to rear - O(1)
- Dequeue: Remove from front - O(1)
- Types: Simple, Circular, Priority, Deque
- Applications: BFS, Scheduling, Load balancing`
      },
      {
        _id: 'dsa-mod-4',
        title: 'Trees and Graphs',
        description: 'Learn hierarchical and network data structures',
        duration: 10,
        videoUrl: 'https://example.com/dsa-trees-graphs',
        content: `Trees and Graphs: Complex Data Structures

**Binary Trees:**
- Traversals: In-order, Pre-order, Post-order, Level-order
- Height and Balance
- Binary Search Trees (BST)

**Graphs:**
- Representation: Adjacency Matrix, Adjacency List
- Traversals: DFS, BFS
- Shortest Path: Dijkstra, Bellman-Ford
- MST: Kruskal, Prim`
      },
      {
        _id: 'dsa-mod-5',
        title: 'Dynamic Programming',
        description: 'Solve optimization problems using memoization',
        duration: 10,
        videoUrl: 'https://example.com/dsa-dynamic-programming',
        content: `Dynamic Programming: Optimization Technique

**Core Concepts:**
1. Overlapping Subproblems
2. Optimal Substructure
3. Memoization
4. Tabulation

**Classic DP Problems:**
- Fibonacci
- 0/1 Knapsack
- LCS (Longest Common Subsequence)
- LIS (Longest Increasing Subsequence)
- Coin Change
- Edit Distance`
      }
    ]
  },
  {
    _id: 'course-dbms-001',
    title: 'Database Management Systems (DBMS)',
    description: 'Comprehensive guide to database design, SQL, normalization, and optimization.',
    level: 'Intermediate',
    duration: '35 hours',
    instructor: 'Prof. DataMaster',
    category: 'Databases',
    modules: [
      {
        _id: 'dbms-mod-1',
        title: 'Relational Database Fundamentals',
        description: 'Understanding RDBMS concepts and data modeling',
        duration: 7,
        videoUrl: 'https://example.com/dbms-fundamentals',
        content: `Relational Database Management Systems (RDBMS)

**Key Concepts:**
- Tables (Relations): 2D structure with rows and columns
- Keys: Primary, Foreign, Candidate, Super
- Constraints: NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY

**Data Types:**
- Numeric: INT, FLOAT, DECIMAL
- String: VARCHAR, CHAR, TEXT
- Date/Time: DATE, TIME, TIMESTAMP
- Boolean: BOOLEAN

**Relationships:**
- One-to-One (1:1)
- One-to-Many (1:N)
- Many-to-Many (M:N)`
      },
      {
        _id: 'dbms-mod-2',
        title: 'SQL: Querying and Manipulation',
        description: 'Master SQL for data retrieval and manipulation',
        duration: 8,
        videoUrl: 'https://example.com/dbms-sql',
        content: `SQL: Structured Query Language

**DML Operations:**
- SELECT: Retrieve data
- INSERT: Add records
- UPDATE: Modify records
- DELETE: Remove records

**Filtering:**
- WHERE, AND, OR, NOT
- BETWEEN, IN, LIKE
- NULL handling

**Joins:**
- INNER JOIN
- LEFT/RIGHT JOIN
- FULL OUTER JOIN
- CROSS JOIN

**Aggregate Functions:**
COUNT(), SUM(), AVG(), MIN(), MAX()`
      },
      {
        _id: 'dbms-mod-3',
        title: 'Database Normalization',
        description: 'Design efficient databases with normalization rules',
        duration: 7,
        videoUrl: 'https://example.com/dbms-normalization',
        content: `Database Normalization

**Normal Forms:**
- 1NF: Atomic values, no repeating groups
- 2NF: Remove partial dependencies
- 3NF: Remove transitive dependencies
- BCNF: Stricter than 3NF

**Purpose:**
- Eliminate redundancy
- Reduce anomalies
- Improve integrity
- Optimize performance`
      },
      {
        _id: 'dbms-mod-4',
        title: 'Indexing and Query Optimization',
        description: 'Improve database performance through indexing',
        duration: 7,
        videoUrl: 'https://example.com/dbms-indexing',
        content: `Indexing and Query Optimization

**Index Types:**
- Primary Index
- Unique Index
- Composite Index
- Full-text Index
- B-Tree (most common)

**Optimization Tips:**
- Use EXPLAIN for execution plans
- Index WHERE columns
- Avoid functions on indexed columns
- Specific columns (avoid SELECT *)
- Partition large tables`
      },
      {
        _id: 'dbms-mod-5',
        title: 'Transactions and ACID Properties',
        description: 'Understanding data consistency and isolation levels',
        duration: 6,
        videoUrl: 'https://example.com/dbms-transactions',
        content: `Transactions and ACID Properties

**ACID:**
- Atomicity: All or nothing
- Consistency: Valid state
- Isolation: No interference
- Durability: Persists

**Isolation Levels:**
- Serializable
- Repeatable Read
- Read Committed
- Read Uncommitted

**Transaction Anomalies:**
- Dirty read
- Non-repeatable read
- Phantom read`
      }
    ]
  },
  {
    _id: 'course-os-001',
    title: 'Operating Systems (OS)',
    description: 'Deep dive into OS concepts including processes, memory management, and file systems.',
    level: 'Intermediate',
    duration: '38 hours',
    instructor: 'Prof. Kernelwiz',
    category: 'Systems',
    modules: [
      {
        _id: 'os-mod-1',
        title: 'OS Fundamentals and Process Management',
        description: 'Core OS concepts and process lifecycle',
        duration: 8,
        videoUrl: 'https://example.com/os-fundamentals',
        content: `Operating Systems Fundamentals

**Main Functions:**
- Resource Allocation
- Process Management
- Memory Management
- File System
- Security
- I/O Management

**Process Management:**
- Process: Executing instance with own context
- States: New, Ready, Running, Waiting, Terminated
- Process Control Block (PCB)
- Context Switching
- Threads: Lightweight processes`
      },
      {
        _id: 'os-mod-2',
        title: 'CPU Scheduling',
        description: 'Learn scheduling algorithms for CPU utilization',
        duration: 7,
        videoUrl: 'https://example.com/os-scheduling',
        content: `CPU Scheduling Algorithms

**Non-Preemptive:**
- FCFS: Simple, convoy effect
- SJF: Minimum wait time
- Priority: Higher priority first

**Preemptive:**
- SRTF: Preemptive SJF
- Round Robin: Time quantum
- Priority Preemptive
- Multi-level Queue/Feedback Queue

**Criteria:**
- CPU Utilization
- Throughput
- Turnaround Time
- Waiting Time
- Response Time`
      },
      {
        _id: 'os-mod-3',
        title: 'Memory Management',
        description: 'Techniques for efficient memory allocation',
        duration: 8,
        videoUrl: 'https://example.com/os-memory',
        content: `Memory Management

**Allocation Types:**
- Contiguous: Fixed/Variable partitions
- Paging: Fixed-size pages
- Segmentation: Meaningful segments
- Virtual Memory: Larger than physical

**Virtual Memory:**
- Demand Paging
- Page Faults
- Page Replacement Algorithms
- Thrashing

**Memory Protection:**
- Base-limit registers
- MMU (Memory Management Unit)
- Permission control`
      },
      {
        _id: 'os-mod-4',
        title: 'File Systems',
        description: 'Understanding file organization and access methods',
        duration: 7,
        videoUrl: 'https://example.com/os-file-systems',
        content: `File Systems

**Access Methods:**
- Sequential: Read from beginning
- Random: Direct access
- Indexed: Index-based access

**Directory Structures:**
- Single-level
- Two-level
- Tree-structured
- Acyclic Graph

**Disk Scheduling:**
- FCFS, SSTF, SCAN, C-SCAN
- Optimize head movement

**File System Types:**
FAT, NTFS, ext4, APFS`
      },
      {
        _id: 'os-mod-5',
        title: 'Synchronization and Deadlocks',
        description: 'Managing concurrent processes and avoiding deadlocks',
        duration: 8,
        videoUrl: 'https://example.com/os-synchronization',
        content: `Synchronization and Deadlock

**Sync Tools:**
- Locks/Mutexes
- Semaphores
- Monitors

**Deadlock Conditions:**
- Mutual Exclusion
- Hold and Wait
- No Preemption
- Circular Wait

**Solutions:**
- Prevention: Break one condition
- Avoidance: Banker's algorithm
- Detection: Resource graph
- Recovery: Process termination`
      }
    ]
  },
  {
    _id: 'course-cn-001',
    title: 'Computer Networks (CN)',
    description: 'Comprehensive networking covering OSI model, TCP/IP, and protocols.',
    level: 'Intermediate',
    duration: '36 hours',
    instructor: 'Prof. Networkpro',
    category: 'Networking',
    modules: [
      {
        _id: 'cn-mod-1',
        title: 'Network Fundamentals and OSI Model',
        description: 'Understanding network basics and layered architecture',
        duration: 7,
        videoUrl: 'https://example.com/cn-fundamentals',
        content: `Network Fundamentals

**Network Types:**
- LAN (Local Area Network)
- MAN (Metropolitan Area Network)
- WAN (Wide Area Network)
- PAN (Personal Area Network)
- VPN (Virtual Private Network)

**OSI Model (7 Layers):**
7. Application: HTTP, FTP, SMTP, DNS
6. Presentation: Formatting, encryption
5. Session: Establishment, termination
4. Transport: TCP, UDP
3. Network: IP, routing
2. Data Link: Ethernet, MAC
1. Physical: Cables, signals

**TCP/IP Model (4 layers):**
- Application (7,6,5)
- Transport (4)
- Network (3)
- Link (2,1)`
      },
      {
        _id: 'cn-mod-2',
        title: 'IP Addressing and Routing',
        description: 'IPv4, IPv6, subnetting, and routing protocols',
        duration: 7,
        videoUrl: 'https://example.com/cn-addressing',
        content: `IP Addressing and Routing

**IPv4:**
- 32-bit address
- 4 octets (0-255)
- 4.3 billion addresses
- Classes A-E

**IPv6:**
- 128-bit address
- 8 groups of 4 hex
- 340 undecillion addresses
- Auto-configuration

**Subnetting:**
- CIDR notation
- Subnet mask
- Network, broadcast, usable

**Routing Protocols:**
- RIP: Distance vector
- OSPF: Link state
- BGP: Path vector`
      },
      {
        _id: 'cn-mod-3',
        title: 'Transport Layer Protocols',
        description: 'TCP, UDP, and end-to-end communication',
        duration: 7,
        videoUrl: 'https://example.com/cn-transport',
        content: `Transport Layer Protocols

**UDP:**
- Connectionless
- Fast but unreliable
- No flow control
- Low overhead
- Uses: DNS, NTP, streaming

**TCP:**
- Connection-oriented
- Reliable, ordered
- Flow control
- Congestion control
- Uses: Email, HTTP, banking

**TCP Features:**
- Sequence numbers
- Acknowledgments
- Three-way handshake
- Window-based flow control

**Connection States:**
SYN, SYN-ACK, ACK, FIN...`
      },
      {
        _id: 'cn-mod-4',
        title: 'DNS and Application Layer',
        description: 'DNS, HTTP, HTTPS, and application protocols',
        duration: 7,
        videoUrl: 'https://example.com/cn-application',
        content: `Application Layer Protocols

**DNS:**
- Domain Name System
- Resolves names to IPs
- Hierarchical nameservers
- Record types: A, AAAA, CNAME, MX

**HTTP:**
- Stateless protocol
- Methods: GET, POST, PUT, DELETE
- Status codes: 2xx, 3xx, 4xx, 5xx
- Headers for metadata

**HTTPS:**
- HTTP over TLS/SSL
- Encrypted communication
- Certificate-based auth
- Port 443

**Other Protocols:**
- SMTP/POP3/IMAP: Email
- FTP/SFTP: File transfer
- DHCP: IP assignment`
      },
      {
        _id: 'cn-mod-5',
        title: 'Network Security and Wireless Networks',
        description: 'Security protocols, encryption, and wireless communication',
        duration: 8,
        videoUrl: 'https://example.com/cn-security',
        content: `Network Security

**Encryption:**
- Symmetric: AES, DES (same key)
- Asymmetric: RSA, ECC (public/private)
- Hash: MD5, SHA (one-way)

**Digital Signatures:**
- Sign with private key
- Verify with public
- Authentication & non-repudiation

**IPsec & TLS:**
- IPsec: IP-level security
- TLS: Transport layer

**Wireless Networks:**
- WiFi (802.11): 2.4/5 GHz
- Security: WEP, WPA, WPA2, WPA3
- Bluetooth: Short range, low power`
      }
    ]
  },
  {
    _id: 'course-oop-001',
    title: 'Object-Oriented Programming (OOP)',
    description: 'Master OOP principles, design patterns, and SOLID principles.',
    level: 'Intermediate',
    duration: '32 hours',
    instructor: 'Prof. OOPMaster',
    category: 'Programming',
    modules: [
      {
        _id: 'oop-mod-1',
        title: 'OOP Fundamentals: Classes and Objects',
        description: 'Introduction to classes, objects, and instance variables',
        duration: 6,
        videoUrl: 'https://example.com/oop-fundamentals',
        content: `Object-Oriented Programming Fundamentals

**Core Concepts:**
- Classes: Template for objects
- Objects: Instance of class
- Attributes: Variables in class
- Methods: Functions in class

**Encapsulation:**
- Bundle data and methods
- Access modifiers: public, private, protected
- Getters and setters
- Information hiding

**Constructors:**
- Initialize objects
- Can be overloaded
- No return type

**Keywords:**
- this: Current object
- static: Belongs to class
- final: Can't change/override`
      },
      {
        _id: 'oop-mod-2',
        title: 'Inheritance and Polymorphism',
        description: 'Code reuse through inheritance and flexible design',
        duration: 6,
        videoUrl: 'https://example.com/oop-inheritance',
        content: `Inheritance and Polymorphism

**Inheritance:**
- Acquire from parent class
- Extends code reusability
- Hierarchy: Parent → Child
- super keyword: Access parent

**Method Overriding:**
- Child provides new implementation
- Same signature as parent
- @Override annotation

**Polymorphism:**
- Ability to exist in many forms
- Compile-time (overloading)
- Runtime (overriding)

**Upcasting & Downcasting:**
- Upcasting: Child → Parent (safe)
- Downcasting: Parent → Child (requires check)

**Interfaces vs Abstract:**
- Interface: Contract, multiple
- Abstract: Partial, single`
      },
      {
        _id: 'oop-mod-3',
        title: 'Encapsulation and Abstraction',
        description: 'Data hiding and creating clean interfaces',
        duration: 5,
        videoUrl: 'https://example.com/oop-encapsulation',
        content: `Encapsulation and Abstraction

**Encapsulation:**
- Hide internal details
- Control access
- Protect data integrity
- Enable changes without breaking

**Abstraction:**
- Hide complexity
- Show only necessary
- Interface focuses on "what"

**Abstract Classes:**
- Can't instantiate directly
- Partial template
- Subclasses must implement

**Interfaces:**
- Complete abstraction
- No state (only constants)
- Multiple inheritance
- "Can-do" relationship

**Good Abstractions:**
- Single responsibility
- Cohesive design
- Minimal interface
- Intuitive naming`
      },
      {
        _id: 'oop-mod-4',
        title: 'Design Patterns',
        description: 'Common solutions to design problems',
        duration: 8,
        videoUrl: 'https://example.com/oop-design-patterns',
        content: `Design Patterns

**Creational:**
- Singleton: One instance
- Factory: Create without specifying class
- Builder: Step-by-step construction
- Prototype: Clone existing object

**Structural:**
- Adapter: Compatible interfaces
- Decorator: Add functionality dynamically
- Facade: Simplified interface
- Proxy: Control access

**Behavioral:**
- Strategy: Select algorithm at runtime
- Observer: Notify multiple objects
- Command: Encapsulate request
- State: Alter on state change`
      },
      {
        _id: 'oop-mod-5',
        title: 'SOLID Principles',
        description: 'Best practices for maintainable OOP code',
        duration: 7,
        videoUrl: 'https://example.com/oop-solid',
        content: `SOLID Principles

**S - Single Responsibility:**
One reason to change

**O - Open/Closed:**
Open for extension, closed for modification

**L - Liskov Substitution:**
Derived substitutable for base

**I - Interface Segregation:**
Specific interfaces vs general

**D - Dependency Inversion:**
Depend on abstractions, not concrete

**Benefits:**
- Maintainability
- Flexibility
- Testability
- Reusability
- Scalability`
      }
    ]
  }
];

// Quiz questions
const quizzesData = [
  {
    courseId: 'course-dsa-001',
    title: 'DSA Exam',
    questions: [
      { id: 1, question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'], correctAnswer: 1, difficulty: 'easy' },
      { id: 2, question: 'Which data structure uses LIFO principle?', options: ['Queue', 'Stack', 'Array', 'Linked List'], correctAnswer: 1, difficulty: 'easy' },
      { id: 3, question: 'What is the average case time complexity of QuickSort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], correctAnswer: 1, difficulty: 'medium' },
      { id: 4, question: 'In a BST, what property must hold?', options: ['Left < Parent < Right', 'Left > Parent > Right', 'All equal', 'Random'], correctAnswer: 0, difficulty: 'medium' },
      { id: 5, question: 'What is the space complexity of merge sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctAnswer: 2, difficulty: 'medium' },
      { id: 6, question: 'How many edges in a tree with n vertices?', options: ['n', 'n-1', 'n+1', '2n'], correctAnswer: 1, difficulty: 'hard' },
      { id: 7, question: 'Which finds shortest path with negative edges?', options: ['Dijkstra', 'BFS', 'DFS', 'Bellman-Ford'], correctAnswer: 3, difficulty: 'hard' },
      { id: 8, question: 'Main idea behind dynamic programming?', options: ['Random numbers', 'Reuse subproblem solutions', 'Always recurse', 'Sort first'], correctAnswer: 1, difficulty: 'hard' }
    ]
  },
  {
    courseId: 'course-dbms-001',
    title: 'DBMS Exam',
    questions: [
      { id: 1, question: 'Which normal form eliminates partial dependencies?', options: ['1NF', '2NF', '3NF', 'BCNF'], correctAnswer: 1, difficulty: 'easy' },
      { id: 2, question: 'What is the primary purpose of indexing?', options: ['Reduce storage', 'Speed up retrieval', 'Improve quality', 'Enable encryption'], correctAnswer: 1, difficulty: 'easy' },
      { id: 3, question: 'Which is NOT part of ACID?', options: ['Atomicity', 'Concurrency', 'Consistency', 'Durability'], correctAnswer: 1, difficulty: 'medium' },
      { id: 4, question: 'What type of join returns matching rows?', options: ['LEFT', 'RIGHT', 'INNER', 'FULL'], correctAnswer: 2, difficulty: 'medium' },
      { id: 5, question: 'Which function counts rows?', options: ['SUM()', 'AVG()', 'COUNT()', 'TOTAL()'], correctAnswer: 2, difficulty: 'easy' },
      { id: 6, question: 'What is a foreign key?', options: ['Key from another country', 'Invalid key', 'Reference to primary key', 'Encryption key'], correctAnswer: 2, difficulty: 'medium' },
      { id: 7, question: 'Most common index type?', options: ['Hash', 'Bitmap', 'B-Tree', 'R-Tree'], correctAnswer: 2, difficulty: 'hard' },
      { id: 8, question: 'Which level prevents dirty reads?', options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'], correctAnswer: 1, difficulty: 'hard' }
    ]
  },
  {
    courseId: 'course-os-001',
    title: 'OS Exam',
    questions: [
      { id: 1, question: 'What is process context?', options: ['Program on disk', 'Register and PC state', 'Memory for variables', 'Schedule'], correctAnswer: 1, difficulty: 'easy' },
      { id: 2, question: 'Which scheduling suffers convoy effect?', options: ['SJF', 'RR', 'FCFS', 'Priority'], correctAnswer: 2, difficulty: 'medium' },
      { id: 3, question: 'What is a page fault?', options: ['Page error', 'Page not in memory', 'Memory full', 'Protection violation'], correctAnswer: 1, difficulty: 'easy' },
      { id: 4, question: 'Which is NOT deadlock condition?', options: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Priority Scheduling'], correctAnswer: 3, difficulty: 'hard' },
      { id: 5, question: 'What is thrashing?', options: ['File deletion', 'Excessive page faults', 'Data corruption', 'Disk breaking'], correctAnswer: 1, difficulty: 'medium' },
      { id: 6, question: 'Which uses base and limit registers?', options: ['Paging', 'Segmentation', 'Contiguous', 'Virtual'], correctAnswer: 2, difficulty: 'hard' },
      { id: 7, question: 'Maximum scheduling latency is?', options: ['Turnaround', 'Response', 'Wait', 'Period'], correctAnswer: 0, difficulty: 'hard' },
      { id: 8, question: 'How many process states?', options: ['2', '3', '5', '7'], correctAnswer: 2, difficulty: 'medium' }
    ]
  },
  {
    courseId: 'course-cn-001',
    title: 'CN Exam',
    questions: [
      { id: 1, question: 'At which layer does IP work?', options: ['Layer 2', 'Layer 3', 'Layer 4', 'Layer 7'], correctAnswer: 1, difficulty: 'easy' },
      { id: 2, question: 'How many bits in IPv4?', options: ['16', '32', '64', '128'], correctAnswer: 1, difficulty: 'easy' },
      { id: 3, question: 'What does TCP provide that UDP doesn\'t?', options: ['Speed', 'Low latency', 'Reliability', 'Datagrams'], correctAnswer: 2, difficulty: 'medium' },
      { id: 4, question: 'DNS full form?', options: ['Data Name', 'Domain Name', 'Direct Network', 'Dynamic Network'], correctAnswer: 1, difficulty: 'easy' },
      { id: 5, question: 'Which HTTP method is idempotent?', options: ['POST', 'PUT', 'DELETE', 'All'], correctAnswer: 3, difficulty: 'hard' },
      { id: 6, question: 'Purpose of ARP?', options: ['IP to MAC', 'MAC to IP', 'Encrypt', 'Route'], correctAnswer: 0, difficulty: 'medium' },
      { id: 7, question: 'Most secure WiFi standard?', options: ['WEP', 'WPA', 'WPA2', 'WPA3'], correctAnswer: 3, difficulty: 'medium' },
      { id: 8, question: 'Port range?', options: ['0-256', '0-1023', '0-65535', '1-100000'], correctAnswer: 2, difficulty: 'hard' }
    ]
  },
  {
    courseId: 'course-oop-001',
    title: 'OOP Exam',
    questions: [
      { id: 1, question: 'What is encapsulation?', options: ['Using envelopes', 'Bundle with control', 'Public data', 'Many classes'], correctAnswer: 1, difficulty: 'easy' },
      { id: 2, question: 'What is method overriding?', options: ['Same in different classes', 'Child new implementation', 'Call multiple times', 'Rename'], correctAnswer: 1, difficulty: 'medium' },
      { id: 3, question: 'Principle: "Depend on abstractions"?', options: ['SRP', 'OCP', 'LSP', 'DIP'], correctAnswer: 3, difficulty: 'hard' },
      { id: 4, question: 'Purpose of constructor?', options: ['Destroy', 'Initialize', 'Call parent', 'Declare'], correctAnswer: 1, difficulty: 'easy' },
      { id: 5, question: 'Pattern that creates without exact class?', options: ['Singleton', 'Factory', 'Adapter', 'Observer'], correctAnswer: 1, difficulty: 'medium' },
      { id: 6, question: 'What does polymorphism mean?', options: ['Multiple countries', 'Many forms', 'Variables', 'Complex'], correctAnswer: 1, difficulty: 'easy' },
      { id: 7, question: 'What is abstract class?', options: ['Abstract concepts', 'Can\'t instantiate', 'No inheritance', 'Complex'], correctAnswer: 1, difficulty: 'medium' },
      { id: 8, question: 'What does "this" refer to?', options: ['Class', 'Parent', 'Current instance', 'Temp var'], correctAnswer: 2, difficulty: 'easy' }
    ]
  }
];

// Mock API functions
const courseAPI = {
  // Fetch all courses
  getAllCourses: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(coursesData);
      }, 500); // Simulate network delay
    });
  },

  // Fetch single course with modules
  getCourseById: async (courseId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const course = coursesData.find(c => c._id === courseId);
        if (course) {
          resolve(course);
        } else {
          reject(new Error('Course not found'));
        }
      }, 300);
    });
  },

  // Fetch module content
  getModuleContent: async (courseId, moduleId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const course = coursesData.find(c => c._id === courseId);
        if (course) {
          const module = course.modules.find(m => m._id === moduleId);
          if (module) {
            resolve(module);
          } else {
            reject(new Error('Module not found'));
          }
        } else {
          reject(new Error('Course not found'));
        }
      }, 200);
    });
  },

  // Fetch quiz for course
  getQuizByCourseId: async (courseId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const quiz = quizzesData.find(q => q.courseId === courseId);
        if (quiz) {
          resolve(quiz);
        } else {
          reject(new Error('Quiz not found'));
        }
      }, 300);
    });
  },

  // Submit quiz answers
  submitQuiz: async (courseId, answers) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const quiz = quizzesData.find(q => q.courseId === courseId);
        let score = 0;
        if (quiz) {
          answers.forEach((answer, index) => {
            if (quiz.questions[index].correctAnswer === answer) {
              score++;
            }
          });
        }
        resolve({
          courseId,
          totalQuestions: quiz?.questions.length || 0,
          correctAnswers: score,
          percentage: ((score / (quiz?.questions.length || 1)) * 100).toFixed(2),
          passed: score >= (quiz?.questions.length || 0) * 0.6
        });
      }, 500);
    });
  }
};

export default courseAPI;
