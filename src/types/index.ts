export interface UserProfile {
  id: string
  user_id: string
  username: string
  age?: number
  occupation?: string
  phone?: string
  bio?: string
  created: string
  updated: string
}

export interface UserProfileForm {
  username: string
  age?: number
  occupation?: string
  phone?: string
  bio?: string
}
