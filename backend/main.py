import os
import tempfile
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    is_computational: bool
    explanation: str
    algorithm_name: Optional[str] = None
    time_complexity: Optional[str] = None
    code_snippet: Optional[str] = None

app = FastAPI(title='AlgoLens Backend')
whisper_model = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*'],
)


def analyze_text(text: str) -> AnalyzeResponse:
    normalized = text.strip().lower()
    if not normalized:
        return AnalyzeResponse(
            is_computational=False,
            explanation='Please enter a scenario or sentence to analyze.',
        )

    route_terms = ['map', 'route', 'road', 'street', 'traffic', 'path', 'distance', 'travel', 'shortest', 'destination', 'source', 'home', 'school']
    place_terms = ['school', 'home', 'house', 'hospital', 'bank', 'park', 'market', 'office', 'airport', 'station']
    if any(term in normalized for term in route_terms) and any(term in normalized for term in place_terms):
        return AnalyzeResponse(
            is_computational=True,
            explanation='This is a route-planning problem: the image shows places connected by roads or traffic, and the goal is to minimize travel cost or distance. Dijkstra\'s algorithm is the correct choice for the shortest path.',
            algorithm_name="Dijkstra's Algorithm",
            time_complexity='O((V + E) log V)',
            code_snippet='function dijkstra(graph, start) {\n  const dist = {};\n  const visited = new Set();\n  for (const node in graph) dist[node] = Infinity;\n  dist[start] = 0;\n  const queue = [[0, start]];\n\n  while (queue.length) {\n    queue.sort((a, b) => a[0] - b[0]);\n    const [cost, node] = queue.shift();\n    if (visited.has(node)) continue;\n    visited.add(node);\n\n    for (const [neighbor, weight] of graph[node]) {\n      const newCost = cost + weight;\n      if (newCost < dist[neighbor]) {\n        dist[neighbor] = newCost;\n        queue.push([newCost, neighbor]);\n      }\n    }\n  }\n  return dist;\n}',
        )

    if 'sort' in normalized or 'sorting' in normalized or 'sorted' in normalized:
        return AnalyzeResponse(
            is_computational=True,
            explanation='This looks like a sorting problem. Merge Sort is a solid algorithm choice.',
            algorithm_name='Merge Sort',
            time_complexity='O(n log n)',
            code_snippet='function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\n\nfunction merge(left, right) {\n  const result = [];\n  while (left.length && right.length) {\n    if (left[0] < right[0]) result.push(left.shift());\n    else result.push(right.shift());\n  }\n  return result.concat(left, right);\n}',
        )

    if 'two sum' in normalized or '2 sum' in normalized or 'target sum' in normalized:
        return AnalyzeResponse(
            is_computational=True,
            explanation='This is a Two Sum problem. A hash map finds the needed complement in one pass.',
            algorithm_name='Hash Map Lookup',
            time_complexity='O(n)',
            code_snippet='function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (seen.has(complement)) return [seen.get(complement), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}',
        )

    if 'search' in normalized or 'find' in normalized or 'lookup' in normalized or 'exists' in normalized:
        return AnalyzeResponse(
            is_computational=True,
            explanation='This appears to be a search problem. Binary Search is efficient for sorted data.',
            algorithm_name='Binary Search',
            time_complexity='O(log n)',
            code_snippet='function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
        )

    if 'shortest path' in normalized or 'graph' in normalized or 'vertices' in normalized or 'edges' in normalized or 'connected' in normalized:
        return AnalyzeResponse(
            is_computational=True,
            explanation='This looks like a graph problem. Dijkstra’s algorithm is a good fit for weighted shortest paths.',
            algorithm_name="Dijkstra's Algorithm",
            time_complexity='O((V + E) log V)',
            code_snippet='function dijkstra(graph, start) {\n  const dist = {};\n  const visited = new Set();\n  for (const node in graph) dist[node] = Infinity;\n  dist[start] = 0;\n  const queue = [[0, start]];\n\n  while (queue.length) {\n    queue.sort((a, b) => a[0] - b[0]);\n    const [cost, node] = queue.shift();\n    if (visited.has(node)) continue;\n    visited.add(node);\n\n    for (const [neighbor, weight] of graph[node]) {\n      const newCost = cost + weight;\n      if (newCost < dist[neighbor]) {\n        dist[neighbor] = newCost;\n        queue.push([newCost, neighbor]);\n      }\n    }\n  }\n  return dist;\n}',
        )

    return AnalyzeResponse(
        is_computational=False,
        explanation='This sentence looks more abstract than a DSA command. Try a more direct algorithmic problem description.',
    )


@app.post('/analyze', response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    return analyze_text(request.text)


@app.post('/transcribe')
async def transcribe(audio: UploadFile = File(...)):
    global whisper_model
    if not audio.content_type or not audio.content_type.startswith('audio/'):
        raise HTTPException(status_code=415, detail='Please upload an audio recording.')

    try:
        from faster_whisper import WhisperModel
    except ImportError as error:
        raise HTTPException(status_code=503, detail='Whisper is not installed. Run pip install -r requirements.txt.') from error

    try:
        if whisper_model is None:
            whisper_model = WhisperModel('tiny', device='cpu', compute_type='int8')
    except Exception as error:
        raise HTTPException(status_code=503, detail='Whisper could not load its speech model. Check network access and ffmpeg support.') from error

    suffix = os.path.splitext(audio.filename or '.webm')[1] or '.webm'
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temporary_file:
        temporary_file.write(await audio.read())
        temporary_path = temporary_file.name

    try:
        try:
            segments, _ = whisper_model.transcribe(temporary_path, beam_size=5)
            return {'text': ' '.join(segment.text.strip() for segment in segments).strip()}
        except Exception as error:
            raise HTTPException(status_code=422, detail='The audio format could not be transcribed. Try recording for at least two seconds.') from error
    finally:
        os.unlink(temporary_path)
