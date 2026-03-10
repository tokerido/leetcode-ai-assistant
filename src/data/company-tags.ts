export interface ProblemEntry {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  companies: string[];
  patterns: string[];
}

export const COMPANY_PROBLEMS: ProblemEntry[] = [
  { slug: "two-sum", title: "Two Sum", difficulty: "Easy", companies: ["Amazon", "Google", "Facebook", "Apple", "Microsoft"], patterns: ["Hash Map", "Array"] },
  { slug: "add-two-numbers", title: "Add Two Numbers", difficulty: "Medium", companies: ["Amazon", "Microsoft", "Facebook"], patterns: ["Linked List", "Math"] },
  { slug: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", companies: ["Amazon", "Google", "Facebook", "Microsoft"], patterns: ["Sliding Window", "Hash Map"] },
  { slug: "median-of-two-sorted-arrays", title: "Median of Two Sorted Arrays", difficulty: "Hard", companies: ["Google", "Amazon", "Microsoft"], patterns: ["Binary Search", "Array"] },
  { slug: "longest-palindromic-substring", title: "Longest Palindromic Substring", difficulty: "Medium", companies: ["Amazon", "Facebook", "Google"], patterns: ["Dynamic Programming", "String"] },
  { slug: "container-with-most-water", title: "Container With Most Water", difficulty: "Medium", companies: ["Google", "Amazon", "Facebook"], patterns: ["Two Pointers", "Array"] },
  { slug: "three-sum", title: "3Sum", difficulty: "Medium", companies: ["Amazon", "Facebook", "Google", "Apple"], patterns: ["Two Pointers", "Array"] },
  { slug: "remove-nth-node-from-end-of-list", title: "Remove Nth Node From End of List", difficulty: "Medium", companies: ["Amazon", "Microsoft"], patterns: ["Two Pointers", "Linked List"] },
  { slug: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", companies: ["Google", "Amazon", "Facebook", "Microsoft"], patterns: ["Stack", "String"] },
  { slug: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", difficulty: "Easy", companies: ["Amazon", "Microsoft", "Google"], patterns: ["Linked List", "Recursion"] },
  { slug: "merge-k-sorted-lists", title: "Merge k Sorted Lists", difficulty: "Hard", companies: ["Amazon", "Google", "Facebook", "Uber"], patterns: ["Heap", "Linked List", "Divide and Conquer"] },
  { slug: "search-in-rotated-sorted-array", title: "Search in Rotated Sorted Array", difficulty: "Medium", companies: ["Amazon", "Microsoft", "Facebook", "Google"], patterns: ["Binary Search", "Array"] },
  { slug: "find-first-and-last-position-of-element-in-sorted-array", title: "Find First and Last Position of Element in Sorted Array", difficulty: "Medium", companies: ["Amazon", "Google", "Facebook"], patterns: ["Binary Search", "Array"] },
  { slug: "combination-sum", title: "Combination Sum", difficulty: "Medium", companies: ["Amazon", "Google", "Apple"], patterns: ["Backtracking", "Array"] },
  { slug: "jump-game", title: "Jump Game", difficulty: "Medium", companies: ["Amazon", "Microsoft", "Google"], patterns: ["Dynamic Programming", "Greedy"] },
  { slug: "merge-intervals", title: "Merge Intervals", difficulty: "Medium", companies: ["Google", "Facebook", "Amazon", "Microsoft", "Twitter"], patterns: ["Array", "Sorting"] },
  { slug: "unique-paths", title: "Unique Paths", difficulty: "Medium", companies: ["Amazon", "Google", "Microsoft"], patterns: ["Dynamic Programming", "Math"] },
  { slug: "climbing-stairs", title: "Climbing Stairs", difficulty: "Easy", companies: ["Amazon", "Apple", "Adobe"], patterns: ["Dynamic Programming", "Math"] },
  { slug: "word-search", title: "Word Search", difficulty: "Medium", companies: ["Amazon", "Microsoft", "Facebook"], patterns: ["Backtracking", "Matrix"] },
  { slug: "binary-tree-maximum-path-sum", title: "Binary Tree Maximum Path Sum", difficulty: "Hard", companies: ["Facebook", "Amazon", "Microsoft"], patterns: ["Tree", "DFS", "Dynamic Programming"] },
  { slug: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", companies: ["Amazon", "Facebook", "Microsoft", "Google"], patterns: ["Array", "Dynamic Programming"] },
  { slug: "maximum-subarray", title: "Maximum Subarray", difficulty: "Medium", companies: ["Amazon", "Google", "Apple", "Microsoft"], patterns: ["Array", "Dynamic Programming", "Divide and Conquer"] },
  { slug: "word-break", title: "Word Break", difficulty: "Medium", companies: ["Amazon", "Google", "Facebook", "Microsoft"], patterns: ["Dynamic Programming", "Trie"] },
  { slug: "number-of-islands", title: "Number of Islands", difficulty: "Medium", companies: ["Amazon", "Google", "Facebook", "Microsoft", "Bloomberg"], patterns: ["BFS", "DFS", "Union Find", "Matrix"] },
  { slug: "reverse-linked-list", title: "Reverse Linked List", difficulty: "Easy", companies: ["Amazon", "Facebook", "Microsoft", "Apple"], patterns: ["Linked List", "Recursion"] },
  { slug: "course-schedule", title: "Course Schedule", difficulty: "Medium", companies: ["Amazon", "Google", "Facebook", "Uber"], patterns: ["DFS", "BFS", "Topological Sort", "Graph"] },
  { slug: "implement-trie-prefix-tree", title: "Implement Trie (Prefix Tree)", difficulty: "Medium", companies: ["Amazon", "Google", "Facebook", "Microsoft"], patterns: ["Trie", "Design"] },
  { slug: "coin-change", title: "Coin Change", difficulty: "Medium", companies: ["Amazon", "Google", "Microsoft", "Facebook"], patterns: ["Dynamic Programming", "BFS"] },
  { slug: "product-of-array-except-self", title: "Product of Array Except Self", difficulty: "Medium", companies: ["Amazon", "Facebook", "Microsoft", "Google"], patterns: ["Array", "Prefix Sum"] },
  { slug: "minimum-window-substring", title: "Minimum Window Substring", difficulty: "Hard", companies: ["Facebook", "Amazon", "Google", "LinkedIn"], patterns: ["Sliding Window", "Hash Map", "String"] },
  { slug: "serialize-and-deserialize-binary-tree", title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", companies: ["Google", "Facebook", "Amazon", "Microsoft"], patterns: ["Tree", "BFS", "DFS", "Design"] },
  { slug: "top-k-frequent-elements", title: "Top K Frequent Elements", difficulty: "Medium", companies: ["Amazon", "Facebook", "Google"], patterns: ["Heap", "Hash Map", "Bucket Sort"] },
  { slug: "decode-ways", title: "Decode Ways", difficulty: "Medium", companies: ["Facebook", "Amazon", "Microsoft"], patterns: ["Dynamic Programming", "String"] },
  { slug: "validate-binary-search-tree", title: "Validate Binary Search Tree", difficulty: "Medium", companies: ["Amazon", "Microsoft", "Facebook"], patterns: ["Tree", "DFS", "BST"] },
  { slug: "kth-smallest-element-in-a-bst", title: "Kth Smallest Element in a BST", difficulty: "Medium", companies: ["Amazon", "Google", "Facebook"], patterns: ["Tree", "DFS", "BST"] },
  { slug: "lowest-common-ancestor-of-a-binary-tree", title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", companies: ["Facebook", "Amazon", "Microsoft", "Google"], patterns: ["Tree", "DFS"] },
  { slug: "lru-cache", title: "LRU Cache", difficulty: "Medium", companies: ["Amazon", "Facebook", "Google", "Microsoft", "Uber"], patterns: ["Design", "Hash Map", "Linked List"] },
  { slug: "sort-colors", title: "Sort Colors", difficulty: "Medium", companies: ["Microsoft", "Amazon", "Facebook"], patterns: ["Two Pointers", "Array", "Sorting"] },
  { slug: "subsets", title: "Subsets", difficulty: "Medium", companies: ["Amazon", "Facebook", "Google"], patterns: ["Backtracking", "Array", "Bit Manipulation"] },
  { slug: "permutations", title: "Permutations", difficulty: "Medium", companies: ["LinkedIn", "Microsoft", "Amazon"], patterns: ["Backtracking", "Array"] },
  { slug: "rotate-image", title: "Rotate Image", difficulty: "Medium", companies: ["Amazon", "Microsoft", "Apple"], patterns: ["Array", "Matrix"] },
  { slug: "group-anagrams", title: "Group Anagrams", difficulty: "Medium", companies: ["Amazon", "Facebook", "Microsoft", "Google"], patterns: ["Hash Map", "String", "Sorting"] },
  { slug: "maximum-product-subarray", title: "Maximum Product Subarray", difficulty: "Medium", companies: ["Amazon", "Facebook", "Microsoft"], patterns: ["Array", "Dynamic Programming"] },
  { slug: "find-minimum-in-rotated-sorted-array", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", companies: ["Amazon", "Microsoft"], patterns: ["Binary Search", "Array"] },
  { slug: "spiral-matrix", title: "Spiral Matrix", difficulty: "Medium", companies: ["Amazon", "Microsoft", "Google", "Apple"], patterns: ["Array", "Matrix", "Simulation"] },
  { slug: "linked-list-cycle", title: "Linked List Cycle", difficulty: "Easy", companies: ["Amazon", "Microsoft", "Bloomberg"], patterns: ["Linked List", "Two Pointers"] },
  { slug: "reorder-list", title: "Reorder List", difficulty: "Medium", companies: ["Amazon", "Google"], patterns: ["Linked List", "Two Pointers", "Stack"] },
  { slug: "binary-tree-level-order-traversal", title: "Binary Tree Level Order Traversal", difficulty: "Medium", companies: ["Amazon", "Facebook", "Microsoft"], patterns: ["Tree", "BFS"] },
  { slug: "maximum-depth-of-binary-tree", title: "Maximum Depth of Binary Tree", difficulty: "Easy", companies: ["Amazon", "Facebook", "LinkedIn"], patterns: ["Tree", "DFS", "BFS"] },
  { slug: "construct-binary-tree-from-preorder-and-inorder-traversal", title: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", companies: ["Amazon", "Microsoft"], patterns: ["Tree", "DFS", "Array"] },
  { slug: "contains-duplicate", title: "Contains Duplicate", difficulty: "Easy", companies: ["Amazon", "Yahoo"], patterns: ["Array", "Hash Map"] },
  { slug: "house-robber", title: "House Robber", difficulty: "Medium", companies: ["Amazon", "Google"], patterns: ["Array", "Dynamic Programming"] },
  { slug: "find-median-from-data-stream", title: "Find Median from Data Stream", difficulty: "Hard", companies: ["Amazon", "Google", "Facebook"], patterns: ["Heap", "Design", "Two Pointers"] },
  { slug: "meeting-rooms-ii", title: "Meeting Rooms II", difficulty: "Medium", companies: ["Google", "Amazon", "Facebook", "Uber", "Bloomberg"], patterns: ["Array", "Sorting", "Heap"] },
  { slug: "alien-dictionary", title: "Alien Dictionary", difficulty: "Hard", companies: ["Facebook", "Google", "Amazon"], patterns: ["BFS", "DFS", "Topological Sort", "Graph"] },
  { slug: "pacific-atlantic-water-flow", title: "Pacific Atlantic Water Flow", difficulty: "Medium", companies: ["Google", "Facebook"], patterns: ["DFS", "BFS", "Matrix"] },
  { slug: "longest-consecutive-sequence", title: "Longest Consecutive Sequence", difficulty: "Medium", companies: ["Google", "Facebook", "Amazon"], patterns: ["Array", "Hash Map", "Union Find"] },
  { slug: "graph-valid-tree", title: "Graph Valid Tree", difficulty: "Medium", companies: ["Google", "LinkedIn", "Facebook"], patterns: ["Graph", "Union Find", "BFS", "DFS"] },
  { slug: "clone-graph", title: "Clone Graph", difficulty: "Medium", companies: ["Facebook", "Amazon", "Google"], patterns: ["Graph", "BFS", "DFS", "Hash Map"] },
];

export function getCompanies(): string[] {
  const companies = new Set<string>();
  for (const problem of COMPANY_PROBLEMS) {
    for (const company of problem.companies) {
      companies.add(company);
    }
  }
  return Array.from(companies).sort();
}

export function getProblemsByCompany(company: string): ProblemEntry[] {
  return COMPANY_PROBLEMS.filter((p) => p.companies.includes(company));
}

export function getCompaniesForSlug(slug: string): string[] {
  const problem = COMPANY_PROBLEMS.find((p) => p.slug === slug);
  return problem?.companies || [];
}

export function getPatternsForSlug(slug: string): string[] {
  const problem = COMPANY_PROBLEMS.find((p) => p.slug === slug);
  return problem?.patterns || [];
}
