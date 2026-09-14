export type AlgorithmOption = {
  name: string
  time_complexity: string
  space_complexity: string
  prerequisites: string
  limitation: string
  reason: string
}

export type AlgorithmStep = {
  label: string
  detail: string
  values?: string[]
  active?: number[]
  visited?: string[]
  queue?: string[]
}

export type AnalyzeResult = {
  is_computational: boolean
  explanation: string
  algorithm_name?: string
  time_complexity?: string
  space_complexity?: string
  prerequisites?: string
  limitation?: string
  code_snippet?: string
  category?: string
  alternatives?: AlgorithmOption[]
  steps?: AlgorithmStep[]
}

const API_URL = process.env.NEXT_PUBLIC_API_URL
const BACKEND_URL = API_URL || 'http://localhost:8000'

export async function transcribeAudio(audio: Blob): Promise<string> {
  const formData = new FormData()
  formData.append('audio', audio, 'voice.webm')
  const response = await fetch(`${BACKEND_URL}/transcribe`, { method: 'POST', body: formData })
  if (!response.ok) throw new Error('Local transcription failed')
  const data = await response.json() as { text?: string }
  return data.text || ''
}

function analyzeTextLocally(text: string): AnalyzeResult {
  const normalized = text.trim().toLowerCase()

  if (!normalized) {
    return {
      is_computational: false,
      explanation: 'Please type a scenario or sentence to analyze.',
    }
  }

  if (/sort|sorting|sorted/.test(normalized)) {
    return {
      is_computational: true,
      explanation: 'This looks like a sorting problem. Merge Sort is a strong DSA choice here.',
      algorithm_name: 'Merge Sort',
      time_complexity: 'O(n log n)',
      space_complexity: 'O(n)',
      prerequisites: 'A collection of comparable values',
      limitation: 'Needs extra memory for merging',
      category: 'Sorting',
      alternatives: [
        { name: 'Quick Sort', time_complexity: 'O(n log n) average', space_complexity: 'O(log n)', prerequisites: 'Random-access array', limitation: 'O(n²) worst case', reason: 'Prefer it when in-place sorting matters.' },
        { name: 'Insertion Sort', time_complexity: 'O(n²)', space_complexity: 'O(1)', prerequisites: 'Small or nearly sorted input', limitation: 'Slow on large random input', reason: 'Prefer it for tiny, nearly sorted arrays.' },
      ],
      steps: [
        { label: 'Split', detail: 'Divide the input into smaller halves.', values: ['8', '3', '5', '1', '7'], active: [0, 1, 2, 3, 4] },
        { label: 'Compare', detail: 'Compare the front values of two sorted halves.', values: ['3', '8', '1', '5', '7'], active: [0, 2] },
        { label: 'Merge', detail: 'Place the smallest available value into the result.', values: ['1', '3', '5', '7', '8'], active: [0, 1, 2, 3, 4] },
      ],
      code_snippet: `function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  return merge(left, right)
}

function merge(left, right) {
  const result = []
  while (left.length && right.length) {
    if (left[0] < right[0]) result.push(left.shift())
    else result.push(right.shift())
  }
  return result.concat(left, right)
}`,
    }
  }

  if (/two sum|2 sum|pair.*sum|sum.*target/.test(normalized)) {
    return {
      is_computational: true,
      explanation: 'This is a Two Sum problem. A hash map finds the needed complement in one pass.',
      algorithm_name: 'Hash Map Lookup',
      time_complexity: 'O(n)',
      space_complexity: 'O(n)',
      prerequisites: 'Values must be hashable and a target sum must be known',
      limitation: 'Uses extra memory proportional to the input size',
      category: 'Array / Hashing',
      alternatives: [{ name: 'Two Pointers', time_complexity: 'O(n log n)', space_complexity: 'O(1)', prerequisites: 'Array can be sorted', limitation: 'Sorting changes original indices', reason: 'Prefer it when the array is already sorted or memory is limited.' }],
      steps: [
        { label: 'Read value', detail: 'Check the current number and calculate its complement.', values: ['2', '7', '11', '15'], active: [0] },
        { label: 'Check map', detail: 'Look up whether the complement was seen earlier.', values: ['2', '7', '11', '15'], active: [1] },
        { label: 'Return pair', detail: 'Return the two indices when the complement exists.', values: ['2', '7', '11', '15'], active: [0, 1] },
      ],
      code_snippet: `function twoSum(nums, target) {
  const seen = new Map()
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i]
    if (seen.has(complement)) return [seen.get(complement), i]
    seen.set(nums[i], i)
  }
  return []
}`,
    }
  }

  if (/search|find|lookup|exists/.test(normalized) && !/shortest path|graph|vertices|edges|connected/.test(normalized)) {
    return {
      is_computational: true,
      explanation: 'This appears to be a search problem. Binary Search is efficient for sorted data.',
      algorithm_name: 'Binary Search',
      time_complexity: 'O(log n)',
      space_complexity: 'O(1)',
      prerequisites: 'The data must already be sorted',
      limitation: 'Cannot be used directly on unsorted data',
      category: 'Searching',
      alternatives: [
        { name: 'Linear Search', time_complexity: 'O(n)', space_complexity: 'O(1)', prerequisites: 'Any iterable collection', limitation: 'Scans values one by one', reason: 'Prefer it when data is unsorted or tiny.' },
        { name: 'Hash Lookup', time_complexity: 'O(1) average', space_complexity: 'O(n)', prerequisites: 'A hashable key and index', limitation: 'Uses additional memory', reason: 'Prefer it for repeated lookups.' },
      ],
      steps: [
        { label: 'Set pointers', detail: 'Start with the full sorted range.', values: ['1', '3', '5', '7', '9'], active: [0, 4] },
        { label: 'Check middle', detail: 'Compare the target with the middle value.', values: ['1', '3', '5', '7', '9'], active: [2] },
        { label: 'Narrow range', detail: 'Discard the half that cannot contain the target.', values: ['1', '3', '5', '7', '9'], active: [3, 4] },
      ],
      code_snippet: `function binarySearch(arr, target) {
  let left = 0
  let right = arr.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) left = mid + 1
    else right = mid - 1
  }
  return -1
}`,
    }
  }

  if (/dependenc|prerequisite|build order|course schedule|topological/.test(normalized)) {
    return {
      is_computational: true,
      explanation: 'This is a dependency-ordering problem. Topological Sort produces a valid order when the dependency graph has no cycle.',
      algorithm_name: 'Topological Sort',
      time_complexity: 'O(V + E)',
      space_complexity: 'O(V)',
      prerequisites: 'A directed acyclic graph of dependencies',
      limitation: 'A cycle means no valid ordering exists',
      category: 'Traversal / Dependencies',
      alternatives: [
        { name: 'BFS', time_complexity: 'O(V + E)', space_complexity: 'O(V)', prerequisites: 'Unweighted graph', limitation: 'Not an ordering algorithm by itself', reason: 'Use Kahn’s BFS-style version to process zero-indegree nodes.' },
        { name: 'DFS', time_complexity: 'O(V + E)', space_complexity: 'O(V)', prerequisites: 'Directed graph', limitation: 'Needs cycle detection', reason: 'Use reverse postorder for a compact recursive solution.' },
      ],
      steps: [
        { label: 'Count indegrees', detail: 'Count how many prerequisites each node has.', visited: [], queue: ['A'] },
        { label: 'Process ready nodes', detail: 'Remove nodes with zero remaining prerequisites.', visited: ['A'], queue: ['B', 'C'] },
        { label: 'Build order', detail: 'Repeat until every dependency is placed or a cycle is found.', visited: ['A', 'B', 'C'], queue: ['D'] },
      ],
      code_snippet: `function topologicalSort(graph) {
  const indegree = new Map()
  const order = []
  // Add zero-indegree nodes to a queue, then remove edges.
  return order
}`,
    }
  }

  if (/breadth first|\bbfs\b|unweighted graph|level order/.test(normalized)) {
    return {
      is_computational: true,
      explanation: 'This is a breadth-first traversal problem. BFS explores neighbors level by level.',
      algorithm_name: 'Breadth-First Search (BFS)',
      time_complexity: 'O(V + E)',
      space_complexity: 'O(V)',
      prerequisites: 'A graph or tree with an adjacency representation',
      limitation: 'Weighted edges need a different shortest-path algorithm',
      category: 'Traversal',
      alternatives: [{ name: 'DFS', time_complexity: 'O(V + E)', space_complexity: 'O(V)', prerequisites: 'Any graph or tree', limitation: 'Does not guarantee fewest edges', reason: 'Use it for exhaustive exploration or connected components.' }],
      steps: [
        { label: 'Enqueue', detail: 'Put the starting node into the queue.', visited: [], queue: ['A'] },
        { label: 'Visit neighbors', detail: 'Visit the front node and enqueue unseen neighbors.', visited: ['A'], queue: ['B', 'C'] },
        { label: 'Next level', detail: 'Continue until the queue is empty.', visited: ['A', 'B', 'C'], queue: ['D'] },
      ],
      code_snippet: `function bfs(graph, start) {
  const queue = [start]
  const visited = new Set([start])
  while (queue.length) {
    const node = queue.shift()
    for (const next of graph[node]) {
      if (!visited.has(next)) { visited.add(next); queue.push(next) }
    }
  }
}`,
    }
  }

  if (/depth first|\bdfs\b|connected component/.test(normalized)) {
    return {
      is_computational: true,
      explanation: 'This is a depth-first traversal problem. DFS follows one branch as far as possible before backtracking.',
      algorithm_name: 'Depth-First Search (DFS)',
      time_complexity: 'O(V + E)',
      space_complexity: 'O(V)',
      prerequisites: 'A graph or tree with an adjacency representation',
      limitation: 'Does not guarantee the shortest path',
      category: 'Traversal',
      alternatives: [{ name: 'BFS', time_complexity: 'O(V + E)', space_complexity: 'O(V)', prerequisites: 'Any graph or tree', limitation: 'Uses a wider frontier', reason: 'Use it when the shallowest solution matters.' }],
      steps: [
        { label: 'Push', detail: 'Put the starting node on the stack.', visited: [], queue: ['A'] },
        { label: 'Explore', detail: 'Pop a node and push an unvisited neighbor.', visited: ['A'], queue: ['B'] },
        { label: 'Backtrack', detail: 'Return to the latest branch with unexplored neighbors.', visited: ['A', 'B'], queue: ['C'] },
      ],
      code_snippet: `function dfs(graph, node, visited = new Set()) {
  if (visited.has(node)) return
  visited.add(node)
  for (const next of graph[node]) dfs(graph, next, visited)
}`,
    }
  }

  if (/shortest path|graph|vertices|edges|connected/.test(normalized)) {
    return {
      is_computational: true,
      explanation: 'This looks like a graph problem. Dijkstra’s algorithm is a good fit for weighted shortest paths.',
      algorithm_name: "Dijkstra's Algorithm",
      time_complexity: 'O((V + E) log V)',
      space_complexity: 'O(V)',
      prerequisites: 'Weighted graph with non-negative edges',
      limitation: 'Not valid for negative edge weights',
      category: 'Graph / Traversal',
      alternatives: [
        { name: 'BFS', time_complexity: 'O(V + E)', space_complexity: 'O(V)', prerequisites: 'Unweighted graph', limitation: 'Ignores different edge weights', reason: 'Prefer it for shortest paths in unweighted graphs.' },
        { name: 'DFS', time_complexity: 'O(V + E)', space_complexity: 'O(V)', prerequisites: 'Graph traversal or connectivity task', limitation: 'Does not guarantee shortest paths', reason: 'Prefer it for exploration and connected components.' },
        { name: 'Topological Sort', time_complexity: 'O(V + E)', space_complexity: 'O(V)', prerequisites: 'A directed acyclic graph', limitation: 'Cannot order cyclic dependencies', reason: 'Prefer it for dependency scheduling.' },
      ],
      steps: [
        { label: 'Start', detail: 'Put the source node in the priority queue.', visited: [], queue: ['A'] },
        { label: 'Visit', detail: 'Choose the cheapest unvisited node and relax its edges.', visited: ['A'], queue: ['B', 'C'] },
        { label: 'Relax', detail: 'Update neighboring distances when a shorter route is found.', visited: ['A', 'B'], queue: ['C', 'D'] },
      ],
      code_snippet: `function dijkstra(graph, start) {
  const dist = {}
  const visited = new Set()
  for (const node in graph) dist[node] = Infinity
  dist[start] = 0
  const queue = [[0, start]]

  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0])
    const [cost, node] = queue.shift()
    if (visited.has(node)) continue
    visited.add(node)

    for (const [neighbor, weight] of graph[node]) {
      const newCost = cost + weight
      if (newCost < dist[neighbor]) {
        dist[neighbor] = newCost
        queue.push([newCost, neighbor])
      }
    }
  }

  return dist
}`,
    }
  }

  return {
    is_computational: false,
    explanation: 'This sentence does not look like a direct DSA problem. Try a more algorithmic requirement.',
  }
}

async function fetchAnalyzeApi(text: string): Promise<AnalyzeResult> {
  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    throw new Error('Backend API request failed')
  }

  return response.json()
}

export async function analyzeText(text: string) {
  if (!text || !text.trim()) {
    throw new Error('Please enter a sentence to convert.')
  }

  if (API_URL) {
    try {
      return await fetchAnalyzeApi(text)
    } catch (error) {
      console.warn('Backend analysis failed, falling back to local analysis.', error)
    }
  }

  return analyzeTextLocally(text)
}
