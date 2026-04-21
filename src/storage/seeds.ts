import { Collection, SavedRequest, Environment, HeaderTemplate } from '../types'
import { v4 as uuidv4 } from 'uuid'

const now = new Date().toISOString()

export const seedCollections: Collection[] = [
  {
    id: uuidv4(),
    name: 'JSONPlaceholder API',
    description: 'Sample REST API for testing and prototyping',
    createdAt: now,
    updatedAt: now
  },
  {
    id: uuidv4(), 
    name: 'User Management',
    description: 'Common user management endpoints',
    createdAt: now,
    updatedAt: now
  }
]

export const seedRequests: SavedRequest[] = [
  {
    id: uuidv4(),
    name: 'Get All Posts',
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts',
    queryParams: [],
    headers: [
      {
        id: uuidv4(),
        key: 'Accept',
        value: 'application/json',
        enabled: true
      }
    ],
    bodyType: 'none',
    body: '',
    timeout: 30000,
    collectionId: seedCollections[0].id,
    notes: 'Retrieves all posts from the JSONPlaceholder API',
    favorite: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: uuidv4(),
    name: 'Get Single Post',
    method: 'GET', 
    url: 'https://jsonplaceholder.typicode.com/posts/{{postId}}',
    queryParams: [],
    headers: [
      {
        id: uuidv4(),
        key: 'Accept',
        value: 'application/json',
        enabled: true
      }
    ],
    bodyType: 'none',
    body: '',
    timeout: 30000,
    collectionId: seedCollections[0].id,
    notes: 'Retrieves a specific post by ID using environment variable',
    favorite: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: uuidv4(),
    name: 'Create New Post',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    queryParams: [],
    headers: [
      {
        id: uuidv4(),
        key: 'Content-Type',
        value: 'application/json',
        enabled: true
      },
      {
        id: uuidv4(),
        key: 'Accept',
        value: 'application/json', 
        enabled: true
      }
    ],
    bodyType: 'json',
    body: JSON.stringify({
      title: 'Sample Post Title',
      body: 'This is a sample post body content.',
      userId: 1
    }, null, 2),
    timeout: 30000,
    collectionId: seedCollections[0].id,
    notes: 'Creates a new post with JSON body',
    favorite: false,
    createdAt: now,
    updatedAt: now
  },
  {
    id: uuidv4(),
    name: 'Login User',
    method: 'POST',
    url: '{{baseUrl}}/api/auth/login',
    queryParams: [],
    headers: [
      {
        id: uuidv4(),
        key: 'Content-Type',
        value: 'application/json',
        enabled: true
      }
    ],
    bodyType: 'json',
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    }, null, 2),
    timeout: 30000,
    collectionId: seedCollections[1].id,
    notes: 'User authentication endpoint',
    favorite: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: uuidv4(),
    name: 'Get User Profile', 
    method: 'GET',
    url: '{{baseUrl}}/api/user/profile',
    queryParams: [],
    headers: [
      {
        id: uuidv4(),
        key: 'Authorization',
        value: 'Bearer {{authToken}}',
        enabled: true
      },
      {
        id: uuidv4(),
        key: 'Accept',
        value: 'application/json',
        enabled: true
      }
    ],
    bodyType: 'none',
    body: '',
    timeout: 30000,
    collectionId: seedCollections[1].id,
    notes: 'Fetch user profile with Bearer token authentication',
    favorite: false,
    createdAt: now,
    updatedAt: now
  }
]

export const seedEnvironments: Environment[] = [
  {
    id: uuidv4(),
    name: 'Development',
    variables: [
      {
        id: uuidv4(),
        key: 'baseUrl',
        value: 'http://localhost:3000',
        enabled: true
      },
      {
        id: uuidv4(),
        key: 'authToken',
        value: 'dev-token-123',
        enabled: true
      },
      {
        id: uuidv4(),
        key: 'postId',
        value: '1',
        enabled: true
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: uuidv4(),
    name: 'Staging',
    variables: [
      {
        id: uuidv4(),
        key: 'baseUrl',
        value: 'https://api-staging.example.com',
        enabled: true
      },
      {
        id: uuidv4(),
        key: 'authToken',
        value: 'staging-token-456',
        enabled: true
      },
      {
        id: uuidv4(),
        key: 'postId',
        value: '5',
        enabled: true
      }
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: uuidv4(),
    name: 'Production',
    variables: [
      {
        id: uuidv4(),
        key: 'baseUrl',
        value: 'https://api.example.com',
        enabled: true
      },
      {
        id: uuidv4(),
        key: 'authToken',
        value: 'prod-token-789',
        enabled: true
      },
      {
        id: uuidv4(),
        key: 'postId',
        value: '10',
        enabled: true
      }
    ],
    createdAt: now,
    updatedAt: now
  }
]

export const seedTemplates: HeaderTemplate[] = [
  {
    id: uuidv4(),
    name: 'JSON API Headers',
    headers: [
      {
        id: uuidv4(),
        key: 'Content-Type',
        value: 'application/json',
        enabled: true
      },
      {
        id: uuidv4(),
        key: 'Accept',
        value: 'application/json',
        enabled: true
      }
    ],
    createdAt: now
  },
  {
    id: uuidv4(),
    name: 'Authenticated Request',
    headers: [
      {
        id: uuidv4(),
        key: 'Authorization',
        value: 'Bearer {{authToken}}',
        enabled: true
      },
      {
        id: uuidv4(),
        key: 'Accept',
        value: 'application/json',
        enabled: true
      }
    ],
    createdAt: now
  }
]